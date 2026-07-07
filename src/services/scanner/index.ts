import "server-only";

import path from "path";
import { prisma } from "@/lib/prisma";
import { scanMediaFolders, ensureMediaDirectories } from "@/services/scanner/walker";
import {
  generateImageThumbnails,
  generateVideoThumbnail,
} from "@/services/scanner/thumbnail";
import type { ScanTrigger, ScannedFile } from "@/services/scanner/types";
import type { ScanResult } from "@/types";

let isScanning = false;

export function getScannerStatus(): "idle" | "running" | "failed" {
  if (isScanning) return "running";
  return "idle";
}

async function upsertFolder(folderPath: string, parentId: string | null) {
  const name = path.basename(folderPath) || folderPath;
  return prisma.folder.upsert({
    where: { path: folderPath },
    create: { path: folderPath, name, parentId },
    update: { name, parentId },
  });
}

async function ensureFolderHierarchy(relativePath: string): Promise<string | null> {
  const parts = path.dirname(relativePath).split(path.sep).filter(Boolean);
  if (parts.length === 0 || parts[0] === ".") return null;

  let parentId: string | null = null;
  let currentPath = "";

  for (const part of parts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    const folder = await upsertFolder(currentPath, parentId);
    parentId = folder.id;
  }

  return parentId;
}

async function processFile(
  file: ScannedFile,
  scanId: string
): Promise<{ action: "added" | "updated" | "unchanged"; thumbnails: number }> {
  const folderId = await ensureFolderHierarchy(file.relativePath);
  const existing = await prisma.media.findUnique({
    where: { fileHash: file.fileHash },
    include: { thumbnails: true, metadata: true },
  });

  const meta = file.type === "PHOTO" ? file.imageMeta : file.videoMeta;
  const width = meta?.width ?? null;
  const height = meta?.height ?? null;
  const aspectRatio = meta?.aspectRatio ?? null;
  const duration = file.type === "VIDEO" ? (file.videoMeta?.duration ?? null) : null;

  const mediaData = {
    filename: file.filename,
    title: path.parse(file.filename).name,
    relativePath: file.relativePath,
    absolutePath: file.absolutePath,
    type: file.type,
    extension: file.extension,
    fileSize: file.fileSize,
    width,
    height,
    aspectRatio,
    duration,
    status: "ACTIVE" as const,
    folderId,
    fileCreatedAt: file.fileCreatedAt,
    fileModifiedAt: file.fileModifiedAt,
  };

  let mediaId: string;
  let action: "added" | "updated" | "unchanged" = "unchanged";
  let thumbnailsGenerated = 0;

  if (!existing) {
    const byPath = await prisma.media.findUnique({
      where: { relativePath: file.relativePath },
    });

    if (byPath && byPath.fileHash !== file.fileHash) {
      await prisma.media.update({
        where: { id: byPath.id },
        data: { status: "MISSING" },
      });
    }

    const created = await prisma.media.create({
      data: {
        fileHash: file.fileHash,
        ...mediaData,
        metadata: {
          create: buildMetadataCreate(file),
        },
      },
    });
    mediaId = created.id;
    action = "added";
  } else if (
    existing.fileModifiedAt?.getTime() !== file.fileModifiedAt.getTime() ||
    existing.relativePath !== file.relativePath
  ) {
    await prisma.media.update({
      where: { id: existing.id },
      data: {
        ...mediaData,
        metadata: {
          upsert: {
            create: buildMetadataCreate(file),
            update: buildMetadataUpdate(file),
          },
        },
      },
    });
    mediaId = existing.id;
    action = "updated";
  } else {
    mediaId = existing.id;
    if (existing.status !== "ACTIVE") {
      await prisma.media.update({
        where: { id: existing.id },
        data: mediaData,
      });
      action = "updated";
    }
  }

  const needsThumbnails =
    action !== "unchanged" ||
    !(await prisma.thumbnail.count({ where: { mediaId } }));

  if (needsThumbnails) {
    thumbnailsGenerated = await generateThumbnailsForMedia(
      file,
      mediaId
    );
  }

  return { action, thumbnails: thumbnailsGenerated };
}

function buildMetadataCreate(file: ScannedFile) {
  const meta = file.type === "PHOTO" ? file.imageMeta : file.videoMeta;
  if (!meta) return {};

  if (file.type === "PHOTO" && file.imageMeta) {
    return {
      camera: file.imageMeta.camera,
      lens: file.imageMeta.lens,
      iso: file.imageMeta.iso,
      aperture: file.imageMeta.aperture,
      shutterSpeed: file.imageMeta.shutterSpeed,
      focalLength: file.imageMeta.focalLength,
      gpsLatitude: file.imageMeta.gpsLatitude,
      gpsLongitude: file.imageMeta.gpsLongitude,
      orientation: file.imageMeta.orientation,
      colorProfile: file.imageMeta.colorProfile,
      dominantColor: file.imageMeta.dominantColor,
      blurDataUrl: file.imageMeta.blurDataUrl,
      tags: file.imageMeta.tags,
    };
  }

  if (file.type === "VIDEO" && file.videoMeta) {
    return {
      bitrate: file.videoMeta.bitrate,
      codec: file.videoMeta.codec,
      fps: file.videoMeta.fps,
      audioChannels: file.videoMeta.audioChannels,
      hasSubtitles: file.videoMeta.hasSubtitles,
      tags: file.videoMeta.tags,
    };
  }

  return {};
}

