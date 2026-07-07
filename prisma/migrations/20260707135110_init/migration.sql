-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('ACTIVE', 'MISSING', 'BROKEN', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "title" TEXT,
    "relativePath" TEXT NOT NULL,
    "absolutePath" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "extension" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "aspectRatio" DOUBLE PRECISION,
    "duration" DOUBLE PRECISION,
    "status" "MediaStatus" NOT NULL DEFAULT 'ACTIVE',
    "folderId" TEXT,
    "fileCreatedAt" TIMESTAMP(3),
    "fileModifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metadata" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "camera" TEXT,
    "lens" TEXT,
    "iso" INTEGER,
    "aperture" TEXT,
    "shutterSpeed" TEXT,
    "focalLength" TEXT,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "orientation" INTEGER,
    "colorProfile" TEXT,
    "bitrate" INTEGER,
    "codec" TEXT,
    "fps" DOUBLE PRECISION,
    "audioChannels" INTEGER,
    "hasSubtitles" BOOLEAN NOT NULL DEFAULT false,
    "dominantColor" TEXT,
    "blurDataUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extraJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thumbnail" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "fileHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thumbnail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewStatistics" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "resumeCount" INTEGER NOT NULL DEFAULT 0,
    "completionPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "watchDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceAnalytics" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "galleryOpens" INTEGER NOT NULL DEFAULT 0,
    "photoOpens" INTEGER NOT NULL DEFAULT 0,
    "videoOpens" INTEGER NOT NULL DEFAULT 0,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "screenResolution" TEXT,
    "language" TEXT,
    "theme" TEXT,
    "timezone" TEXT,
    "searchQueries" JSONB NOT NULL DEFAULT '[]',
    "filterUsage" JSONB NOT NULL DEFAULT '{}',
    "sortUsage" JSONB NOT NULL DEFAULT '{}',
    "firstVisitAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisitAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanHistory" (
    "id" TEXT NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "filesScanned" INTEGER NOT NULL DEFAULT 0,
    "filesAdded" INTEGER NOT NULL DEFAULT 0,
    "filesUpdated" INTEGER NOT NULL DEFAULT 0,
    "filesDeleted" INTEGER NOT NULL DEFAULT 0,
    "filesRenamed" INTEGER NOT NULL DEFAULT 0,
    "thumbnailsGenerated" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB NOT NULL DEFAULT '[]',
    "triggeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScannerSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScannerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Folder_path_key" ON "Folder"("path");

-- CreateIndex
CREATE INDEX "Folder_parentId_idx" ON "Folder"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_fileHash_key" ON "Media"("fileHash");

-- CreateIndex
CREATE UNIQUE INDEX "Media_relativePath_key" ON "Media"("relativePath");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "Media_status_idx" ON "Media"("status");

-- CreateIndex
CREATE INDEX "Media_folderId_idx" ON "Media"("folderId");

-- CreateIndex
CREATE INDEX "Media_filename_idx" ON "Media"("filename");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

-- CreateIndex
CREATE INDEX "Media_fileModifiedAt_idx" ON "Media"("fileModifiedAt");

-- CreateIndex
CREATE INDEX "Media_type_status_idx" ON "Media"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_mediaId_key" ON "Metadata"("mediaId");

-- CreateIndex
CREATE INDEX "Thumbnail_mediaId_idx" ON "Thumbnail"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "Thumbnail_mediaId_size_key" ON "Thumbnail"("mediaId", "size");

-- CreateIndex
CREATE INDEX "ViewStatistics_deviceId_idx" ON "ViewStatistics"("deviceId");

-- CreateIndex
CREATE INDEX "ViewStatistics_viewCount_idx" ON "ViewStatistics"("viewCount");

-- CreateIndex
CREATE UNIQUE INDEX "ViewStatistics_mediaId_deviceId_key" ON "ViewStatistics"("mediaId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceAnalytics_deviceId_key" ON "DeviceAnalytics"("deviceId");

-- CreateIndex
CREATE INDEX "ScanHistory_startedAt_idx" ON "ScanHistory"("startedAt");

-- CreateIndex
CREATE INDEX "ScanHistory_status_idx" ON "ScanHistory"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ScannerSettings_key_key" ON "ScannerSettings"("key");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metadata" ADD CONSTRAINT "Metadata_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thumbnail" ADD CONSTRAINT "Thumbnail_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewStatistics" ADD CONSTRAINT "ViewStatistics_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
