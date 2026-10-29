"use client";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Lock,
  Play,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Badge, DifficultyBadge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { CURRICULUM } from "../lib/demo/curriculum";
import { PROBLEMS } from "../lib/demo/problems";
import type { CourseModule, Lesson } from "../lib/demo/types";
import { DAILY_QUEST, DEMO_USER, NEXT_UNLOCK } from "../lib/demo/user";
import { useDemoStore as useSessionDemoStore } from "../lib/demo-store";
import { getLevelInfo, type LevelInfo } from "../lib/levels";
import { useDemoStore } from "../lib/progress-store";
import { cn } from "../lib/utils";

type ContinueTarget = {
  module: CourseModule;
  lesson: Lesson;
  href: string;
  completedInModule: number;
  lessonsInModule: number;
} | null;

function useOverviewData() {
  const xp = useDemoStore((s) => s.xp);
  const completedLessons = useDemoStore((s) => s.completedLessonIds);
  const completedProblems = useDemoStore((s) => s.completedProblemIds);
  // The goal is edited in Settings (demo-store); read the same store so the
  // quest target always matches what the user configured there.
  const dailyGoal = useSessionDemoStore((s) => s.settings.dailyGoal);

  const levelInfo = getLevelInfo(xp);

  const totalLessons = CURRICULUM.reduce((n, m) => n + m.lessons.length, 0);

  const continueTarget = useMemo<ContinueTarget>(() => {
    for (const module of CURRICULUM) {
      const completedInModule = module.lessons.filter((l) =>
        completedLessons.includes(`${module.id}/${l.id}`),
      ).length;
      if (completedInModule === module.lessons.length) continue;
      const lesson =
        module.lessons.find(
          (l) => !completedLessons.includes(`${module.id}/${l.id}`),
        ) ?? module.lessons[0];
      if (lesson) {
        return {
          module,
          lesson,
          href: `/dashboard/learn/${module.id}/${lesson.id}`,
          completedInModule,
          lessonsInModule: module.lessons.length,
        };
      }
    }
    return null;
  }, [completedLessons]);

  const recommended = useMemo(() => {
    const open = PROBLEMS.filter((p) => !completedProblems.includes(p.slug));
    const focus = open.filter((p) =>
      p.tags.some((t) => t.includes("slice") || t.includes("map")),
    );
    return [...focus, ...open.filter((p) => !focus.includes(p))]
      .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i)
      .slice(0, 3);
  }, [completedProblems]);

  return {
    xp,
    levelInfo,
    totalLessons,
    completedLessonCount: completedLessons.length,
    completedProblemCount: completedProblems.length,
    continueTarget,
    recommended,
    dailyGoal,
  };
}

function PageHeader({ nextLevelTitle }: { nextLevelTitle: string | null }) {
  const hour = new Date().getHours();
  const part =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Overview
        </p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight sm:text-[32px]">
          {part}, {DEMO_USER.name}.
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-ink-muted">
          {nextLevelTitle
            ? `One focused session today moves you closer to ${nextLevelTitle}.`
            : "You have reached the top rank. Keep the reps coming."}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/dashboard/problems"
          className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-edge bg-panel px-4 text-sm font-medium text-ink transition-colors hover:border-edge-strong hover:bg-panel-muted"
        >
          Browse problems
        </Link>
        <Link
          href="/dashboard/learn"
          className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-ink/90"
        >
          Open curriculum
          <ArrowRight size={15} />
        </Link>
      </div>
    </header>
  );
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="px-5 py-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
          {label}
        </p>
        <p className="mt-2.5 text-[26px] font-semibold leading-none tracking-tight tabular-nums">
          {value}
        </p>
        <p className="mt-2.5 text-[12px] leading-4 text-ink-muted">{note}</p>
      </CardContent>
    </Card>
  );
}

