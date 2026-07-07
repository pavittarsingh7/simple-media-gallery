"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MediaViewer } from "@/components/viewer/media-viewer";
import { GallerySkeleton } from "@/components/gallery/gallery-skeleton";
import type { MediaItem } from "@/types";

export default function ViewPage() {
  const params = useParams();
  const router = useRouter();
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [adjacent, setAdjacent] = useState<{
    prev: MediaItem | null;
    next: MediaItem | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    fetch(`/api/media/${id}?adjacent=true`)
      .then((r) => r.json())
      .then((data) => {
        setMedia(data.media);
        setAdjacent(data.adjacent);
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleNavigate = async (newId: string) => {
    router.replace(`/view/${newId}`, { scroll: false });
    const res = await fetch(`/api/media/${newId}?adjacent=true`);
    if (res.ok) {
      const data = await res.json();
      setMedia(data.media);
      setAdjacent(data.adjacent);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <GallerySkeleton count={1} />
      </div>
    );
  }

  if (!media) return null;

  return (
    <MediaViewer
      media={media}
      adjacent={adjacent ?? undefined}
      onClose={() => router.back()}
      onNavigate={handleNavigate}
    />
  );
}
