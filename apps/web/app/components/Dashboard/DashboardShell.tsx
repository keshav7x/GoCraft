"use client";

import { Code2, Menu, PanelLeftClose, PanelLeftOpen, X, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProfileMenu } from "@/app/components/shell/profile-menu";
import { NotificationsPopover } from "@/app/components/shell/notifications-popover";
import { findNavItem, NAV_ITEMS } from "@/app/lib/nav";
import { getMarketItem } from "@/app/lib/demo/marketplace";
import { useDemoStore as useSessionDemoStore } from "@/app/lib/demo-store";
import { useDemoStore } from "@/app/lib/store/demo";
import { useUiStore } from "@/app/lib/store/ui";
import { cn, levelFromXp } from "@/app/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  /* Close the mobile drawer on navigation — adjusted during render
     (conditional) to avoid cascading renders. */
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  const xp = useDemoStore((state) => state.xp);
  const equippedTheme = useDemoStore((state) => state.equippedTheme);

  const activeItem = findNavItem(pathname);
  // Problem detail pages use a full-bleed LeetCode-style split layout.
  // Lesson pages render their own workspace chrome (course rail, Visual Lab).
  const pathSegments = pathname.split("/").filter(Boolean);
  const fullBleed =
    pathname.startsWith("/dashboard/problems/") ||
    (pathSegments[0] === "modules" && pathSegments.length === 3);
  const { level, title: levelTitle } = levelFromXp(xp);
  const sessionAccent = useSessionDemoStore((state) => state.settings.accent);
  const equippedAccent = getMarketItem(equippedTheme)?.accent;
  // A non-default marketplace theme wins; otherwise the Settings accent applies.
  const accent =
    equippedAccent && equippedAccent !== "graphite" ? equippedAccent : sessionAccent;

  useEffect(() => {
    if (!mobileOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      previousFocusRef.current?.focus();
    };
  }, [mobileOpen]);

  return (
    <div
      data-accent={accent}
      className="min-h-screen bg-canvas text-ink"
    >
      {/* Mobile backdrop */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

      {/* Sidebar */}
      <aside
        aria-label="Primary"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-surface",
          "transition-[width,transform] duration-200 ease-out",
          "lg:translate-x-0",
          collapsed ? "lg:w-[76px]" : "lg:w-[248px]",
          mobileOpen
            ? "w-[280px] translate-x-0"
            : "w-[280px] -translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "flex h-[64px] shrink-0 items-center border-b border-line",
            collapsed ? "lg:justify-center lg:px-0" : "justify-between px-5",
            "px-5",
          )}
        >
          <Link
            href="/dashboard"
            aria-label="GoCraft overview"
            className="gc-focus-ring flex min-w-0 items-center gap-3 rounded-lg"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-contrast">
              <Code2 size={17} strokeWidth={2} />
            </span>
            <span
              className={cn(
                "text-[15px] font-semibold tracking-tight",
                collapsed ? "lg:hidden" : "",
              )}
            >
              GoCraft
            </span>
          </Link>

          <button
            ref={closeRef}
            type="button"
            aria-label="Close mobile navigation"
            onClick={() => setMobileOpen(false)}
            className="gc-focus-ring rounded-lg p-2 text-ink-3 transition hover:bg-surface-2 hover:text-ink lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="gc-scrollbar flex-1 overflow-y-auto px-3 py-5">
          <p
            className={cn(
              "mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-4",
              collapsed ? "lg:hidden" : "",
            )}
          >
            Workspace
          </p>

          <nav aria-label="Dashboard" className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.href === activeItem.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "gc-focus-ring group relative flex min-h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors duration-150",
                    collapsed ? "lg:justify-center lg:px-0" : "",
                    active
                      ? "bg-accent-soft text-accent-ink"
                      : "text-ink-3 hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-r-full bg-accent"
                    />
                  ) : null}

                  <Icon
                    size={17}
                    strokeWidth={active ? 2 : 1.7}
                    className="shrink-0"
                  />

                  <span className={cn(collapsed ? "lg:hidden" : "")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Progress card */}
          <div
            className={cn(
              "mt-7 rounded-xl border border-line bg-inset p-3.5",
              collapsed ? "lg:hidden" : "",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-ink-3">
                Demo progress
              </span>
              <Zap size={14} className="text-warning" />
            </div>

            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-lg font-semibold tracking-tight tabular-nums">
                {xp.toLocaleString()}
              </span>
              <span className="text-[11px] text-ink-3">XP</span>
            </div>

            <div
              role="progressbar"
              aria-valuenow={xp % 400}
              aria-valuemin={0}
              aria-valuemax={400}
              aria-label="Progress to next level"
              className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-line"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                style={{ width: `${((xp % 400) / 400) * 100}%` }}
              />
            </div>

            <p className="mt-2 text-[11px] text-ink-3">
              Level {level} · {levelTitle}
            </p>
          </div>
        </div>

        {/* Profile */}
        <div className="shrink-0 border-t border-line p-2.5">
          <Link
            href="/dashboard/friends/you"
            title={collapsed ? "Your demo profile" : undefined}
            className={cn(
              "gc-focus-ring flex items-center gap-3 rounded-lg p-2 transition hover:bg-surface-2",
              collapsed ? "lg:justify-center" : "",
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-[11px] font-semibold">
              Y
            </span>
            <span className={cn("min-w-0 flex-1", collapsed ? "lg:hidden" : "")}>
              <span className="block truncate text-xs font-semibold text-ink">
                Your profile
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-ink-3">
                Level {level} · demo
              </span>
            </span>
          </Link>
        </div>
      </aside>

      {/* Application frame */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[248px]",
        )}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[64px] shrink-0 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="gc-focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition hover:bg-surface-2 lg:hidden"
            >
              <Menu size={19} />
            </button>

            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={toggleSidebar}
              className="gc-focus-ring hidden h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition hover:bg-surface-2 hover:text-ink lg:flex"
            >
              {collapsed ? (
                <PanelLeftOpen size={17} />
              ) : (
                <PanelLeftClose size={17} />
              )}
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                {activeItem.label}
              </p>
              <p className="hidden truncate text-[11px] text-ink-3 sm:block">
                {activeItem.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <span
              title="Demo XP balance"
              className="hidden items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 sm:inline-flex"
            >
              <Zap size={13} className="text-warning" />
              <span className="text-xs font-semibold tabular-nums">
                {xp.toLocaleString()}
              </span>
              <span className="text-[11px] text-ink-3">XP</span>
            </span>

            <NotificationsPopover />
            <ProfileMenu />
          </div>
        </header>

        {/* Page content */}
        <main
          className={cn(
            "mx-auto w-full flex-1",
            fullBleed
              ? "max-w-none p-0"
              : "max-w-[1440px] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
