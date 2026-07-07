import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { getScannerStatus } from "@/services/scanner";
import { getMediaCounts } from "@/services/media";
import { formatFileSize } from "@/lib/utils/paths";
import type { AdminDashboardStats, ScanHistoryItem } from "@/types";

function serializeScan(scan: {
  id: string;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
  filesScanned: number;
  filesAdded: number;
  filesUpdated: number;
  filesDeleted: number;
  filesRenamed: number;
  thumbnailsGenerated: number;
  triggeredBy: string;
  errors: unknown;
}): ScanHistoryItem {
  return {
    id: scan.id,
    status: scan.status,
    startedAt: scan.startedAt.toISOString(),
    completedAt: scan.completedAt?.toISOString() ?? null,
    filesScanned: scan.filesScanned,
    filesAdded: scan.filesAdded,
    filesUpdated: scan.filesUpdated,
    filesDeleted: scan.filesDeleted,
    filesRenamed: scan.filesRenamed,
    thumbnailsGenerated: scan.thumbnailsGenerated,
    triggeredBy: scan.triggeredBy,
    errors: Array.isArray(scan.errors) ? (scan.errors as string[]) : [],
  };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [
    counts,
    brokenFiles,
    missingFiles,
    duplicateFiles,
    lastScan,
    recentScans,
    topViewedRaw,
  ] = await Promise.all([
    getMediaCounts(),
    prisma.media.count({ where: { status: "BROKEN" } }),
    prisma.media.count({ where: { status: "MISSING" } }),
    prisma.media.count({ where: { status: "DUPLICATE" } }),
    prisma.scanHistory.findFirst({ orderBy: { startedAt: "desc" } }),
    prisma.scanHistory.findMany({
      orderBy: { startedAt: "desc" },
      take: 10,
    }),
    prisma.media.findMany({
      where: { status: "ACTIVE" },
      include: {
        metadata: true,
        thumbnails: true,
        folder: true,
        viewStats: true,
      },
      take: 10,
    }),
  ]);

  const topViewed = topViewedRaw
    .map((m) => ({
      item: m,
      views: m.viewStats.reduce((s, v) => s + v.viewCount, 0),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return {
    totalMedia: counts.total,
    photoCount: counts.photos,
    videoCount: counts.videos,
    storageUsed: formatFileSize(BigInt(counts.totalSize)),
    scannerStatus: getScannerStatus(),
    lastScan: lastScan ? serializeScan(lastScan) : null,
    brokenFiles,
    missingFiles,
    duplicateFiles,
    topViewed: topViewed.map((t) => {
      const totalViews = t.views;
      return {
        id: t.item.id,
        fileHash: t.item.fileHash,
        filename: t.item.filename,
        title: t.item.title,
        relativePath: t.item.relativePath,
        type: t.item.type,
        extension: t.item.extension,
        fileSize: t.item.fileSize.toString(),
        width: t.item.width,
        height: t.item.height,
        aspectRatio: t.item.aspectRatio,
        duration: t.item.duration,
        status: t.item.status,
        folderPath: null,
        fileCreatedAt: t.item.fileCreatedAt?.toISOString() ?? null,
        fileModifiedAt: t.item.fileModifiedAt?.toISOString() ?? null,
        createdAt: t.item.createdAt.toISOString(),
        updatedAt: t.item.updatedAt.toISOString(),
        metadata: null,
        thumbnails: t.item.thumbnails.map((th) => ({
          size: th.size,
          path: th.path,
          width: th.width,
          height: th.height,
        })),
        viewCount: totalViews,
      };
    }),
    recentScans: recentScans.map(serializeScan),
  };
}

export async function logAdminAction(
  action: string,
  details?: Record<string, unknown> | object,
  ipAddress?: string
) {
  await prisma.adminAuditLog.create({
    data: {
      action,
      details: details as Prisma.InputJsonValue | undefined,
      ipAddress,
    },
  });
}
