"use client";

import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/app/lib/utils";

type BlockToolbarProps = {
  onDuplicate: () => void;
  onDelete: () => void;
  onInsertBelow: () => void;
  dragProps?: React.HTMLAttributes<HTMLSpanElement>;
  className?: string;
};

export function BlockToolbar({
  onDuplicate,
  onDelete,
  onInsertBelow,
  dragProps,
  className,
}: BlockToolbarProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute -top-3.5 right-0 z-20 flex translate-y-0 items-center gap-0.5 rounded-lg border border-line bg-panel p-0.5 opacity-0 shadow-pop transition-all",
        "group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100",
        className,
      )}
    >
      <span
        {...dragProps}
        title="Drag to reorder"
        className="pointer-events-auto cursor-grab rounded-md p-1.5 text-ink-faint transition hover:bg-panel-muted hover:text-ink active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </span>
      <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-line" />
      <button
        type="button"
        aria-label="Insert block below"
        onClick={onInsertBelow}
        className="pointer-events-auto rounded-md p-1.5 text-ink-3 transition hover:bg-panel-muted hover:text-ink"
      >
        <Plus size={14} />
      </button>
      <button
        type="button"
        aria-label="Duplicate block"
        onClick={onDuplicate}
        className="pointer-events-auto rounded-md p-1.5 text-ink-3 transition hover:bg-panel-muted hover:text-ink"
      >
        <Copy size={14} />
      </button>
      <button
        type="button"
        aria-label="Delete block"
        onClick={onDelete}
        className="pointer-events-auto rounded-md p-1.5 text-ink-3 transition hover:bg-hard-soft hover:text-hard"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
