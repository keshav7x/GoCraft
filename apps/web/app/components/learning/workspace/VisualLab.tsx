"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsRight, FlaskConical, Maximize2, X } from "lucide-react";
import type { ParsedBlock } from "@/app/lib/curriculum/types";
import { visualBlocks, visualBlockKind, visualBlockLabel } from "@/app/lib/curriculum/visuals";
import { VisualizationBlock } from "../visualizations/VisualizationBlock";
import { cn } from "@/app/lib/utils";

function useVisuals(blocks: ParsedBlock[]) {
  return useMemo(
    () => visualBlocks(blocks).filter((b) => b.payload !== null),
    [blocks],
  );
}

function VizTabs({
  visuals,
  active,
  onChange,
}: {
  visuals: ParsedBlock[];
  active: number;
  onChange: (i: number) => void;
}) {
  if (visuals.length <= 1) return null;
  return (
    <div
      role="tablist"
      aria-label="Visualizations in this lesson"
      className="flex gap-1 overflow-x-auto gc-scrollbar"
    >
      {visuals.map((block, i) => {
        const selected = i === active;
        return (
          <button
            key={block.row.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(i)}
            className={cn(
              "focus-ring shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors",
              selected
                ? "bg-accent-soft text-accent-ink ring-1 ring-inset ring-accent-border"
                : "text-ink-muted hover:bg-panel-muted hover:text-ink",
            )}
          >
            {visualBlockLabel(block)}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Right rail of the lesson workspace. Only mounted when the lesson
 * actually contains visualization blocks; hidden entirely otherwise.
 */
export function VisualLab({
  blocks,
  onExpand,
  onCollapse,
}: {
  blocks: ParsedBlock[];
  onExpand: () => void;
  onCollapse: () => void;
}) {
  const visuals = useVisuals(blocks);
  const [active, setActive] = useState(0);
  if (visuals.length === 0) return null;
  const clamped = Math.min(active, visuals.length - 1);
  const current = visuals[clamped]!;

  return (
    <aside
      aria-label="Visual Lab"
      className="lab-in hidden h-full w-[340px] shrink-0 flex-col border-l border-line bg-surface xl:flex 2xl:w-[380px]"
    >
      {/* Panel header */}
      <div className="shrink-0 border-b border-line px-4 pb-3 pt-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent-border bg-accent-soft text-accent-ink">
            <FlaskConical size={15} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-4 tracking-tight text-ink">
              Visual Lab
            </p>
            <p className="mt-0.5 font-mono text-[8.5px] uppercase leading-3 tracking-[0.18em] text-ink-faint">
              {visuals.length} interactive{" "}
              {visuals.length === 1 ? "model" : "models"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={onExpand}
              title="Open focused view"
              aria-label="Expand visualization to focused view"
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-panel-muted hover:text-ink"
            >
              <Maximize2 size={15} />
            </button>
            <button
              type="button"
              onClick={onCollapse}
              title="Close Visual Lab"
              aria-label="Close Visual Lab"
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-panel-muted hover:text-ink"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
        {visuals.length > 1 && (
          <div className="mt-2.5">
            <VizTabs visuals={visuals} active={clamped} onChange={setActive} />
          </div>
        )}
      </div>

      {/* Model stage */}
      <div className="gc-scrollbar flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        <div className="[&_figure]:shadow-none" key={current.row.id}>
          <VisualizationBlock block={current.payload!} />
        </div>
        <p className="mt-3 px-1 text-[10.5px] leading-4 text-ink-faint">
          Experiment freely — interactions here never affect your progress or XP.
        </p>
      </div>
    </aside>
  );
}

/**
 * Focused view of the lesson's visualizations: a large, quiet modal
 * layered over the workspace. Esc, the backdrop, or the close button
 * dismisses it. Visual state resets on close — the lesson keeps yours.
 */
export function VizFocusOverlay({
  blocks,
  initialIndex = 0,
  onClose,
}: {
  blocks: ParsedBlock[];
  initialIndex?: number;
  onClose: () => void;
}) {
  const visuals = useVisuals(blocks);
  const [active, setActive] = useState(() =>
    Math.min(initialIndex, Math.max(0, visuals.length - 1)),
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (visuals.length === 0) return null;
  const clamped = Math.min(active, visuals.length - 1);
  const current = visuals[clamped]!;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close focused view"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/45 backdrop-blur-[3px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Visual Lab — focused view"
        initial={{ opacity: 0, y: 28, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.99 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="relative m-0 flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden border border-line bg-canvas shadow-pop sm:m-6 sm:max-h-[86dvh] sm:rounded-2xl"
      >
        {/* Dialog header */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-4 sm:px-5">
          <FlaskConical size={16} className="shrink-0 text-accent-ink" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-4 tracking-tight text-ink">
              Visual Lab
            </p>
            <p className="font-mono text-[8px] uppercase leading-3 tracking-[0.2em] text-ink-faint">
              Focused view · {visualBlockKind(current)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close focused view"
            className="focus-ring ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-panel-muted hover:text-ink"
          >
            <X size={17} />
          </button>
        </div>

        {visuals.length > 1 && (
          <div className="shrink-0 border-b border-line px-3 py-2 sm:px-4">
            <VizTabs visuals={visuals} active={clamped} onChange={setActive} />
          </div>
        )}

        {/* Stage */}
        <div className="gc-scrollbar flex-1 overflow-y-auto p-4 sm:p-6">
          <div key={current.row.id}>
            <VisualizationBlock block={current.payload!} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex h-10 shrink-0 items-center justify-between border-t border-line px-4 sm:px-5">
          <p className="text-[10.5px] text-ink-faint">
            Experiments here stay local — nothing is graded.
          </p>
          <kbd className="rounded border border-line bg-inset px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-muted">
            Esc
          </kbd>
        </div>
      </motion.div>
    </div>
  );
}

export function VizFocusRoot({
  open,
  blocks,
  initialIndex,
  onClose,
}: {
  open: boolean;
  blocks: ParsedBlock[];
  initialIndex: number;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <VizFocusOverlay blocks={blocks} initialIndex={initialIndex} onClose={onClose} />
      ) : null}
    </AnimatePresence>
  );
}
