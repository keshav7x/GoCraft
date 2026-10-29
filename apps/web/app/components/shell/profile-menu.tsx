"use client";

import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/app/components/ui/avatar";
import { useDemoStore } from "@/app/lib/store/demo";
import { initialsOf, levelFromXp } from "@/app/lib/utils";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const name = useDemoStore((state) => state.profile.name);
  const xp = useDemoStore((state) => state.xp);
  const { level } = levelFromXp(xp);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Open profile menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="gc-focus-ring flex items-center gap-1.5 rounded-full p-0.5 transition hover:bg-surface-2"
      >
        <Avatar initials={initialsOf(name)} size="sm" />
        <ChevronDown size={13} className="text-ink-4" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Profile"
          className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border border-line bg-surface shadow-pop"
        >
          <div className="border-b border-line px-4 py-3.5">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            <p className="mt-0.5 text-xs text-ink-3">
              Level {level} · {xp.toLocaleString()} XP
            </p>
            <span className="mt-2 inline-flex rounded-md bg-warning-soft px-1.5 py-0.5 text-[10px] font-medium text-warning">
              Demo profile
            </span>
          </div>

          <div className="p-1.5">
            <Link
              href="/dashboard/friends/you"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <UserRound size={15} />
              View profile
            </Link>
            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <Settings size={15} />
              Settings
            </Link>
            <Link
              href="/"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <LogOut size={15} />
              Back to landing page
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
