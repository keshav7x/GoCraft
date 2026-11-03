import { BookOpen, Target, Trophy } from "lucide-react";
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { isAuthError } from "@/trpc/errors";
import { PageHeader } from "@/app/components/ui/page-header";
import { Card, CardContent } from "@/app/components/ui/card";
import { ModuleCards } from "@/app/components/learning/curriculum/ModuleCards";

export const metadata = {
  title: "Learn — GoCraft",
};

export default async function ModulesPage() {
  let modules;
  let lessons;
  let progress;
  let myProgress;
  try {
    [modules, lessons, progress, myProgress] = await Promise.all([
      caller.module.getAllModulesWithStats.query(),
      caller.lesson.getAllLessons.query(),
      caller.progress.getCurriculumProgress.query(),
      caller.progress.getMyProgress.query(),
    ]);
  } catch (error) {
    // Only bounce when the session is actually invalid — other failures
    // (API down, 500, etc.) should surface via error.tsx, not login.
    if (isAuthError(error)) redirect("/login");
    throw error;
  }

  const totalLessons = lessons.length;
  const doneLessons = progress.filter((p) => p.status === "completed").length;
  const totalXp = myProgress.reduce((sum, p) => sum + (p.xpAwarded ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learn"
        description="A progressive Go curriculum: fundamentals first, then collections, types, and concurrency. Work through modules in order and track your XP."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-edge bg-panel px-3 text-[13px]">
              <BookOpen size={14} className="text-ink-faint" />
              <span className="font-medium tabular-nums">
                {doneLessons}/{totalLessons}
              </span>
              <span className="text-ink-muted">lessons</span>
            </div>
            <div className="flex h-9 items-center gap-2 rounded-lg border border-edge bg-panel px-3 text-[13px]">
              <Trophy size={14} className="text-accent" />
              <span className="font-medium tabular-nums">
                {totalXp.toLocaleString()}
              </span>
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
            the modules in order — lessons include explanations, interactive
            visualizations, quizzes, and challenges. XP is awarded server-side
            and saved to your account.
          </p>
        </CardContent>
      </Card>

      <ModuleCards modules={modules} lessons={lessons} progress={progress} />
    </div>
  );
}
