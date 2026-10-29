"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { dateKey } from "@/app/lib/utils";

/* ------------------------------------------------------------------ */
/* Local demo state. Persisted to localStorage only. This is NOT       */
/* account data — the API has no XP/progress endpoints yet. Every      */
/* surface that reads this store is labeled as demo in the UI.         */
/* ------------------------------------------------------------------ */

export type LearningSettings = {
  dailyGoalXp: 20 | 50 | 100;
  preferredDifficulty: "Easy" | "Medium" | "Hard" | "Any";
  shuffleByDefault: boolean;
};

export type NotificationSettings = {
  dailyQuestReminder: boolean;
  friendActivity: boolean;
  leaderboardChanges: boolean;
  productNews: boolean;
};

export type PrivacySettings = {
  publicProfile: boolean;
  showActivityStatus: boolean;
  appearOnLeaderboard: boolean;
};

export type ProfileSettings = {
  name: string;
  handle: string;
  bio: string;
  /** Avatar color preset id — resolved to classes in the UI layer. */
  avatarColor: string;
};

type DemoState = {
  xp: number;
  completedLessons: string[];
  solvedProblems: string[];
  ownedItems: string[];
  equippedTheme: string;
  equippedAvatar: string;
  acceptedRequests: string[];
  dismissedRequests: string[];
  todayActivityCount: number;
  activityByDate: Record<string, number>;
  profile: ProfileSettings;
  learning: LearningSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;

  addXp: (amount: number) => void;
  completeLesson: (lessonKey: string, xp: number) => boolean;
  solveProblem: (slug: string, xp: number) => boolean;
  purchaseItem: (itemId: string, price: number) => "ok" | "insufficient" | "owned";
  equipItem: (itemId: string, category: "themes" | "avatars") => void;
  acceptRequest: (id: string) => void;
  dismissRequest: (id: string) => void;
  setProfile: (patch: Partial<ProfileSettings>) => void;
  setLearning: (patch: Partial<LearningSettings>) => void;
  setNotification: (key: keyof NotificationSettings, value: boolean) => void;
  setPrivacy: (key: keyof PrivacySettings, value: boolean) => void;
  markTodayActivity: (amount: number) => void;
};

const STARTER_OWNED = ["theme-graphite", "avatar-basic", "badge-first-blood"];

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      xp: 840,
      completedLessons: [
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
      solvedProblems: [
        "anagram-check",
        "word-frequency",
        "fizzbuzz",
        "unique-characters",
        "bracket-match",
        "shuffled-deck",
      ],
      ownedItems: [...STARTER_OWNED],
      equippedTheme: "theme-graphite",
      equippedAvatar: "avatar-basic",
      acceptedRequests: [],
      dismissedRequests: [],
      todayActivityCount: 1,
      activityByDate: {},
      profile: {
        name: "Kesha Dev",
        handle: "you",
        bio: "Learning Go by building real things.",
        avatarColor: "ink",
      },
      learning: {
        dailyGoalXp: 50,
        preferredDifficulty: "Any",
        shuffleByDefault: false,
      },
      notifications: {
        dailyQuestReminder: true,
        friendActivity: true,
        leaderboardChanges: true,
        productNews: false,
      },
      privacy: {
        publicProfile: true,
        showActivityStatus: true,
        appearOnLeaderboard: true,
      },

      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),

      completeLesson: (lessonKey, xp) => {
        const state = get();
        if (state.completedLessons.includes(lessonKey)) return false;
        set({
          completedLessons: [...state.completedLessons, lessonKey],
          xp: state.xp + xp,
        });
        get().markTodayActivity(1);
        return true;
      },

      solveProblem: (slug, xp) => {
        const state = get();
        if (state.solvedProblems.includes(slug)) return false;
        set({
          solvedProblems: [...state.solvedProblems, slug],
          xp: state.xp + xp,
        });
        get().markTodayActivity(1);
        return true;
      },

      purchaseItem: (itemId, price) => {
        const state = get();
        if (state.ownedItems.includes(itemId)) return "owned";
        if (state.xp < price) return "insufficient";
        set({
          ownedItems: [...state.ownedItems, itemId],
          xp: state.xp - price,
        });
        return "ok";
      },

      equipItem: (itemId, category) => {
        if (category === "themes") set({ equippedTheme: itemId });
        else set({ equippedAvatar: itemId });
      },

      acceptRequest: (id) =>
        set((state) => ({
          acceptedRequests: [...state.acceptedRequests, id],
          dismissedRequests: [...state.dismissedRequests, id],
        })),

      dismissRequest: (id) =>
        set((state) => ({
          dismissedRequests: [...state.dismissedRequests, id],
        })),

      setProfile: (patch) =>
        set((state) => ({ profile: { ...state.profile, ...patch } })),

      setLearning: (patch) =>
        set((state) => ({ learning: { ...state.learning, ...patch } })),

      setNotification: (key, value) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: value },
        })),

      setPrivacy: (key, value) =>
        set((state) => ({ privacy: { ...state.privacy, [key]: value } })),

      markTodayActivity: (amount) => {
        const key = dateKey(new Date());
        set((state) => ({
          todayActivityCount: state.todayActivityCount + amount,
          activityByDate: {
            ...state.activityByDate,
            [key]: (state.activityByDate[key] ?? 0) + amount,
          },
        }));
      },
    }),
    {
      name: "gocraft-demo-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        xp: state.xp,
        completedLessons: state.completedLessons,
        solvedProblems: state.solvedProblems,
        ownedItems: state.ownedItems,
        equippedTheme: state.equippedTheme,
        equippedAvatar: state.equippedAvatar,
        acceptedRequests: state.acceptedRequests,
        dismissedRequests: state.dismissedRequests,
        todayActivityCount: state.todayActivityCount,
        activityByDate: state.activityByDate,
        profile: state.profile,
        learning: state.learning,
        notifications: state.notifications,
        privacy: state.privacy,
      }),
      skipHydration: true,
    },
  ),
);

export function lessonKey(moduleId: string, lessonId: string): string {
  return `${moduleId}/${lessonId}`;
}
