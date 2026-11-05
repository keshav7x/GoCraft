"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FlaskConical,
  ListTree,
  Loader2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/app/lib/curriculum/types";
import { lessonBlocks } from "@/app/lib/curriculum/types";
import { buildPicoContext } from "@/app/lib/pico/context";
import { isVisualBlock } from "@/app/lib/curriculum/visuals";
import { LessonRenderer } from "@/app/components/learning/lesson-renderer/LessonRenderer";
import { Button } from "@/app/components/ui/button";
import { CourseNav } from "@/app/components/learning/workspace/CourseNav";
import { VisualLab, VizFocusRoot } from "@/app/components/learning/workspace/VisualLab";
import { PicoPanel } from "@/app/components/learning/workspace/PicoPanel";
import { useMediaQuery } from "@/app/components/learning/workspace/useMediaQuery";
import { cn } from "@/app/lib/utils";

type LessonDetail = RouterOutputs["lesson"]["getLessonById"];
type SiblingLessons = RouterOutputs["lesson"]["getLessonsByModuleId"];
type InitialProgress = RouterOutputs["progress"]["getLessonProgress"];
type AllModules = RouterOutputs["module"]["getAllModulesWithStats"];
type AllLessons = RouterOutputs["lesson"]["getAllLessons"];
type CurriculumProgress = RouterOutputs["progress"]["getCurriculumProgress"];

/**
 * Student lesson workspace: course rail (left), focused reading column
 * (center), contextual Visual Lab (right, only when the lesson contains
 * visualization blocks) and Pico, the lesson-aware companion.
 */
