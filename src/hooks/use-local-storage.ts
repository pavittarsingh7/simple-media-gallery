"use client";

import { useCallback, useEffect, useState } from "react";
import { LOCAL_STORAGE_KEYS, VIDEO_PROGRESS_SAVE_INTERVAL_MS } from "@/constants/media";
import type { VideoResumeData, DeviceHistory } from "@/types";

export function useLocalHistory() {
  const [history, setHistory] = useState<DeviceHistory>({
    viewedPhotos: [],
    viewedVideos: [],
    recentlyPlayed: [],
    lastViewed: null,
    favorites: [],
  });

  useEffect(() => {
    setHistory({
      viewedPhotos: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.viewedPhotos) || "[]"),
      viewedVideos: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.viewedVideos) || "[]"),
      recentlyPlayed: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.recentlyPlayed) || "[]"),
      lastViewed: localStorage.getItem(LOCAL_STORAGE_KEYS.lastViewed),
      favorites: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.favorites) || "[]"),
    });
  }, []);

  const markViewed = useCallback((mediaId: string, type: "PHOTO" | "VIDEO") => {
    const key = type === "PHOTO" ? LOCAL_STORAGE_KEYS.viewedPhotos : LOCAL_STORAGE_KEYS.viewedVideos;
    const existing: string[] = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = [mediaId, ...existing.filter((id) => id !== mediaId)].slice(0, 500);
    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem(LOCAL_STORAGE_KEYS.lastViewed, mediaId);

    if (type === "VIDEO") {
      const played: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.recentlyPlayed) || "[]");
      const playedUpdated = [mediaId, ...played.filter((id) => id !== mediaId)].slice(0, 50);
      localStorage.setItem(LOCAL_STORAGE_KEYS.recentlyPlayed, JSON.stringify(playedUpdated));
    }

    setHistory((prev) => ({
      ...prev,
      viewedPhotos: type === "PHOTO" ? updated : prev.viewedPhotos,
      viewedVideos: type === "VIDEO" ? updated : prev.viewedVideos,
      recentlyPlayed:
        type === "VIDEO"
          ? [mediaId, ...prev.recentlyPlayed.filter((id) => id !== mediaId)].slice(0, 50)
          : prev.recentlyPlayed,
      lastViewed: mediaId,
    }));
  }, []);

  const toggleFavorite = useCallback((mediaId: string) => {
    const existing: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.favorites) || "[]");
    const updated = existing.includes(mediaId)
      ? existing.filter((id) => id !== mediaId)
      : [...existing, mediaId];
    localStorage.setItem(LOCAL_STORAGE_KEYS.favorites, JSON.stringify(updated));
    setHistory((prev) => ({ ...prev, favorites: updated }));
    return updated.includes(mediaId);
  }, []);

  const isFavorite = useCallback(
    (mediaId: string) => history.favorites.includes(mediaId),
    [history.favorites]
  );

  return { history, markViewed, toggleFavorite, isFavorite };
}

export function useVideoResume(mediaId: string, relativePath: string) {
  const [resumeData, setResumeData] = useState<VideoResumeData | null>(null);

  useEffect(() => {
    const all: VideoResumeData[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.videoResume) || "[]"
    );
    const found = all.find((r) => r.mediaId === mediaId);
    if (found && found.completedPercent < 95 && found.currentTime > 5) {
      setResumeData(found);
    }
  }, [mediaId]);

  const saveProgress = useCallback(
    (currentTime: number, duration: number) => {
      const completedPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
      const all: VideoResumeData[] = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEYS.videoResume) || "[]"
      );
      const updated: VideoResumeData = {
        mediaId,
        relativePath,
        currentTime,
        lastWatched: new Date().toISOString(),
        completedPercent,
      };
      const filtered = all.filter((r) => r.mediaId !== mediaId);
      filtered.unshift(updated);
      localStorage.setItem(LOCAL_STORAGE_KEYS.videoResume, JSON.stringify(filtered.slice(0, 100)));
    },
    [mediaId, relativePath]
  );

  const clearResume = useCallback(() => {
    const all: VideoResumeData[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.videoResume) || "[]"
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.videoResume,
      JSON.stringify(all.filter((r) => r.mediaId !== mediaId))
    );
    setResumeData(null);
  }, [mediaId]);

  return { resumeData, saveProgress, clearResume, saveInterval: VIDEO_PROGRESS_SAVE_INTERVAL_MS };
}

export function useLayoutPreference() {
  const [layout, setLayout] = useState<"masonry" | "grid" | "list">("masonry");

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.layout);
    if (saved === "masonry" || saved === "grid" || saved === "list") {
      setLayout(saved);
    }
  }, []);

  const updateLayout = useCallback((newLayout: "masonry" | "grid" | "list") => {
    setLayout(newLayout);
    localStorage.setItem(LOCAL_STORAGE_KEYS.layout, newLayout);
  }, []);

  return { layout, setLayout: updateLayout };
}

export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const key = e.key.toLowerCase();
      if (handlers[key]) {
        e.preventDefault();
        handlers[key]();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
