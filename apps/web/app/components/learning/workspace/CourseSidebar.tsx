"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utils";

export type SidebarModule = {
  id: number;
  moduleNo: number;
  title: string;
  shortDescription: string | null;
  description: string | null;
  difficulty: string;
  estimatedDuration: number;
  lessonsCount: number;
};

export type SidebarLesson = {
  id: number;
  moduleId: number;
  lessonNo: number;
  title: string;
  description: string | null;
  estimatedTimeMinutes: number;
  xpReward: number;
};

export type SidebarProgress = {
  lessonId: number;
  status: string;
};

const STATUS_DONE = "completed";

/**
 * Left rail of the lesson workspace: the whole curriculum as an
 * expandable tree. Lessons link directly — switching lessons never
 * returns to a module index page.
 */
export function CourseSidebar({
  modules,
  lessons,
  progress,
  currentModuleId,
  currentLessonId,
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
}: {
  modules: SidebarModule[];
  lessons: SidebarLesson[];
  progress: SidebarProgress[];
  currentModuleId: number;
  currentLessonId: number;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapsed: () => void;
}) {
  const pathname = usePathname();

  const [openIds, setOpenIds] = useState<Set<number>>(
    () => new Set([currentModuleId]),
  );

  // Switching modules opens that module's branch. (State must merge, not
  // reset — deriving during render would drop the user's manual toggles.)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenIds((prev) => {
      if (prev.has(currentModuleId)) return prev;
      const next = new Set(prev);
      next.add(currentModuleId);
      return next;
    });
  }, [currentModuleId]);

  // Close the drawer on any navigation.
  useEffect(() => {
    onCloseMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape closes the mobile drawer; body scroll locks while it is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseMobile();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, onCloseMobile]);

  const statusByLesson = useMemo(
    () => new Map(progress.map((p) => [p.lessonId, p.status])),
    [progress],
  );

  const lessonsByModule = useMemo(() => {
    const map = new Map<number, SidebarLesson[]>();
    for (const lesson of lessons) {
      const list = map.get(lesson.moduleId);
      if (list) list.push(lesson);
      else map.set(lesson.moduleId, [lesson]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.lessonNo - b.lessonNo);
    }
    return map;
  }, [lessons]);

  const orderedModules = useMemo(
    () => [...modules].sort((a, b) => a.moduleNo - b.moduleNo),
    [modules],
  );

  const moduleStats = useMemo(() => {
    const stats = new Map<number, { total: number; done: number }>();
    for (const m of orderedModules) {
      const list = lessonsByModule.get(m.id) ?? [];
      const done = list.filter(
        (l) => statusByLesson.get(l.id) === STATUS_DONE,
      ).length;
      stats.set(m.id, { total: list.length, done });
    }
    return stats;
  }, [orderedModules, lessonsByModule, statusByLesson]);

  const curriculum = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const { total: t, done: d } of moduleStats.values()) {
      total += t;
      done += d;
    }
    return { total, done };
  }, [moduleStats]);

  const toggleBranch = (id: number) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const firstUnfinishedHref = (moduleId: number): string | null => {
    const list = lessonsByModule.get(moduleId) ?? [];
    const target =
      list.find((l) => statusByLesson.get(l.id) !== STATUS_DONE) ?? list[0];
    return target ? `/modules/${moduleId}/${target.id}` : null;
  };

  const curriculumPct =
    curriculum.total > 0 ? Math.round((curriculum.done / curriculum.total) * 100) : 0;

  return (
    <>
      {/* Drawer backdrop (mobile / laptop-small) */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close course navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        aria-label="Course navigation"
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen || undefined}
        className={cn(
          "z-40 flex flex-col bg-surface",
          // Below lg: slide-over drawer.
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:w-[300px] max-lg:border-r max-lg:border-line max-lg:shadow-pop",
          "max-lg:transition-transform max-lg:duration-300 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)]",
          mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
          // lg+: sticky in-flow rail that can collapse to an icon strip.
          "lg:sticky lg:top-[116px] lg:h-[calc(100dvh-140px)] lg:shrink-0 lg:border-r lg:border-line",
          "transition-[width] duration-300 ease-out",
          collapsed ? "lg:w-[68px]" : "lg:w-[272px]",
        )}
      >
        {/* Rail header */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-line px-3.5",
            collapsed && "lg:justify-center lg:px-2",
          )}
        >
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-mono text-[8.5px] uppercase leading-3 tracking-[0.22em] text-ink-faint">
                Learning path
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold leading-4 tracking-tight text-ink">
                <GraduationCap size={13} className="text-accent" />
                Go Curriculum
              </p>
            </div>
          )}
          <div className={cn("flex items-center", collapsed ? "" : "ml-auto")}>
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? "Expand course sidebar" : "Collapse course sidebar"}
              aria-expanded={!collapsed}
              className="focus-ring hidden h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-panel-muted hover:text-ink lg:flex"
            >
              {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close course navigation"
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-panel-muted hover:text-ink lg:hidden"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Collapsed icon rail */}
        {collapsed && (
          <div className="hidden flex-1 flex-col items-center gap-1.5 overflow-y-auto px-2 py-3 lg:flex">
            {orderedModules.map((m) => {
              const stats = moduleStats.get(m.id) ?? { total: 0, done: 0 };
              const complete = stats.total > 0 && stats.done === stats.total;
              const active = m.id === currentModuleId;
              const href = firstUnfinishedHref(m.id);
              const cls = cn(
                "focus-ring relative flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border transition-all",
                active
                  ? "border-accent-border bg-accent-soft text-accent-ink"
                  : complete
                    ? "border-success/30 bg-success-soft text-success hover:border-success/50"
                    : "border-line bg-inset text-ink-faint hover:border-edge-strong hover:text-ink",
              );
              const inner = (
                <>
                  <span className="font-mono text-[12.5px] font-semibold leading-none tabular-nums">
                    {m.moduleNo}
                  </span>
                  {complete && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-success text-white">
                      <Check size={9} strokeWidth={3.5} />
                    </span>
                  )}
                </>
              );
              return href ? (
                <Link key={m.id} href={href} title={m.title} aria-label={`Module ${m.moduleNo}: ${m.title}`} className={cls}>
                  {inner}
                </Link>
              ) : (
                <span key={m.id} title={m.title} className={cn(cls, "cursor-default opacity-70")}>
                  {inner}
                </span>
              );
            })}
          </div>
        )}

        {/* Expanded tree */}
        {!collapsed && (
          <div className="gc-scrollbar flex-1 overflow-y-auto overscroll-contain px-2 py-3">
            {orderedModules.length === 0 && (
              <p className="px-3 py-6 text-center text-[12px] text-ink-muted">
                No published modules yet.
              </p>
            )}

            {orderedModules.map((m) => {
              const list = lessonsByModule.get(m.id) ?? [];
              const stats = moduleStats.get(m.id) ?? {
                total: list.length,
                done: 0,
              };
              const pct = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;
              const open = openIds.has(m.id);
              const activeModule = m.id === currentModuleId;
              const moduleComplete = stats.total > 0 && stats.done === stats.total;

              return (
                <div key={m.id} className="mb-1">
                  {/* Module row */}
                  <button
                    type="button"
                    onClick={() => toggleBranch(m.id)}
                    aria-expanded={open}
                    aria-controls={`module-branch-${m.id}`}
                    className={cn(
                      "focus-ring group flex w-full items-center gap-2.5 rounded-lg px-1.5 py-2 text-left transition-colors",
                      activeModule ? "bg-panel-muted/60" : "hover:bg-panel-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-semibold tabular-nums",
                        moduleComplete
                          ? "border-success/30 bg-success-soft text-success"
                          : activeModule
                            ? "border-accent-border bg-accent-soft text-accent-ink"
                            : "border-line bg-inset text-ink-muted",
                      )}
                    >
                      {moduleComplete ? <Check size={12} strokeWidth={3} /> : m.moduleNo}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold leading-4 text-ink">
                        {m.title}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5">
                        <span className="h-[3px] w-14 overflow-hidden rounded-full bg-surface-2">
                          <span
                            className="block h-full rounded-full bg-accent transition-[width] duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </span>
                        <span className="font-mono text-[8.5px] tabular-nums text-ink-faint">
                          {stats.done}/{stats.total}
                        </span>
                      </span>
                    </span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "shrink-0 text-ink-faint transition-transform duration-200",
                        !open && "-rotate-90",
                      )}
                    />
                  </button>

                  {/* Lessons */}
                  {open && (
                    <div
                      id={`module-branch-${m.id}`}
                      className="ml-[23px] mt-0.5 space-y-0.5 border-l border-line py-1 pl-2"
                    >
                      {list.length === 0 && (
                        <p className="px-2 py-2 text-[11px] text-ink-faint">
                          No lessons published yet.
                        </p>
                      )}
                      {list.map((lesson, index) => {
                        const status = statusByLesson.get(lesson.id);
                        const done = status === STATUS_DONE;
                        const current = lesson.id === currentLessonId;
                        return (
                          <Link
                            key={lesson.id}
                            href={`/modules/${m.id}/${lesson.id}`}
                            aria-current={current ? "page" : undefined}
                            className={cn(
                              "focus-ring group relative flex items-start gap-2 rounded-md py-[7px] pl-2 pr-1.5 transition-colors",
                              current
                                ? "bg-accent-soft ring-1 ring-inset ring-accent-border"
                                : "hover:bg-panel-muted/60",
                            )}
                          >
                            {current && (
                              <span
                                aria-hidden
                                className="absolute -left-[9px] top-2 bottom-2 w-[2px] rounded-full bg-accent"
                              />
                            )}
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                              {done ? (
                                <CheckCircle2 size={14} className="text-success" />
                              ) : current ? (
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent">
                                  <span className="h-1.5 w-1.5 rounded-full bg-accent-contrast" />
                                </span>
                              ) : (
                                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-edge-strong font-mono text-[7.5px] font-medium text-ink-faint">
                                  {index + 1}
                                </span>
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                className={cn(
                                  "block text-[11.5px] leading-[1.4]",
                                  current
                                    ? "font-semibold text-accent-ink"
                                    : done
                                      ? "font-medium text-ink-muted"
                                      : "font-medium text-ink-2 group-hover:text-ink",
                                )}
                              >
                                {lesson.title}
                              </span>
                              <span className="mt-0.5 block font-mono text-[8px] uppercase tracking-[0.08em] text-ink-faint">
                                {lesson.estimatedTimeMinutes} min · +{lesson.xpReward} XP
                              </span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Curriculum footer */}
        {!collapsed && (
          <div className="shrink-0 border-t border-line px-4 py-3">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-ink-faint">
                Curriculum
              </span>
              <span className="font-mono text-[10px] tabular-nums text-ink-muted">
                {curriculum.done}/{curriculum.total} · {curriculumPct}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={curriculumPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Curriculum progress"
              className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-2"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${curriculumPct}%` }}
              />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
