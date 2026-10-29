import { ArrowLeft, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonActions } from "../../../../components/learn/LessonActions";
import { LessonBlocks } from "../../../../components/learn/LessonBlocks";
import { Quiz } from "../../../../components/learn/Quiz";
import { Badge } from "../../../../components/ui/badge";
import { CURRICULUM, findLesson } from "../../../../lib/demo/curriculum";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>;
}) {
  const { moduleId, lessonId } = await params;
  const found = findLesson(moduleId, lessonId);
  if (!found) notFound();

  const { module, lesson, prev, next, nextModule } = found;
  const nextModulePublished = nextModule
    ? CURRICULUM.find((m) => m.id === nextModule.id)
    : null;

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header>
        <Link
          href={`/dashboard/learn/${module.id}`}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} />
          {module.title}
        </Link>

        <div className="mt-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
            {lesson.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{lesson.summary}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge>
              <Clock size={11} />
              {lesson.minutes} min
            </Badge>
            <Badge tone="accent">
              <Zap size={11} />
              +{lesson.xp} XP
            </Badge>
          </div>
        </div>
      </header>

      <div className="h-px bg-edge" />

      <LessonBlocks sections={lesson.sections ?? []} />

      <div className="h-px bg-edge" />

      <Quiz questions={lesson.quiz ?? []} lessonKey={`${module.id}/${lesson.id}`} />

      <LessonActions
        moduleId={module.id}
        lessonId={lesson.id}
        xp={lesson.xp}
        prev={prev ? { id: prev.id, title: prev.title } : null}
        next={next ? { id: next.id, title: next.title } : null}
        nextModuleHref={
          nextModulePublished
            ? `/dashboard/learn/${nextModulePublished.id}`
            : null
        }
      />
    </article>
  );
}
