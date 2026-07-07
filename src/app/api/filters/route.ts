import { NextRequest, NextResponse } from "next/server";
import { getFilterOptions } from "@/services/media";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  if (type !== "PHOTO" && type !== "VIDEO") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const options = await getFilterOptions(type);
  return NextResponse.json(options);
}
