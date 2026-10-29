import { ArrowLeft, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModuleLessonList } from "../../../components/learn/ModuleLessonList";
import { ModuleProgress } from "../../../components/learn/ModuleProgress";
import { Badge } from "../../../components/ui/badge";
import { CURRICULUM, findModule } from "../../../lib/demo/curriculum";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const module = findModule(moduleId);
  if (!module || !("lessons" in module)) notFound();

  const published = CURRICULUM.find((m) => m.id === moduleId);
  if (!published) notFound();

  const prereqTitles = published.prerequisites.map(
    (id) => findModule(id)?.title ?? id,
  );

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
                {published.title}
              </h1>
              <Badge>
                {published.lessons.length} lesson
                {published.lessons.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
              {published.objective}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-[12.5px] text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} className="text-ink-faint" />
                {published.lessons.reduce((n, l) => n + l.minutes, 0)} minutes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap size={13} className="text-accent" />
                {published.lessons.reduce((n, l) => n + l.xp, 0)} XP available
              </span>
            </div>
          </div>

          <ModuleProgress moduleId={published.id} />
        </div>
      </div>

      <ModuleLessonList module={published} prereqTitles={prereqTitles} />
    </div>
  );
}
