import { GalleryPage } from "@/components/gallery/gallery-page";

export const metadata = {
  title: "Photos | Media Gallery",
  description: "Browse your photo collection",
};

export default function PhotosPage() {
  return <GalleryPage type="PHOTO" title="Photos" emoji="📷" />;
}
