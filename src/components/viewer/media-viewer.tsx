"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Info,
  Play,
  Pause,
  Volume2,
  VolumeX,
  PictureInPicture,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MetadataSidebar } from "@/components/viewer/metadata-sidebar";
import { useVideoResume, useKeyboardShortcuts } from "@/hooks/use-local-storage";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  cn,
  formatDuration,
  getMediaUrl,
  getDownloadUrl,
} from "@/lib/utils/format";
import type { MediaItem } from "@/types";

interface MediaViewerProps {
  media: MediaItem;
  adjacent?: { prev: MediaItem | null; next: MediaItem | null };
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export function MediaViewer({ media, adjacent, onClose, onNavigate }: MediaViewerProps) {
  const [showMetadata, setShowMetadata] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const { track } = useAnalytics();

  useEffect(() => {
    track(media.type === "PHOTO" ? "photo_open" : "video_open", media.id);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [media.id, media.type, track]);

  useKeyboardShortcuts({
    escape: onClose,
    arrowleft: () => adjacent?.prev && onNavigate(adjacent.prev.id),
    arrowright: () => adjacent?.next && onNavigate(adjacent.next.id),
    f: () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
  });

  const handleZoom = useCallback((delta: number) => {
    setZoom((z) => Math.max(0.5, Math.min(5, z + delta)));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex bg-black/95 backdrop-blur-xl"
      >
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
              <X className="h-5 w-5" />
            </Button>
            <span className="text-sm text-white/70">{media.filename}</span>
          </div>
          <div className="flex items-center gap-2">
            {media.type === "PHOTO" && (
              <>
                <Button variant="ghost" size="icon" onClick={() => handleZoom(-0.25)} className="text-white hover:bg-white/10">
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleZoom(0.25)} className="text-white hover:bg-white/10">
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => document.documentElement.requestFullscreen()}
              className="text-white hover:bg-white/10"
            >
              <Maximize className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10">
              <a href={getDownloadUrl(media.id)} download>
                <Download className="h-5 w-5" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMetadata(!showMetadata)}
              className={cn("text-white hover:bg-white/10", showMetadata && "bg-white/10")}
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {adjacent?.prev && (
          <button
            onClick={() => onNavigate(adjacent.prev!.id)}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {adjacent?.next && (
          <button
            onClick={() => onNavigate(adjacent.next!.id)}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        <div
          className="flex flex-1 items-center justify-center overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          {media.type === "PHOTO" ? (
            <motion.div
              layoutId={`media-${media.id}`}
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              }}
              className="relative max-h-[90vh] max-w-[90vw]"
            >
              <Image
                src={getMediaUrl(media.id)}
                alt={media.filename}
                width={media.width ?? 1920}
                height={media.height ?? 1080}
                className="max-h-[90vh] w-auto object-contain"
                priority
              />
            </motion.div>
          ) : (
            <VideoPlayer media={media} track={track} />
          )}
        </div>

        <AnimatePresence>
          {showMetadata && (
            <MetadataSidebar media={media} onClose={() => setShowMetadata(false)} />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

function VideoPlayer({
  media,
  track,
}: {
  media: MediaItem;
  track: (event: string, mediaId?: string, data?: Record<string, unknown>) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const { resumeData, saveProgress, clearResume, saveInterval } = useVideoResume(
    media.id,
    media.relativePath
  );
  const progressInterval = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    if (resumeData) {
      setShowResumePrompt(true);
    }
  }, [resumeData]);

  const startPlayback = useCallback(
    (fromTime = 0) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = fromTime;
      video.play();
      setPlaying(true);
      track("video_play", media.id);

      progressInterval.current = setInterval(() => {
        if (video) {
          saveProgress(video.currentTime, video.duration);
        }
      }, saveInterval);
    },
    [media.id, saveProgress, saveInterval, track]
  );

  const handleResume = () => {
    setShowResumePrompt(false);
    startPlayback(resumeData?.currentTime ?? 0);
    track("video_resume", media.id);
  };

  const handleStartOver = () => {
    setShowResumePrompt(false);
    clearResume();
    startPlayback(0);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
    } else {
      startPlayback(video.currentTime);
    }
  };

  useKeyboardShortcuts({ " ": togglePlay });

  return (
    <div className="relative w-full max-w-5xl">
      {showResumePrompt && resumeData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-x-0 top-1/2 z-20 mx-auto w-fit -translate-y-1/2 rounded-2xl bg-black/80 p-6 text-center backdrop-blur-xl"
        >
          <p className="mb-4 text-white">
            Resume from {formatDuration(resumeData.currentTime)}?
          </p>
          <div className="flex gap-3">
            <Button onClick={handleResume}>Resume</Button>
            <Button variant="outline" onClick={handleStartOver}>
              Start Over
            </Button>
          </div>
        </motion.div>
      )}

      <video
        ref={videoRef}
        src={getMediaUrl(media.id)}
        className="max-h-[80vh] w-full rounded-lg"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setPlaying(false);
          saveProgress(duration, duration);
          if (progressInterval.current) clearInterval(progressInterval.current);
        }}
        onClick={togglePlay}
      />

      <div className="mt-4 space-y-3 rounded-xl bg-white/5 p-4 backdrop-blur-xl">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={([v]) => {
            if (videoRef.current) {
              videoRef.current.currentTime = v;
              setCurrentTime(v);
            }
          }}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white">
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <span className="text-sm text-white/70">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <SelectSpeed speed={speed} onChange={(s) => {
              setSpeed(s);
              if (videoRef.current) videoRef.current.playbackRate = s;
            }} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setMuted(!muted);
                if (videoRef.current) videoRef.current.muted = !muted;
              }}
              className="text-white"
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider
              className="w-24"
              value={[muted ? 0 : volume]}
              max={1}
              step={0.05}
              onValueChange={([v]) => {
                setVolume(v);
                setMuted(v === 0);
                if (videoRef.current) {
                  videoRef.current.volume = v;
                  videoRef.current.muted = v === 0;
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => videoRef.current?.requestPictureInPicture()}
              className="text-white"
            >
              <PictureInPicture className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectSpeed({ speed, onChange }: { speed: number; onChange: (s: number) => void }) {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  return (
    <select
      value={speed}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-md bg-white/10 px-2 py-1 text-sm text-white"
    >
      {speeds.map((s) => (
        <option key={s} value={s}>
          {s}x
        </option>
      ))}
    </select>
  );
}
