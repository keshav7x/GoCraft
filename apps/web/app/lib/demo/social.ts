import type { DemoUser, FriendActivity, FriendRequest } from "./types";

/* Demo social graph — clearly sample data, not real accounts. */

export const DEMO_USERS: DemoUser[] = [
  {
    handle: "you",
    name: "Kesha Dev",
    bio: "Learning Go by building real things. Currently deep in concurrency.",
    avatarTone: "slate",
    level: 3,
    xp: 840,
    streakDays: 7,
    solved: 12,
    lessonsDone: 9,
    online: true,
    lastActive: "now",
    isSelf: true,
  },
  {
    handle: "ada",
    name: "Ada Lovelace",
    bio: "Compiler enthusiast. Teaches Go by day, writes CLIs by night.",
    avatarTone: "indigo",
    level: 6,
    xp: 3120,
    streakDays: 21,
    solved: 48,
    lessonsDone: 40,
    online: true,
    lastActive: "5m ago",
  },
  {
    handle: "gopher-max",
    name: "Max Chen",
    bio: "SRE turning chaos into goroutines.",
    avatarTone: "emerald",
    level: 5,
    xp: 2480,
    streakDays: 14,
    solved: 37,
    lessonsDone: 33,
    online: false,
    lastActive: "1h ago",
  },
  {
    handle: "rin",
    name: "Rin Takahashi",
    bio: "Backend engineer. Fan of table-driven tests and tiny interfaces.",
    avatarTone: "rose",
    level: 5,
    xp: 2210,
    streakDays: 9,
    solved: 31,
    lessonsDone: 29,
    online: true,
    lastActive: "now",
  },
  {
    handle: "samir",
    name: "Samir Patel",
    bio: "From JavaScript to Go — one channel at a time.",
    avatarTone: "amber",
    level: 3,
    xp: 1150,
    streakDays: 4,
    solved: 15,
    lessonsDone: 14,
    online: false,
    lastActive: "3h ago",
  },
  {
    handle: "nova",
    name: "Nova Okonkwo",
    bio: "Distributed systems student. Currently obsessed with context.Context.",
    avatarTone: "violet",
    level: 4,
    xp: 1760,
    streakDays: 11,
    solved: 24,
    lessonsDone: 22,
    online: false,
    lastActive: "yesterday",
  },
  {
    handle: "theo",
    name: "Theo Marchetti",
    bio: "Writes network services in Go. Maintains a few small open-source tools.",
    avatarTone: "sky",
    level: 7,
    xp: 4050,
    streakDays: 30,
    solved: 61,
    lessonsDone: 48,
    online: false,
    lastActive: "2d ago",
  },
  {
    handle: "lina",
    name: "Lina Berg",
    bio: "Learning concurrency patterns and refusing to use sleep() in tests.",
    avatarTone: "teal",
    level: 4,
    xp: 1590,
    streakDays: 6,
    solved: 21,
    lessonsDone: 20,
    online: true,
    lastActive: "now",
  },
  {
    handle: "ozzy",
    name: "Ozzy Nguyen",
    bio: "Platform engineer. Believes every service deserves a /healthz.",
    avatarTone: "slate",
    level: 5,
    xp: 2650,
    streakDays: 16,
    solved: 40,
    lessonsDone: 35,
    online: false,
    lastActive: "8h ago",
  },
];

export const DEMO_FRIEND_HANDLES = [
  "ada",
  "gopher-max",
  "rin",
  "samir",
  "nova",
  "lina",
];

export const DEMO_REQUESTS: FriendRequest[] = [
  { id: "req-1", handle: "theo", direction: "incoming", sentAt: "2h ago" },
  { id: "req-2", handle: "ozzy", direction: "incoming", sentAt: "1d ago" },
  { id: "req-3", handle: "ada", direction: "outgoing", sentAt: "pending" },
];

