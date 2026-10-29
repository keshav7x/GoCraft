"use client";

import { Camera, Check, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDemoStore } from "../../../lib/store/demo";
import { cn, initialsOf } from "../../../lib/utils";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input, Label, Textarea } from "../../ui/input";
import { AVATAR_COLORS, avatarClass, Row, Section } from "./settings-shared";

const RESERVED_HANDLES = new Set([
  "you",
  "me",
  "admin",
  "root",
  "gocraft",
  "settings",
  "dashboard",
  "support",
]);

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9._]{1,18}[a-z0-9])?$/;

function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Display name must be at least 2 characters.";
  if (trimmed.length > 60) return "Display name must be 60 characters or fewer.";
  return null;
}

function validateHandle(handle: string): string | null {
  const trimmed = handle.trim().toLowerCase();
  if (trimmed.length < 3) return "Username must be at least 3 characters.";
  if (trimmed.length > 20) return "Username must be 20 characters or fewer.";
  if (!HANDLE_PATTERN.test(trimmed)) {
    return "Use lowercase letters, numbers, dots, or underscores — start and end with a letter or number.";
  }
  if (RESERVED_HANDLES.has(trimmed)) return "That username is reserved.";
  return null;
}

type Draft = { name: string; handle: string; bio: string; avatarColor: string };

export function ProfileSection() {
  const profile = useDemoStore((s) => s.profile);
  const setProfile = useDemoStore((s) => s.setProfile);

  const [draft, setDraft] = useState<Draft>({
    name: profile.name,
    handle: profile.handle,
    bio: profile.bio,
    avatarColor: profile.avatarColor,
  });
  const [touched, setTouched] = useState({ name: false, handle: false });
  const [saving, setSaving] = useState(false);
  const [showColors, setShowColors] = useState(false);

  const nameError = validateName(draft.name);
  const handleError = validateHandle(draft.handle);
  const bioLength = draft.bio.length;
  const bioError = bioLength > 160 ? "Bio must be 160 characters or fewer." : null;

  const dirty = useMemo(
    () =>
      draft.name !== profile.name ||
      draft.handle !== profile.handle ||
      draft.bio !== profile.bio ||
      draft.avatarColor !== profile.avatarColor,
    [draft, profile],
  );

  const valid = !nameError && !handleError && !bioError;

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function resetDraft() {
    setDraft({
      name: profile.name,
      handle: profile.handle,
      bio: profile.bio,
      avatarColor: profile.avatarColor,
    });
    setTouched({ name: false, handle: false });
  }

  function handleSave() {
    setTouched({ name: true, handle: true });
    if (!valid) {
      toast.error("Fix the highlighted fields before saving.");
      return;
    }
    setSaving(true);
    // Local-only persistence — there is no profile API to write to yet.
    setProfile({
      name: draft.name.trim(),
      handle: draft.handle.trim().toLowerCase(),
      bio: draft.bio.trim(),
      avatarColor: draft.avatarColor,
    });
    window.setTimeout(() => {
      setSaving(false);
      toast.success("Profile saved", {
        description: "Stored in this browser. No server was contacted.",
      });
    }, 350);
  }

  const initials = initialsOf(draft.name || profile.name);

  return (
    <Section
      id="profile"
      title="Profile"
      description="How you appear across GoCraft. Saved locally in this demo."
      badge={
        dirty ? (
          <Badge variant="warning">Unsaved changes</Badge>
        ) : (
          <Badge variant="success">
            <Check size={11} />
            Saved
          </Badge>
        )
      }
    >
      <Row className="flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-2.5">
          <span
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold shadow-card",
              avatarClass(draft.avatarColor),
            )}
            aria-hidden
          >
            {initials}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowColors((v) => !v)}
            aria-expanded={showColors}
          >
            <Camera size={14} />
            Change avatar
          </Button>
          <p className="text-[11px] leading-4 text-ink-3">
            Image upload needs a connected account.
          </p>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          {showColors ? (
            <div
              role="radiogroup"
              aria-label="Avatar color"
              className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel-muted/60 p-3"
            >
              {AVATAR_COLORS.map((color) => {
                const active = draft.avatarColor === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={color.label}
                    onClick={() => setDraft((d) => ({ ...d, avatarColor: color.id }))}
                    className={cn(
                      "focus-ring flex h-8 w-8 items-center justify-center rounded-full transition-transform",
                      color.className,
                      active
                        ? "ring-2 ring-accent-600 ring-offset-2 ring-offset-panel"
                        : "hover:scale-105",
                    )}
                  >
                    {active ? <Check size={13} /> : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="profile-name">Display name</Label>
              <Input
                id="profile-name"
                value={draft.name}
                onChange={(e) => {
                  setTouched((t) => ({ ...t, name: true }));
                  setDraft((d) => ({ ...d, name: e.target.value }));
                }}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                className="mt-1.5"
                aria-invalid={touched.name && !!nameError}
                aria-describedby="profile-name-error"
              />
              {touched.name && nameError ? (
                <p id="profile-name-error" className="mt-1.5 text-xs text-hard">
                  {nameError}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="profile-handle">Username</Label>
              <Input
                id="profile-handle"
                value={draft.handle}
                onChange={(e) => {
                  setTouched((t) => ({ ...t, handle: true }));
                  setDraft((d) => ({ ...d, handle: e.target.value.replace(/[^a-zA-Z0-9._]/g, "") }));
                }}
                onBlur={() => setTouched((t) => ({ ...t, handle: true }))}
                className="mt-1.5"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={touched.handle && !!handleError}
                aria-describedby="profile-handle-error"
              />
              {touched.handle && handleError ? (
                <p id="profile-handle-error" className="mt-1.5 text-xs text-hard">
                  {handleError}
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] leading-4 text-ink-3">
                  Format is checked here; uniqueness needs a connected account.
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="profile-bio">Bio</Label>
              <span
                className={cn(
                  "text-[11px] tabular-nums",
                  bioError ? "text-hard" : bioLength > 140 ? "text-medium" : "text-ink-4",
                )}
              >
                {bioLength}/160
              </span>
            </div>
            <Textarea
              id="profile-bio"
              value={draft.bio}
              onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
              rows={3}
              placeholder="A short introduction for your friends."
              className="mt-1.5 resize-none"
              aria-invalid={!!bioError}
            />
            {bioError ? <p className="mt-1.5 text-xs text-hard">{bioError}</p> : null}
          </div>
        </div>
      </Row>

      <Row className="border-t border-line">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-ink">Preview</p>
          <div className="mt-2.5 flex items-start gap-3 rounded-xl border border-line bg-panel-muted/50 p-3.5">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                avatarClass(draft.avatarColor),
              )}
              aria-hidden
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {draft.name.trim() || "Your name"}
              </p>
              <p className="truncate text-xs text-ink-3">
                @{draft.handle.trim().toLowerCase() || "username"}
              </p>
              {draft.bio.trim() ? (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-muted">
                  {draft.bio.trim()}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </Row>

      <Row className="border-t border-line">
        <p className="min-w-0 flex-1 text-xs leading-5 text-ink-3">
          {dirty
            ? "You have unsaved changes — they stay in this tab until you save or discard."
            : "Profile changes save to this browser only. Server-side accounts aren't connected in this build."}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetDraft}
            disabled={!dirty || saving}
          >
            <RotateCcw size={13} />
            Cancel
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={handleSave}
            disabled={!dirty || !valid || saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Row>
    </Section>
  );
}
