"use client";

import { useDemoStore } from "../../../lib/demo-store";
import { cn } from "../../../lib/utils";
import { Label, Select } from "../../ui/input";
import { Disclosure, Row, Section, ToggleRow } from "./settings-shared";

const WEEK_DAYS = [
  { id: "Mon", label: "M" },
  { id: "Tue", label: "T" },
  { id: "Wed", label: "W" },
  { id: "Thu", label: "T" },
  { id: "Fri", label: "F" },
  { id: "Sat", label: "S" },
  { id: "Sun", label: "S" },
] as const;

export function RemindersSection() {
  const settings = useDemoStore((s) => s.settings);
  const updateSettings = useDemoStore((s) => s.updateSettings);

  const days = settings.dsaReminderDays;
  const needsDay = settings.dsaReminderEnabled && days.length === 0;

  function toggleDay(day: string) {
    const next = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day];
    updateSettings({ dsaReminderDays: next });
  }

  return (
    <Section
      id="reminders"
      title="Stay consistent"
      description="Daily targets and DSA practice reminders. Saved automatically."
    >
      <Row className="items-start">
        <div className="min-w-0 flex-1">
          <Label htmlFor="reminder-daily-goal">Daily problem target</Label>
          <Select
            id="reminder-daily-goal"
            value={String(settings.dailyGoal)}
            onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}
            className="mt-1.5 w-full max-w-[220px]"
          >
            <option value="1">1 problem per day</option>
            <option value="2">2 problems per day</option>
            <option value="3">3 problems per day</option>
            <option value="5">5 problems per day</option>
          </Select>
          <p className="mt-2 text-xs leading-5 text-ink-3">
            Same target as Your learning flow — change it anywhere.
          </p>
        </div>
      </Row>

      <ToggleRow
        className="border-t border-line"
        label="Remind me to practise DSA"
        detail="Time to solve a problem. Your future self will thank you."
        checked={settings.dsaReminderEnabled}
        onChange={(value) => updateSettings({ dsaReminderEnabled: value })}
      />

      <Row
        className={cn(
          "items-start border-t border-line",
          !settings.dsaReminderEnabled && "opacity-60",
        )}
      >
        <div className="min-w-0 flex-1 space-y-4">
          <div className="max-w-[220px]">
            <Label htmlFor="dsa-time">Reminder time</Label>
            <input
              id="dsa-time"
              type="time"
              value={settings.dsaReminderTime}
              onChange={(e) => updateSettings({ dsaReminderTime: e.target.value })}
              disabled={!settings.dsaReminderEnabled}
              aria-label="DSA reminder time"
              className="focus-ring mt-1.5 h-9 w-full rounded-lg border border-line bg-panel px-3 text-sm text-ink tabular-nums disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <span id="dsa-days-label" className="text-[13px] font-medium text-ink">
              Days of the week
            </span>
            <div
              role="group"
              aria-labelledby="dsa-days-label"
              className="mt-1.5 flex items-center gap-1.5"
            >
              {WEEK_DAYS.map((day) => {
                const active = days.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    aria-pressed={active}
                    aria-label={day.id}
                    disabled={!settings.dsaReminderEnabled}
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      "focus-ring flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors disabled:cursor-not-allowed",
                      active
                        ? "border-transparent bg-accent-600 text-white"
                        : "border-line bg-panel text-ink-3 hover:border-line-strong hover:text-ink",
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            {needsDay ? (
              <p className="mt-1.5 text-xs text-hard">
                Pick at least one day for the reminder.
              </p>
            ) : null}
          </div>
        </div>
      </Row>

      <Disclosure>
        Reminder preferences are saved in this browser, but GoCraft has no
        scheduling or notification backend yet — nothing will actually be
        delivered until that service is connected.
      </Disclosure>
    </Section>
  );
}
