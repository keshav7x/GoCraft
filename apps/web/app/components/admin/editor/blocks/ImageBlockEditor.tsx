"use client";

import { useState } from "react";
import { ImageOff, Replace } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { MediaPicker } from "@/app/components/admin/MediaPicker";
import { cn } from "@/app/lib/utils";
import type { BlockDataMap } from "@/app/lib/admin/types";
import { Field, PlainTextarea, SegmentedControl } from "../editor-shared";

const WIDTH_OPTIONS: { value: BlockDataMap["image"]["width"]; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "full", label: "Full" },
];

export function ImageBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["image"];
  onChange: (patch: Partial<BlockDataMap["image"]>) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center overflow-hidden rounded-lg border border-edge bg-panel-muted">
        {data.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.src}
            alt={data.alt || "Selected image"}
            className={cn(
              "object-contain",
              data.width === "sm" && "max-h-40 w-[40%]",
              data.width === "md" && "max-h-52 w-[65%]",
              data.width === "lg" && "max-h-64 w-[90%]",
              data.width === "full" && "h-64 w-full",
              data.alignment === "left" && "mr-auto",
              data.alignment === "center" && "mx-auto",
              data.alignment === "right" && "ml-auto",
            )}
          />
        ) : (
          <div className="flex h-44 w-full flex-col items-center justify-center gap-2 text-ink-faint">
            <ImageOff size={20} />
            <span className="text-xs">No image selected</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
          <Replace size={13} />
          {data.src ? "Replace image" : "Choose from Media Library"}
        </Button>
        {data.src ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({ src: null, mediaId: null })}
          >
            Remove
          </Button>
        ) : null}
      </div>

      <Field label="Caption">
        <PlainTextarea
          value={data.caption}
          onChange={(caption) => onChange({ caption })}
          placeholder="Figure 1 — The scheduler multiplexes goroutines onto threads."
          rows={2}
        />
      </Field>

      <Field label="Alternative text" hint="Describe the image for screen readers and search.">
        <Input
          value={data.alt}
          onChange={(event) => onChange({ alt: event.target.value })}
          placeholder="Alt text"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <SegmentedControl
          label="Alignment"
          value={data.alignment}
          onChange={(alignment) => onChange({ alignment })}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
        />
        <SegmentedControl
          label="Width"
          value={data.width}
          onChange={(width) => onChange({ width })}
          options={WIDTH_OPTIONS}
        />
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) =>
          onChange({ mediaId: asset.id, src: asset.url, alt: data.alt || asset.alt })
        }
        title="Select image"
      />
    </div>
  );
}
