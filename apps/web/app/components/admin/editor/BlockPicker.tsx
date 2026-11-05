"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import {
  BLOCK_CATEGORIES,
  BLOCK_META,
  type BlockCategory,
  type BlockType,
} from "@/app/lib/admin/types";
import { cn } from "@/app/lib/utils";

type BlockPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (type: BlockType) => void;
};

export function BlockPicker({ open, onClose, onSelect }: BlockPickerProps) {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = (Object.keys(BLOCK_CATEGORIES) as BlockCategory[]).flatMap((category) =>
      BLOCK_CATEGORIES[category].map((type) => ({
        type,
        category,
        meta: BLOCK_META[type],
      })),
    );
    if (!q) return all;
    return all.filter(
      (item) =>
        item.meta.label.toLowerCase().includes(q) ||
        item.meta.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  }, [query]);

  /* Reset transient state when the picker (re)opens or the query changes —
     adjusted during render (conditional, so no cascading-render warning). */
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const item = results[activeIndex];
        if (item) {
          onSelect(item.type);
          onClose();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, activeIndex, onSelect, onClose]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (typeof document === "undefined") return null;

  const grouped = (Object.keys(BLOCK_CATEGORIES) as BlockCategory[])
    .map((category) => ({
      category,
      items: results
        .map((item, index) => ({ ...item, index }))
        .filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length > 0);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[120] flex items-start justify-center pt-[18vh]">
          <motion.button
            type="button"
            aria-label="Close block picker"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Add a block"
            initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-line bg-panel shadow-pop"
          >
            <div className="flex items-center gap-2.5 border-b border-line px-3.5">
              <Search size={15} className="shrink-0 text-ink-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search blocks…"
                className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              <kbd className="shrink-0 rounded border border-line bg-panel-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
                Esc
              </kbd>
            </div>

            <div ref={listRef} className="gc-scrollbar max-h-[320px] overflow-y-auto p-1.5">
              {grouped.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-ink-3">No blocks match “{query}”.</p>
              ) : (
                grouped.map((group) => (
                  <div key={group.category} className="mb-1.5 last:mb-0">
                    <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-4">
                      {group.category}
                    </p>
                    {group.items.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        data-index={item.index}
                        onMouseEnter={() => setActiveIndex(item.index)}
                        onClick={() => {
                          onSelect(item.type);
                          onClose();
                        }}
                        className={cn(
                          "focus-ring flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition",
                          activeIndex === item.index ? "bg-accent-soft" : "hover:bg-panel-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold",
                            activeIndex === item.index
                              ? "border-accent/40 bg-panel text-accent-ink"
                              : "border-line bg-panel-muted text-ink-3",
                          )}
                        >
                          {item.meta.icon}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-ink">
                            {item.meta.label}
                          </span>
                          <span className="block truncate text-[11px] text-ink-3">
                            {item.meta.description}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
