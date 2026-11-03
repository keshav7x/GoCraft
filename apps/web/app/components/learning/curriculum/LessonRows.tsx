"use client";

import { ArrowRight, CheckCircle2, Circle, Play } from "lucide-react";
import Link from "next/link";
import type { RouterOutputs } from "@/app/lib/curriculum/types";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";

type Lesson = RouterOutputs["lesson"]["getAllLessons"][number];
type ModuleProgress = RouterOutputs["progress"]["getModuleProgress"];

/**
 * Ordered lesson rows for a module detail page — real API data.
 */
export function LessonRows({
  moduleId,
  lessons,
  progress,
}: {
  moduleId: number;
  lessons: Lesson[];
  progress: ModuleProgress;
}) {
  const statusById = new Map(progress.map((p) => [p.lessonId, p.status]));
  const ordered = [...lessons].sort((a, b) => a.lessonNo - b.lessonNo);
  const firstIncomplete = ordered.find(
    (l) => statusById.get(l.id) !== "completed"
  );
  const resumeLesson = firstIncomplete ?? ordered[0];
  const doneCount = ordered.filter(
    (l) => statusById.get(l.id) === "completed"
  ).length;
  const allDone = doneCount === ordered.length && ordered.length > 0;

  return (
    <div className="space-y-6">
      {resumeLesson ? (
        <div className="flex flex-col gap-3 rounded-xl border border-edge bg-panel p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[12px] text-ink-muted">
              {allDone
                ? "Review this module from the top"
                : doneCount === 0
                  ? "Start this module"
                  : "Resume where you stopped"}
            </p>
            <p className="mt-0.5 text-[15px] font-semibold tracking-tight text-ink">
              {resumeLesson.title}
            </p>
          </div>
          <Link
            href={`/modules/${moduleId}/${resumeLesson.id}`}
            className="focus-ring inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-ink/90"
          >
            <Play size={14} />
            {doneCount === 0 ? "Start module" : allDone ? "Review" : "Continue"}
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : null}

      <ol className="overflow-hidden rounded-xl bg-panel">
        {ordered.map((lesson, index) => {
          const done = statusById.get(lesson.id) === "completed";
          const inProgress = statusById.get(lesson.id) === "in progress";
          const isCurrent =
            resumeLesson?.id === lesson.id && !done;

          return (
            <li key={lesson.id}>
              <Link
                href={`/modules/${moduleId}/${lesson.id}`}
                className={cn(
                  "focus-ring group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-panel-muted/60",
                  isCurrent && "bg-accent-soft/30"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold tabular-nums",
                    done
                      ? "border-success/30 bg-success-soft text-success"
                      : isCurrent
                        ? "border-accent bg-accent text-white"
                        : "border-edge bg-panel text-ink-faint"
                  )}
                >
                  {done ? (
                    <CheckCircle2 size={15} />
                  ) : isCurrent ? (
                    <Play size={12} />
                  ) : (
                    index + 1
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink">
                    {lesson.title}
                  </p>
                  {lesson.description && (
                    <p className="mt-0.5 truncate text-[12px] text-ink-muted">
                      {lesson.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {isCurrent && <Badge tone="accent">Up next</Badge>}
                  {inProgress && !isCurrent && (
                    <Badge tone="accent">In progress</Badge>
                  )}
                  <span className="hidden text-[11.5px] tabular-nums text-ink-faint sm:inline">
                    {lesson.estimatedTimeMinutes} min
                  </span>
                  <span className="text-[11.5px] font-medium tabular-nums text-accent-ink">
                    +{lesson.xpReward} XP
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      {ordered.length === 0 && (
        <div className="rounded-xl border border-dashed border-edge px-5 py-10 text-center">
          <Circle size={18} className="mx-auto text-ink-faint" />
          <p className="mt-3 text-sm font-medium text-ink">
            No lessons published yet
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            This module is on the roadmap.
          </p>
        </div>
      )}
    </div>
  );
}
