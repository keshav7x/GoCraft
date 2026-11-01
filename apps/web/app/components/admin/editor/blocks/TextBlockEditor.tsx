"use client";

import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from "lucide-react";
import { Input, Textarea } from "@/app/components/ui/input";
import { cn } from "@/app/lib/utils";
import type { BlockDataMap } from "@/app/lib/admin/types";
import { PlainTextarea, SegmentedControl, StringListEditor } from "../editor-shared";

type Change<D> = (patch: Partial<D>) => void;

export function HeadingBlockEditor({
  level,
  data,
  onChange,
}: {
  level: 1 | 2 | 3;
  data: BlockDataMap["heading1"];
  onChange: Change<BlockDataMap["heading1"]>;
}) {
  return (
    <Input
      value={data.text}
      onChange={(event) => onChange({ text: event.target.value })}
      placeholder={`Heading ${level}`}
      className={cn(
        "h-auto border-0 bg-transparent px-0 shadow-none hover:border-0 focus:border-0 focus-visible:ring-0",
        level === 1 && "text-2xl font-semibold tracking-tight",
        level === 2 && "text-xl font-semibold tracking-tight",
        level === 3 && "text-lg font-semibold tracking-tight",
      )}
    />
  );
}

export function ParagraphBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["paragraph"];
  onChange: Change<BlockDataMap["paragraph"]>;
}) {
  return (
    <div className="space-y-2">
      <Textarea
        value={data.text}
        onChange={(event) => onChange({ text: event.target.value })}
        placeholder="Write something learners will read…"
        rows={2}
        className="min-h-[52px] resize-none border-0 bg-transparent px-0 py-0 text-[15px] leading-7 shadow-none hover:border-0 focus:border-0 focus-visible:ring-0"
      />
      <div className="flex gap-1.5">
        {(
          [
            { key: "bold" as const, label: "B", className: "font-bold" },
            { key: "italic" as const, label: "I", className: "italic" },
          ]
        ).map((toggle) => (
          <button
            key={toggle.key}
            type="button"
            aria-pressed={Boolean(data[toggle.key])}
            onClick={() =>
              onChange(
                toggle.key === "bold" ? { bold: !data.bold } : { italic: !data.italic },
              )
            }
            className={cn(
              "focus-ring h-7 w-7 rounded-md border text-xs transition",
              data[toggle.key]
                ? "border-accent bg-accent-soft text-accent-ink"
                : "border-edge text-ink-3 hover:bg-panel-muted",
              toggle.className,
            )}
          >
            {toggle.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ListBlockEditor({
  data,
  onChange,
  ordered,
}: {
  data: BlockDataMap["bulletedList"];
  onChange: Change<BlockDataMap["bulletedList"]>;
  ordered: boolean;
}) {
  return (
    <StringListEditor
      items={data.items}
      onChange={(items) => onChange({ items })}
      placeholder={ordered ? "List item" : "List item"}
      addLabel="Add list item"
    />
  );
}

export function BulletedListEditor(props: {
  data: BlockDataMap["bulletedList"];
  onChange: Change<BlockDataMap["bulletedList"]>;
}) {
  return <ListBlockEditor {...props} ordered={false} />;
}

export function NumberedListEditor(props: {
  data: BlockDataMap["numberedList"];
  onChange: Change<BlockDataMap["numberedList"]>;
}) {
  return <ListBlockEditor {...props} ordered />;
}

export function QuoteBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["quote"];
  onChange: Change<BlockDataMap["quote"]>;
}) {
  return (
    <div className="space-y-2 border-l-2 border-accent pl-4">
      <Textarea
        value={data.text}
        onChange={(event) => onChange({ text: event.target.value })}
        placeholder="Quote text…"
        rows={2}
        className="border-0 bg-transparent px-0 py-0 italic shadow-none hover:border-0 focus:border-0 focus-visible:ring-0"
      />
      <Input
        value={data.attribution}
        onChange={(event) => onChange({ attribution: event.target.value })}
        placeholder="Attribution (optional)"
        className="h-7 border-0 bg-transparent px-0 text-xs shadow-none hover:border-0 focus:border-0 focus-visible:ring-0"
      />
    </div>
  );
}

const CALLOUT_TONES = {
  info: { icon: Info, className: "border-focus/30 bg-focus/5 text-focus", label: "Info" },
  success: { icon: CheckCircle2, className: "border-easy/30 bg-easy-soft text-easy", label: "Success" },
  warning: { icon: AlertTriangle, className: "border-medium/30 bg-medium-soft text-medium", label: "Warning" },
  danger: { icon: OctagonAlert, className: "border-hard/30 bg-hard-soft text-hard", label: "Danger" },
} as const;

export function CalloutBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["callout"];
  onChange: Change<BlockDataMap["callout"]>;
}) {
  const tone = CALLOUT_TONES[data.tone] ?? CALLOUT_TONES.info;
  const Icon = tone.icon;
  return (
    <div className={cn("space-y-2 rounded-lg border p-3.5", tone.className.split(" ").slice(0, 2))}>
      <div className="flex items-center gap-2">
        <Icon size={15} />
        <SegmentedControl
          value={data.tone}
          onChange={(value) => onChange({ tone: value })}
          options={Object.entries(CALLOUT_TONES).map(([key, meta]) => ({
            value: key as BlockDataMap["callout"]["tone"],
            label: meta.label,
          }))}
        />
      </div>
      <Input
        value={data.title}
        onChange={(event) => onChange({ title: event.target.value })}
        placeholder="Callout title"
        className="border-0 bg-transparent px-0 font-semibold shadow-none hover:border-0 focus:border-0 focus-visible:ring-0"
      />
      <PlainTextarea
        value={data.text}
        onChange={(value) => onChange({ text: value })}
        placeholder="Callout message…"
        rows={2}
        className="border-0 bg-transparent px-0 shadow-none hover:border-0 focus:border-0 focus-visible:ring-0"
      />
    </div>
  );
}

export function DividerBlockEditor() {
  return (
    <div className="flex items-center gap-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-4">
      <span className="h-px flex-1 bg-line" />
      Divider
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
