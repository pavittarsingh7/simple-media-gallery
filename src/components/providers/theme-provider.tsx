"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { LOCAL_STORAGE_KEYS, MEDIA_SCAN_COMPLETE_EVENT } from "@/constants/media";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey={LOCAL_STORAGE_KEYS.theme}
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  return { theme, setTheme, resolvedTheme };
}

interface AppStats {
  photos: number;
  videos: number;
  total: number;
}

const StatsContext = createContext<AppStats>({ photos: 0, videos: 0, total: 0 });

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<AppStats>({ photos: 0, videos: 0, total: 0 });

  useEffect(() => {
    const loadStats = () => {
      fetch("/api/stats")
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {});
    };

    loadStats();
    window.addEventListener(MEDIA_SCAN_COMPLETE_EVENT, loadStats);
    return () => window.removeEventListener(MEDIA_SCAN_COMPLETE_EVENT, loadStats);
  }, []);

  return <StatsContext.Provider value={stats}>{children}</StatsContext.Provider>;
}

export function useStats() {
  return useContext(StatsContext);
}
