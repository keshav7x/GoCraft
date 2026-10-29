"use client";

import { BookOpen, Target, Trophy } from "lucide-react";
import { CurriculumExplorer } from "../../components/learn/CurriculumExplorer";
import { PageHeader } from "../../components/ui/page-header";
import { Card, CardContent } from "../../components/ui/card";
import { CURRICULUM, CURRICULUM_PLANNED, totalLessons } from "../../lib/demo/curriculum";
import { useDemoStore } from "../../lib/progress-store";

export function LearnClient() {
  const completedLessonIds = useDemoStore((s) => s.completedLessonIds);
  const xp = useDemoStore((s) => s.xp);

  const total = totalLessons();
  const done = completedLessonIds.filter((id) =>
    CURRICULUM.some((m) => m.lessons.some((l) => `${m.id}/${l.id}` === id)),
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learn"
        description="A progressive Go curriculum: fundamentals first, then collections, types, and concurrency. Each module unlocks as you finish its prerequisites."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-edge bg-panel px-3 text-[13px]">
              <BookOpen size={14} className="text-ink-faint" />
              <span className="font-medium tabular-nums">
                {done}/{total}
              </span>
              <span className="text-ink-muted">lessons</span>
            </div>
            <div className="flex h-9 items-center gap-2 rounded-lg border border-edge bg-panel px-3 text-[13px]">
              <Trophy size={14} className="text-accent" />
              <span className="font-medium tabular-nums">{xp.toLocaleString()}</span>
              <span className="text-ink-muted">XP</span>
            </div>
          </div>
        }
      />

      <Card>
        <CardContent className="flex items-start gap-3 px-5 py-4">
          <Target size={16} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-[13px] leading-5 text-ink-muted">
            <span className="font-medium text-ink">Current goal:</span> finish
            the Data Types module to unlock Arrays, Slices, and Maps. Lessons
            include explanations, runnable-style examples, and checkpoints.
          </p>
        </CardContent>
      </Card>

      <CurriculumExplorer
        modules={CURRICULUM}
        planned={CURRICULUM_PLANNED}
      />
    </div>
  );
}
