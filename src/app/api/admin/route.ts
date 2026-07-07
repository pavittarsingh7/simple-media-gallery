import { NextRequest, NextResponse } from "next/server";
import { getAdminDashboardStats, logAdminAction } from "@/services/admin";
import { runMediaScan, rebuildAllThumbnails, getScannerStatus } from "@/services/scanner";
import { getSearchAnalytics } from "@/services/analytics";
import { getMediaCounts } from "@/services/media";
import { validateAdminSecret, getClientIp } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  if (!validateAdminSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [stats, searchAnalytics] = await Promise.all([
    getAdminDashboardStats(),
    getSearchAnalytics(),
  ]);

  return NextResponse.json({ ...stats, searchAnalytics, scannerStatus: getScannerStatus() });
}

export async function POST(request: NextRequest) {
  if (!validateAdminSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const body = await request.json();
  const action = body.action as string;

  switch (action) {
    case "scan": {
      const result = await runMediaScan("manual");
      await logAdminAction("manual_scan", result, ip);
      return NextResponse.json(result);
    }
    case "rebuild_thumbnails": {
      const count = await rebuildAllThumbnails();
      await logAdminAction("rebuild_thumbnails", { count }, ip);
      return NextResponse.json({ thumbnailsRebuilt: count });
    }
    case "health": {
      const counts = await getMediaCounts();
      return NextResponse.json({
        database: "connected",
        media: counts,
        scanner: getScannerStatus(),
      });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
