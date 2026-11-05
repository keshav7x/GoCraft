"use client";

import {
  CheckCircle2,
  ChevronDown,
  Circle,
  CircleDashed,
  GraduationCap,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { RouterOutputs } from "@/app/lib/curriculum/types";
import { cn } from "@/app/lib/utils";

type ModuleWithStats =
  RouterOutputs["module"]["getAllModulesWithStats"][number];
type Lesson = RouterOutputs["lesson"]["getAllLessons"][number];
type CurriculumProgress = RouterOutputs["progress"]["getCurriculumProgress"];

type LessonStatus = "completed" | "in progress" | "not started";

function lessonStatusIcon(status: LessonStatus | undefined, current: boolean) {
  if (status === "completed") {
    return (
      <CheckCircle2
        size={16}
        className="shrink-0 text-success"
        aria-label="Completed"
      />
    );
  }
  if (current) {
    return (
      <span
        aria-hidden
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-accent"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
    );
  }
  if (status === "in progress") {
    return (
      <CircleDashed
        size={16}
        className="shrink-0 text-accent"
        aria-label="In progress"
      />
    );
  }
  return (
    <Circle size={16} className="shrink-0 text-ink-faint" aria-label="Not started" />
  );
}

export type CourseNavProps = {
  modules: ModuleWithStats[];
  lessons: Lesson[];
  progress: CurriculumProgress;
  currentModuleId: number;
  currentLessonId: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

/**
 * Course rail: module list + expandable lesson trees with locking,
 * completion states and per-module progress.
 * lg+: docked column, collapsible to an icon rail.
 * Below lg: slide-over drawer (backdrop + Escape via workspace).
 */
export function CourseNav({
  modules,
  lessons,
  progress,
  currentModuleId,
  currentLessonId,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: CourseNavProps) {
  const statusByLesson = useMemo(
    () => new Map(progress.map((p) => [p.lessonId, p.status as LessonStatus])),
    [progress],
  );

  const sortedModules = useMemo(
    () => [...modules].sort((a, b) => a.moduleNo - b.moduleNo),
    [modules],
  );

  const lessonsByModule = useMemo(() => {
    const map = new Map<number, Lesson[]>();
    for (const lesson of lessons) {
      const list = map.get(lesson.moduleId) ?? [];
      list.push(lesson);
      map.set(lesson.moduleId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.lessonNo - b.lessonNo);
    }
    return map;
  }, [lessons]);

  const [expanded, setExpanded] = useState<Record<number, boolean>>(() => ({
    [currentModuleId]: true,
  }));

  /* Escape closes the mobile drawer; body scroll locks while it is open. */
  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseMobile();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, onCloseMobile]);

  const totalLessons = lessons.length;
  const doneLessons = useMemo(
    () =>
      lessons.filter((l) => statusByLesson.get(l.id) === "completed").length,
    [lessons, statusByLesson],
  );
  const doneModules = useMemo(
    () =>
      sortedModules.filter((m) => {
        const ls = lessonsByModule.get(m.id) ?? [];
        return (
          ls.length > 0 &&
          ls.every((l) => statusByLesson.get(l.id) === "completed")
        );
      }).length,
    [sortedModules, lessonsByModule, statusByLesson],
  );
  const curriculumPct =
    totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  const toggleModule = (id: number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ── Full navigation body (mobile drawer + expanded desktop rail) ── */
  const fullBody = (
    <>
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-3">
        <div className="flex min-w-0 items-center gap-2">
          <GraduationCap size={16} className="shrink-0 text-accent" />
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Curriculum
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse course navigation"
            className="hidden h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink lg:inline-flex"
          >
            <PanelLeftClose size={15} />
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink lg:hidden"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <nav
        aria-label="Course modules"
        className="gc-scrollbar flex-1 overflow-y-auto px-2.5 py-3"
      >
        {sortedModules.map((module) => {
          const moduleLessons = lessonsByModule.get(module.id) ?? [];
          const done = moduleLessons.filter(
            (l) => statusByLesson.get(l.id) === "completed",
          ).length;
          const total = moduleLessons.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const isOpen = expanded[module.id] ?? false;
          const complete = total > 0 && done === total;
          const firstIncomplete = moduleLessons.find(
            (l) => statusByLesson.get(l.id) !== "completed",
          );

          return (
            <div key={module.id} className="mb-1">
              {/* Module row */}
              <div
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-2 py-2 transition-colors",
                  module.id === currentModuleId && "bg-panel-muted/50",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${module.title}`}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <ChevronDown
                    size={15}
                    className={cn(
                      "transition-transform duration-200",
                      isOpen ? "" : "-rotate-90",
                    )}
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[12px] font-semibold tracking-tight text-ink">
                      <span className="mr-1.5 font-mono text-[10.5px] font-medium text-ink-faint">
                        {String(module.moduleNo).padStart(2, "0")}
                      </span>
                      {module.title}
                    </p>
                    {complete && (
                      <CheckCircle2
                        size={13}
                        className="shrink-0 text-success"
                        aria-label="Module complete"
                      />
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width] duration-500",
                          complete ? "bg-success" : "bg-accent",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="shrink-0 font-mono text-[9.5px] tabular-nums text-ink-faint">
                      {done}/{total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lessons */}
              {isOpen && (
                <ol className="mt-0.5 space-y-0.5 pb-2 pl-5">
                  {moduleLessons.map((lesson) => {
                    const status = statusByLesson.get(lesson.id);
                    const isCurrent = lesson.id === currentLessonId;
                    const locked =
                      !isCurrent &&
                      !!firstIncomplete &&
                      lesson.lessonNo > firstIncomplete.lessonNo &&
                      status !== "completed";

                    if (locked) {
                      return (
                        <li key={lesson.id}>
                          <div
                            title="Complete the previous lesson to unlock"
                            aria-disabled="true"
                            className="flex cursor-not-allowed items-center gap-2 rounded-md px-2 py-[7px] text-ink-faint"
                          >
                            <Lock size={13} className="shrink-0" />
                            <span className="min-w-0 flex-1 truncate text-[12px] text-ink-faint">
                              {lesson.title}
                            </span>
                          </div>
                        </li>
                      );
                    }

                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/modules/${module.id}/${lesson.id}`}
                          aria-current={isCurrent ? "page" : undefined}
                          onClick={onCloseMobile}
                          className={cn(
                            "focus-ring relative flex items-center gap-2 rounded-md px-2 py-[7px] transition-colors",
                            isCurrent
                              ? "bg-accent-soft font-medium text-accent-ink"
                              : "text-ink-muted hover:bg-surface-2 hover:text-ink",
                          )}
                        >
                          {isCurrent && (
                            <span
                              aria-hidden
                              className="absolute bottom-1.5 left-0 top-1.5 w-[2.5px] rounded-full bg-accent"
                            />
                          )}
                          {lessonStatusIcon(status, isCurrent)}
                          <span className="min-w-0 flex-1 truncate text-[12px] leading-4">
                            {lesson.title}
                          </span>
                          <span className="shrink-0 font-mono text-[9.5px] tabular-nums text-ink-faint">
                            {lesson.estimatedTimeMinutes}m
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                  {moduleLessons.length === 0 && (
                    <li className="px-2 py-2 text-[11.5px] text-ink-faint">
                      No lessons published yet.
                    </li>
                  )}
                </ol>
              )}
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        <div className="flex items-center justify-between text-[11px] font-medium text-ink-muted">
          <span>Curriculum progress</span>
          <span className="tabular-nums">
            {doneLessons}/{totalLessons} lessons
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={curriculumPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Curriculum completion"
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${curriculumPct}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10.5px] text-ink-faint">
          {doneModules} of {sortedModules.length} modules complete
        </p>
      </div>
    </>
  );

  /* ── Collapsed icon rail (desktop only) ── */
  const railBody = (
    <>
      <div className="flex h-12 shrink-0 items-center justify-center border-b border-line">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expand course navigation"
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <PanelLeftOpen size={16} />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center gap-1.5 overflow-y-auto py-3">
        {sortedModules.map((module) => {
          const moduleLessons = lessonsByModule.get(module.id) ?? [];
          const done = moduleLessons.filter(
            (l) => statusByLesson.get(l.id) === "completed",
          ).length;
          const complete =
            moduleLessons.length > 0 && done === moduleLessons.length;
          const active = module.id === currentModuleId;
          return (
            <button
              key={module.id}
              type="button"
              title={module.title}
              onClick={onToggleCollapse}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-lg font-mono text-[11px] font-semibold transition-colors",
                active
                  ? "bg-accent text-accent-contrast"
                  : complete
                    ? "bg-success-soft text-success"
                    : "text-ink-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              {String(module.moduleNo).padStart(2, "0")}
              {complete && (
                <span
                  aria-hidden
                  className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-surface"
                />
              )}
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close course navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] lg:hidden"
        />
      )}
      <aside
        aria-label="Course navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-[288px] flex-col border-r border-line bg-surface transition-[transform,width] duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:inset-auto lg:z-auto lg:shrink-0 lg:translate-x-0",
          collapsed ? "lg:w-14" : "lg:w-[272px]",
        )}
      >
        {/* Desktop icon rail */}
        {collapsed && (
          <div className="hidden h-full flex-col lg:flex">{railBody}</div>
        )}
        {/* Full navigation (mobile always, desktop when expanded) */}
        <div
          className={cn(
            "flex h-full min-h-0 flex-col",
            collapsed && "lg:hidden",
          )}
        >
          {fullBody}
        </div>
      </aside>
    </>
  );
}
