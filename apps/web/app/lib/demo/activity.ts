import { dateKey } from "@/app/lib/utils";
import type { ActivityEvent, NotificationItem } from "./types";

/* Deterministic activity seed so the heatmap is stable across renders. */

function seededIntensity(index: number): number {
  const x = Math.sin(index * 12.9898 + 4.1414) * 43758.5453;
  const frac = x - Math.floor(x);
  if (frac > 0.82) return 3;
  if (frac > 0.6) return 2;
  if (frac > 0.35) return 1;
  return 0;
}

export type HeatmapDay = { date: string; intensity: number; isFuture: boolean };

export function buildHeatmap(weeks = 16, extraCounts?: Record<string, number>): HeatmapDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // End the grid on today's week (Sunday start).
  const end = new Date(today);
  const dayOfWeek = end.getDay();
  end.setDate(end.getDate() + (6 - dayOfWeek));

  const days: HeatmapDay[] = [];
  const totalDays = weeks * 7;
  const start = new Date(end);
  start.setDate(start.getDate() - (totalDays - 1));

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = dateKey(date);
    const isFuture = date.getTime() > today.getTime();
    const baseline = isFuture ? 0 : seededIntensity(i + date.getDate());
    const extra = extraCounts?.[key] ?? 0;
    days.push({
      date: key,
      intensity: Math.min(3, baseline + extra),
      isFuture,
    });
  }

  return days;
}

export const DEMO_ACTIVITY_FEED: ActivityEvent[] = [
  {
    id: "act-1",
    kind: "lesson",
    title: "Completed “Maps”",
    detail: "Collections module",
    at: "Today · 09:24",
    xp: 60,
  },
  {
    id: "act-2",
    kind: "problem",
    title: "Solved “Word Frequency Counter”",
    detail: "Easy · Maps",
    at: "Today · 08:50",
    xp: 50,
  },
  {
    id: "act-3",
    kind: "achievement",
    title: "Earned “First Blood”",
    detail: "First challenge solved",
    at: "Yesterday · 19:12",
    xp: 25,
  },
  {
    id: "act-4",
    kind: "lesson",
    title: "Completed “Slices: the everyday sequence”",
    detail: "Collections module",
    at: "Yesterday · 18:40",
    xp: 70,
  },
  {
    id: "act-5",
    kind: "problem",
    title: "Solved “Valid Anagram”",
    detail: "Easy · Strings",
    at: "2 days ago",
    xp: 50,
  },
  {
    id: "act-6",
    kind: "lesson",
    title: "Started “Goroutines and Channels”",
    detail: "Unlocked module 10",
    at: "3 days ago",
    xp: 0,
  },
];

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-1",
    title: "Ada accepted your friend request",
    detail: "You can now compare leaderboards.",
    at: "10m ago",
    unread: true,
  },
  {
    id: "n-2",
    title: "Daily quest is waiting",
    detail: "Complete 2 lessons to keep your 7-day streak.",
    at: "1h ago",
    unread: true,
  },
  {
    id: "n-3",
    title: "New problem set: Concurrency",
    detail: "Three new practice problems unlocked.",
    at: "yesterday",
    unread: false,
  },
];

export const DAILY_QUEST = {
  id: "quest-daily",
  title: "Complete 2 lessons or 1 challenge",
  detail: "Finish either two ready lessons or one practice problem today.",
  xpReward: 100,
};
