"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import { getTrpcErrorInfo } from "@/app/lib/trpc";
import {
  lessonBlocks,
  type LessonDetail,
} from "@/app/lib/curriculum/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DataState } from "./progress/ProgressOverview";
import { LessonRenderer } from "./lesson-renderer/LessonRenderer";
import type { BlockHandlers } from "./lesson-renderer/blocks";

/**
 * Full lesson experience: fetches the lesson + its module's lessons for
 * navigation, records "started", renders content blocks, grades quizzes
 * and challenges server-side, and completes lessons with one-time XP.
 */
export function LessonView({
  moduleId,
  lessonId,
}: {
  moduleId: number;
  lessonId: number;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const lessonQuery = useQuery(
    trpc.lesson.getLessonById.queryOptions({ id: lessonId })
  );
  const siblingsQuery = useQuery(
    trpc.lesson.getLessonsByModuleId.queryOptions({ moduleId })
  );
  const progressQuery = useQuery(
    trpc.progress.getLessonProgress.queryOptions({ lessonId })
  );

  const startLesson = useMutation(
    trpc.progress.startLesson.mutationOptions()
  );
  const submitQuiz = useMutation(
    trpc.progress.submitQuizAnswer.mutationOptions()
  );
  const submitChallenge = useMutation(
    trpc.progress.submitChallenge.mutationOptions()
  );
  const completeLesson = useMutation(
    trpc.progress.completeLesson.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.progress.getLessonProgress.queryKey({ lessonId }),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.progress.getModuleProgress.queryKey({ moduleId }),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.progress.getCurriculumProgress.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.progress.getMyProgress.queryKey(),
        });
      },
    })
  );

  // Mark the lesson in-progress once on open (idempotent server-side).
  useEffect(() => {
    if (lessonQuery.data) {
      startLesson.mutate({ lessonId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonQuery.data?.lesson.id]);

  const detail = lessonQuery.data as LessonDetail | undefined;
  const lesson = detail?.lesson;
  const moduleRow = detail?.module;

  const siblings = useMemo(
    () =>
      [...(siblingsQuery.data ?? [])].sort((a, b) => a.lessonNo - b.lessonNo),
    [siblingsQuery.data]
  );
  const index = siblings.findIndex((l) => l.id === lessonId);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  const blocks = useMemo(
    () => (detail ? lessonBlocks(detail) : []),
    [detail]
  );

  const progress = progressQuery.data;
  const completed = progress?.status === "completed";

  const error =
    (lessonQuery.error ? getTrpcErrorInfo(lessonQuery.error).message : null) ??
    (siblingsQuery.error
      ? getTrpcErrorInfo(siblingsQuery.error).message
      : null) ??
    (progressQuery.error
      ? getTrpcErrorInfo(progressQuery.error).message
      : null);

  const loading = lessonQuery.isLoading || siblingsQuery.isLoading;

  // 404: the lesson query failed and nothing loaded.
  if (!loading && lessonQuery.data == null) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-inset px-6 py-12 text-center">
        <p className="text-[15px] font-medium text-ink">Lesson not found</p>
        <p className="mt-1 text-[13px] text-ink-muted">
          It may be unpublished, or the link is wrong.
        </p>
        <Link
          href={`/modules/${moduleId}`}
          className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded-lg border border-edge px-3.5 py-2 text-[13px] font-medium text-ink-2 hover:bg-panel-muted"
        >
          <ArrowLeft size={14} />
          Back to module
        </Link>
      </div>
    );
  }

  const handlers: BlockHandlers = {
    onQuizSubmit: async (blockId, questionId, answer) => {
      const res = await submitQuiz.mutateAsync({
        lessonId,
        blockId,
        questionId,
        answer,
      });
      if (res.xpAwarded > 0) {
        void queryClient.invalidateQueries({
          queryKey: trpc.progress.getLessonProgress.queryKey({ lessonId }),
        });
      }
      return { correct: res.correct, explanation: res.explanation };
    },
    onChallengeSubmit: async (blockId, input) => {
      const res = await submitChallenge.mutateAsync({
        lessonId,
        blockId,
        code: input.code,
        answer: input.answer,
      });
      if (res.xpAwarded > 0) {
        void queryClient.invalidateQueries({
          queryKey: trpc.progress.getLessonProgress.queryKey({ lessonId }),
        });
      }
      return { accepted: res.accepted, message: res.message };
    },
  };

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header>
        <Link
          href={`/modules/${moduleId}`}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} />
          {moduleRow?.title ?? "Module"}
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
              {lesson?.title ?? "Loading…"}
            </h1>
            {lesson?.description ? (
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {lesson.description}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge>
                {lesson?.estimatedTimeMinutes ?? 0} min
              </Badge>
              <Badge tone="accent">
                <Zap size={11} />
                +{lesson?.xpReward ?? 0} XP
              </Badge>
              {completed ? (
                <Badge tone="success">
                  <CheckCircle2 size={11} />
                  Completed
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="h-px bg-edge" />

      <DataState
        loading={loading}
        error={error}
        empty={!loading && blocks.length === 0}
        emptyMessage="This lesson has no content yet."
      >
        <LessonRenderer
          title={lesson?.title ?? ""}
          description={lesson?.description}
          learningObjectives={(lesson?.learningObjectives ?? []) as string[]}
          blocks={blocks}
          handlers={handlers}
          showMeta={false}
        />
      </DataState>

      <div className="h-px bg-edge" />

      {/* Complete + navigation */}
      <div className="border-t border-edge pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {prev ? (
              <Link
                href={`/modules/${moduleId}/${prev.id}`}
                className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-edge px-3 text-[13px] font-medium text-ink-muted transition-colors hover:bg-panel-muted hover:text-ink"
              >
                <ArrowLeft size={14} />
                {prev.title}
              </Link>
            ) : null}

            {next ? (
              <Link
                href={`/modules/${moduleId}/${next.id}`}
                className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-edge px-3 text-[13px] font-medium text-ink transition-colors hover:bg-panel-muted"
              >
                {next.title}
                <ArrowRight size={14} />
              </Link>
            ) : null}
          </div>

          {completed ? (
            <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-easy/30 bg-easy-soft px-4 text-[13px] font-medium text-easy">
              <CheckCircle2 size={15} />
              Completed · +{lesson?.xpReward ?? 0} XP earned
            </span>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={completeLesson.isPending}
              onClick={() => completeLesson.mutate({ lessonId })}
              className="w-fit"
            >
              {completeLesson.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              Complete lesson
              <span className="ml-1 rounded bg-white/15 px-1.5 py-0.5 text-[11px]">
                +{lesson?.xpReward ?? 0} XP
              </span>
            </Button>
          )}
        </div>

        {completeLesson.error ? (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-danger-soft px-3.5 py-2.5 text-[13px] text-danger"
          >
            {getTrpcErrorInfo(completeLesson.error).message}
          </p>
        ) : null}
        {completeLesson.isSuccess ? (
          <p
            role="status"
            className="mt-3 rounded-lg bg-success-soft px-3.5 py-2.5 text-[13px] text-success"
          >
            {completeLesson.data.alreadyCompleted
              ? "Already completed — XP was awarded previously."
              : `Lesson complete! +${completeLesson.data.xpAwarded} XP (total ${completeLesson.data.totalXp}).`}
          </p>
        ) : null}
      </div>
    </article>
  );
}
