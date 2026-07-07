import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { GalleryFilters, GalleryQuery, MediaItem, PaginatedResult } from "@/types";
import type { SortOption } from "@/constants/media";

function serializeMedia(
  media: Prisma.MediaGetPayload<{
    include: { metadata: true; thumbnails: true; folder: true; viewStats: true };
  }>
): MediaItem {
  const totalViews = media.viewStats.reduce((sum, v) => sum + v.viewCount, 0);

  return {
    id: media.id,
    fileHash: media.fileHash,
    filename: media.filename,
    title: media.title,
    relativePath: media.relativePath,
    type: media.type,
    extension: media.extension,
    fileSize: media.fileSize.toString(),
    width: media.width,
    height: media.height,
    aspectRatio: media.aspectRatio,
    duration: media.duration,
    status: media.status,
    folderPath: media.folder?.path ?? null,
    fileCreatedAt: media.fileCreatedAt?.toISOString() ?? null,
    fileModifiedAt: media.fileModifiedAt?.toISOString() ?? null,
    createdAt: media.createdAt.toISOString(),
    updatedAt: media.updatedAt.toISOString(),
    metadata: media.metadata
      ? {
          camera: media.metadata.camera,
          lens: media.metadata.lens,
          iso: media.metadata.iso,
          aperture: media.metadata.aperture,
          shutterSpeed: media.metadata.shutterSpeed,
          focalLength: media.metadata.focalLength,
          gpsLatitude: media.metadata.gpsLatitude,
          gpsLongitude: media.metadata.gpsLongitude,
          orientation: media.metadata.orientation,
          colorProfile: media.metadata.colorProfile,
          bitrate: media.metadata.bitrate,
          codec: media.metadata.codec,
          fps: media.metadata.fps,
          audioChannels: media.metadata.audioChannels,
          hasSubtitles: media.metadata.hasSubtitles,
          dominantColor: media.metadata.dominantColor,
          blurDataUrl: media.metadata.blurDataUrl,
          tags: media.metadata.tags,
        }
      : null,
    thumbnails: media.thumbnails.map((t) => ({
      size: t.size,
      path: t.path,
      width: t.width,
      height: t.height,
    })),
    viewCount: totalViews,
  };
}

function buildWhereClause(
  query: GalleryQuery
): Prisma.MediaWhereInput {
  const where: Prisma.MediaWhereInput = {
    type: query.type,
    status: "ACTIVE",
  };

  if (query.search) {
    const search = query.search.toLowerCase();
    where.OR = [
      { filename: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { extension: { contains: search, mode: "insensitive" } },
      { metadata: { camera: { contains: search, mode: "insensitive" } } },
      { metadata: { lens: { contains: search, mode: "insensitive" } } },
      { metadata: { codec: { contains: search, mode: "insensitive" } } },
      { metadata: { tags: { has: search } } },
      { folder: { path: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (query.filters) {
    applyFilters(where, query.filters, query.type);
  }

  return where;
}

function applyFilters(
  where: Prisma.MediaWhereInput,
  filters: GalleryFilters,
  type: "PHOTO" | "VIDEO"
) {
  if (filters.extension) {
    where.extension = filters.extension.toLowerCase();
  }

  if (filters.folder) {
    where.folder = { path: { contains: filters.folder, mode: "insensitive" } };
  }

  if (filters.dateFrom || filters.dateTo) {
    where.fileCreatedAt = {};
    if (filters.dateFrom) {
      where.fileCreatedAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.fileCreatedAt.lte = new Date(filters.dateTo);
    }
  }

  if (type === "PHOTO") {
    if (filters.camera) {
      where.metadata = { ...((where.metadata as object) || {}), camera: { contains: filters.camera, mode: "insensitive" } };
    }
    if (filters.lens) {
      where.metadata = { ...((where.metadata as object) || {}), lens: { contains: filters.lens, mode: "insensitive" } };
    }
    if (filters.orientation) {
      if (filters.orientation === "landscape") {
        where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { width: { gt: 0 } }, { height: { gt: 0 } }];
        // Prisma doesn't support column comparison directly; filter post-query for orientation
      }
    }
    if (filters.resolution) {
      const [w, h] = filters.resolution.split("x").map(Number);
      if (w) where.width = { gte: w };
      if (h) where.height = { gte: h };
    }
  }

  if (type === "VIDEO") {
    if (filters.codec) {
      where.metadata = { ...((where.metadata as object) || {}), codec: { contains: filters.codec, mode: "insensitive" } };
    }
    if (filters.fps) {
      where.metadata = { ...((where.metadata as object) || {}), fps: { gte: filters.fps } };
    }
    if (filters.durationMin !== undefined) {
      where.duration = { ...(where.duration as object), gte: filters.durationMin };
    }
    if (filters.durationMax !== undefined) {
      where.duration = { ...(where.duration as object), lte: filters.durationMax };
    }
    if (filters.resolution) {
      const [w, h] = filters.resolution.split("x").map(Number);
      if (w) where.width = { gte: w };
      if (h) where.height = { gte: h };
    }
  }
}

function buildOrderBy(sort?: SortOption): Prisma.MediaOrderByWithRelationInput {
  switch (sort) {
    case "oldest":
      return { fileCreatedAt: "asc" };
    case "name":
      return { filename: "asc" };
    case "fileSize":
      return { fileSize: "desc" };
    case "duration":
      return { duration: "desc" };
    case "resolution":
      return { width: "desc" };
    case "newest":
    default:
      return { fileCreatedAt: "desc" };
  }
}

export async function getMediaList(
  query: GalleryQuery
): Promise<PaginatedResult<MediaItem>> {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 48, 100);
  const skip = (page - 1) * limit;
  const where = buildWhereClause(query);

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      include: { metadata: true, thumbnails: true, folder: true, viewStats: true },
      orderBy: buildOrderBy(query.sort),
      skip,
      take: limit,
    }),
    prisma.media.count({ where }),
  ]);

  let serialized = items.map(serializeMedia);

  if (query.filters?.orientation) {
    serialized = serialized.filter((item) => {
      if (!item.width || !item.height) return false;
      const ratio = item.width / item.height;
      if (query.filters?.orientation === "landscape") return ratio > 1.1;
      if (query.filters?.orientation === "portrait") return ratio < 0.9;
      if (query.filters?.orientation === "square") return ratio >= 0.9 && ratio <= 1.1;
      return true;
    });
  }

  if (query.sort === "mostViewed") {
    serialized.sort((a, b) => b.viewCount - a.viewCount);
  }

  return {
    items: serialized,
    total,
    page,
    limit,
    hasMore: skip + items.length < total,
  };
}

