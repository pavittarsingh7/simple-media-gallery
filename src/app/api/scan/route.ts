import { NextResponse } from "next/server";
import { runMediaScan } from "@/services/scanner";
import { getEnv } from "@/lib/env";

export async function POST() {
  try {
    const result = await runMediaScan("manual");
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const env = getEnv();
  return NextResponse.json({ scanOnStartup: env.SCAN_ON_STARTUP });
}
