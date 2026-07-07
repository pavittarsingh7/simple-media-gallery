import path from "path";
import { getEnv } from "@/lib/env";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "@/constants/media";

export function resolveMediaRoot(): string {
  const env = getEnv();
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), env.MEDIA_ROOT);
}

export function resolvePhotoPath(): string {
  const env = getEnv();
  return path.join(resolveMediaRoot(), env.PHOTO_FOLDER);
}

export function resolveVideoPath(): string {
  const env = getEnv();
  return path.join(resolveMediaRoot(), env.VIDEO_FOLDER);
}

export function resolveThumbnailPath(): string {
  const env = getEnv();
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), env.THUMBNAIL_FOLDER);
}

export function isPathWithinRoot(filePath: string, rootPath: string): boolean {
  const resolved = path.resolve(filePath);
  const resolvedRoot = path.resolve(rootPath);
  const relative = path.relative(resolvedRoot, resolved);
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

export function sanitizeRelativePath(relativePath: string): string {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  if (normalized.includes("..")) {
    throw new Error("Path traversal detected");
  }
  return normalized.replace(/\\/g, "/");
}

export function getExtension(filename: string): string {
  return path.extname(filename).slice(1).toLowerCase();
}

export function isImageExtension(ext: string): boolean {
  return (IMAGE_EXTENSIONS as readonly string[]).includes(ext.toLowerCase());
}

export function isVideoExtension(ext: string): boolean {
  return (VIDEO_EXTENSIONS as readonly string[]).includes(ext.toLowerCase());
}

export function getMediaTypeFromExtension(ext: string): "PHOTO" | "VIDEO" | null {
  if (isImageExtension(ext)) return "PHOTO";
  if (isVideoExtension(ext)) return "VIDEO";
  return null;
}

export function resolveSafeMediaPath(
  relativePath: string,
  type: "PHOTO" | "VIDEO"
): string {
  const sanitized = sanitizeRelativePath(relativePath);
  const root = type === "PHOTO" ? resolvePhotoPath() : resolveVideoPath();
  const fullPath = path.join(root, sanitized);

  if (!isPathWithinRoot(fullPath, root)) {
    throw new Error("Access denied: path outside media directory");
  }

  return fullPath;
}

export function resolveSafeThumbnailPath(relativePath: string): string {
  const sanitized = sanitizeRelativePath(relativePath);
  const root = resolveThumbnailPath();
  const fullPath = path.join(root, sanitized);

  if (!isPathWithinRoot(fullPath, root)) {
    throw new Error("Access denied: path outside thumbnail directory");
  }

  return fullPath;
}

export function formatFileSize(bytes: bigint | number): string {
  const num = typeof bytes === "bigint" ? Number(bytes) : bytes;
  if (num === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(num) / Math.log(1024));
  return `${(num / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getResolutionLabel(width: number | null, height: number | null): string {
  if (!width || !height) return "Unknown";
  return `${width}×${height}`;
}

export function getOrientation(
  width: number | null,
  height: number | null
): "landscape" | "portrait" | "square" | null {
  if (!width || !height) return null;
  if (width === height) return "square";
  return width > height ? "landscape" : "portrait";
}
