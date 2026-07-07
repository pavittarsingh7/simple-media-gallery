"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Film, Moon, Sun, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { useStats } from "@/components/providers/theme-provider";
import { useAnalytics } from "@/hooks/use-analytics";
import { useEffect } from "react";

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const stats = useStats();
  const { track } = useAnalytics();

  useEffect(() => {
    track("visit");
  }, [track]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Camera className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">Media Gallery</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/photos">
            <Button variant="ghost" size="sm" className="gap-2">
              <Camera className="h-4 w-4" />
              Photos
              {stats.photos > 0 && (
                <span className="text-xs text-muted-foreground">({stats.photos})</span>
              )}
            </Button>
          </Link>
          <Link href="/videos">
            <Button variant="ghost" size="sm" className="gap-2">
              <Film className="h-4 w-4" />
              Videos
              {stats.videos > 0 && (
                <span className="text-xs text-muted-foreground">({stats.videos})</span>
              )}
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
