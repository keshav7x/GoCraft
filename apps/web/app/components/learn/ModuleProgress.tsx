"use client";

import { CURRICULUM } from "../../lib/demo/curriculum";
import { useDemoStore } from "../../lib/progress-store";
import { Progress } from "../ui/progress";

export function ModuleProgress({ moduleId }: { moduleId: string }) {
  const completedLessonIds = useDemoStore((s) => s.completedLessonIds);
  const module = CURRICULUM.find((m) => m.id === moduleId);

  if (!module || module.lessons.length === 0) return null;

  const done = module.lessons.filter((l) =>
    completedLessonIds.includes(`${module.id}/${l.id}`),
  ).length;
  const pct = Math.round((done / module.lessons.length) * 100);

  return (
    <div className="w-full shrink-0 rounded-xl border border-edge bg-panel px-4 py-3 sm:w-[220px]">
      <div className="flex items-baseline justify-between text-[12px]">
        <span className="text-ink-muted">Module progress</span>
        <span className="font-semibold tabular-nums">{pct}%</span>
      </div>
      <Progress value={pct} className="mt-2" ariaLabel="Module progress" />
      <p className="mt-2 text-[11.5px] tabular-nums text-ink-faint">
        {done} of {module.lessons.length} lessons
      </p>
    </div>
  );
}
