"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/layout/app-header";
import { SearchBar } from "@/components/gallery/search-bar";
import { GalleryToolbar } from "@/components/gallery/gallery-toolbar";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { MediaViewer } from "@/components/viewer/media-viewer";
import { useGallery } from "@/hooks/use-gallery";
import { useLayoutPreference, useLocalHistory } from "@/hooks/use-local-storage";
import { useAnalytics } from "@/hooks/use-analytics";
import type { MediaItem } from "@/types";

interface GalleryPageProps {
  type: "PHOTO" | "VIDEO";
  title: string;
  emoji: string;
}

export function GalleryPage({ type, title, emoji }: GalleryPageProps) {
  const { layout, setLayout } = useLayoutPreference();
  const { markViewed, toggleFavorite, isFavorite } = useLocalHistory();
  const { track } = useAnalytics();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [adjacent, setAdjacent] = useState<{
    prev: MediaItem | null;
    next: MediaItem | null;
  } | null>(null);

  const {
    items,
    total,
    loading,
    hasMore,
    loadingMore,
    search,
    setSearch,
    sort,
    setSort,
    filters,
    setFilters,
    loadMore,
  } = useGallery({ type });

  const handleItemClick = useCallback(
    async (item: MediaItem) => {
      setSelectedMedia(item);
      markViewed(item.id, type);
      track("gallery_open", item.id);

      const res = await fetch(`/api/media/${item.id}?adjacent=true`);
      if (res.ok) {
        const data = await res.json();
        setAdjacent(data.adjacent);
      }
    },
    [type, markViewed, track]
  );

  const handleNavigate = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/media/${id}?adjacent=true`);
      if (res.ok) {
        const data = await res.json();
        setSelectedMedia(data.media);
        setAdjacent(data.adjacent);
        markViewed(id, type);
      }
    },
    [type, markViewed]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <span>{emoji}</span> {title}
          </h1>
        </motion.div>

        <div className="mb-6 space-y-4">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              if (v) track("search", undefined, { query: v });
            }}
            placeholder={`Search ${title.toLowerCase()}...`}
          />
          <GalleryToolbar
            layout={layout}
            onLayoutChange={setLayout}
            sort={sort}
            onSortChange={setSort}
            filters={filters}
            onFiltersChange={setFilters}
            type={type}
            total={total}
          />
        </div>

        <GalleryGrid
          items={items}
          layout={layout}
          loading={loading}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          onItemClick={handleItemClick}
          isFavorite={isFavorite}
          onFavorite={toggleFavorite}
        />
      </main>

      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          adjacent={adjacent ?? undefined}
          onClose={() => {
            setSelectedMedia(null);
            setAdjacent(null);
          }}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
