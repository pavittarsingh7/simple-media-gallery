"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, MoreHorizontal, Play, Clock, HardDrive } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatFileSize, formatDuration, getResolutionLabel, formatDate, getMediaUrl, getDownloadUrl } from "@/lib/utils/format";
import type { MediaItem } from "@/types";

interface MediaCardProps {
  item: MediaItem;
  layout: "masonry" | "grid" | "list";
  isSelected?: boolean;
  isFavorite?: boolean;
  onClick: () => void;
  onFavorite?: () => void;
  index?: number;
}

export function MediaCard({
  item,
  layout,
  isSelected,
  isFavorite,
  onClick,
  onFavorite,
  index = 0,
}: MediaCardProps) {
  const thumb = item.thumbnails.find((t) => t.size === "md") ?? item.thumbnails[0];
  const thumbUrl = thumb ? getMediaUrl(item.id, thumb.size) : null;
  const blurData = item.metadata?.blurDataUrl;
  const showVideoPlaceholder = item.type === "VIDEO" && !thumbUrl;

  if (layout === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        layoutId={`media-${item.id}`}
      >
        <Card
          className={cn(
            "group flex cursor-pointer items-center gap-4 overflow-hidden p-3 transition-all hover:shadow-lg",
            "border-white/10 bg-white/5 backdrop-blur-xl dark:bg-white/5",
            isSelected && "ring-2 ring-primary"
          )}
          onClick={onClick}
        >
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            {showVideoPlaceholder ? (
              <div className="flex h-full w-full items-center justify-center bg-purple-500/20">
                <Play className="h-5 w-5 text-purple-400" />
              </div>
            ) : (
              <Image
                src={thumbUrl!}
                alt={item.filename}
                fill
                className="object-cover"
                sizes="64px"
                placeholder={blurData ? "blur" : "empty"}
                blurDataURL={blurData ?? undefined}
              />
            )}
            {item.type === "VIDEO" && !showVideoPlaceholder && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="h-5 w-5 fill-white text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{item.title ?? item.filename}</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{getResolutionLabel(item.width, item.height)}</span>
              {item.duration && <span>{formatDuration(item.duration)}</span>}
              <span>{formatFileSize(BigInt(item.fileSize))}</span>
              <span>{formatDate(item.fileCreatedAt)}</span>
            </div>
          </div>
          <CardActions item={item} isFavorite={isFavorite} onFavorite={onFavorite} />
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 25 }}
      layoutId={`media-${item.id}`}
      className={cn(layout === "masonry" && "break-inside-avoid mb-4")}
    >
      <Card
        className={cn(
          "group relative cursor-pointer overflow-hidden border-0 p-0 transition-all duration-300",
          "bg-white/5 shadow-lg backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/10",
          "hover:-translate-y-1",
          isSelected && "ring-2 ring-primary",
          layout === "grid" && "aspect-square"
        )}
        onClick={onClick}
      >
        <div className={cn("relative w-full overflow-hidden", layout === "grid" ? "h-full" : "h-auto")}>
          {showVideoPlaceholder ? (
            <div
              className={cn(
                "flex w-full items-center justify-center bg-gradient-to-br from-purple-500/20 to-purple-900/30",
                layout === "grid" ? "h-full min-h-[200px]" : "min-h-[200px]"
              )}
            >
              <div className="rounded-full bg-black/40 p-4">
                <Play className="h-8 w-8 fill-white text-white" />
              </div>
            </div>
          ) : (
            <Image
              src={thumbUrl!}
              alt={item.filename}
              width={thumb?.width ?? 400}
              height={thumb?.height ?? 400}
              className={cn(
                "w-full transition-transform duration-500 group-hover:scale-105",
                layout === "grid" ? "h-full object-cover" : "h-auto object-cover"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              placeholder={blurData ? "blur" : "empty"}
              blurDataURL={blurData ?? undefined}
              style={{
                backgroundColor: item.metadata?.dominantColor ?? undefined,
              }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {item.type === "VIDEO" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-black/50 p-3 opacity-80 backdrop-blur-sm transition-transform group-hover:scale-110">
                <Play className="h-6 w-6 fill-white text-white" />
              </div>
            </div>
          )}

          {item.duration && (
            <Badge className="absolute bottom-2 right-2 bg-black/60 text-white backdrop-blur-sm">
              <Clock className="mr-1 h-3 w-3" />
              {formatDuration(item.duration)}
            </Badge>
          )}

          <div className="absolute bottom-0 left-0 right-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
            <p className="truncate text-sm font-medium text-white">{item.title ?? item.filename}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
              <span>{getResolutionLabel(item.width, item.height)}</span>
              <span>·</span>
              <HardDrive className="h-3 w-3" />
              <span>{formatFileSize(BigInt(item.fileSize))}</span>
            </div>
          </div>

          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <CardActions item={item} isFavorite={isFavorite} onFavorite={onFavorite} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function CardActions({
  item,
  isFavorite,
  onFavorite,
}: {
  item: MediaItem;
  isFavorite?: boolean;
  onFavorite?: () => void;
}) {
  return (
    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onFavorite}
        className="rounded-full bg-black/40 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/60"
      >
        <Heart className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "text-white")} />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full bg-black/40 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/60">
          <MoreHorizontal className="h-4 w-4 text-white" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href={getDownloadUrl(item.id)} download>
              Download
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/view/${item.id}`)}
          >
            Copy Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
