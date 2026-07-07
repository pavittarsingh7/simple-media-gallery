import { formatFileSize, formatDuration, getResolutionLabel } from "@/lib/utils/paths";
import { format } from "date-fns";

export { formatFileSize, formatDuration, getResolutionLabel };

export function formatDate(date: string | null): string {
  if (!date) return "Unknown";
  try {
    return format(new Date(date), "MMM d, yyyy");
  } catch {
    return "Unknown";
  }
}

export function getMediaUrl(mediaId: string, thumb?: string): string {
  const params = thumb ? `?thumb=${thumb}` : "";
  return `/api/media/${mediaId}/file${params}`;
}

export function getDownloadUrl(mediaId: string): string {
  return `/api/media/${mediaId}/file?download=true`;
}

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
