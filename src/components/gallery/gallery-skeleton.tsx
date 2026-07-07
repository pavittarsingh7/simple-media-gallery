import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/format";

interface GallerySkeletonProps {
  layout?: "masonry" | "grid" | "list";
  count?: number;
}

export function GallerySkeleton({ layout = "grid", count = 12 }: GallerySkeletonProps) {
  if (layout === "list") {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl p-3">
            <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layout === "masonry") {
    return (
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("mb-4 w-full rounded-xl", i % 3 === 0 ? "h-64" : i % 2 === 0 ? "h-48" : "h-56")}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full rounded-xl" />
      ))}
    </div>
  );
}
