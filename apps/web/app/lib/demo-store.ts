"use client";

import { create } from "zustand";
import {
  CURRENT_USER,
  FRIENDS,
  MARKETPLACE_ITEMS,
  MODULES,
  PROBLEMS,
  type FriendStatus,
} from "./demo-data";

/**
 * Session-scoped demo state.
 *
 * This store powers interactive UI behavior (lesson completion, purchases,
 * friend requests, preferences) WITHOUT a backend. Nothing here is
 * persisted or synced — it resets on reload. Real accounts must go
 * through the API layer.
 */

export type AccentPreset = "graphite" | "go" | "indigo" | "emerald" | "amber" | "rose";

export type PracticeDestination = "gocraft" | "leetcode" | "each-time";

export type ProfileState = {
  name: string;
  handle: string;
  bio: string;
  /** Tailwind background class for the initials avatar (no image upload exists). */
  avatarColor: string;
};

export type XpTransaction = {
  id: string;
  kind: "sent";
  amount: number;
  recipientName: string;
  recipientHandle: string;
  reference: string;
  timestamp: number;
  message?: string;
};

export type SettingsState = {
  emailMarketing: boolean;
  pushQuests: boolean;
  pushFriends: boolean;
  pushStreak: boolean;
  profileVisibility: "everyone" | "friends" | "private";
  activityVisible: boolean;
  showInLeaderboard: boolean;
  dailyGoal: number;
  lessonAutoplay: boolean;
  checkpointAutoAdvance: boolean;
  accent: AccentPreset;
  dsaReminderEnabled: boolean;
  dsaReminderTime: string;
  dsaReminderDays: string[];
  emailDailyEnabled: boolean;
  emailDsaEnabled: boolean;
  emailTime: string;
  practiceDestination: PracticeDestination;
};

export type SendXpResult =
  | { ok: true; transaction: XpTransaction; newBalance: number }
  | { ok: false; error: string };

export const XP_TRANSFER_MIN = 10;
export const XP_TRANSFER_MAX = 500;

export type PurchaseResult = "ok" | "insufficient" | "owned";

type DemoState = {
  xp: number;
  profile: ProfileState;
  xpTransactions: XpTransaction[];
  solvedProblemIds: Set<string>;
  completedLessonIds: Set<string>;
  ownedItemIds: Set<string>;
  friendStatuses: Record<string, FriendStatus>;
  notificationsRead: boolean;
  settings: SettingsState;
  completeLesson: (lessonId: string, xp: number) => void;
  solveProblem: (problemId: string, xp: number) => void;
  purchaseItem: (itemId: string, price: number) => PurchaseResult;
  acceptFriend: (friendId: string) => void;
  declineRequest: (friendId: string) => void;
  sendRequest: (friendId: string) => void;
  updateProfile: (patch: Partial<ProfileState>) => void;
  sendXp: (args: {
    recipientId: string;
    recipientName: string;
    recipientHandle: string;
    amount: number;
    message?: string;
  }) => SendXpResult;
  markNotificationsRead: () => void;
  updateSettings: (patch: Partial<SettingsState>) => void;
};

const seededLessons = new Set(
  MODULES.flatMap((m) => m.lessons)
    .filter((l) => l.status === "completed")
    .map((l) => l.id),
);

const seededProblems = new Set(PROBLEMS.filter((p) => p.solved).map((p) => p.id));

const seededOwnedItems = new Set(
  MARKETPLACE_ITEMS.filter((item) => item.owned).map((item) => item.id),
);

const seededFriendStatuses: Record<string, FriendStatus> = Object.fromEntries(
  FRIENDS.map((friend) => [friend.id, friend.status]),
);

const initialSettings: SettingsState = {
  emailMarketing: false,
  pushQuests: true,
  pushFriends: true,
  pushStreak: true,
  profileVisibility: "everyone",
  activityVisible: true,
  showInLeaderboard: true,
  dailyGoal: 3,
  lessonAutoplay: false,
  checkpointAutoAdvance: false,
  accent: "graphite",
  dsaReminderEnabled: false,
  dsaReminderTime: "19:00",
  dsaReminderDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  emailDailyEnabled: false,
  emailDsaEnabled: false,
  emailTime: "09:00",
  practiceDestination: "each-time",
};

const initialProfile: ProfileState = {
  name: CURRENT_USER.name,
  handle: CURRENT_USER.handle,
  bio: "Learning Go by building real things.",
  avatarColor: "bg-slate-900",
};

function makeReference(): string {
  return `GC-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  xp: CURRENT_USER.xp,
  profile: initialProfile,
  xpTransactions: [],
  solvedProblemIds: seededProblems,
  completedLessonIds: seededLessons,
  ownedItemIds: seededOwnedItems,
  friendStatuses: seededFriendStatuses,
  notificationsRead: false,
  settings: initialSettings,

  completeLesson: (lessonId, xp) =>
    set((state) => {
      if (state.completedLessonIds.has(lessonId)) return state;
      const next = new Set(state.completedLessonIds);
      next.add(lessonId);
      return { completedLessonIds: next, xp: state.xp + xp };
    }),

  solveProblem: (problemId, xp) =>
    set((state) => {
      if (state.solvedProblemIds.has(problemId)) return state;
      const next = new Set(state.solvedProblemIds);
      next.add(problemId);
      return { solvedProblemIds: next, xp: state.xp + xp };
    }),

  purchaseItem: (itemId, price) => {
    const state = useDemoStore.getState();
    if (state.ownedItemIds.has(itemId)) return "owned";
    if (state.xp < price) return "insufficient";
    const next = new Set(state.ownedItemIds);
    next.add(itemId);
    set({ ownedItemIds: next, xp: state.xp - price });
    return "ok";
  },

  acceptFriend: (friendId) =>
    set((state) => ({
      friendStatuses: { ...state.friendStatuses, [friendId]: "friend" },
    })),

  declineRequest: (friendId) =>
    set((state) => ({
      friendStatuses: { ...state.friendStatuses, [friendId]: "none" },
    })),

  sendRequest: (friendId) =>
    set((state) => ({
      friendStatuses: { ...state.friendStatuses, [friendId]: "sent" },
    })),

  updateProfile: (patch) =>
    set((state) => ({ profile: { ...state.profile, ...patch } })),

  sendXp: ({ recipientId, recipientName, recipientHandle, amount, message }) => {
    const state = get();

    if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
      return { ok: false, error: "Enter a whole number of XP." };
    }
    if (amount < XP_TRANSFER_MIN) {
      return { ok: false, error: `Minimum transfer is ${XP_TRANSFER_MIN} XP.` };
    }
    if (amount > XP_TRANSFER_MAX) {
      return { ok: false, error: `Maximum transfer is ${XP_TRANSFER_MAX} XP.` };
    }
    if (recipientId === "you") {
      return { ok: false, error: "You can't send XP to yourself." };
    }
    if (amount > state.xp) {
      return { ok: false, error: "Not enough XP for this transfer." };
    }

    const transaction: XpTransaction = {
      id: `tx_${Date.now().toString(36)}`,
      kind: "sent",
      amount,
      recipientName,
      recipientHandle,
      reference: makeReference(),
      timestamp: Date.now(),
      message: message?.trim() ? message.trim() : undefined,
    };

    set({
      xp: state.xp - amount,
      xpTransactions: [transaction, ...state.xpTransactions],
    });

    return { ok: true, transaction, newBalance: state.xp - amount };
  },

  markNotificationsRead: () => set({ notificationsRead: true }),

  updateSettings: (patch) =>
    set((state) => ({ settings: { ...state.settings, ...patch } })),
}));
