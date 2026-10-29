"use client";

import { ArrowRight, CheckCircle2, Circle, Lock, Play } from "lucide-react";
import Link from "next/link";
import type { CurriculumModule } from "../../lib/demo/types";
import { useDemoStore } from "../../lib/progress-store";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

export function ModuleLessonList({
  module,
  prereqTitles,
}: {
  module: CurriculumModule;
  prereqTitles: string[];
}) {
  const completedLessonIds = useDemoStore((s) => s.completedLessonIds);

  const firstIncomplete = module.lessons.find(
    (l) => !completedLessonIds.includes(`${module.id}/${l.id}`),
  );
  const resumeLesson = firstIncomplete ?? module.lessons[0];

  const doneCount = module.lessons.filter((l) =>
    completedLessonIds.includes(`${module.id}/${l.id}`),
  ).length;
  const allDone = doneCount === module.lessons.length && module.lessons.length > 0;

  return (
    <div className="space-y-6">
      {prereqTitles.length > 0 ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-edge bg-panel-muted px-3.5 py-2.5 text-[12.5px] leading-5 text-ink-muted">
          <Lock size={14} className="mt-0.5 shrink-0 text-ink-faint" />
          <p>
            <span className="font-medium text-ink">Prerequisites:</span>{" "}
            {prereqTitles.join(", ")}. You have access because your progress
            cleared them.
          </p>
        </div>
      ) : null}

      {resumeLesson ? (
        <div className="flex flex-col gap-3 rounded-xl border border-edge bg-panel p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[12px] text-ink-muted">
              {allDone ? "Review this module from the top" : "Resume where you stopped"}
            </p>
            <p className="mt-0.5 text-[15px] font-semibold tracking-tight">
              {resumeLesson.title}
            </p>
          </div>
          <Link
            href={`/dashboard/learn/${module.id}/${resumeLesson.id}`}
            className="focus-ring inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-ink/90"
          >
            <Play size={14} />
            {doneCount === 0 ? "Start module" : allDone ? "Review" : "Continue"}
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : null}

      <ol className="overflow-hidden rounded-xl bg-panel">
        {module.lessons.map((lesson, index) => {
          const key = `${module.id}/${lesson.id}`;
          const done = completedLessonIds.includes(key);
          const isCurrent = resumeLesson?.id === lesson.id && !done;

          return (
            <li key={lesson.id}>
              <Link
                href={`/dashboard/learn/${module.id}/${lesson.id}`}
                className={cn(
                  "focus-ring group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-panel-muted/60",
                  isCurrent && "bg-accent-soft/30",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold tabular-nums",
                    done
                      ? "border-easy/30 bg-easy-soft text-easy"
                      : isCurrent
                        ? "border-accent bg-accent text-white"
                        : "border-edge bg-panel text-ink-faint",
                  )}
                >
                  {done ? <CheckCircle2 size={15} /> : isCurrent ? <Play size={12} /> : index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink">
                    {lesson.title}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-ink-muted">
                    {lesson.summary}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {isCurrent ? <Badge tone="accent">Up next</Badge> : null}
                  <span className="hidden text-[11.5px] tabular-nums text-ink-faint sm:inline">
                    {lesson.minutes} min
                  </span>
                  <span className="text-[11.5px] font-medium tabular-nums text-accent-strong">
                    +{lesson.xp} XP
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      {module.lessons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge px-5 py-10 text-center">
          <Circle size={18} className="mx-auto text-ink-faint" />
          <p className="mt-3 text-sm font-medium">No lessons published yet</p>
          <p className="mt-1 text-xs text-ink-muted">
            This module is on the roadmap.
          </p>
        </div>
      ) : null}
    </div>
  );
}
