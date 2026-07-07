import { NextResponse } from "next/server";
import { getMediaCounts } from "@/services/media";
import { getScannerStatus } from "@/services/scanner";

export async function GET() {
  const [counts, scannerStatus] = await Promise.all([
    getMediaCounts(),
    Promise.resolve(getScannerStatus()),
  ]);

  return NextResponse.json({
    photos: counts.photos,
    videos: counts.videos,
    total: counts.total,
    scannerStatus,
  });
}
