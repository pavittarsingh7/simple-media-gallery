"use client";

import { motion } from "framer-motion";
import {
  LayoutGrid,
  LayoutList,
  Columns3,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterPanel } from "@/components/gallery/filter-panel";
import { cn } from "@/lib/utils/format";
import type { GalleryFilters } from "@/types";
import type { SortOption } from "@/constants/media";

interface GalleryToolbarProps {
  layout: "masonry" | "grid" | "list";
  onLayoutChange: (layout: "masonry" | "grid" | "list") => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  filters: GalleryFilters;
  onFiltersChange: (filters: GalleryFilters) => void;
  type: "PHOTO" | "VIDEO";
  total: number;
}

export function GalleryToolbar({
  layout,
  onLayoutChange,
  sort,
  onSortChange,
  filters,
  onFiltersChange,
  type,
  total,
}: GalleryToolbarProps) {
  const layouts = [
    { id: "masonry" as const, icon: Columns3, label: "Masonry" },
    { id: "grid" as const, icon: LayoutGrid, label: "Grid" },
    { id: "list" as const, icon: LayoutList, label: "List" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-4"
    >
      <p className="text-sm text-muted-foreground">
        {total.toLocaleString()} {type === "PHOTO" ? "photos" : "videos"}
      </p>

      <div className="flex items-center gap-2">
        <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-40 border-white/10 bg-white/5 backdrop-blur-xl">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="fileSize">File Size</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
            <SelectItem value="resolution">Resolution</SelectItem>
            <SelectItem value="mostViewed">Most Viewed</SelectItem>
          </SelectContent>
        </Select>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="border-white/10 bg-white/5 backdrop-blur-xl">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FilterPanel
              type={type}
              filters={filters}
              onChange={onFiltersChange}
            />
          </SheetContent>
        </Sheet>

        <div className="flex rounded-lg border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
          {layouts.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onLayoutChange(id)}
              className={cn(
                "rounded-md p-2 transition-all",
                layout === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
