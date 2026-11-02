"use client";

import Link from "next/link";
import { BookOpen, Clock, ImageOff, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";
import { formatMinutes, DIFFICULTY_LABEL, DIFFICULTY_TONE } from "@/app/lib/admin/format";
import type { Module } from "@/app/lib/admin/types";

type ModuleCardProps = {
  module: Module;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ModuleCard({ module, onEdit, onDelete }: ModuleCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const publishedLessons = module.lessons.filter((l) => l.status === "published").length;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-edge bg-panel shadow-card transition hover:border-edge-strong">
      <Link
        href={`/admin/modules/${module.id}`}
        className="gc-focus-ring block rounded-xl"
        aria-label={`Open ${module.title}`}
      >
        <div className="relative aspect-[16/7] overflow-hidden border-b border-edge bg-panel-muted">
          {module.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={module.coverImage}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-faint">
              <ImageOff size={22} />
            </div>
          )}
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <Badge variant={module.status === "published" ? "success" : "neutral"}>
              {module.status === "published" ? "Published" : "Draft"}
            </Badge>
            <Badge variant={DIFFICULTY_TONE[module.difficulty] ?? "neutral"}>
              {DIFFICULTY_LABEL[module.difficulty]}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold tracking-tight text-ink">{module.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-muted">{module.description}</p>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-ink-3">
            <span className="inline-flex items-center gap-1">
              <BookOpen size={12} />
              {module.lessons.length} lesson{module.lessons.length === 1 ? "" : "s"}
              {module.lessons.length > 0 ? ` · ${publishedLessons} live` : ""}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {formatMinutes(module.estimatedDuration)}
            </span>
          </div>
        </div>
      </Link>

      <div ref={menuRef} className="absolute right-3 top-3">
        <button
          type="button"
          aria-label={`Actions for ${module.title}`}
          onClick={(event) => {
            event.preventDefault();
            setMenuOpen((open) => !open);
          }}
          className={cn(
            "focus-ring rounded-lg border border-white/40 bg-white/85 p-1.5 text-ink-2 shadow-sm backdrop-blur transition hover:bg-white",
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          )}
        >
          <MoreVertical size={15} />
        </button>
        {menuOpen ? (
          <div role="menu" className="absolute right-0 top-[calc(100%+6px)] z-20 w-40 rounded-xl border border-line bg-panel p-1 shadow-pop">
            {onEdit ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                className="focus-ring flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 transition hover:bg-panel-muted hover:text-ink"
              >
                <Pencil size={14} />
                Edit module
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="focus-ring flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-hard transition hover:bg-hard-soft"
              >
                <Trash2 size={14} />
                Delete module
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
