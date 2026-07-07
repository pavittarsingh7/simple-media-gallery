import { GalleryPage } from "@/components/gallery/gallery-page";

export const metadata = {
  title: "Videos | Media Gallery",
  description: "Browse your video collection",
};

export default function VideosPage() {
  return <GalleryPage type="VIDEO" title="Videos" emoji="🎥" />;
}
