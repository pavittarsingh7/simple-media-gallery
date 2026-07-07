import path from "path";
import { readdir, stat } from "fs/promises";
import {
  getExtension,
  getMediaTypeFromExtension,
  resolvePhotoPath,
  resolveVideoPath,
} from "@/lib/utils/paths";
import { computeFileHash } from "@/services/scanner/hash";
import { extractImageMetadata } from "@/services/scanner/image-metadata";
import { extractVideoMetadata } from "@/services/scanner/video-metadata";
import type { ScannedFile } from "@/services/scanner/types";

async function walkDirectory(
  dir: string,
  rootDir: string,
  type: "PHOTO" | "VIDEO"
): Promise<ScannedFile[]> {
  const results: ScannedFile[] = [];

  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const subResults = await walkDirectory(fullPath, rootDir, type);
      results.push(...subResults);
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = getExtension(entry.name);
    const mediaType = getMediaTypeFromExtension(ext);
    if (!mediaType || mediaType !== type) continue;

    try {
      const stats = await stat(fullPath);
      const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
      const fileHash = await computeFileHash(fullPath);

      const scanned: ScannedFile = {
        absolutePath: fullPath,
        relativePath,
        filename: entry.name,
        extension: ext,
        type,
        fileSize: BigInt(stats.size),
        fileHash,
        fileCreatedAt: stats.birthtime,
        fileModifiedAt: stats.mtime,
      };

      if (type === "PHOTO") {
        scanned.imageMeta = await extractImageMetadata(fullPath);
      } else {
        scanned.videoMeta = await extractVideoMetadata(fullPath);
      }

      results.push(scanned);
    } catch (error) {
      console.error(`Failed to scan file: ${fullPath}`, error);
    }
  }

  return results;
}

export async function scanMediaFolders(): Promise<ScannedFile[]> {
  const [photos, videos] = await Promise.all([
    walkDirectory(resolvePhotoPath(), resolvePhotoPath(), "PHOTO"),
    walkDirectory(resolveVideoPath(), resolveVideoPath(), "VIDEO"),
  ]);

  return [...photos, ...videos];
}

export async function ensureMediaDirectories(): Promise<void> {
  const { mkdir } = await import("fs/promises");
  await Promise.all([
    mkdir(resolvePhotoPath(), { recursive: true }),
    mkdir(resolveVideoPath(), { recursive: true }),
  ]);
}
