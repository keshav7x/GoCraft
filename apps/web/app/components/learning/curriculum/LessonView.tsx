"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/app/lib/curriculum/types";
import { lessonBlocks } from "@/app/lib/curriculum/types";
import { LessonRenderer } from "@/app/components/learning/lesson-renderer/LessonRenderer";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

type LessonDetail = RouterOutputs["lesson"]["getLessonById"];
type SiblingLessons = RouterOutputs["lesson"]["getLessonsByModuleId"];
type InitialProgress = RouterOutputs["progress"]["getLessonProgress"];

/**
 * Learner lesson view: starts progress on open, wires quiz/challenge
 * submissions to the server grader, and completes lessons with
 * server-side idempotent XP.
 */
export function LessonView({
  detail,
  siblings,
  initialProgress,
}: {
  detail: LessonDetail;
  siblings: SiblingLessons;
  initialProgress: InitialProgress;
}) {
  const trpc = useTRPC();
  const router = useRouter();

  const { lesson, module, blocks } = detail;
  const lessonId = lesson.id;
  const parsed = lessonBlocks(detail);

  const startLesson = useMutation(trpc.progress.startLesson.mutationOptions());
  const submitQuiz = useMutation(
    trpc.progress.submitQuizAnswer.mutationOptions()
  );
  const submitChallenge = useMutation(
    trpc.progress.submitChallenge.mutationOptions()
  );
  const completeLesson = useMutation(
    trpc.progress.completeLesson.mutationOptions()
  );

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startLesson.mutate(
      { lessonId: lesson.id },
      { onError: () => void 0 } // non-fatal: page still renders
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  const progressQuery = useQuery(
    trpc.progress.getLessonProgress.queryOptions({ lessonId }, {
      initialData: initialProgress ?? undefined,
    })
  );
  const status = progressQuery.data?.status ?? "not started";

  const ordered = [...siblings].sort((a, b) => a.lessonNo - b.lessonNo);
  const idx = ordered.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

  async function handleComplete() {
    try {
      const res = await completeLesson.mutateAsync({ lessonId: lesson.id });
      if (res.alreadyCompleted) {
        toast.info("Already completed — XP was awarded earlier.");
      } else if (res.xpAwarded > 0) {
        toast.success(`Lesson complete! +${res.xpAwarded} XP`);
      } else {
        toast.success("Lesson complete!");
      }
      if (next) {
        router.push(`/modules/${module.id}/${next.id}`);
      } else {
        router.push(`/modules/${module.id}`);
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not complete lesson.");
    }
  }

  const completed = status === "completed";

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header>
        <Link
          href={`/modules/${module.id}`}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} />
          {module.title}
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge>
            {lesson.estimatedTimeMinutes} min
          </Badge>
          <Badge tone="accent">
            +{lesson.xpReward} XP
          </Badge>
          {completed && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-success/30 bg-success-soft px-2.5 py-1 text-[12px] font-medium text-success">
              <CheckCircle2 size={13} />
              Completed
            </span>
          )}
          {status === "in progress" && !completed && (
            <Badge tone="accent">In progress</Badge>
          )}
        </div>
      </header>

      <div className="h-px bg-edge" />

      <LessonRenderer
        title={lesson.title}
        description={lesson.description}
        learningObjectives={
          (lesson.learningObjectives as string[] | null) ?? null
        }
        blocks={parsed}
        handlers={{
          onQuizSubmit: async (blockId, questionId, answer) => {
            const res = await submitQuiz.mutateAsync({
              lessonId: lesson.id,
              blockId,
              questionId,
              answer,
            });
            if (res.xpAwarded > 0) {
              toast.success(`Correct! +${res.xpAwarded} XP`);
              void progressQuery.refetch();
            }
            return { correct: res.correct, explanation: res.explanation };
          },
          onChallengeSubmit: async (blockId, input) => {
            const res = await submitChallenge.mutateAsync({
              lessonId: lesson.id,
              blockId,
              code: input.code,
              answer: input.answer,
            });
            if (res.xpAwarded > 0) {
              toast.success(`Challenge solved! +${res.xpAwarded} XP`);
              void progressQuery.refetch();
            }
            return { accepted: res.accepted, message: res.message };
          },
        }}
      />

      <div className="h-px bg-edge" />

      <div className="border-t border-edge pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {prev ? (
              <Link
                href={`/modules/${module.id}/${prev.id}`}
                className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-edge px-3 text-[13px] font-medium text-ink-muted transition-colors hover:bg-panel-muted hover:text-ink"
              >
                <ArrowLeft size={14} />
                {prev.title}
              </Link>
            ) : null}

            {next ? (
              <Link
                href={`/modules/${module.id}/${next.id}`}
                className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-edge px-3 text-[13px] font-medium text-ink transition-colors hover:bg-panel-muted"
              >
                {next.title}
                <ArrowRight size={14} />
              </Link>
            ) : (
              <Link
                href={`/modules/${module.id}`}
                className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-edge px-3 text-[13px] font-medium text-ink transition-colors hover:bg-panel-muted"
              >
                Back to module
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {completed ? (
            <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-success/30 bg-success-soft px-4 text-[13px] font-medium text-success">
              <CheckCircle2 size={15} />
              Completed · +{lesson.xpReward} XP earned
            </span>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => void handleComplete()}
              disabled={completeLesson.isPending}
              className="w-fit"
            >
              {completeLesson.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              Complete lesson
              <span className="ml-1 rounded bg-white/15 px-1.5 py-0.5 text-[11px]">
                +{lesson.xpReward} XP
              </span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
