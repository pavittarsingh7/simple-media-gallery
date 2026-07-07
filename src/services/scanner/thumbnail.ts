import path from "path";
import { mkdir, writeFile, access } from "fs/promises";
import sharp from "sharp";
import { execFile } from "child_process";
import { promisify } from "util";
import { THUMBNAIL_SIZES, type ThumbnailSize } from "@/constants/media";
import { resolveThumbnailPath } from "@/lib/utils/paths";

const execFileAsync = promisify(execFile);

export async function ensureThumbnailDir(): Promise<void> {
  await mkdir(resolveThumbnailPath(), { recursive: true });
}

export function getThumbnailRelativePath(
  fileHash: string,
  size: ThumbnailSize,
  extension: string
): string {
  const subdir = fileHash.slice(0, 2);
  return path.join(subdir, `${fileHash}_${size}.${extension === "gif" ? "webp" : "webp"}`);
}

export async function generateImageThumbnails(
  sourcePath: string,
  fileHash: string,
  sizes: ThumbnailSize[] = ["sm", "md", "lg"]
): Promise<Array<{ size: ThumbnailSize; path: string; width: number; height: number }>> {
  await ensureThumbnailDir();
  const results: Array<{ size: ThumbnailSize; path: string; width: number; height: number }> = [];

  for (const size of sizes) {
    const { width, height } = THUMBNAIL_SIZES[size];
    const relativePath = getThumbnailRelativePath(fileHash, size, "webp");
    const outputPath = path.join(resolveThumbnailPath(), relativePath);

    await mkdir(path.dirname(outputPath), { recursive: true });

    const output = await sharp(sourcePath)
      .rotate()
      .resize(width, height, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: size === "sm" ? 70 : 85 })
      .toBuffer({ resolveWithObject: true });

    await writeFile(outputPath, output.data);

    results.push({
      size,
      path: relativePath.replace(/\\/g, "/"),
      width: output.info.width,
      height: output.info.height,
    });
  }

  return results;
}

export async function generateVideoThumbnail(
  sourcePath: string,
  fileHash: string,
  size: ThumbnailSize = "md"
): Promise<{ size: ThumbnailSize; path: string; width: number; height: number } | null> {
  await ensureThumbnailDir();
  const { width, height } = THUMBNAIL_SIZES[size];
  const relativePath = getThumbnailRelativePath(fileHash, size, "webp");
  const outputPath = path.join(resolveThumbnailPath(), relativePath);

  await mkdir(path.dirname(outputPath), { recursive: true });
  const tempFrame = outputPath.replace(".webp", "_frame.jpg");

  try {
    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      sourcePath,
      "-ss",
      "00:00:01",
      "-vframes",
      "1",
      "-q:v",
      "2",
      tempFrame,
    ]);

    const output = await sharp(tempFrame)
      .resize(width, height, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });

    await writeFile(outputPath, output.data);

    const { unlink } = await import("fs/promises");
    await unlink(tempFrame).catch(() => {});

    return {
      size,
      path: relativePath.replace(/\\/g, "/"),
      width: output.info.width,
      height: output.info.height,
    };
  } catch {
    return null;
  }
}

export async function thumbnailExists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(resolveThumbnailPath(), relativePath));
    return true;
  } catch {
    return false;
  }
}
