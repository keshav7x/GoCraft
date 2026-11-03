"use client";

import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/app/components/ui/avatar";
import { useDemoStore } from "@/app/lib/store/demo";
import { initialsOf, levelFromXp } from "@/app/lib/utils";
import { logout } from "@/app/lib/auth";

export function ProfileMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
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

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    setOpen(false);
    try {
      await logout();
      toast.success("Signed out");
      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

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
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={busy}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-60"
            >
              <LogOut size={15} />
              {busy ? "Signing out…" : "Log out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
