import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getEnv } from "@/lib/env";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { getMediaList } from "@/services/media";

const querySchema = z.object({
  type: z.enum(["PHOTO", "VIDEO"]),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(48),
  search: z.string().optional(),
  sort: z
    .enum([
      "newest",
      "oldest",
      "name",
      "fileSize",
      "duration",
      "resolution",
      "mostViewed",
      "recentlyViewed",
    ])
    .optional(),
  resolution: z.string().optional(),
  orientation: z.enum(["landscape", "portrait", "square"]).optional(),
  camera: z.string().optional(),
  lens: z.string().optional(),
  extension: z.string().optional(),
  codec: z.string().optional(),
  folder: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  durationMin: z.coerce.number().optional(),
  durationMax: z.coerce.number().optional(),
  fps: z.coerce.number().optional(),
});

export async function GET(request: NextRequest) {
  const env = getEnv();
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip, env.RATE_LIMIT_MAX, env.RATE_LIMIT_WINDOW_MS);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
    );
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { type, page, limit, search, sort, ...filters } = parsed.data;

  const result = await getMediaList({
    type,
    page,
    limit,
    search,
    sort,
    filters: {
      resolution: filters.resolution,
      orientation: filters.orientation,
      camera: filters.camera,
      lens: filters.lens,
      extension: filters.extension,
      codec: filters.codec,
      folder: filters.folder,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      durationMin: filters.durationMin,
      durationMax: filters.durationMax,
      fps: filters.fps,
    },
  });

  return NextResponse.json(result, {
    headers: {
      "X-RateLimit-Remaining": String(rateLimit.remaining),
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
