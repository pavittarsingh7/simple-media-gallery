import { prisma } from "@/lib/prisma";
import type { AnalyticsPayload } from "@/types";

export async function trackAnalytics(payload: AnalyticsPayload) {
  const { deviceId, event, mediaId, data, deviceInfo } = payload;

  await prisma.deviceAnalytics.upsert({
    where: { deviceId },
    create: {
      deviceId,
      totalVisits: event === "visit" ? 1 : 0,
      galleryOpens: event === "gallery_open" ? 1 : 0,
      photoOpens: event === "photo_open" ? 1 : 0,
      videoOpens: event === "video_open" ? 1 : 0,
      deviceType: deviceInfo?.deviceType,
      browser: deviceInfo?.browser,
      os: deviceInfo?.os,
      screenResolution: deviceInfo?.screenResolution,
      language: deviceInfo?.language,
      theme: deviceInfo?.theme,
      timezone: deviceInfo?.timezone,
      lastVisitAt: new Date(),
    },
    update: {
      totalVisits: event === "visit" ? { increment: 1 } : undefined,
      galleryOpens: event === "gallery_open" ? { increment: 1 } : undefined,
      photoOpens: event === "photo_open" ? { increment: 1 } : undefined,
      videoOpens: event === "video_open" ? { increment: 1 } : undefined,
      deviceType: deviceInfo?.deviceType,
      browser: deviceInfo?.browser,
      os: deviceInfo?.os,
      screenResolution: deviceInfo?.screenResolution,
      language: deviceInfo?.language,
      theme: deviceInfo?.theme,
      timezone: deviceInfo?.timezone,
      lastVisitAt: new Date(),
    },
  });

  if (mediaId) {
    await prisma.viewStatistics.upsert({
      where: { mediaId_deviceId: { mediaId, deviceId } },
      create: {
        mediaId,
        deviceId,
        viewCount: 1,
        playCount: event === "video_play" ? 1 : 0,
        resumeCount: event === "video_resume" ? 1 : 0,
        completionPercent:
          typeof data?.completedPercent === "number" ? data.completedPercent : 0,
        watchDuration:
          typeof data?.watchDuration === "number" ? data.watchDuration : 0,
        lastViewedAt: new Date(),
      },
      update: {
        viewCount: { increment: 1 },
        playCount: event === "video_play" ? { increment: 1 } : undefined,
        resumeCount: event === "video_resume" ? { increment: 1 } : undefined,
        completionPercent:
          typeof data?.completedPercent === "number"
            ? data.completedPercent
            : undefined,
        watchDuration:
          typeof data?.watchDuration === "number"
            ? { increment: data.watchDuration }
            : undefined,
        lastViewedAt: new Date(),
      },
    });
  }

  if (event === "search" && typeof data?.query === "string") {
    const device = await prisma.deviceAnalytics.findUnique({
      where: { deviceId },
    });
    if (device) {
      const queries = Array.isArray(device.searchQueries)
        ? (device.searchQueries as string[])
        : [];
      queries.push(data.query);
      await prisma.deviceAnalytics.update({
        where: { deviceId },
        data: { searchQueries: queries.slice(-100) },
      });
    }
  }
}

export async function getSearchAnalytics(limit = 20) {
  const devices = await prisma.deviceAnalytics.findMany({
    select: { searchQueries: true },
  });

  const queryCounts = new Map<string, number>();
  for (const device of devices) {
    const queries = Array.isArray(device.searchQueries)
      ? (device.searchQueries as string[])
      : [];
    for (const q of queries) {
      queryCounts.set(q, (queryCounts.get(q) ?? 0) + 1);
    }
  }

  return Array.from(queryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));
}