export function LessonView({
  detail,
  siblings,
  initialProgress,
  modules,
  allLessons,
  curriculumProgress,
}: {
  detail: LessonDetail;
  siblings: SiblingLessons;
  initialProgress: InitialProgress;
  modules: AllModules;
  allLessons: AllLessons;
  curriculumProgress: CurriculumProgress;
}) {
  const trpc = useTRPC();
  const router = useRouter();

  const { lesson, module } = detail;
  const lessonId = lesson.id;
  const parsed = useMemo(() => lessonBlocks(detail), [detail]);
  const visualBlocks = useMemo(() => parsed.filter(isVisualBlock), [parsed]);
  const hasVisuals = visualBlocks.length > 0;

  const [navCollapsed, setNavCollapsed] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(true);
  const [focusOpen, setFocusOpen] = useState(false);
  const [picoOpen, setPicoOpen] = useState(false);

  const isXl = useMediaQuery("(min-width: 1280px)");
  const labDocked = hasVisuals && isXl && labOpen;

  const picoContext = useMemo(
    () => buildPicoContext(detail, parsed),
    [detail, parsed],
  );

  const startLesson = useMutation(trpc.progress.startLesson.mutationOptions());
  const submitQuiz = useMutation(
    trpc.progress.submitQuizAnswer.mutationOptions(),
  );
  const submitChallenge = useMutation(
    trpc.progress.submitChallenge.mutationOptions(),
  );
  const completeLesson = useMutation(
    trpc.progress.completeLesson.mutationOptions(),
  );

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startLesson.mutate(
      { lessonId: lesson.id },
      { onError: () => void 0 }, // non-fatal: page still renders
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  const progressQuery = useQuery(
    trpc.progress.getLessonProgress.queryOptions(
      { lessonId },
      { initialData: initialProgress ?? undefined },
    ),
  );
  const status = progressQuery.data?.status ?? "not started";
  const completed = status === "completed";

  const ordered = useMemo(
    () => [...siblings].sort((a, b) => a.lessonNo - b.lessonNo),
    [siblings],
  );
  const idx = ordered.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;
  const lessonNumber = idx + 1;

  function handleLabToggle() {
    if (isXl) setLabOpen((v) => !v);
    else setFocusOpen(true);
  }

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
      toast.error(
        err instanceof Error ? err.message : "Could not complete lesson.",
      );
    }
  }

  const statusChip = completed ? (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-success/30 bg-success-soft px-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-success">
      <CheckCircle2 size={12} />
      Completed
    </span>
  ) : status === "in progress" ? (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-accent-border bg-accent-soft px-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-accent-ink">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      In progress
    </span>
  ) : (
    <span className="inline-flex h-7 items-center rounded-full border border-line bg-inset px-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted">
      Not started
    </span>
  );

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[600px] flex-col overflow-hidden bg-canvas">
      {/* ── Workspace toolbar ─────────────────────────────────── */}
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface px-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open course navigation"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink lg:hidden"
          >
            <ListTree size={16} />
          </button>

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-1 text-[12px]"
          >
            <Link
              href="/modules"
              className="hidden shrink-0 font-medium text-ink-faint transition-colors hover:text-ink md:inline"
            >
              Learn
            </Link>
            <ChevronRight size={12} className="hidden shrink-0 text-ink-faint md:inline" />
            <Link
              href={`/modules/${module.id}`}
              className="hidden max-w-[180px] shrink truncate font-medium text-ink-muted transition-colors hover:text-ink sm:inline"
            >
              {module.title}
            </Link>
            <ChevronRight size={12} className="hidden shrink-0 text-ink-faint sm:inline" />
            <span
              aria-current="page"
              className="min-w-0 truncate font-semibold text-ink"
            >
              {lesson.title}
            </span>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Lesson meta chips (desktop) */}
          <span className="hidden h-7 items-center gap-1 rounded-md border border-line bg-inset px-2 font-mono text-[10.5px] font-medium tabular-nums text-ink-muted md:inline-flex">
            <Clock size={11} />
            {lesson.estimatedTimeMinutes}m
          </span>
          <span className="hidden h-7 items-center gap-1 rounded-md border border-line bg-inset px-2 font-mono text-[10.5px] font-semibold tabular-nums text-accent-ink md:inline-flex">
            <Zap size={11} className="text-accent" />+{lesson.xpReward} XP
          </span>
          <span className="hidden sm:inline-flex">{statusChip}</span>

          {/* Visual Lab toggle — only when the lesson has visualization blocks */}
          {hasVisuals && (
            <button
              type="button"
              onClick={handleLabToggle}
              aria-pressed={isXl ? labOpen : focusOpen}
              title={
                isXl
                  ? labOpen
                    ? "Hide the Visual Lab"
                    : "Show the Visual Lab"
                  : "Open the Visual Lab"
              }
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-md border px-2 text-[11px] font-semibold transition-colors",
                (isXl ? labOpen : focusOpen)
                  ? "border-accent-border bg-accent-soft text-accent-ink"
                  : "border-line bg-surface text-ink-muted hover:text-ink",
              )}
            >
              <FlaskConical size={13} />
              <span className="hidden sm:inline">Visual Lab</span>
            </button>
          )}

          {/* Pico toggle */}
          <button
            type="button"
            onClick={() => setPicoOpen((v) => !v)}
            aria-pressed={picoOpen}
            title="Toggle Pico, your learning companion"
            className={cn(
              "flex h-8 shrink-0 items-center gap-1.5 rounded-full border pl-1 pr-2.5 text-[11.5px] font-semibold transition-all",
              picoOpen
                ? "border-accent bg-accent text-accent-contrast shadow-card"
                : "border-line bg-surface text-ink hover:border-accent-border hover:text-accent-ink",
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0d84b6] font-mono text-[10px] font-bold text-white">
              P
            </span>
            <span className="hidden min-[400px]:inline">Ask Pico</span>
          </button>
        </div>
      </div>

      {/* ── Workspace body ────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        <CourseNav
          modules={modules}
          lessons={allLessons}
          progress={curriculumProgress}
          currentModuleId={module.id}
          currentLessonId={lesson.id}
          collapsed={navCollapsed}
          onToggleCollapse={() => setNavCollapsed((v) => !v)}
          mobileOpen={navOpen}
          onCloseMobile={() => setNavOpen(false)}
        />

        {/* Center column */}
        <main className="gc-scrollbar min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1040px] px-5 pb-8 pt-6 sm:px-8 sm:pt-8">
            {/* Kicker */}
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                Lesson {lessonNumber} of {ordered.length}
              </span>
              <span className="h-px flex-1 bg-line" aria-hidden />
            </div>

            <LessonRenderer
              title={lesson.title}
              description={lesson.description}
              learningObjectives={
                (lesson.learningObjectives as string[] | null) ?? null
              }
              blocks={parsed}
              hideVisualizations={labDocked}
              wide={!hasVisuals}
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
                  return {
                    correct: res.correct,
                    explanation: res.explanation,
                  };
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

            {/* ── Footer: prev / complete / next ─────────────────── */}
            <div className="mt-10 border-t border-line pt-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  {prev ? (
                    <Link
                      href={`/modules/${module.id}/${prev.id}`}
                      className="focus-ring inline-flex h-9 max-w-[240px] items-center gap-1.5 rounded-lg border border-line px-3 text-[12.5px] font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
                    >
                      <ArrowLeft size={13} className="shrink-0" />
                      <span className="truncate">{prev.title}</span>
                    </Link>
                  ) : (
                    <span />
                  )}
                  {next && (
                    <Link
                      href={`/modules/${module.id}/${next.id}`}
                      className="focus-ring inline-flex h-9 max-w-[240px] items-center gap-1.5 rounded-lg border border-line px-3 text-[12.5px] font-medium text-ink transition-colors hover:bg-surface-2"
                    >
                      <span className="truncate">{next.title}</span>
                      <ArrowRight size={13} className="shrink-0" />
                    </Link>
                  )}
                </div>

                {completed ? (
                  <span className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-success/30 bg-success-soft px-4 text-[12.5px] font-semibold text-success lg:self-auto">
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
                    className="w-fit self-start lg:self-auto"
                  >
                    {completeLesson.isPending ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Check size={15} />
                    )}
                    Complete lesson
                    <span className="ml-1 rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10.5px]">
                      +{lesson.xpReward} XP
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Visual Lab — docked (xl+), only when the lesson has visuals */}
        {labDocked && (
          <VisualLab
            blocks={parsed}
            onExpand={() => setFocusOpen(true)}
            onCollapse={() => setLabOpen(false)}
          />
        )}

        {/* Pico — always mounted to preserve the conversation on this lesson */}
        <PicoPanel
          key={lessonId}
          open={picoOpen}
          onClose={() => setPicoOpen(false)}
          context={picoContext}
        />
      </div>

      {/* Focused Visual Lab overlay (any breakpoint) */}
      <VizFocusRoot
        open={focusOpen}
        blocks={parsed}
        initialIndex={0}
        onClose={() => setFocusOpen(false)}
      />
    </div>
  );
}
