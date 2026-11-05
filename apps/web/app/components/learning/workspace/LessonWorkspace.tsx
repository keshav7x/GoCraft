"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FlaskConical,
  ListChecks,
  Loader2,
  PanelLeft,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/app/lib/curriculum/types";
import { lessonBlocks } from "@/app/lib/curriculum/types";
import { isVisualBlock } from "@/app/lib/curriculum/visuals";
import { LessonRenderer } from "@/app/components/learning/lesson-renderer/LessonRenderer";
import { Button } from "@/app/components/ui/button";
import { CourseSidebar, type SidebarLesson, type SidebarModule, type SidebarProgress } from "./CourseSidebar";
import { VisualLab, VizFocusRoot } from "./VisualLab";
import { PicoChat, PicoAvatar } from "../pico/PicoChat";
import { buildPicoContext } from "@/app/lib/pico/context";
import { useMediaQuery } from "./useMediaQuery";
import { cn } from "@/app/lib/utils";

type LessonDetail = RouterOutputs["lesson"]["getLessonById"];
type SiblingLessons = RouterOutputs["lesson"]["getLessonsByModuleId"];
type InitialProgress = RouterOutputs["progress"]["getLessonProgress"];

/* Persisted rail-collapse flag — useSyncExternalStore keeps it SSR-safe
   (server renders expanded) with no hydration drift and no effect setState. */
const NAV_COLLAPSED_KEY = "gocraft:lesson-nav-collapsed";
const navListeners = new Set<() => void>();

function subscribeNavCollapsed(onChange: () => void) {
  navListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    navListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getNavCollapsedSnapshot() {
  try {
    return window.localStorage.getItem(NAV_COLLAPSED_KEY) === "1";
  } catch {
    /* storage unavailable */
    return false;
  }
}

function getNavCollapsedServerSnapshot() {
  return false;
}

function storeNavCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(NAV_COLLAPSED_KEY, value ? "1" : "0");
  } catch {
    /* storage unavailable */
  }
  for (const listener of [...navListeners]) listener();
}

/**
 * The student lesson workspace: course rail · reading column ·
 * Visual Lab · Pico companion. Replaces the old article-style page.
 */
