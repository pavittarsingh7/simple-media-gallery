import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trackAnalytics } from "@/services/analytics";
import { getEnv } from "@/lib/env";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

const analyticsSchema = z.object({
  deviceId: z.string().min(1),
  event: z.string().min(1),
  mediaId: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  deviceInfo: z
    .object({
      deviceType: z.string().optional(),
      browser: z.string().optional(),
      os: z.string().optional(),
      screenResolution: z.string().optional(),
      language: z.string().optional(),
      theme: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  const env = getEnv();
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`analytics-${ip}`, env.RATE_LIMIT_MAX, env.RATE_LIMIT_WINDOW_MS);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = analyticsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await trackAnalytics(parsed.data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
