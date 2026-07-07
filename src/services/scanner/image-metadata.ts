import { readFile } from "fs/promises";
import sharp from "sharp";
import type { ImageMetadata } from "@/services/scanner/types";

async function parseExif(filePath: string) {
  const exifr = await import("exifr");
  const buffer = await readFile(filePath);
  return exifr.parse(buffer, { gps: true }).catch(() => null);
}

export async function extractImageMetadata(
  filePath: string
): Promise<ImageMetadata> {
  const [sharpMeta, exifData] = await Promise.all([
    sharp(filePath).metadata().catch(() => null),
    parseExif(filePath),
  ]);

  const width = sharpMeta?.width ?? null;
  const height = sharpMeta?.height ?? null;
  const aspectRatio = width && height ? width / height : null;

  let dominantColor: string | null = null;
  let blurDataUrl: string | null = null;

  try {
    const { dominant } = await sharp(filePath).stats();
    if (dominant) {
      dominantColor = `rgb(${dominant.r},${dominant.g},${dominant.b})`;
    }
    const blurBuffer = await sharp(filePath)
      .resize(10, 10, { fit: "inside" })
      .blur(2)
      .webp({ quality: 20 })
      .toBuffer();
    blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
  } catch {
    // Non-critical
  }

  return {
    width,
    height,
    aspectRatio,
    orientation: sharpMeta?.orientation ?? exifData?.Orientation ?? null,
    colorProfile: sharpMeta?.space ?? null,
    camera: exifData?.Make
      ? `${exifData.Make}${exifData.Model ? ` ${exifData.Model}` : ""}`.trim()
      : null,
    lens: exifData?.LensModel ?? exifData?.LensMake ?? null,
    iso: exifData?.ISO ?? null,
    aperture: exifData?.FNumber ? `f/${exifData.FNumber}` : null,
    shutterSpeed: exifData?.ExposureTime
      ? exifData.ExposureTime < 1
        ? `1/${Math.round(1 / exifData.ExposureTime)}`
        : `${exifData.ExposureTime}s`
      : null,
    focalLength: exifData?.FocalLength
      ? `${exifData.FocalLength}mm`
      : null,
    gpsLatitude: exifData?.latitude ?? null,
    gpsLongitude: exifData?.longitude ?? null,
    dominantColor,
    blurDataUrl,
    tags: [],
  };
}
