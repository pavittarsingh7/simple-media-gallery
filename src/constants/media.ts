export const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
] as const;

export const VIDEO_EXTENSIONS = [
  "mp4",
  "mov",
  "mkv",
  "webm",
  "avi",
  "m4v",
] as const;

export type ImageExtension = (typeof IMAGE_EXTENSIONS)[number];
export type VideoExtension = (typeof VIDEO_EXTENSIONS)[number];

export const THUMBNAIL_SIZES = {
  sm: { width: 150, height: 150 },
  md: { width: 400, height: 400 },
  lg: { width: 800, height: 800 },
  xl: { width: 1200, height: 1200 },
  preview: { width: 1920, height: 1080 },
} as const;

export type ThumbnailSize = keyof typeof THUMBNAIL_SIZES;

export const LAYOUT_TYPES = ["masonry", "grid", "list"] as const;
export type LayoutType = (typeof LAYOUT_TYPES)[number];

export const SORT_OPTIONS = [
  "newest",
  "oldest",
  "name",
  "fileSize",
  "duration",
  "resolution",
  "mostViewed",
  "recentlyViewed",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export const MEDIA_TYPES = ["photo", "video"] as const;
export type MediaCategory = (typeof MEDIA_TYPES)[number];

export const LOCAL_STORAGE_KEYS = {
  deviceId: "mg_device_id",
  theme: "mg_theme",
  layout: "mg_layout",
  favorites: "mg_favorites",
  viewedPhotos: "mg_viewed_photos",
  viewedVideos: "mg_viewed_videos",
  recentlyPlayed: "mg_recently_played",
  lastViewed: "mg_last_viewed",
  videoResume: "mg_video_resume",
  sortPreference: "mg_sort_preference",
  filterPreferences: "mg_filter_preferences",
} as const;

export const MEDIA_SCAN_COMPLETE_EVENT = "media-scan-complete";
