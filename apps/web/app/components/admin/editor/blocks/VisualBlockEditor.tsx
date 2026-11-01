"use client";

import { useState } from "react";
import { ImageOff, Replace } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { MediaPicker } from "@/app/components/admin/MediaPicker";
import type { BlockDataMap } from "@/app/lib/admin/types";
import { Field, PlainTextarea } from "../editor-shared";

export function DiagramBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["diagram"];
  onChange: (patch: Partial<BlockDataMap["diagram"]>) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title">
          <Input
            value={data.title}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="e.g. Garbage collection cycle"
          />
        </Field>
        <Field label="Alternative text">
          <Input
            value={data.alt}
            onChange={(event) => onChange({ alt: event.target.value })}
            placeholder="Describe the diagram"
          />
        </Field>
      </div>

      <div className="flex items-center justify-center overflow-hidden rounded-lg border border-edge bg-panel-muted">
        {data.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.src} alt={data.alt} className="max-h-72 w-full object-contain" />
        ) : (
          <div className="flex h-44 w-full flex-col items-center justify-center gap-2 text-ink-faint">
            <ImageOff size={20} />
            <span className="text-xs">No diagram selected</span>
          </div>
        )}
      </div>

      <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
        <Replace size={13} />
        {data.src ? "Replace diagram" : "Choose diagram"}
      </Button>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) =>
          onChange({ mediaId: asset.id, src: asset.url, alt: data.alt || asset.alt })
        }
        title="Select diagram"
      />
    </div>
  );
}

export function VisualExplanationBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["visualExplanation"];
  onChange: (patch: Partial<BlockDataMap["visualExplanation"]>) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function updateAnnotation(id: string, patch: { label?: string; note?: string }) {
    onChange({
      annotations: data.annotations.map((annotation) =>
        annotation.id === id ? { ...annotation, ...patch } : annotation,
      ),
    });
  }

  return (
    <div className="space-y-3">
      <Field label="Title">
        <Input
          value={data.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="e.g. How a channel connects goroutines"
        />
      </Field>

      <div className="flex items-center justify-center overflow-hidden rounded-lg border border-edge bg-panel-muted">
        {data.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.src} alt={data.title} className="max-h-72 w-full object-contain" />
        ) : (
          <div className="flex h-44 w-full flex-col items-center justify-center gap-2 text-ink-faint">
            <ImageOff size={20} />
            <span className="text-xs">No visual selected</span>
          </div>
        )}
      </div>

      <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
        <Replace size={13} />
        {data.src ? "Replace visual" : "Choose visual"}
      </Button>

      <Field label="Explanation">
        <PlainTextarea
          value={data.explanation}
          onChange={(explanation) => onChange({ explanation })}
          placeholder="Walk the learner through what they are looking at."
          rows={3}
        />
      </Field>

      <Field label="Annotations & labels" hint="Call out the important parts of the visual.">
        <div className="space-y-2">
          {data.annotations.map((annotation) => (
            <div key={annotation.id} className="flex items-center gap-2">
              <Input
                value={annotation.label}
                onChange={(event) => updateAnnotation(annotation.id, { label: event.target.value })}
                placeholder="Label"
                className="w-36 shrink-0"
              />
              <Input
                value={annotation.note}
                onChange={(event) => updateAnnotation(annotation.id, { note: event.target.value })}
                placeholder="What it means"
              />
              <button
                type="button"
                aria-label="Remove annotation"
                onClick={() =>
                  onChange({ annotations: data.annotations.filter((a) => a.id !== annotation.id) })
                }
                className="focus-ring shrink-0 rounded-lg border border-edge px-2 py-2 text-xs text-ink-3 transition hover:border-hard/40 hover:bg-hard-soft hover:text-hard"
              >
                ✕
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              onChange({
                annotations: [
                  ...data.annotations,
                  { id: `an_${Math.random().toString(36).slice(2, 8)}`, label: "", note: "" },
                ],
              })
            }
          >
            Add annotation
          </Button>
        </div>
      </Field>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => onChange({ mediaId: asset.id, src: asset.url })}
        title="Select visual"
      />
    </div>
  );
}

export function StepByStepBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["stepByStep"];
  onChange: (patch: Partial<BlockDataMap["stepByStep"]>) => void;
}) {
  function updateStep(id: string, patch: { title?: string; description?: string }) {
    onChange({
      steps: data.steps.map((step) => (step.id === id ? { ...step, ...patch } : step)),
    });
  }

  return (
    <div className="space-y-3">
      <Field label="Title">
        <Input
          value={data.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="e.g. Tracing a channel send"
        />
      </Field>

      <div className="space-y-3">
        {data.steps.map((step, index) => (
          <div key={step.id} className="rounded-lg border border-edge bg-panel-muted/50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-4">
                Step {index + 1}
              </span>
              <button
                type="button"
                aria-label={`Remove step ${index + 1}`}
                onClick={() => onChange({ steps: data.steps.filter((s) => s.id !== step.id) })}
                className="focus-ring rounded-md px-1.5 py-0.5 text-xs text-ink-3 transition hover:bg-hard-soft hover:text-hard"
              >
                Remove
              </button>
            </div>
            <Input
              value={step.title}
              onChange={(event) => updateStep(step.id, { title: event.target.value })}
              placeholder="Step title"
              className="mb-2"
            />
            <PlainTextarea
              value={step.description}
              onChange={(description) => updateStep(step.id, { description })}
              placeholder="What happens in this step?"
              rows={2}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            onChange({
              steps: [
                ...data.steps,
                {
                  id: `st_${Math.random().toString(36).slice(2, 8)}`,
                  title: `Step ${data.steps.length + 1}`,
                  description: "",
                },
              ],
            })
          }
        >
          Add step
        </Button>
      </div>
    </div>
  );
}

export function VideoEmbedBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["videoEmbed"];
  onChange: (patch: Partial<BlockDataMap["videoEmbed"]>) => void;
}) {
  return (
    <div className="space-y-3">
      <Field label="Video title">
        <Input
          value={data.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="e.g. Channels in 5 minutes"
        />
      </Field>
      <Field label="Video URL" hint="Paste a link to an embedded lesson video.">
        <Input
          value={data.url}
          onChange={(event) => onChange({ url: event.target.value })}
          placeholder="https://…"
        />
      </Field>
      <div className="flex aspect-video items-center justify-center rounded-lg border border-edge bg-ink/95">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
            ▶
          </span>
          <p className="mt-2 max-w-xs truncate px-4 text-xs text-white/70">
            {data.title || "Untitled video"}
          </p>
        </div>
      </div>
    </div>
  );
}
