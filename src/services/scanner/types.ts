export interface ImageMetadata {
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  orientation: number | null;
  colorProfile: string | null;
  camera: string | null;
  lens: string | null;
  iso: number | null;
  aperture: string | null;
  shutterSpeed: string | null;
  focalLength: string | null;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  dominantColor: string | null;
  blurDataUrl: string | null;
  tags: string[];
}

export interface VideoMetadata {
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  duration: number | null;
  bitrate: number | null;
  codec: string | null;
  fps: number | null;
  audioChannels: number | null;
  hasSubtitles: boolean;
  dominantColor: string | null;
  blurDataUrl: string | null;
  tags: string[];
}

export interface ScannedFile {
  absolutePath: string;
  relativePath: string;
  filename: string;
  extension: string;
  type: "PHOTO" | "VIDEO";
  fileSize: bigint;
  fileHash: string;
  fileCreatedAt: Date;
  fileModifiedAt: Date;
  imageMeta?: ImageMetadata;
  videoMeta?: VideoMetadata;
}

export interface ScanProgress {
  scanId: string;
  current: number;
  total: number;
  currentFile?: string;
}

export type ScanTrigger = "startup" | "manual" | "scheduled";
