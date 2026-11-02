import { ArrowLeft, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { LessonRows } from "../../../components/learning/curriculum/LessonRows";
import { Badge } from "../../../components/ui/badge";

export const metadata = {
  title: "Module — GoCraft",
};

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId: raw } = await params;
  const moduleId = Number(raw);
  if (!Number.isInteger(moduleId) || moduleId <= 0) notFound();

  let detail;
  let lessons;
  let progress;
  try {
    [detail, lessons, progress] = await Promise.all([
      caller.module.getModuleById({ moduleId }),
      caller.lesson.getLessonsByModuleId({ moduleId }),
      caller.progress.getModuleProgress({ moduleId }),
    ]);
  } catch {
    redirect("/login");
  }

  const { module, lessonCount } = detail;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/learn"
          className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} />
          All modules
        </Link>

        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
                {module.title}
              </h1>
              <Badge>
                {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
              </Badge>
              <Badge className="border border-edge">{module.difficulty}</Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
              {module.shortDescription ?? module.description ?? ""}
            </p>

            {module.estimatedDuration > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-[12.5px] text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={13} className="text-ink-faint" />
                  {module.estimatedDuration} minutes
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap size={13} className="text-accent" />
                  {lessons.reduce((n, l) => n + l.xpReward, 0)} XP available
                </span>
              </div>
            )}
          </div>

          <div className="shrink-0 rounded-xl border border-edge bg-panel px-4 py-3 shadow-card">
            <div className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">
              Your progress
            </div>
            <div className="mt-1 font-mono text-xl font-semibold text-ink tabular-nums">
              {
                progress.filter((p) => p.status === "completed").length
              }
              /{lessons.length}
            </div>
            <div className="text-[12px] text-ink-muted">lessons completed</div>
          </div>
        </div>
      </div>

      <LessonRows moduleId={module.id} lessons={lessons} progress={progress} />
    </div>
  );
}