export const DEMO_ACTIVITY: FriendActivity[] = [
  {
    id: "fa-1",
    handle: "ada",
    action: "Solved “Token Bucket Rate Limiter”",
    detail: "Concurrency path",
    at: "12m ago",
    xp: 100,
  },
  {
    id: "fa-2",
    handle: "rin",
    action: "Completed “Interfaces — Implicit satisfaction”",
    detail: "Interfaces module",
    at: "1h ago",
    xp: 70,
  },
  {
    id: "fa-3",
    handle: "lina",
    action: "Hit a 6-day streak",
    detail: "Consistency badge progress",
    at: "3h ago",
  },
  {
    id: "fa-4",
    handle: "gopher-max",
    action: "Reached Level 5",
    detail: "Journeyman",
    at: "5h ago",
  },
  {
    id: "fa-5",
    handle: "samir",
    action: "Solved “Valid Anagram”",
    detail: "Strings practice",
    at: "yesterday",
    xp: 50,
  },
  {
    id: "fa-6",
    handle: "nova",
    action: "Started “Goroutines and Channels”",
    detail: "New module unlocked",
    at: "yesterday",
  },
];

export function getUser(handle: string): DemoUser | undefined {
  return DEMO_USERS.find((user) => user.handle === handle);
}

export type LeaderboardRow = {
  rank: number;
  name: string;
  initials: string;
  color: string;
  xp: number;
  streak: number;
  isYou?: boolean;
};

export type SocialActivity = {
  id: string;
  actorName: string;
  initials: string;
  color: string;
  action: string;
  target: string;
  href: string;
  time: string;
};

export const LEADERBOARD: LeaderboardRow[] = [
  { rank: 1, name: "Theo Marchetti", initials: "TM", color: "bg-sky-600", xp: 4050, streak: 30 },
  { rank: 2, name: "Ada Lovelace", initials: "AL", color: "bg-indigo-600", xp: 3120, streak: 21 },
  { rank: 3, name: "Ozzy Nguyen", initials: "ON", color: "bg-slate-600", xp: 2650, streak: 16 },
  { rank: 4, name: "Max Chen", initials: "MC", color: "bg-emerald-600", xp: 2480, streak: 14 },
  { rank: 5, name: "Rin Takahashi", initials: "RT", color: "bg-rose-600", xp: 2210, streak: 9 },
  { rank: 6, name: "You", initials: "K", color: "bg-ink", xp: 840, streak: 7, isYou: true },
];

export const FRIEND_ACTIVITY: SocialActivity[] = [
  {
    id: "sa-1",
    actorName: "Ada Lovelace",
    initials: "AL",
    color: "bg-indigo-600",
    action: "solved",
    target: "Token Bucket Rate Limiter",
    href: "/dashboard/problems/rate-limiter",
    time: "12m ago",
  },
  {
    id: "sa-2",
    actorName: "Rin Takahashi",
    initials: "RT",
    color: "bg-rose-600",
    action: "completed",
    target: "Interfaces — Implicit satisfaction",
    href: "/dashboard/learn/interfaces/interface-basics",
    time: "1h ago",
  },
  {
    id: "sa-3",
    actorName: "Lina Berg",
    initials: "LB",
    color: "bg-teal-600",
    action: "hit a",
    target: "6-day streak",
    href: "/dashboard/friends/lina",
    time: "3h ago",
  },
  {
    id: "sa-4",
    actorName: "Max Chen",
    initials: "MC",
    color: "bg-emerald-600",
    action: "reached",
    target: "Level 5",
    href: "/dashboard/friends/gopher-max",
    time: "5h ago",
  },
  {
    id: "sa-5",
    actorName: "Samir Patel",
    initials: "SP",
    color: "bg-amber-600",
    action: "solved",
    target: "Valid Anagram",
    href: "/dashboard/problems/anagram-check",
    time: "yesterday",
  },
  {
    id: "sa-6",
    actorName: "Nova Okonkwo",
    initials: "NO",
    color: "bg-violet-600",
    action: "started",
    target: "Goroutines and Channels",
    href: "/dashboard/learn/goroutines/channels",
    time: "yesterday",
  },
];
