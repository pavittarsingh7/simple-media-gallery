"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryFilters, MediaItem, PaginatedResult } from "@/types";
import type { SortOption } from "@/constants/media";

interface UseGalleryOptions {
  type: "PHOTO" | "VIDEO";
  initialSort?: SortOption;
  limit?: number;
}

export function useGallery({ type, initialSort = "newest", limit = 48 }: UseGalleryOptions) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [filters, setFilters] = useState<GalleryFilters>({});
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchMedia = useCallback(
    async (pageNum: number, append = false) => {
      const params = new URLSearchParams({
        type,
        page: String(pageNum),
        limit: String(limit),
        sort,
      });

      if (search) params.set("search", search);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.set(key, String(value));
        }
      });

      const res = await fetch(`/api/media?${params}`);
      if (!res.ok) throw new Error("Failed to fetch media");

      const data: PaginatedResult<MediaItem> = await res.json();

      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(pageNum);
    },
    [type, limit, sort, search, filters]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      await fetchMedia(page + 1, true);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, page, fetchMedia]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await fetchMedia(1, false);
    } finally {
      setLoading(false);
    }
  }, [fetchMedia]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      refresh();
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search, sort, filters, type]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items,
    total,
    page,
    hasMore,
    loading,
    loadingMore,
    search,
    setSearch,
    sort,
    setSort,
    filters,
    setFilters,
    loadMore,
    refresh,
  };
}