function buildMetadataUpdate(file: ScannedFile) {
  return buildMetadataCreate(file);
}

async function generateThumbnailsForMedia(
  file: ScannedFile,
  mediaId: string
): Promise<number> {
  let generated = 0;

  try {
    if (file.type === "PHOTO") {
      const thumbs = await generateImageThumbnails(
        file.absolutePath,
        file.fileHash,
        ["sm", "md", "lg"]
      );
      for (const thumb of thumbs) {
        await prisma.thumbnail.upsert({
          where: { mediaId_size: { mediaId, size: thumb.size } },
          create: {
            mediaId,
            size: thumb.size,
            path: thumb.path,
            width: thumb.width,
            height: thumb.height,
            fileHash: file.fileHash,
          },
          update: {
            path: thumb.path,
            width: thumb.width,
            height: thumb.height,
            fileHash: file.fileHash,
          },
        });
        generated++;
      }
    } else {
      const thumb = await generateVideoThumbnail(
        file.absolutePath,
        file.fileHash,
        "md"
      );
      if (thumb) {
        await prisma.thumbnail.upsert({
          where: { mediaId_size: { mediaId, size: thumb.size } },
          create: {
            mediaId,
            size: thumb.size,
            path: thumb.path,
            width: thumb.width,
            height: thumb.height,
            fileHash: file.fileHash,
          },
          update: {
            path: thumb.path,
            width: thumb.width,
            height: thumb.height,
            fileHash: file.fileHash,
          },
        });
        generated++;
      }
    }
  } catch (error) {
    console.error(`Thumbnail generation failed for ${file.relativePath}:`, error);
  }

  return generated;
}

async function markMissingFiles(scannedPaths: Set<string>): Promise<number> {
  const activeMedia = await prisma.media.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, relativePath: true },
  });

  let deleted = 0;
  for (const media of activeMedia) {
    if (!scannedPaths.has(media.relativePath)) {
      await prisma.media.update({
        where: { id: media.id },
        data: { status: "MISSING" },
      });
      deleted++;
    }
  }
  return deleted;
}

async function detectDuplicates(): Promise<number> {
  const allMedia = await prisma.media.findMany({
    select: { id: true, fileHash: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const hashMap = new Map<string, string>();
  let count = 0;

  for (const item of allMedia) {
    if (hashMap.has(item.fileHash)) {
      await prisma.media.update({
        where: { id: item.id },
        data: { status: "DUPLICATE" },
      });
      count++;
    } else {
      hashMap.set(item.fileHash, item.id);
    }
  }

  return count;
}

export async function runMediaScan(triggeredBy: ScanTrigger = "manual"): Promise<ScanResult> {
  if (isScanning) {
    throw new Error("Scan already in progress");
  }

  isScanning = true;
  const errors: string[] = [];
  let filesAdded = 0;
  let filesUpdated = 0;
  let filesDeleted = 0;
  let thumbnailsGenerated = 0;

  const scan = await prisma.scanHistory.create({
    data: { status: "RUNNING", triggeredBy },
  });

  try {
    await ensureMediaDirectories();
    const files = await scanMediaFolders();
    const scannedPaths = new Set(files.map((f) => f.relativePath));

    for (const file of files) {
      try {
        const result = await processFile(file, scan.id);
        if (result.action === "added") filesAdded++;
        if (result.action === "updated") filesUpdated++;
        thumbnailsGenerated += result.thumbnails;
      } catch (error) {
        const msg = `Error processing ${file.relativePath}: ${error instanceof Error ? error.message : "Unknown"}`;
        errors.push(msg);
        console.error(msg);
      }
    }

    filesDeleted = await markMissingFiles(scannedPaths);
    await detectDuplicates();

    await prisma.scanHistory.update({
      where: { id: scan.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        filesScanned: files.length,
        filesAdded,
        filesUpdated,
        filesDeleted,
        thumbnailsGenerated,
        errors,
      },
    });

    return {
      scanId: scan.id,
      filesScanned: files.length,
      filesAdded,
      filesUpdated,
      filesDeleted,
      filesRenamed: 0,
      thumbnailsGenerated,
      errors,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Scan failed";
    errors.push(msg);

    await prisma.scanHistory.update({
      where: { id: scan.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errors,
      },
    });

    throw error;
  } finally {
    isScanning = false;
  }
}

export async function rebuildAllThumbnails(): Promise<number> {
  const media = await prisma.media.findMany({
    where: { status: "ACTIVE" },
  });

  let count = 0;
  for (const item of media) {
    await prisma.thumbnail.deleteMany({ where: { mediaId: item.id } });
    const file: ScannedFile = {
      absolutePath: item.absolutePath,
      relativePath: item.relativePath,
      filename: item.filename,
      extension: item.extension,
      type: item.type,
      fileSize: item.fileSize,
      fileHash: item.fileHash,
      fileCreatedAt: item.fileCreatedAt ?? new Date(),
      fileModifiedAt: item.fileModifiedAt ?? new Date(),
    };
    count += await generateThumbnailsForMedia(file, item.id);
  }
  return count;
}
