import { NextRequest, NextResponse } from "next/server";
import { getMediaById, getAdjacentMedia } from "@/services/media";
import { getEnv } from "@/lib/env";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const env = getEnv();
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip, env.RATE_LIMIT_MAX, env.RATE_LIMIT_WINDOW_MS);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { id } = await params;
  const media = await getMediaById(id);

  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const includeAdjacent = request.nextUrl.searchParams.get("adjacent") === "true";
  let adjacent = null;

  if (includeAdjacent) {
    adjacent = await getAdjacentMedia(id, media.type);
  }

  return NextResponse.json({ media, adjacent });
}
