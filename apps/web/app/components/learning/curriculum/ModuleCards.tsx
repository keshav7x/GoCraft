"use client";

import { ArrowRight, BookOpen, Clock, Trophy } from "lucide-react";
import Link from "next/link";
import type { RouterOutputs } from "@/app/lib/curriculum/types";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";

type ModuleWithStats = RouterOutputs["module"]["getAllModulesWithStats"][number];
type Lesson = RouterOutputs["lesson"]["getAllLessons"][number];
type CurriculumProgress =
  RouterOutputs["progress"]["getCurriculumProgress"];

const DIFFICULTY_TONE: Record<string, string> = {
  beginner: "border-success/30 bg-success-soft text-success",
  intermediate: "border-warning/40 bg-warning-soft text-warning",
  advanced: "border-danger/30 bg-danger-soft text-danger",
};

/**
 * Module cards for /dashboard/learn — real API data with per-module progress.
 */
export function ModuleCards({
  modules,
  lessons,
  progress,
}: {
  modules: ModuleWithStats[];
  lessons: Lesson[];
  progress: CurriculumProgress;
}) {
  const statusByLesson = new Map(progress.map((p) => [p.lessonId, p.status]));

  return (
    <div className="space-y-3">
      {modules.map((module) => {
        const moduleLessons = lessons
          .filter((l) => l.moduleId === module.id)
          .sort((a, b) => a.lessonNo - b.lessonNo);
        const done = moduleLessons.filter(
          (l) => statusByLesson.get(l.id) === "completed"
        ).length;
        const total = moduleLessons.length || module.lessonsCount;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const state =
          total > 0 && done === total
            ? "completed"
            : done > 0
              ? "in-progress"
              : total > 0
                ? "available"
                : "planned";

        return (
          <Link
            key={module.id}
            href={`/dashboard/learn/${module.id}`}
            className="focus-ring group block rounded-xl border border-edge bg-panel p-4 shadow-card transition-colors hover:bg-panel-muted/60"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-[15.5px] font-semibold tracking-tight text-ink">
                    {module.title}
                  </h3>
                  <Badge
                    className={cn(
                      "border",
                      DIFFICULTY_TONE[module.difficulty] ?? "border-edge"
                    )}
                  >
                    {module.difficulty}
                  </Badge>
                  {state === "completed" && (
                    <Badge tone="success">Completed</Badge>
                  )}
                  {state === "in-progress" && <Badge tone="accent">In progress</Badge>}
                  {state === "planned" && <Badge>In development</Badge>}
                </div>
                <p className="mt-1.5 line-clamp-2 max-w-2xl text-[13.5px] leading-5 text-ink-muted">
                  {module.shortDescription ?? module.description ?? "No description yet."}
                </p>
              </div>
              <ArrowRight
                size={16}
                className="mt-1 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                aria-hidden
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen size={13} className="text-ink-faint" />
                {total} lesson{total === 1 ? "" : "s"}
              </span>
              {module.estimatedDuration > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={13} className="text-ink-faint" />
                  {module.estimatedDuration} min
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Trophy size={13} className="text-accent" />
                {done}/{total} done
              </span>
            </div>

            {total > 0 && (
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-inset"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${module.title} progress`}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width]",
                    state === "completed" ? "bg-success" : "bg-accent"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </Link>
        );
      })}

      {modules.length === 0 && (
        <div className="rounded-xl border border-dashed border-edge px-5 py-12 text-center">
          <BookOpen size={18} className="mx-auto text-ink-faint" />
          <p className="mt-3 text-sm font-medium text-ink">
            No modules published yet
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Content is being written — check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