function DailyQuest({
  progress,
  target,
}: {
  progress: number;
  target: number;
}) {
  const complete = progress >= target;

  return (
    <Card className="shadow-card">
      <div className="border-b border-edge bg-panel-muted/50 px-5 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass size={15} className="text-accent" />
            <p className="text-[13px] font-semibold">Daily quest</p>
          </div>
          <Badge tone={complete ? "success" : "accent"}>
            {complete ? "Completed" : `+${DAILY_QUEST.xpReward} XP`}
          </Badge>
        </div>
      </div>

      <CardContent className="px-5 py-5">
        <h2 className="text-[15px] font-semibold tracking-tight">
          {DAILY_QUEST.title}
        </h2>
        <p className="mt-1 text-[13px] leading-5 text-ink-muted">
          {DAILY_QUEST.detail}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-1.5">
          {Array.from({ length: target }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex h-8 items-center justify-center gap-1.5 rounded-md border text-[11px] font-medium",
                i < progress
                  ? "border-accent/30 bg-accent-soft text-accent-strong"
                  : "border-edge bg-panel text-ink-faint",
              )}
            >
              {i < progress ? (
                <Check size={12} />
              ) : (
                <Clock size={12} />
              )}
              <span>Problem {i + 1}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-edge pt-4">
          <p className="text-[12px] text-ink-muted">
            <span className="font-semibold tabular-nums text-ink">
              {Math.min(progress, target)}/{target}
            </span>{" "}
            done today
          </p>
          <Link
            href="/dashboard/problems?difficulty=easy"
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-ink px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-ink/90"
          >
            {complete ? "Practice more" : "Continue quest"}
            <ArrowRight size={14} />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function LevelCard({ levelInfo }: { levelInfo: LevelInfo }) {
  const next = levelInfo.nextLevel;
  const remaining = levelInfo.xpForLevel - levelInfo.xpIntoLevel;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div>
          <CardTitle>Level progress</CardTitle>
          <p className="mt-1 text-xs text-ink-muted">
            Level {levelInfo.level} · {levelInfo.title}
          </p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent-border bg-accent-soft text-accent-strong">
          <Trophy size={16} strokeWidth={1.8} />
        </div>
      </CardHeader>
      <CardContent className="px-5 py-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[28px] font-semibold leading-none tracking-tight tabular-nums">
            {Math.round(levelInfo.progress * 100)}%
          </p>
          <p className="text-[12px] tabular-nums text-ink-muted">
            {levelInfo.xpIntoLevel.toLocaleString()} /{" "}
            {levelInfo.xpForLevel.toLocaleString()} XP
          </p>
        </div>
        <Progress
          value={levelInfo.progress * 100}
          className="mt-3.5"
          ariaLabel="Level progress"
        />
        <p className="mt-2 text-[11px] text-ink-faint">
          {next
            ? `${remaining.toLocaleString()} XP to ${next.title}`
            : "Top rank reached"}
        </p>

        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-edge bg-panel-muted/60 px-3 py-2.5">
          <Lock size={13} className="mt-0.5 shrink-0 text-ink-faint" />
          <div>
            <p className="text-[11px] text-ink-muted">Next unlock</p>
            <p className="mt-0.5 text-[13px] font-medium">
              {NEXT_UNLOCK.label}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-faint">
              Reach level {NEXT_UNLOCK.level}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContinueCard({ target }: { target: ContinueTarget }) {
  if (!target) {
    return (
      <Card className="shadow-card">
        <CardContent className="px-5 py-6 text-center">
          <CheckCircle2 size={22} className="mx-auto text-easy" />
          <p className="mt-3 text-sm font-semibold">Curriculum complete</p>
          <p className="mt-1 text-xs text-ink-muted">
            Every published lesson is done. More modules are on the way.
          </p>
          <Link
            href="/dashboard/problems"
            className="focus-ring mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-edge px-3.5 text-[13px] font-medium transition-colors hover:bg-panel-muted"
          >
            Practice problems <ArrowRight size={14} />
          </Link>
        </CardContent>
      </Card>
    );
  }

  const modulePct = Math.round(
    (target.completedInModule / target.lessonsInModule) * 100,
  );

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div>
          <CardTitle>Continue learning</CardTitle>
          <p className="mt-1 text-xs text-ink-muted">
            Pick up exactly where you left off.
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-edge bg-panel-muted px-2 py-1 text-[11px] font-medium tabular-nums text-ink-muted">
          {target.completedInModule}/{target.lessonsInModule} in module
        </span>
      </CardHeader>
      <CardContent className="px-5 py-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
          {target.module.title}
        </p>
        <h3 className="mt-1.5 text-xl font-semibold tracking-tight">
          {target.lesson.title}
        </h3>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-ink-muted">
          {target.lesson.summary}
        </p>

        <div className="mt-3.5 flex flex-wrap gap-2 text-[11px] text-ink-muted">
          <span className="rounded-md border border-edge px-2 py-1">
            <Clock size={11} className="mr-1 inline align-[-2px]" />
            {target.lesson.minutes} min
          </span>
          <span className="rounded-md border border-edge px-2 py-1">
            <Zap size={11} className="mr-1 inline align-[-2px] text-accent" />+
            {target.lesson.xp} XP
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>Module progress</span>
            <span className="tabular-nums">{modulePct}%</span>
          </div>
          <Progress
            value={modulePct}
            className="mt-2"
            ariaLabel="Module progress"
          />
        </div>

        <Link
          href={target.href}
          className="focus-ring mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-ink/90"
        >
          <Play size={14} />
          Resume lesson
        </Link>
      </CardContent>
    </Card>
  );
}

function RecommendedCard({
  problems,
}: {
  problems: (typeof PROBLEMS)[number][];
}) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div>
          <CardTitle>Recommended challenges</CardTitle>
          <p className="mt-1 text-xs text-ink-muted">
            Matched to your current focus: maps and slices.
          </p>
        </div>
        <Link
          href="/dashboard/problems"
          className="focus-ring shrink-0 rounded text-[12px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          View all
        </Link>
      </CardHeader>

      {problems.length === 0 ? (
        <CardContent className="px-5 py-8 text-center text-sm text-ink-muted">
          You have solved every available problem. New sets arrive weekly.
        </CardContent>
      ) : (
        <ul className="divide-y divide-edge">
          {problems.map((problem) => (
            <li key={problem.slug}>
              <Link
                href={`/dashboard/problems/${problem.slug}`}
                className="focus-ring group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-panel-muted/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium group-hover:text-ink">
                    {problem.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                    {problem.topics[0] ?? "Go"} · {problem.estMinutes} min · +
                    {problem.xp} XP
                  </p>
                </div>
                <DifficultyBadge difficulty={problem.difficulty} />
                <ChevronRight
                  size={15}
                  className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function OverviewPage() {
  const {
    xp,
    levelInfo,
    totalLessons,
    completedLessonCount,
    completedProblemCount,
    continueTarget,
    recommended,
    dailyGoal,
  } = useOverviewData();

  const lessonPct =
    totalLessons > 0 ? Math.round((completedLessonCount / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader nextLevelTitle={levelInfo.nextLevel?.title ?? null} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total XP"
          value={xp.toLocaleString()}
          note="All-time earned"
        />
        <StatCard
          label="Level"
          value={String(levelInfo.level)}
          note={
            levelInfo.nextLevel
              ? `${levelInfo.title} · ${Math.round(levelInfo.progress * 100)}% to ${levelInfo.nextLevel.title}`
              : `${levelInfo.title} · top rank`
          }
        />
        <StatCard
          label="Lessons"
          value={`${completedLessonCount}/${totalLessons}`}
          note={`${lessonPct}% of the curriculum`}
        />
        <StatCard
          label="Problems solved"
          value={String(completedProblemCount)}
          note={`of ${PROBLEMS.length} published`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <ContinueCard target={continueTarget} />
          <RecommendedCard problems={recommended} />
        </div>

        <div className="space-y-6">
          <DailyQuest
            progress={Math.min(DEMO_USER.weeklyGoalCompleted, dailyGoal)}
            target={dailyGoal}
          />
          <LevelCard levelInfo={levelInfo} />
        </div>
      </div>

      <p className="pt-2 text-center text-[11px] text-ink-faint">
        Sample workspace · progress persists in this browser only · no account
        or backend connected
      </p>
    </div>
  );
}
