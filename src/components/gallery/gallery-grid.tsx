"use client";

import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion, AnimatePresence } from "framer-motion";
import { MediaCard } from "@/components/gallery/media-card";
import { GallerySkeleton } from "@/components/gallery/gallery-skeleton";
import { cn } from "@/lib/utils/format";
import type { MediaItem } from "@/types";

interface GalleryGridProps {
  items: MediaItem[];
  layout: "masonry" | "grid" | "list";
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onItemClick: (item: MediaItem) => void;
  isFavorite: (id: string) => boolean;
  onFavorite: (id: string) => void;
}

export function GalleryGrid({
  items,
  layout,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  onItemClick,
  isFavorite,
  onFavorite,
}: GalleryGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const columns = layout === "list" ? 1 : layout === "grid" ? 4 : 3;
  const rowCount = layout === "list" ? items.length : Math.ceil(items.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (layout === "list" ? 88 : layout === "grid" ? 280 : 320),
    overscan: 5,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

  if (loading) {
    return <GallerySkeleton layout={layout} />;
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-4 text-6xl">📭</div>
        <h3 className="text-xl font-semibold">No media found</h3>
        <p className="mt-2 text-muted-foreground">
          Add files to your media folders and run a scan to populate the gallery.
        </p>
      </motion.div>
    );
  }

  if (layout === "masonry") {
    return (
      <div>
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          <AnimatePresence>
            {items.map((item, index) => (
              <MediaCard
                key={item.id}
                item={item}
                layout="masonry"
                index={index}
                isFavorite={isFavorite(item.id)}
                onClick={() => onItemClick(item)}
                onFavorite={() => onFavorite(item.id)}
              />
            ))}
          </AnimatePresence>
        </div>
        <div ref={loadMoreRef} className="h-10" />
        {loadingMore && <GallerySkeleton layout={layout} count={4} />}
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-[calc(100vh-200px)] overflow-auto">
      <div
        style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems =
            layout === "list"
              ? [items[virtualRow.index]]
              : items.slice(virtualRow.index * columns, virtualRow.index * columns + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className={cn(
                  "gap-4 p-1",
                  layout === "list" ? "flex flex-col" : `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
                )}
              >
                {rowItems.filter(Boolean).map((item, colIndex) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    layout={layout}
                    index={virtualRow.index * columns + colIndex}
                    isFavorite={isFavorite(item.id)}
                    onClick={() => onItemClick(item)}
                    onFavorite={() => onFavorite(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div ref={loadMoreRef} className="h-10" />
      {loadingMore && <GallerySkeleton layout={layout} count={4} />}
    </div>
  );
}
