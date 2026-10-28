
"use client";

import {
  Bell,
  BookOpen,
  ChevronDown,
  Code2,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingBag,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Lessons", href: "/dashboard/lessons", icon: BookOpen },
  { label: "Problems", href: "/dashboard/problems", icon: Code2 },
  { label: "Friends", href: "/dashboard/friends", icon: Users },
  { label: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

type DashboardShellProps = {
  children: React.ReactNode;
};

export default function DashboardShell({
  children,
}: DashboardShellProps) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem =
    NAV_ITEMS.find((item) =>
      item.href === "/dashboard"
        ? pathname === item.href
        : pathname.startsWith(item.href),
    ) ?? NAV_ITEMS[0];

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-900">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white",
          "transition-[width,transform] duration-200 ease-out",
          "lg:translate-x-0",
          collapsed ? "lg:w-[76px]" : "lg:w-[248px]",
          mobileOpen
            ? "w-[280px] translate-x-0"
            : "w-[280px] -translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div
          className={[
            "flex h-[68px] shrink-0 items-center border-b border-slate-100",
            collapsed ? "lg:justify-center lg:px-0" : "justify-between px-5",
            "px-5",
          ].join(" ")}
        >
          <Link
            href="/dashboard"
            aria-label="GoCraft home"
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Code2 size={19} strokeWidth={2} />
            </span>

            <span
              className={[
                "text-[17px] font-semibold tracking-tight",
                collapsed ? "lg:hidden" : "",
              ].join(" ")}
            >
              GoCraft
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close mobile navigation"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <div
            className={[
              "mb-3 flex items-center px-3",
              collapsed ? "lg:justify-center lg:px-0" : "justify-between",
            ].join(" ")}
          >
            <p
              className={[
                "text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400",
                collapsed ? "lg:hidden" : "",
              ].join(" ")}
            >
              Workspace
            </p>

            {collapsed && (
              <span className="hidden text-slate-400 lg:inline">
                <Zap size={14} />
              </span>
            )}
          </div>

          <nav aria-label="Dashboard navigation" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group relative flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium",
                    "transition-colors duration-150",
                    collapsed ? "lg:justify-center lg:px-0" : "",
                    active
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")}
                >
                  {active && (
                    <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-slate-900" />
                  )}

                  <Icon
                    size={18}
                    strokeWidth={active ? 2 : 1.7}
                    className="shrink-0"
                  />

                  <span className={collapsed ? "lg:hidden" : ""}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* XP card */}
          <div
            className={[
              "mt-8 rounded-xl border border-slate-200 bg-slate-50/80 p-4",
              collapsed ? "lg:hidden" : "",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Your progress
              </span>
              <Zap size={15} className="text-amber-500" />
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-xl font-semibold tracking-tight">840</span>
              <span className="text-xs text-slate-500">XP</span>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[68%] rounded-full bg-slate-900" />
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              Level 3 · Keep the streak going
            </p>
          </div>
        </div>

        {/* User profile */}
        <div className="shrink-0 border-t border-slate-100 p-3">
          <Link
            href="/dashboard/settings"
            title={collapsed ? "Your profile" : undefined}
            className={[
              "flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-slate-50",
              collapsed ? "lg:justify-center" : "",
            ].join(" ")}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold">
              K
            </span>

            <span
              className={[
                "min-w-0 flex-1",
                collapsed ? "lg:hidden" : "",
              ].join(" ")}
            >
              <span className="block truncate text-xs font-semibold text-slate-900">
                Your profile
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                Level 3 developer
              </span>
            </span>

            <ChevronDown
              size={15}
              className={[
                "shrink-0 text-slate-400",
                collapsed ? "lg:hidden" : "",
              ].join(" ")}
            />
          </Link>
        </div>
      </aside>

      {/* Main application */}
      <div
        className={[
          "min-h-screen transition-[padding] duration-200",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[248px]",
        ].join(" ")}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile menu */}
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 lg:hidden"
            >
              <Menu size={19} />
            </button>

            {/* Desktop collapse */}
            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:flex"
            >
              {collapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                {activeItem.label}
              </p>
              <p className="hidden text-[11px] text-slate-500 sm:block">
                Your developer workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:flex">
              <Zap size={14} className="text-amber-500" />
              <span className="text-xs font-semibold">840</span>
              <span className="text-xs text-slate-500">XP</span>
            </div>

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            <Link
              href="/dashboard/settings"
              aria-label="Open settings"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold transition hover:border-slate-300"
            >
              K
            </Link>
          </div>
        </header>

        {/* Individual pages render here */}
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
