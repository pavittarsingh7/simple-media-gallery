"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Film, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { useStats } from "@/components/providers/theme-provider";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function HomePage() {
  const stats = useStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <AppHeader />

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-12 text-center"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6 inline-flex"
          >
            <Sparkles className="h-12 w-12 text-primary" />
          </motion.div>
          <h1 className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl">
            Media Gallery
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your personal photo & video library
          </p>
          {stats.total > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {stats.photos.toLocaleString()} photos · {stats.videos.toLocaleString()} videos
            </p>
          )}
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2"
        >
          <motion.div variants={item}>
            <Link href="/photos" className="group block">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 dark:bg-white/5">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/10 transition-transform duration-500 group-hover:scale-150" />
                <Camera className="mb-4 h-12 w-12 text-blue-500 transition-transform duration-300 group-hover:scale-110" />
                <h2 className="text-2xl font-semibold">Photos</h2>
                <p className="mt-2 text-muted-foreground">
                  Browse your image collection with EXIF metadata
                </p>
                {stats.photos > 0 && (
                  <p className="mt-4 text-3xl font-bold text-blue-500">
                    {stats.photos.toLocaleString()}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link href="/videos" className="group block">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 dark:bg-white/5">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/10 transition-transform duration-500 group-hover:scale-150" />
                <Film className="mb-4 h-12 w-12 text-purple-500 transition-transform duration-300 group-hover:scale-110" />
                <h2 className="text-2xl font-semibold">Videos</h2>
                <p className="mt-2 text-muted-foreground">
                  Watch with resume playback and custom controls
                </p>
                {stats.videos > 0 && (
                  <p className="mt-4 text-3xl font-bold text-purple-500">
                    {stats.videos.toLocaleString()}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center text-sm text-muted-foreground"
        >
          Add media to your configured folders — no upload needed
        </motion.p>
      </main>
    </div>
  );
}
