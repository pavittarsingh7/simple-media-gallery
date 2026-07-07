"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  formatFileSize,
  formatDuration,
  getResolutionLabel,
  formatDate,
} from "@/lib/utils/format";
import type { MediaItem } from "@/types";

interface MetadataSidebarProps {
  media: MediaItem;
  onClose: () => void;
}

export function MetadataSidebar({ media, onClose }: MetadataSidebarProps) {
  const meta = media.metadata;

  return (
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute right-0 top-0 h-full w-80 border-l border-white/10 bg-black/80 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold text-white">Details</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-60px)] px-4">
        <div className="space-y-4 pb-8">
          <div>
            <p className="text-lg font-medium text-white">{media.title ?? media.filename}</p>
            <p className="text-sm text-white/50">{media.relativePath}</p>
          </div>

          <Separator className="bg-white/10" />

          <MetadataSection title="File">
            <MetadataRow label="Size" value={formatFileSize(BigInt(media.fileSize))} />
            <MetadataRow label="Resolution" value={getResolutionLabel(media.width, media.height)} />
            <MetadataRow label="Extension" value={`.${media.extension}`} />
            <MetadataRow label="Created" value={formatDate(media.fileCreatedAt)} />
            <MetadataRow label="Modified" value={formatDate(media.fileModifiedAt)} />
            {media.duration && (
              <MetadataRow label="Duration" value={formatDuration(media.duration)} />
            )}
          </MetadataSection>

          {meta && (meta.camera || meta.lens || meta.iso) && (
            <MetadataSection title="Camera">
              {meta.camera && <MetadataRow label="Camera" value={meta.camera} />}
              {meta.lens && <MetadataRow label="Lens" value={meta.lens} />}
              {meta.iso && <MetadataRow label="ISO" value={String(meta.iso)} />}
              {meta.aperture && <MetadataRow label="Aperture" value={meta.aperture} />}
              {meta.shutterSpeed && <MetadataRow label="Shutter" value={meta.shutterSpeed} />}
              {meta.focalLength && <MetadataRow label="Focal Length" value={meta.focalLength} />}
            </MetadataSection>
          )}

          {meta && (meta.codec || meta.fps || meta.bitrate) && (
            <MetadataSection title="Video">
              {meta.codec && <MetadataRow label="Codec" value={meta.codec} />}
              {meta.fps && <MetadataRow label="FPS" value={String(meta.fps)} />}
              {meta.bitrate && (
                <MetadataRow label="Bitrate" value={`${Math.round(meta.bitrate / 1000)} kbps`} />
              )}
              {meta.audioChannels && (
                <MetadataRow label="Audio Channels" value={String(meta.audioChannels)} />
              )}
            </MetadataSection>
          )}

          {meta?.gpsLatitude && meta?.gpsLongitude && (
            <MetadataSection title="Location">
              <MetadataRow
                label="GPS"
                value={`${meta.gpsLatitude.toFixed(4)}, ${meta.gpsLongitude.toFixed(4)}`}
              />
            </MetadataSection>
          )}

          {meta?.tags && meta.tags.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">Tags</p>
              <div className="flex flex-wrap gap-1">
                {meta.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <MetadataRow label="Views" value={String(media.viewCount)} />
        </div>
      </ScrollArea>
    </motion.aside>
  );
}

function MetadataSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/50">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
