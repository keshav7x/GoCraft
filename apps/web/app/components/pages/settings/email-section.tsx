"use client";

import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useDemoStore,
  type PracticeDestination,
  type SettingsState,
} from "../../../lib/demo-store";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Input, Label } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Disclosure, Row, Section, ToggleRow } from "./settings-shared";

type EmailDraft = Pick<
  SettingsState,
  "emailDailyEnabled" | "emailDsaEnabled" | "emailTime" | "practiceDestination"
>;

const DESTINATIONS: { value: PracticeDestination; label: string; detail: string }[] = [
  {
    value: "gocraft",
    label: "GoCraft",
    detail: "Open problems in the built-in playground.",
  },
  {
    value: "leetcode",
    label: "LeetCode",
    detail: "Jump to leetcode.com to pick a problem.",
  },
  {
    value: "each-time",
    label: "Choose each time",
    detail: "Decide where to solve when the reminder arrives.",
  },
];

function buildEmailPreview(draft: EmailDraft) {
  const subject = "Your daily coding challenge is waiting";
  const where =
    draft.practiceDestination === "gocraft"
      ? "on GoCraft"
      : draft.practiceDestination === "leetcode"
        ? "on LeetCode (leetcode.com)"
        : "on GoCraft or LeetCode";
  const body =
    "Hey! Ready for a small win today? Spend a few minutes " +
    where +
    ". Consistency beats intensity. Pick one problem and get started.";
  return { subject, body };
}

export function EmailSection() {
  const settings = useDemoStore((s) => s.settings);
  const updateSettings = useDemoStore((s) => s.updateSettings);

  const [draft, setDraft] = useState<EmailDraft>({
    emailDailyEnabled: settings.emailDailyEnabled,
    emailDsaEnabled: settings.emailDsaEnabled,
    emailTime: settings.emailTime,
    practiceDestination: settings.practiceDestination,
  });
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(
    () =>
      draft.emailDailyEnabled !== settings.emailDailyEnabled ||
      draft.emailDsaEnabled !== settings.emailDsaEnabled ||
      draft.emailTime !== settings.emailTime ||
      draft.practiceDestination !== settings.practiceDestination,
    [draft, settings],
  );

  const preview = buildEmailPreview(draft);
  const anyEmailOn = draft.emailDailyEnabled || draft.emailDsaEnabled;

  function patch(next: Partial<EmailDraft>) {
    setDraft((d) => ({ ...d, ...next }));
  }

  function resetDraft() {
    setDraft({
      emailDailyEnabled: settings.emailDailyEnabled,
      emailDsaEnabled: settings.emailDsaEnabled,
      emailTime: settings.emailTime,
      practiceDestination: settings.practiceDestination,
    });
  }

  function save() {
    setSaving(true);
    updateSettings({
      emailDailyEnabled: draft.emailDailyEnabled,
      emailDsaEnabled: draft.emailDsaEnabled,
      emailTime: draft.emailTime,
      practiceDestination: draft.practiceDestination,
    });
    window.setTimeout(() => {
      setSaving(false);
      toast.success("Email preferences saved", {
        description: "Stored locally — no email service is connected yet.",
      });
    }, 300);
  }

  return (
    <Section
      id="email"
      title="Practice, even on busy days"
      description="Email reminders for daily practice and DSA. Opt in explicitly."
      badge={
        dirty ? <Badge variant="warning">Unsaved changes</Badge> : null
      }
    >
      <ToggleRow
        label="Daily GoCraft practice"
        detail="A morning nudge when your daily quest is waiting."
        note="Preference only — no email service is connected in this build."
        checked={draft.emailDailyEnabled}
        onChange={(value) => patch({ emailDailyEnabled: value })}
      />

      <ToggleRow
        className="border-t border-line"
        label="DSA problem practice"
        detail="A reminder to keep your problem-solving streak warm."
        note="Preference only — no email service is connected in this build."
        checked={draft.emailDsaEnabled}
        onChange={(value) => patch({ emailDsaEnabled: value })}
      />

      <Row
        className={cn(
          "items-start border-t border-line",
          !anyEmailOn && "opacity-60",
        )}
      >
        <div className="min-w-0 flex-1">
          <Label htmlFor="email-time">Preferred send time</Label>
          <Input
            id="email-time"
            type="time"
            value={draft.emailTime}
            onChange={(e) => patch({ emailTime: e.target.value })}
            disabled={!anyEmailOn}
            className="mt-1.5 max-w-[160px] tabular-nums"
          />
          <p className="mt-1.5 text-[11px] leading-4 text-ink-3">
            Used by both daily and DSA reminders.
          </p>
        </div>
      </Row>

      <Row className="flex-col items-start border-t border-line">
        <div className="min-w-0 w-full">
          <span id="destination-label" className="text-[13px] font-medium text-ink">
            Practice destination
          </span>
          <p className="mt-0.5 text-xs text-ink-3">
            Where reminder links should take you.
          </p>
          <div
            role="radiogroup"
            aria-labelledby="destination-label"
            className="mt-2 space-y-1.5"
          >
            {DESTINATIONS.map((dest) => {
              const active = draft.practiceDestination === dest.value;
              return (
                <button
                  key={dest.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => patch({ practiceDestination: dest.value })}
                  className={cn(
                    "focus-ring flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                    active
                      ? "border-accent-600 bg-accent-50 dark:bg-sky-500/10"
                      : "border-line bg-panel hover:border-line-strong",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                      active ? "border-accent-600" : "border-line-strong",
                    )}
                  >
                    {active ? (
                      <span className="h-2 w-2 rounded-full bg-accent-600" />
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium text-ink">
                      {dest.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-3">
                      {dest.detail}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Row>

      {anyEmailOn ? (
        <Row className="border-t border-line">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-ink">Email preview</p>
            <p className="mt-0.5 text-xs text-ink-3">
              What the reminder would say — nothing is sent from this page.
            </p>
            <div className="mt-2.5 overflow-hidden rounded-xl border border-line">
              <div className="border-b border-line bg-panel-muted/60 px-4 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-ink-4">
                  Subject
                </p>
                <p className="mt-0.5 text-[13px] font-medium text-ink">
                  {preview.subject}
                </p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[13px] leading-6 text-ink-2">{preview.body}</p>
              </div>
            </div>
            {draft.practiceDestination === "leetcode" ? (
              <a
                href="https://leetcode.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring mt-2 inline-block text-xs font-medium text-accent-strong underline-offset-4 hover:underline"
              >
                leetcode.com
              </a>
            ) : null}
          </div>
        </Row>
      ) : null}

      <Row className="border-t border-line">
        <p className="min-w-0 flex-1 text-xs leading-5 text-ink-3">
          {dirty
            ? "Unsaved changes — save to keep them."
            : "Preferences are stored in this browser. Emails require explicit opt-in and an opt-out in every message."}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetDraft}
            disabled={!dirty || saving}
          >
            <RotateCcw size={13} />
            Discard
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={save}
            disabled={!dirty || saving}
          >
            {saving ? "Saving…" : "Save preferences"}
          </Button>
        </div>
      </Row>

      <Disclosure>
        Scheduled delivery is not implemented — configuration is saved, but
        GoCraft cannot send these emails until a provider and scheduler are
        connected. No email is sent when this page loads.
      </Disclosure>
    </Section>
  );
}
