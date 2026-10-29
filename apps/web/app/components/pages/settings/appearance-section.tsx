"use client";

import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useDemoStore, type AccentPreset } from "../../../lib/demo-store";
import { cn } from "../../../lib/utils";
import { Label } from "../../ui/input";
import { Disclosure, Section } from "./settings-shared";

type ThemeChoice = "light" | "dark" | "system";

const THEME_OPTIONS: {
  value: ThemeChoice;
  label: string;
  detail: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "Light", detail: "Bright, paper-like surfaces.", icon: Sun },
  { value: "dark", label: "Dark", detail: "Low-glare night interface.", icon: Moon },
  { value: "system", label: "System", detail: "Match your OS setting.", icon: Laptop },
];

const ACCENTS: { id: AccentPreset; label: string; swatch: string }[] = [
  { id: "graphite", label: "Graphite", swatch: "#10131a" },
  { id: "go", label: "Go cyan", swatch: "#0d84b6" },
  { id: "indigo", label: "Indigo", swatch: "#4f46e5" },
  { id: "emerald", label: "Emerald", swatch: "#0f7a55" },
  { id: "amber", label: "Amber", swatch: "#b45309" },
  { id: "rose", label: "Rose", swatch: "#be3455" },
];

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const settings = useDemoStore((s) => s.settings);
  const updateSettings = useDemoStore((s) => s.updateSettings);

  // Avoid hydration mismatch — next-themes resolves the stored theme client-side.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", settings.accent);
  }, [settings.accent]);

  const current = (mounted ? theme : "light") as ThemeChoice | undefined;

  return (
    <Section
      id="appearance"
      title="Appearance"
      description="Theme and accent for the whole dashboard. Saved automatically."
    >
      <div className="px-5 py-4">
        <Label id="theme-label">Theme</Label>
        <div
          role="radiogroup"
          aria-labelledby="theme-label"
          className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {THEME_OPTIONS.map((option) => {
            const active = current === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "focus-ring group relative flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                  active
                    ? "border-accent-600 bg-accent-50 dark:bg-sky-500/10"
                    : "border-line bg-panel hover:border-line-strong",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    active
                      ? "bg-accent-600 text-white"
                      : "bg-panel-muted text-ink-3 group-hover:text-ink",
                  )}
                >
                  <Icon size={15} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                    {option.label}
                    {active ? (
                      <Check size={13} className="text-accent-600" aria-label="Selected" />
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs leading-4 text-ink-3">
                    {option.detail}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-line px-5 py-4">
        <Label id="accent-label">Accent</Label>
        <div
          role="radiogroup"
          aria-labelledby="accent-label"
          className="mt-2 flex flex-wrap gap-2"
        >
          {ACCENTS.map((accent) => {
            const active = settings.accent === accent.id;
            return (
              <button
                key={accent.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => updateSettings({ accent: accent.id })}
                className={cn(
                  "focus-ring inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "border-ink bg-panel text-ink shadow-card"
                    : "border-line bg-panel text-ink-3 hover:border-line-strong hover:text-ink",
                )}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: accent.swatch }}
                  aria-hidden
                />
                {accent.label}
                {active ? <Check size={13} /> : null}
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 text-xs leading-5 text-ink-3">
          Equipped marketplace themes override the accent until you switch back
          to the default Graphite theme.
        </p>
      </div>

      <Disclosure>
        Theme is persisted by the app&apos;s theme provider (light / dark /
        system). The interface respects reduced-motion and contrast settings
        from your OS.
      </Disclosure>
    </Section>
  );
}
