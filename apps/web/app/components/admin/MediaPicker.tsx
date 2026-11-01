"use client";

import { useMemo, useRef, useState } from "react";
import { Search, Upload } from "lucide-react";
import { Dialog } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { SearchInput } from "@/app/components/ui/input";
import { EmptyState } from "@/app/components/ui/empty-state";
import { useCmsStore } from "@/app/lib/admin/store";
import { formatBytes } from "@/app/lib/admin/format";
import { uid, type MediaAsset } from "@/app/lib/admin/types";
import { cn } from "@/app/lib/utils";

type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  title?: string;
};

export function MediaPicker({ open, onClose, onSelect, title = "Media Library" }: MediaPickerProps) {
  const media = useCmsStore((state) => state.media);
  const addMedia = useCmsStore((state) => state.addMedia);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return media;
    return media.filter(
      (asset) => asset.name.toLowerCase().includes(q) || asset.alt.toLowerCase().includes(q),
    );
  }, [media, query]);

  function handleUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const asset: MediaAsset = {
        id: uid("media"),
        name: file.name,
        url: String(reader.result ?? ""),
        size: file.size,
        type: file.type || "image/*",
        alt: file.name.replace(/\.[^.]+$/, ""),
        uploadedAt: new Date().toISOString(),
      };
      addMedia(asset);
      setSelectedId(asset.id);
    };
    reader.readAsDataURL(file);
  }

  const selected = media.find((asset) => asset.id === selectedId) ?? null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description="Pick an existing image or upload a new one."
      className="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            disabled={!selected}
            onClick={() => {
              if (selected) {
                onSelect(selected);
                onClose();
              }
            }}
          >
            Insert image
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search images…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
            className="flex-1"
          />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload size={14} />
            Upload
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleUpload(file);
              event.target.value = "";
            }}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No images found"
            description="Try a different search term, or upload a new image."
            className="py-10"
          />
        ) : (
          <div className="gc-scrollbar grid max-h-[46vh] grid-cols-3 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-4">
            {filtered.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSelectedId(asset.id)}
                onDoubleClick={() => {
                  onSelect(asset);
                  onClose();
                }}
                className={cn(
                  "focus-ring group overflow-hidden rounded-lg border text-left transition",
                  selectedId === asset.id
                    ? "border-accent ring-2 ring-accent/25"
                    : "border-edge hover:border-edge-strong",
                )}
              >
                <div className="aspect-[4/3] bg-panel-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.url} alt={asset.alt} className="h-full w-full object-cover" />
                </div>
                <div className="px-2 py-1.5">
                  <p className="truncate text-[11px] font-medium text-ink">{asset.name}</p>
                  <p className="text-[10px] text-ink-faint">{formatBytes(asset.size)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
