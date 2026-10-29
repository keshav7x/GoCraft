"use client";

import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemoStore } from "../../lib/progress-store";
import { Button } from "../ui/button";

type LessonActionsProps = {
  moduleId: string;
  lessonId: string;
  xp: number;
  prev: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
  nextModuleHref: string | null;
};

export function LessonActions({
  moduleId,
  lessonId,
  xp,
  prev,
  next,
  nextModuleHref,
}: LessonActionsProps) {
  const router = useRouter();
  const completed = useDemoStore((s) =>
    s.completedLessonIds.includes(`${moduleId}/${lessonId}`),
  );
  const completeLesson = useDemoStore((s) => s.completeLesson);

  function handleComplete() {
    completeLesson(`${moduleId}/${lessonId}`, xp);
    if (next) {
      router.push(`/dashboard/learn/${moduleId}/${next.id}`);
    }
  }

  return (
    <div className="border-t border-edge pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {prev ? (
            <Link
              href={`/dashboard/learn/${moduleId}/${prev.id}`}
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-edge px-3 text-[13px] font-medium text-ink-muted transition-colors hover:bg-panel-muted hover:text-ink"
            >
              <ArrowLeft size={14} />
              {prev.title}
            </Link>
          ) : null}

          {next ? (
            <Link
              href={`/dashboard/learn/${moduleId}/${next.id}`}
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-edge px-3 text-[13px] font-medium text-ink transition-colors hover:bg-panel-muted"
            >
              {next.title}
              <ArrowRight size={14} />
            </Link>
          ) : nextModuleHref ? (
            <Link
              href={nextModuleHref}
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-edge px-3 text-[13px] font-medium text-ink transition-colors hover:bg-panel-muted"
            >
              Next module
              <ArrowRight size={14} />
            </Link>
          ) : null}
        </div>

        {completed ? (
          <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-easy/30 bg-easy-soft px-4 text-[13px] font-medium text-easy">
            <CheckCircle2 size={15} />
            Completed · +{xp} XP earned
          </span>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleComplete}
            className="w-fit"
          >
            <Check size={15} />
            Complete lesson
            <span className="ml-1 rounded bg-white/15 px-1.5 py-0.5 text-[11px]">
              +{xp} XP
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
