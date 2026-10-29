"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_USER } from "./demo/user";
import { DEMO_FRIEND_HANDLES, DEMO_REQUESTS } from "./demo/social";
import { MARKET_ITEMS } from "./demo/marketplace";

/**
 * Demo progress store.
 *
 * Everything here is browser-local sample state so the UI feels coherent.
 * It is intentionally isolated from any backend. When a real API exists,
 * replace the actions with API calls and keep the same shape.
 */
export type AppearanceAccent = "cyan" | "violet" | "emerald";

export const XP_TRANSFER_MIN = 10;
export const XP_TRANSFER_MAX = 500;

export type XpSentTransaction = {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientHandle: string;
  amount: number;
  reference: string;
  timestamp: number;
  message?: string;
};

export type SendXpResult =
  | { ok: true; transaction: XpSentTransaction; newBalance: number }
  | { ok: false; error: string };

type DemoState = {
  xp: number;
  completedLessonIds: string[];
  completedProblemIds: string[];
  purchasedItemIds: string[];
  friendIds: string[];
  pendingRequestIds: string[];
  answeredQuizIds: string[];
  xpTransactions: XpSentTransaction[];
  name: string;
  headline: string;
  dailyGoal: number;
  reminderEnabled: boolean;
  streakReminders: boolean;
  friendRequestsEnabled: boolean;
  leaderboardVisible: boolean;
  heatmapVisible: boolean;
  accent: AppearanceAccent;
  lastXpEvent: { id: number; amount: number; label: string } | null;

  addXp: (amount: number, label: string) => void;
  completeLesson: (lessonId: string, xp: number) => void;
  solveProblem: (problemId: string, xp: number) => void;
  markQuizAnswered: (questionId: string) => void;
  purchaseItem: (itemId: string, price: number) => "ok" | "insufficient" | "locked" | "owned";
  sendXp: (args: {
    recipientId: string;
    recipientName: string;
    recipientHandle: string;
    amount: number;
    message?: string;
  }) => SendXpResult;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  updateProfile: (patch: { name?: string; headline?: string }) => void;
  updatePreferences: (patch: Partial<Pick<DemoState, "dailyGoal" | "reminderEnabled" | "streakReminders" | "friendRequestsEnabled" | "leaderboardVisible" | "heatmapVisible" | "accent">>) => void;
  clearLastXpEvent: () => void;
};

function makeTransferReference(): string {
  return `GC-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

function levelFromXp(xp: number) {
  const thresholds = [0, 400, 900, 1600, 2500, 3600, 5000, 6800, 9000, 12000];
  let level = 1;
  thresholds.forEach((t, i) => {
    if (xp >= t) level = i + 1;
  });
  return level;
}

let xpEventId = 0;

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      xp: DEMO_USER.baseXp,
      completedLessonIds: [
        "getting-started/why-go",
        "getting-started/installing-go",
        "getting-started/hello-world",
        "variables/declaring",
        "variables/constants",
        "data-types/strings",
        "control-flow/if-and-switch",
        "control-flow/for-loops",
        "functions/basics",
      ],
      completedProblemIds: [
        "two-sum",
        "word-frequency",
        "merge-intervals",
        "anagram-check",
        "fizzbuzz",
        "unique-characters",
        "first-unique-rune",
        "rotate-slice",
        "bracket-match",
        "dedupe-interface-slice",
        "validate-inputs",
        "shuffled-deck",
      ],
      purchasedItemIds: MARKET_ITEMS.filter((i) => i.free).map((i) => i.id),
      friendIds: [...DEMO_FRIEND_HANDLES],
      pendingRequestIds: DEMO_REQUESTS.filter((r) => r.direction === "incoming").map(
        (r) => r.id,
      ),
      answeredQuizIds: [],
      xpTransactions: [],
      name: DEMO_USER.fullName,
      headline: DEMO_USER.headline,
      dailyGoal: 2,
      reminderEnabled: true,
      streakReminders: true,
      friendRequestsEnabled: true,
      leaderboardVisible: true,
      heatmapVisible: true,
      accent: "cyan",
      lastXpEvent: null,

      addXp: (amount, label) =>
        set((state) => ({
          xp: state.xp + amount,
          lastXpEvent: { id: ++xpEventId, amount, label },
        })),

      completeLesson: (lessonId, xp) =>
        set((state) => {
          if (state.completedLessonIds.includes(lessonId)) return state;
          return {
            completedLessonIds: [...state.completedLessonIds, lessonId],
            xp: state.xp + xp,
            lastXpEvent: { id: ++xpEventId, amount: xp, label: "Lesson complete" },
          };
        }),

      solveProblem: (problemId, xp) =>
        set((state) => {
          if (state.completedProblemIds.includes(problemId)) return state;
          return {
            completedProblemIds: [...state.completedProblemIds, problemId],
            xp: state.xp + xp,
            lastXpEvent: { id: ++xpEventId, amount: xp, label: "Problem solved" },
          };
        }),

      markQuizAnswered: (questionId) =>
        set((state) =>
          state.answeredQuizIds.includes(questionId)
            ? state
            : { answeredQuizIds: [...state.answeredQuizIds, questionId] },
        ),

      purchaseItem: (itemId, price) => {
        const state = get();
        if (state.purchasedItemIds.includes(itemId)) return "owned";
        const item = MARKET_ITEMS.find((i) => i.id === itemId);
        if (!item) return "owned";
        if (state.xp < price) return "insufficient";
        set({
          purchasedItemIds: [...state.purchasedItemIds, itemId],
          xp: state.xp - price,
          lastXpEvent: { id: ++xpEventId, amount: -price, label: `Bought ${item.name}` },
        });
        return "ok";
      },

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
        if (recipientId === "you" || recipientHandle.replace(/^@/, "") === "you") {
          return { ok: false, error: "You can't send XP to yourself." };
        }
        if (!recipientId) {
          return { ok: false, error: "Choose a recipient." };
        }
        if (amount > state.xp) {
          return { ok: false, error: "Not enough XP for this transfer." };
        }

        const transaction: XpSentTransaction = {
          id: `tx_${Date.now().toString(36)}`,
          recipientId,
          recipientName,
          recipientHandle,
          amount,
          reference: makeTransferReference(),
          timestamp: Date.now(),
          message: message?.trim() ? message.trim() : undefined,
        };

        set({
          xp: state.xp - amount,
          xpTransactions: [transaction, ...state.xpTransactions],
        });

        return { ok: true, transaction, newBalance: state.xp - amount };
      },

      acceptFriendRequest: (requestId) =>
        set((state) => {
          const request = DEMO_REQUESTS.find((r) => r.id === requestId);
          const friendHandle = request?.handle;
          return {
            pendingRequestIds:
              request?.direction === "incoming"
                ? state.pendingRequestIds.filter((id) => id !== requestId)
                : state.pendingRequestIds,
            friendIds:
              friendHandle && !state.friendIds.includes(friendHandle)
                ? [...state.friendIds, friendHandle]
                : state.friendIds,
          };
        }),

      declineFriendRequest: (requestId) =>
        set((state) => ({
          pendingRequestIds: state.pendingRequestIds.filter((id) => id !== requestId),
        })),

      updateProfile: (patch) => set((state) => ({ ...state, ...patch })),

      updatePreferences: (patch) => set((state) => ({ ...state, ...patch })),

      clearLastXpEvent: () => set({ lastXpEvent: null }),
    }),
    {
      name: "gocraft-demo-progress",
      version: 1,
    },
  ),
);