export function LessonWorkspace({
  detail,
  siblings,
  curriculumModules,
  allLessons,
  progressRows,
  initialProgress,
}: {
  detail: LessonDetail;
  siblings: SiblingLessons;
  curriculumModules: SidebarModule[];
  allLessons: SidebarLesson[];
  progressRows: SidebarProgress[];
  initialProgress: InitialProgress;
}) {
  const trpc = useTRPC();
  const router = useRouter();

  const { lesson, module, blocks } = detail;
  const lessonId = lesson.id;
  const parsed = useMemo(() => lessonBlocks(detail), [detail]);
  const visuals = useMemo(() => parsed.filter(isVisualBlock), [parsed]);
  const hasVisuals = visuals.length > 0;

  const isXl = useMediaQuery("(min-width: 1280px)");

  const navCollapsed = useSyncExternalStore(
    subscribeNavCollapsed,
    getNavCollapsedSnapshot,
    getNavCollapsedServerSnapshot,
  );
  const [navOpen, setNavOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(hasVisuals);
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [picoOpen, setPicoOpen] = useState(false);
  const [picoFocus, setPicoFocus] = useState(0);

  const toggleNavCollapsed = () => storeNavCollapsed(!navCollapsed);

  const statusByLesson = useMemo(
    () => new Map(progressRows.map((p) => [p.lessonId, p.status])),
    [progressRows],
  );

  const ordered = useMemo(
    () => [...siblings].sort((a, b) => a.lessonNo - b.lessonNo),
    [siblings],
  );
  const idx = ordered.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

  const moduleDone = ordered.filter(
    (l) => statusByLesson.get(l.id) === "completed",
  ).length;
  const modulePct = ordered.length > 0 ? (moduleDone / ordered.length) * 100 : 0;

  /* ---------------- progress plumbing (unchanged semantics) ---------------- */

  const startLesson = useMutation(trpc.progress.startLesson.mutationOptions());
  const submitQuiz = useMutation(trpc.progress.submitQuizAnswer.mutationOptions());
  const submitChallenge = useMutation(trpc.progress.submitChallenge.mutationOptions());
  const completeLesson = useMutation(trpc.progress.completeLesson.mutationOptions());

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startLesson.mutate({ lessonId }, { onError: () => void 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const progressQuery = useQuery(
    trpc.progress.getLessonProgress.queryOptions(
      { lessonId },
      { initialData: initialProgress ?? undefined },
    ),
  );
  const status = progressQuery.data?.status ?? "not started";
  const completed = status === "completed";

  async function handleComplete() {
    try {
      const res = await completeLesson.mutateAsync({ lessonId });
      if (res.alreadyCompleted) {
        toast.info("Already completed — XP was awarded earlier.");
      } else if (res.xpAwarded > 0) {
        toast.success(`Lesson complete! +${res.xpAwarded} XP`);
      } else {
        toast.success("Lesson complete!");
      }
      router.push(next ? `/modules/${module.id}/${next.id}` : `/modules/${module.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not complete lesson.");
    }
  }

  const openPico = () => {
    setPicoOpen((v) => {
      if (!v) setPicoFocus((s) => s + 1);
      return !v;
    });
  };

  const toggleLab = () => {
    if (isXl) setLabOpen((v) => !v);
    else setFocusOpen((v) => !v);
  };
  const labActive = isXl ? labOpen : focusOpen;

  const labInline = hasVisuals && labOpen && isXl;
  const picoContext = useMemo(() => buildPicoContext(detail, parsed), [detail, parsed]);
  const objectives = (lesson.learningObjectives as string[] | null) ?? [];

  /* ------------------------------- render -------------------------------- */

  return (
    <div className="flex min-h-[calc(100dvh-64px)] flex-col bg-canvas">
      {/* ── Workspace command strip ─────────────────────────────────── */}
      <div className="sticky top-16 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-canvas/85 px-3 backdrop-blur-xl sm:px-4">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          aria-label="Open course navigation"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-panel-muted hover:text-ink lg:hidden"
        >
          <PanelLeft size={17} />
        </button>

        {/* Wayfinding */}
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0 rounded border border-line bg-inset px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-muted">
            MOD {String(module.moduleNo).padStart(2, "0")}
          </span>
          <ChevronRight size={12} className="shrink-0 text-ink-faint" />
          <span className="truncate text-[12px] font-medium text-ink-2">
            {lesson.title}
          </span>
          <span className="hidden shrink-0 font-mono text-[9.5px] tabular-nums text-ink-faint md:inline">
            · {idx + 1}/{ordered.length}
          </span>
        </div>

        {/* Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          {hasVisuals && (
            <button
              type="button"
              onClick={toggleLab}
              aria-pressed={labActive}
              title={labActive ? "Hide Visual Lab" : "Open Visual Lab"}
              className={cn(
                "focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition-colors",
                labActive
                  ? "border-accent-border bg-accent-soft text-accent-ink"
                  : "border-line bg-surface text-ink-muted hover:border-edge-strong hover:text-ink",
              )}
            >
              <FlaskConical size={14} />
              <span className="hidden sm:inline">Visual Lab</span>
              <span className="rounded bg-surface-2 px-1 font-mono text-[9px] tabular-nums text-ink-muted">
                {visuals.length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={openPico}
            aria-pressed={picoOpen}
            title={picoOpen ? "Close Pico" : "Ask Pico"}
            className={cn(
              "focus-ring inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[12px] font-semibold text-accent-contrast shadow-[0_1px_2px_rgba(2,132,184,0.35)] transition-all",
              picoOpen
                ? "bg-accent-hover ring-2 ring-accent/25"
                : "bg-accent hover:bg-accent-hover",
            )}
          >
            <PicoAvatar size={18} className="rounded-[5px]" />
            Ask Pico
          </button>
        </div>

        {/* Module completion hairline */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-[2px] bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${modulePct}%` }}
        />
      </div>

      {/* ── Workspace body ──────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 items-stretch">
        <CourseSidebar
          modules={curriculumModules}
          lessons={allLessons}
          progress={progressRows}
          currentModuleId={module.id}
          currentLessonId={lesson.id}
          collapsed={navCollapsed}
          mobileOpen={navOpen}
          onCloseMobile={() => setNavOpen(false)}
          onToggleCollapsed={toggleNavCollapsed}
        />

        {/* ── Reading column ─────────────────────────────────────── */}
        <main className="min-w-0 flex-1">
          <div
            className={cn(
              "mx-auto w-full py-6 sm:py-8",
              labInline
                ? "max-w-[860px] px-4 sm:px-6 lg:px-8"
                : "max-w-[920px] px-4 sm:px-8 lg:px-12",
            )}
          >
            {/* Lesson hero */}
            <header>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase leading-4 tracking-[0.22em] text-accent-ink">
                  Module {String(module.moduleNo).padStart(2, "0")} — Lesson{" "}
                  {String(idx + 1).padStart(2, "0")}
                </p>
                <div className="flex items-center gap-3 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> {lesson.estimatedTimeMinutes} min
                  </span>
                  <span className="inline-flex items-center gap-1 text-accent-ink">
                    <Zap size={11} /> +{lesson.xpReward} XP
                  </span>
                  {completed && (
                    <span className="inline-flex items-center gap-1 text-success">
                      <CheckCircle2 size={11} /> Done
                    </span>
                  )}
                </div>
              </div>

              <h1 className="mt-3 text-balance text-[30px] font-semibold leading-[1.14] tracking-tight text-ink sm:text-[36px]">
                {lesson.title}
              </h1>
              {lesson.description && (
                <p className="mt-3 max-w-[68ch] text-pretty text-[15.5px] leading-7 text-ink-muted">
                  {lesson.description}
                </p>
              )}

              {objectives.length > 0 && (
                <div className="mt-5 rounded-xl border border-accent-border/60 bg-accent-soft/35 px-4 py-3.5 sm:px-5">
                  <div className="flex items-center gap-1.5">
                    <ListChecks size={13} className="text-accent-ink" />
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent-ink">
                      What you&apos;ll walk away with
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {objectives.map((obj, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-[13px] leading-6 text-ink-2"
                      >
                        <Check size={12} strokeWidth={3} className="mt-1 shrink-0 text-accent" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </header>

            <div aria-hidden className="my-6 border-t border-line" />

            {/* Blocks */}
            <LessonRenderer
              title={lesson.title}
              blocks={parsed}
              showMeta={false}
              wide
              hideVisualizations={labInline}
              handlers={{
                onQuizSubmit: async (blockId, questionId, answer) => {
                  const res = await submitQuiz.mutateAsync({
                    lessonId,
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
                    lessonId,
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

            {/* Footer: prev/next */}
            <nav
              aria-label="Lesson navigation"
              className="mt-10 flex items-stretch justify-between gap-3 border-t border-line pt-5"
            >
              {prev ? (
                <Link
                  href={`/modules/${module.id}/${prev.id}`}
                  className="focus-ring group flex max-w-[46%] items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 transition-colors hover:border-edge-strong hover:bg-panel-muted"
                >
                  <ArrowLeft size={15} className="shrink-0 text-ink-faint transition-transform group-hover:-translate-x-0.5" />
                  <span className="min-w-0">
                    <span className="block font-mono text-[8.5px] uppercase tracking-[0.2em] text-ink-faint">
                      Prev
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] font-medium text-ink-2">
                      {prev.title}
                    </span>
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/modules/${module.id}/${next.id}`}
                  className="focus-ring group ml-auto flex max-w-[46%] items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-right transition-colors hover:border-edge-strong hover:bg-panel-muted"
                >
                  <span className="min-w-0">
                    <span className="block font-mono text-[8.5px] uppercase tracking-[0.2em] text-ink-faint">
                      Next
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] font-medium text-ink">
                      {next.title}
                    </span>
                  </span>
                  <ArrowRight size={15} className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <Link
                  href={`/modules/${module.id}`}
                  className="focus-ring group ml-auto flex max-w-[46%] items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-right transition-colors hover:border-edge-strong hover:bg-panel-muted"
                >
                  <span className="min-w-0">
                    <span className="block font-mono text-[8.5px] uppercase tracking-[0.2em] text-ink-faint">
                      Module
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] font-medium text-ink">
                      Back to overview
                    </span>
                  </span>
                  <ArrowRight size={15} className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </nav>

            {/* Completion band */}
            <div className="relative mt-4 overflow-hidden rounded-2xl border border-line bg-inset px-5 py-4 sm:px-6">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 hidden w-56 opacity-60 [mask-image:linear-gradient(to_left,black,transparent)] sm:block"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--c-line-strong) 1.1px, transparent 1.2px)",
                  backgroundSize: "16px 16px",
                }}
              />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-soft text-accent-ink">
                    <Zap size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink">
                      {completed ? "Lesson complete" : "Finished with this lesson?"}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-5 text-ink-muted">
                      {completed
                        ? "Progress saved to your account. XP was banked server-side."
                        : `Mark it complete to bank +${lesson.xpReward} XP and save your place.`}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 sm:ml-auto">
                  {completed ? (
                    <span className="inline-flex h-11 items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-4 text-[13px] font-semibold text-success">
                      <CheckCircle2 size={16} />
                      Completed · +{lesson.xpReward} XP
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="accent"
                      size="lg"
                      onClick={() => void handleComplete()}
                      disabled={completeLesson.isPending}
                      className="w-fit"
                    >
                      {completeLesson.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} strokeWidth={2.5} />
                      )}
                      Complete lesson
                      <span className="rounded-md bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">
                        +{lesson.xpReward}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ── Visual Lab (inline, xl+) ─────────────────────────────── */}
        {labInline && (
          <VisualLab
            blocks={parsed}
            onExpand={() => {
              setFocusIndex(0);
              setFocusOpen(true);
            }}
            onCollapse={() => setLabOpen(false)}
          />
        )}

        {/* ── Pico dock ──────────────────────────────────────────── */}
        <aside
          key={lessonId}
          aria-label="Pico learning companion"
          aria-hidden={!picoOpen}
          inert={!picoOpen}
          className={cn(
            "flex flex-col bg-surface",
            // Below lg: full-screen sheet from the right.
            "max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50 max-lg:w-full max-lg:max-w-md max-lg:border-l max-lg:border-line max-lg:shadow-pop",
            "max-lg:transition-transform max-lg:duration-300 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)]",
            picoOpen
              ? "max-lg:translate-x-0"
              : "max-lg:pointer-events-none max-lg:translate-x-full",
            // lg+: collapsible dock beside the workspace, conversation preserved.
            "lg:sticky lg:top-[132px] lg:h-[calc(100dvh-156px)] lg:shrink-0 lg:overflow-hidden lg:border-l lg:border-line",
            "lg:transition-[width] lg:duration-300 lg:ease-out",
            picoOpen ? "lg:w-[360px] xl:w-[380px]" : "lg:w-0 lg:border-transparent",
          )}
        >
          <PicoChat
            context={picoContext}
            open={picoOpen}
            onClose={() => setPicoOpen(false)}
            focusSignal={picoFocus}
          />
        </aside>
      </div>

      {/* Focused visualization overlay (expand / sub-xl lab) */}
      <VizFocusRoot
        open={focusOpen}
        blocks={parsed}
        initialIndex={focusIndex}
        onClose={() => setFocusOpen(false)}
      />
    </div>
  );
}
