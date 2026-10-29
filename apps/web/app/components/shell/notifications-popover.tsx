"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DEMO_NOTIFICATIONS } from "@/app/lib/demo/activity";

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const unread = DEMO_NOTIFICATIONS.filter((item) => item.unread).length;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="gc-focus-ring relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Bell size={17} />
        {unread > 0 ? (
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-surface" />
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 top-11 z-50 w-[320px] overflow-hidden rounded-xl border border-line bg-surface shadow-pop"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-xs font-semibold text-ink">Notifications</p>
            <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-ink-3">
              Demo feed
            </span>
          </div>
          <ul className="max-h-80 divide-y divide-line overflow-y-auto">
            {DEMO_NOTIFICATIONS.map((item) => (
              <li
                key={item.id}
                className="flex gap-3 px-4 py-3 transition-colors hover:bg-surface-2/60"
              >
                <span
                  aria-hidden="true"
                  className={
                    item.unread
                      ? "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      : "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-line-strong"
                  }
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium leading-5 text-ink">{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-ink-3">{item.detail}</p>
                  <p className="mt-1 text-[10px] text-ink-4">{item.at}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="border-t border-line bg-inset px-4 py-2.5 text-[10px] leading-4 text-ink-4">
            Sample notifications — not delivered by a server.
          </p>
        </div>
      ) : null}
    </div>
  );
}
