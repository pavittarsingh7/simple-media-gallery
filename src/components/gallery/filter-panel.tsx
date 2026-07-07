"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { GalleryFilters } from "@/types";

interface FilterPanelProps {
  type: "PHOTO" | "VIDEO";
  filters: GalleryFilters;
  onChange: (filters: GalleryFilters) => void;
}

export function FilterPanel({ type, filters, onChange }: FilterPanelProps) {
  const [options, setOptions] = useState<{
    cameras: string[];
    lenses: string[];
    extensions: string[];
    codecs: string[];
  }>({ cameras: [], lenses: [], extensions: [], codecs: [] });

  useEffect(() => {
    fetch(`/api/filters?type=${type}`)
      .then((r) => r.json())
      .then(setOptions)
      .catch(() => {});
  }, [type]);

  const update = (key: keyof GalleryFilters, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-2">
        <Label>Extension</Label>
        <Select value={filters.extension ?? ""} onValueChange={(v) => update("extension", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Any extension" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any</SelectItem>
            {options.extensions.map((ext) => (
              <SelectItem key={ext} value={ext}>
                .{ext}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Resolution (min)</Label>
        <Input
          placeholder="e.g. 1920x1080"
          value={filters.resolution ?? ""}
          onChange={(e) => update("resolution", e.target.value)}
        />
      </div>

      {type === "PHOTO" && (
        <>
          <div className="space-y-2">
            <Label>Orientation</Label>
            <Select
              value={filters.orientation ?? ""}
              onValueChange={(v) => update("orientation", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any orientation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
                <SelectItem value="portrait">Portrait</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Camera</Label>
            <Select value={filters.camera ?? ""} onValueChange={(v) => update("camera", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Any camera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                {options.cameras.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Lens</Label>
            <Select value={filters.lens ?? ""} onValueChange={(v) => update("lens", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Any lens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                {options.lenses.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {type === "VIDEO" && (
        <>
          <div className="space-y-2">
            <Label>Codec</Label>
            <Select value={filters.codec ?? ""} onValueChange={(v) => update("codec", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Any codec" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                {options.codecs.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Min Duration (seconds)</Label>
            <Input
              type="number"
              value={filters.durationMin ?? ""}
              onChange={(e) =>
                onChange({ ...filters, durationMin: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Max Duration (seconds)</Label>
            <Input
              type="number"
              value={filters.durationMax ?? ""}
              onChange={(e) =>
                onChange({ ...filters, durationMax: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date From</Label>
          <Input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => update("dateFrom", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Date To</Label>
          <Input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => update("dateTo", e.target.value)}
          />
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={() => onChange({})}>
        Clear Filters
      </Button>
    </div>
  );
}
