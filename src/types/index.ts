import type { MediaType, MediaStatus } from "@/generated/prisma/client";
import type { LayoutType, SortOption, ThumbnailSize } from "@/constants/media";

export interface MediaItem {
  id: string;
  fileHash: string;
  filename: string;
  title: string | null;
  relativePath: string;
  type: MediaType;
  extension: string;
  fileSize: string;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  duration: number | null;
  status: MediaStatus;
  folderPath: string | null;
  fileCreatedAt: string | null;
  fileModifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: MediaMetadata | null;
  thumbnails: ThumbnailInfo[];
  viewCount: number;
}

export interface MediaMetadata {
  camera: string | null;
  lens: string | null;
  iso: number | null;
  aperture: string | null;
  shutterSpeed: string | null;
  focalLength: string | null;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  orientation: number | null;
  colorProfile: string | null;
  bitrate: number | null;
  codec: string | null;
  fps: number | null;
  audioChannels: number | null;
  hasSubtitles: boolean;
  dominantColor: string | null;
  blurDataUrl: string | null;
  tags: string[];
}

export interface ThumbnailInfo {
  size: ThumbnailSize | string;
  path: string;
  width: number;
  height: number;
}

export interface GalleryFilters {
  resolution?: string;
  orientation?: "landscape" | "portrait" | "square";
  camera?: string;
  lens?: string;
  extension?: string;
  dateFrom?: string;
  dateTo?: string;
  durationMin?: number;
  durationMax?: number;
  codec?: string;
  fps?: number;
  folder?: string;
}

export interface GalleryQuery {
  type: "PHOTO" | "VIDEO";
  page?: number;
  limit?: number;
  search?: string;
  sort?: SortOption;
  filters?: GalleryFilters;
  layout?: LayoutType;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ScanResult {
  scanId: string;
  filesScanned: number;
  filesAdded: number;
  filesUpdated: number;
  filesDeleted: number;
  filesRenamed: number;
  thumbnailsGenerated: number;
  errors: string[];
}

export interface VideoResumeData {
  mediaId: string;
  relativePath: string;
  currentTime: number;
  lastWatched: string;
  completedPercent: number;
}

export interface DeviceHistory {
  viewedPhotos: string[];
  viewedVideos: string[];
  recentlyPlayed: string[];
  lastViewed: string | null;
  favorites: string[];
}

export interface AdminDashboardStats {
  totalMedia: number;
  photoCount: number;
  videoCount: number;
  storageUsed: string;
  scannerStatus: "idle" | "running" | "failed";
  lastScan: ScanHistoryItem | null;
  brokenFiles: number;
  missingFiles: number;
  duplicateFiles: number;
  topViewed: MediaItem[];
  recentScans: ScanHistoryItem[];
}

export interface ScanHistoryItem {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  filesScanned: number;
  filesAdded: number;
  filesUpdated: number;
  filesDeleted: number;
  filesRenamed: number;
  thumbnailsGenerated: number;
  triggeredBy: string;
  errors: string[];
}

export interface AnalyticsPayload {
  deviceId: string;
  event: string;
  mediaId?: string;
  data?: Record<string, unknown>;
  deviceInfo?: {
    deviceType?: string;
    browser?: string;
    os?: string;
    screenResolution?: string;
    language?: string;
    theme?: string;
    timezone?: string;
  };
}
