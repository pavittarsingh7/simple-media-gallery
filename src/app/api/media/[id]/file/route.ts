import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { getMediaById } from "@/services/media";
import {
  resolveSafeMediaPath,
  resolveSafeThumbnailPath,
} from "@/lib/utils/paths";
import { getEnv } from "@/lib/env";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const env = getEnv();
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`file-${ip}`, env.RATE_LIMIT_MAX, env.RATE_LIMIT_WINDOW_MS);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { id } = await params;
  const media = await getMediaById(id);

  if (!media || media.status !== "ACTIVE") {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const thumbnailSize = request.nextUrl.searchParams.get("thumb");
  let filePath: string;
  let contentType: string;

  if (thumbnailSize) {
    const thumb = media.thumbnails.find((t) => t.size === thumbnailSize);
    if (!thumb) {
      return NextResponse.json({ error: "Thumbnail not found" }, { status: 404 });
    }
    filePath = resolveSafeThumbnailPath(thumb.path);
    contentType = "image/webp";
  } else {
    filePath = resolveSafeMediaPath(media.relativePath, media.type);
    contentType = getContentType(media.extension, media.type);
  }

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }

  const fileStat = await stat(filePath);
  const download = request.nextUrl.searchParams.get("download") === "true";

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Length": String(fileStat.size),
    "Cache-Control": thumbnailSize
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600",
    "X-Content-Type-Options": "nosniff",
  };

  if (download) {
    headers["Content-Disposition"] = `attachment; filename="${media.filename}"`;
  } else {
    headers["Content-Disposition"] = `inline; filename="${media.filename}"`;
  }

  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;

  return new NextResponse(webStream, { headers });
}

function getContentType(ext: string, type: string): string {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
    mp4: "video/mp4",
    mov: "video/quicktime",
    mkv: "video/x-matroska",
    webm: "video/webm",
    avi: "video/x-msvideo",
    m4v: "video/x-m4v",
  };
  return map[ext.toLowerCase()] ?? (type === "VIDEO" ? "video/mp4" : "image/jpeg");
}
