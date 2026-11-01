"use client";

import { useMemo, useRef, useState } from "react";
import { ImageOff, Search, Trash2, Upload } from "lucide-react";
import { toast, Toaster } from "sonner";
import { PageHeader } from "@/app/components/ui/page-header";
import { Button } from "@/app/components/ui/button";
import { Dialog } from "@/app/components/ui/dialog";
import { EmptyState } from "@/app/components/ui/empty-state";
import { SearchInput } from "@/app/components/ui/input";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { useCmsStore } from "@/app/lib/admin/store";
import { formatBytes, formatRelative } from "@/app/lib/admin/format";
import { uid, type MediaAsset } from "@/app/lib/admin/types";
import { cn } from "@/app/lib/utils";

export default function MediaLibraryPage() {
  const media = useCmsStore((state) => state.media);
  const addMedia = useCmsStore((state) => state.addMedia);
  const deleteMedia = useCmsStore((state) => state.deleteMedia);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
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
      addMedia({
        id: uid("media"),
        name: file.name,
        url: String(reader.result ?? ""),
        size: file.size,
        type: file.type || "image/*",
        alt: file.name.replace(/\.[^.]+$/, ""),
        uploadedAt: new Date().toISOString(),
      });
      toast.success(`Uploaded ${file.name}`);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div data-accent="emerald" className="space-y-6">
      <Toaster position="bottom-right" richColors />
      <PageHeader
        title="Media Library"
        description="Images available to image and visual explanation blocks."
        actions={
          <Button variant="accent" onClick={() => fileRef.current?.click()}>
            <Upload size={15} />
            Upload image
          </Button>
        }
      />
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

      <SearchInput
        placeholder="Search images by name or alt text…"
        className="max-w-md"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No images found"
          description="Upload an image or adjust your search."
          action={
            <Button variant="accent" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload size={14} />
              Upload image
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="group overflow-hidden rounded-xl border border-edge bg-panel shadow-card transition hover:border-edge-strong"
            >
              <button
                type="button"
                onClick={() => setSelected(asset)}
                className="gc-focus-ring block w-full"
              >
                <div className="aspect-[4/3] bg-panel-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.url} alt={asset.alt} className="h-full w-full object-cover" />
                </div>
              </button>
              <div className="flex items-start justify-between gap-2 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink">{asset.name}</p>
                  <p className="mt-0.5 text-[11px] text-ink-3">
                    {formatBytes(asset.size)} · {formatRelative(asset.uploadedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Delete ${asset.name}`}
                  onClick={() => setDeleteTarget(asset)}
                  className="focus-ring shrink-0 rounded-lg p-1.5 text-ink-faint opacity-0 transition group-hover:opacity-100 hover:bg-hard-soft hover:text-hard focus-visible:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Image"}
        description={selected ? `${formatBytes(selected.size)} · Uploaded ${formatRelative(selected.uploadedAt)}` : undefined}
        className="max-w-2xl"
        footer={
          <>
            <Button
              variant="danger"
              onClick={() => {
                if (selected) setDeleteTarget(selected);
              }}
            >
              <Trash2 size={14} />
              Delete
            </Button>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-edge bg-panel-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.url} alt={selected.alt} className="max-h-[50vh] w-full object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-4">
                Alternative text
              </p>
              <p className={cn("mt-1 text-sm text-ink-2", !selected.alt && "text-ink-faint")}>
                {selected.alt || "No alt text provided"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-4">
                Asset ID
              </p>
              <p className="mt-1 font-mono text-xs text-ink-2">{selected.id}</p>
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center text-ink-faint">
            <ImageOff size={22} />
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete image?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed from the library. Blocks using it will show a placeholder.`
            : ""
        }
        confirmLabel="Delete image"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMedia(deleteTarget.id);
            toast.success("Image deleted");
          }
          setSelected(null);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
