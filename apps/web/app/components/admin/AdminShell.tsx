"use client";

import { ArrowUpRight, Check, Code2, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import { findAdminNavItem, ADMIN_NAV_ITEMS } from "./admin-nav";
import {
  clearSimulatedRole,
  fetchRealRole,
  readSimulatedRole,
  writeSimulatedRole,
} from "@/app/lib/admin/role";
import { logout } from "@/app/lib/auth";
import { cn } from "@/app/lib/utils";

type AdminShellProps = {
  children: React.ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeItem = findAdminNavItem(pathname);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [role, setRole] = useState<"admin" | "user">("admin");
  const profileRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [real, simulated] = await Promise.all([
        fetchRealRole(),
        Promise.resolve(readSimulatedRole()),
      ]);
      if (cancelled) return;
      // Prefer the live preview flag; fall back to the real session role.
      setRole(simulated ?? real ?? "admin");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Close the mobile drawer + profile menu on navigation — adjusted
     during render (conditional) to avoid cascading renders. */
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setProfileOpen(false);
  }

  useEffect(() => {
    if (!profileOpen) return;
    function onDown(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  function simulateAs(next: "admin" | "user") {
    setRole(next);
    setProfileOpen(false);
    if (next === "user") {
      writeSimulatedRole("user");
      toast.success("Previewing USER experience");
      router.push("/");
    } else {
      clearSimulatedRole();
      toast.success("Back to ADMIN experience");
    }
  }

  async function handleLogout() {
    setProfileOpen(false);
    await logout();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <div data-accent="emerald" className="min-h-screen bg-canvas text-ink">
      <Toaster position="bottom-right" richColors />

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

      <aside
        aria-label="Admin"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[264px] -translate-x-full flex-col border-r border-line bg-surface lg:translate-x-0",
        )}
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-line px-4">
          <Link href="/admin" className="gc-focus-ring flex items-center gap-2.5 rounded-lg">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-contrast">
              <ShieldCheck size={17} strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold tracking-tight">GoCraft Admin</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-ink-4">
                Content Studio
              </span>
            </span>
          </Link>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="gc-focus-ring rounded-lg p-2 text-ink-3 transition hover:bg-surface-2 hover:text-ink lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav aria-label="Admin sections" className="gc-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-4">
            Workspace
          </p>
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "gc-focus-ring relative flex min-h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors duration-150",
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
                <Icon size={16} strokeWidth={active ? 2 : 1.7} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-line p-3">
          <Link
            href="/"
            className="gc-focus-ring flex items-center gap-3 rounded-lg p-2 transition hover:bg-surface-2"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
              <Code2 size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-ink">Back to GoCraft</span>
              <span className="mt-0.5 block truncate text-[11px] text-ink-3">Learner app</span>
            </span>
            <ArrowUpRight size={14} className="shrink-0 text-ink-4" />
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="gc-focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition hover:bg-surface-2 lg:hidden"
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">{activeItem.label}</p>
              <p className="hidden truncate text-[11px] text-ink-3 sm:block">
                {activeItem.description}
              </p>
            </div>
          </div>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className="gc-focus-ring flex items-center gap-2.5 rounded-lg border border-line bg-panel py-1.5 pl-1.5 pr-3 transition hover:border-edge-strong hover:bg-panel-muted"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-ink">
                A
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold leading-4">Admin</span>
                <span className="block text-[10px] leading-3.5 text-ink-3">admin@gocraft.dev</span>
              </span>
            </button>

            {profileOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] w-60 rounded-xl border border-line bg-panel p-1.5 shadow-pop"
              >
                <div className="border-b border-line px-2.5 pb-2 pt-1.5">
                  <p className="text-xs font-semibold text-ink">Admin account</p>
                  <p className="mt-0.5 text-[11px] text-ink-3">admin@gocraft.dev</p>
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-4">
                    Simulate role
                  </p>
                  <div className="mt-1.5 flex gap-1">
                    {(["admin", "user"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        role="menuitemradio"
                        aria-checked={role === r}
                        onClick={() => simulateAs(r)}
                        className={cn(
                          "focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition",
                          role === r
                            ? "border-accent bg-accent-soft text-accent-ink"
                            : "border-line text-ink-3 hover:bg-panel-muted hover:text-ink",
                        )}
                      >
                        {role === r ? <Check size={12} /> : null}
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <Link
                  href="/"
                  role="menuitem"
                  className="focus-ring flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 transition hover:bg-panel-muted hover:text-ink"
                >
                  <ArrowUpRight size={14} />
                  Back to GoCraft
                </Link>
                <Link
                  href="/dashboard/settings"
                  role="menuitem"
                  className="focus-ring flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 transition hover:bg-panel-muted hover:text-ink"
                >
                  <Code2 size={14} />
                  Learner dashboard
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="focus-ring flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 transition hover:bg-panel-muted hover:text-ink"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
