import type { ActorActivity } from "./types";

export const DEMO_USER = {
  name: "Kesha",
  fullName: "Kesha Verma",
  handle: "@kesha",
  initials: "K",
  headline: "Learning Go · Building daily",
  joinedLabel: "Learning since September 2026",
  baseXp: 840,
  streakDays: 7,
  longestStreak: 12,
  weeklyGoalCompleted: 3,
  weeklyGoalTarget: 5,
  problemsSolved: 12,
  lessonsCompleted: 9,
  focusTopic: "Maps & Slices",
} as const;

export const STREAK_CONTEXT = {
  todayDone: false,
  message: "Solve one problem or finish one lesson to keep your 7-day streak alive.",
  week: [
    { day: "M", done: true },
    { day: "T", done: true },
    { day: "W", done: true },
    { day: "T", done: true },
    { day: "F", done: true },
    { day: "S", done: true },
    { day: "S", done: true },
  ],
} as const;

/**
 * Deterministic demo heatmap: 26 weeks of activity intensity (0–4).
 * Generated with a seeded formula so it stays stable between renders.
 */
export function buildHeatmapWeeks(): number[][] {
  const weeks: number[][] = [];
  for (let w = 0; w < 26; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      const seed = (w * 7 + d) % 11;
      const recentBoost = w > 20 ? 3 : w > 15 ? 1 : 0;
      const weekendDip = d >= 5 ? -1 : 0;
      const value = (seed % 4) + recentBoost + weekendDip;
      week.push(Math.max(0, Math.min(4, value)));
    }
    weeks.push(week);
  }
  return weeks;
}

export const HEATMAP_MONTH_LABELS = [
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
] as const;

export const RECENT_ACTIVITY: ActorActivity[] = [
  {
    id: "a1",
    actorName: "You",
    initials: "K",
    color: "bg-slate-900",
    action: "Solved",
    target: "Two Sum",
    href: "/dashboard/problems/two-sum",
    time: "2h ago",
    xp: 120,
  },
  {
    id: "a2",
    actorName: "You",
    initials: "K",
    color: "bg-slate-900",
    action: "Completed lesson",
    target: "Slices deep dive",
    href: "/dashboard/learn/data-types/slices-deep-dive",
    time: "Yesterday",
    xp: 80,
  },
  {
    id: "a3",
    actorName: "You",
    initials: "K",
    color: "bg-slate-900",
    action: "Earned badge",
    target: "Seven-day streak",
    href: "/dashboard/marketplace/inventory",
    time: "Yesterday",
  },
  {
    id: "a4",
    actorName: "You",
    initials: "K",
    color: "bg-slate-900",
    action: "Solved",
    target: "Word Frequency",
    href: "/dashboard/problems/word-frequency",
    time: "2 days ago",
    xp: 100,
  },
  {
    id: "a5",
    actorName: "You",
    initials: "K",
    color: "bg-slate-900",
    action: "Completed lesson",
    target: "Constants and zero values",
    href: "/dashboard/learn/variables-constants/constants-and-zero-values",
    time: "3 days ago",
    xp: 60,
  },
];

export const DAILY_QUEST = {
  title: "Solve two Easy problems",
  detail: "Reps build reflexes. Two easy problems keep your foundation sharp.",
  progress: 1,
  target: 2,
  xpReward: 150,
  href: "/dashboard/problems?difficulty=easy&focus=daily",
} as const;

export const NEXT_UNLOCK = {
  label: "Sticker pack: Gopher Crew",
  level: 4,
} as const;
