"use client";

import { useDemoStore } from "../../../lib/demo-store";
import { cn } from "../../../lib/utils";
import { Label, Select } from "../../ui/input";
import { Disclosure, Row, Section, ToggleRow } from "./settings-shared";

const GOAL_OPTIONS = [
  { value: 1, label: "1 problem per day" },
  { value: 2, label: "2 problems per day" },
  { value: 3, label: "3 problems per day" },
  { value: 5, label: "5 problems per day" },
] as const;

export function LearningSection() {
  const settings = useDemoStore((s) => s.settings);
  const updateSettings = useDemoStore((s) => s.updateSettings);

  return (
    <Section
      id="learning"
      title="Your learning flow"
      description="Daily targets and playback behavior. Changes save automatically."
    >
      <Row className="items-start">
        <div className="min-w-0 flex-1">
          <Label htmlFor="daily-goal">Daily problem goal</Label>
          <Select
            id="daily-goal"
            value={String(settings.dailyGoal)}
            onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}
            className="mt-1.5 w-full max-w-[220px]"
          >
            {GOAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <p className="mt-2 max-w-md text-xs leading-5 text-ink-3">
            Small daily wins add up. Set a goal you can actually maintain.
          </p>
        </div>
      </Row>

      <ToggleRow
        className="border-t border-line"
        label="Automatically advance lessons"
        detail="Move to the next lesson when the current lesson is complete."
        checked={settings.lessonAutoplay}
        onChange={(value) => updateSettings({ lessonAutoplay: value })}
      />

      <ToggleRow
        className="border-t border-line"
        label="Auto-advance checkpoints"
        detail="Continue to the next checkpoint when the lesson player supports it."
        note="Saved preference only — playback integration is coming later."
        checked={settings.checkpointAutoAdvance}
        onChange={(value) => updateSettings({ checkpointAutoAdvance: value })}
      />

      <Disclosure>
        {cn(
          "Learning preferences are saved instantly in this browser.",
          settings.checkpointAutoAdvance &&
            " Auto-advance checkpoints won't change lesson playback yet.",
        )}
      </Disclosure>
    </Section>
  );
}
