"use client";

import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { getLevelInfo } from "../../../lib/levels";
import { useDemoStore as useProgressStore } from "../../../lib/progress-store";
import { useDemoStore as usePersistedStore } from "../../../lib/store/demo";
import { cn, initialsOf } from "../../../lib/utils";
import { AccountSection } from "./account-section";
import { AppearanceSection } from "./appearance-section";
import { EmailSection } from "./email-section";
import { LearningSection } from "./learning-section";
import { ProfileSection } from "./profile-section";
import { RemindersSection } from "./reminders-section";
import { avatarClass } from "./settings-shared";
import { WalletSection } from "./wallet-section";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "learning", label: "Learning" },
  { id: "reminders", label: "Reminders" },
  { id: "appearance", label: "Appearance" },
  { id: "wallet", label: "Wallet" },
  { id: "email", label: "Email" },
  { id: "privacy", label: "Account" },
] as const;

export function SettingsView() {
  const [activeSection, setActiveSection] = useState<string>("profile");

  const profile = usePersistedStore((s) => s.profile);
  const persistedXp = usePersistedStore((s) => s.xp);
  const liveXp = useProgressStore((s) => s.xp);

  // Prefer the live progression balance; fall back to the shell store.
  const xp = liveXp || persistedXp;
  const level = getLevelInfo(xp);

  useEffect(() => {
    const sections = TABS.map((tab) => document.getElementById(tab.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = visible[0]?.target.id;
        if (id) setActiveSection(id);
      },
      { rootMargin: "-150px 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    setActiveSection(id);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <nav
        aria-label="Settings sections"
        className="sticky top-[64px] z-20 border-b border-line bg-canvas/90 backdrop-blur-md"
      >
        <div className="scrollbar-subtle flex overflow-x-auto">
          {TABS.map((tab) => {
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollTo(tab.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring relative shrink-0 whitespace-nowrap px-3.5 py-3 text-[13px] transition-colors first:pl-0",
                  active ? "font-medium text-ink" : "text-ink-3 hover:text-ink",
                )}
              >
                {tab.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent transition-opacity duration-150",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mt-7 space-y-10">
        <div className="flex items-center gap-3.5 rounded-xl border border-line bg-panel px-4 py-3.5 shadow-card">
          <span
            aria-hidden
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
              avatarClass(profile.avatarColor),
            )}
          >
            {initialsOf(profile.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight text-ink">
              {profile.name}
            </p>
            <p className="truncate text-xs text-ink-3">
              @{profile.handle} · Level {level.level} {level.title}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-panel-muted px-2.5 py-1.5 text-xs font-semibold tabular-nums text-ink">
            <Zap size={12} className="text-accent-600" />
            {xp.toLocaleString()}
            <span className="font-normal text-ink-3">XP</span>
          </span>
        </div>

        <ProfileSection />
        <LearningSection />
        <RemindersSection />
        <AppearanceSection />
        <WalletSection />
        <EmailSection />
        <AccountSection />

        <p className="text-center text-[11px] leading-5 text-ink-4">
          GoCraft demo build — preferences live in this browser only. Account,
          reminder delivery, and XP transfer backends are not connected yet.
        </p>
      </div>
    </div>
  );
}