export async function getMediaById(id: string): Promise<MediaItem | null> {
  const media = await prisma.media.findUnique({
    where: { id },
    include: { metadata: true, thumbnails: true, folder: true, viewStats: true },
  });
  return media ? serializeMedia(media) : null;
}

export async function getMediaByPath(
  relativePath: string,
  type: "PHOTO" | "VIDEO"
): Promise<MediaItem | null> {
  const media = await prisma.media.findFirst({
    where: { relativePath, type, status: "ACTIVE" },
    include: { metadata: true, thumbnails: true, folder: true, viewStats: true },
  });
  return media ? serializeMedia(media) : null;
}

export async function getAdjacentMedia(
  currentId: string,
  type: "PHOTO" | "VIDEO"
): Promise<{ prev: MediaItem | null; next: MediaItem | null }> {
  const current = await prisma.media.findUnique({ where: { id: currentId } });
  if (!current) return { prev: null, next: null };

  const [prev, next] = await Promise.all([
    prisma.media.findFirst({
      where: { type, status: "ACTIVE", fileCreatedAt: { lt: current.fileCreatedAt ?? undefined } },
      orderBy: { fileCreatedAt: "desc" },
      include: { metadata: true, thumbnails: true, folder: true, viewStats: true },
    }),
    prisma.media.findFirst({
      where: { type, status: "ACTIVE", fileCreatedAt: { gt: current.fileCreatedAt ?? undefined } },
      orderBy: { fileCreatedAt: "asc" },
      include: { metadata: true, thumbnails: true, folder: true, viewStats: true },
    }),
  ]);

  return {
    prev: prev ? serializeMedia(prev) : null,
    next: next ? serializeMedia(next) : null,
  };
}

export async function getMediaCounts() {
  const [photos, videos, totalSize] = await Promise.all([
    prisma.media.count({ where: { type: "PHOTO", status: "ACTIVE" } }),
    prisma.media.count({ where: { type: "VIDEO", status: "ACTIVE" } }),
    prisma.media.aggregate({
      where: { status: "ACTIVE" },
      _sum: { fileSize: true },
    }),
  ]);

  return {
    photos,
    videos,
    total: photos + videos,
    totalSize: totalSize._sum.fileSize?.toString() ?? "0",
  };
}

export async function getFilterOptions(type: "PHOTO" | "VIDEO") {
  if (type === "PHOTO") {
    const [cameras, lenses, extensions] = await Promise.all([
      prisma.metadata.findMany({
        where: { media: { type: "PHOTO", status: "ACTIVE" }, camera: { not: null } },
        select: { camera: true },
        distinct: ["camera"],
      }),
      prisma.metadata.findMany({
        where: { media: { type: "PHOTO", status: "ACTIVE" }, lens: { not: null } },
        select: { lens: true },
        distinct: ["lens"],
      }),
      prisma.media.findMany({
        where: { type: "PHOTO", status: "ACTIVE" },
        select: { extension: true },
        distinct: ["extension"],
      }),
    ]);
    return {
      cameras: cameras.map((c) => c.camera!).filter(Boolean),
      lenses: lenses.map((l) => l.lens!).filter(Boolean),
      extensions: extensions.map((e) => e.extension),
      codecs: [] as string[],
    };
  }

  const [codecs, extensions] = await Promise.all([
    prisma.metadata.findMany({
      where: { media: { type: "VIDEO", status: "ACTIVE" }, codec: { not: null } },
      select: { codec: true },
      distinct: ["codec"],
    }),
    prisma.media.findMany({
      where: { type: "VIDEO", status: "ACTIVE" },
      select: { extension: true },
      distinct: ["extension"],
    }),
  ]);

  return {
    cameras: [] as string[],
    lenses: [] as string[],
    extensions: extensions.map((e) => e.extension),
    codecs: codecs.map((c) => c.codec!).filter(Boolean),
  };
}
