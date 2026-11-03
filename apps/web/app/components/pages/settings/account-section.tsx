"use client";

import { AlertTriangle, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useDemoStore } from "../../../lib/demo-store";
import { useDemoStore as usePersistedStore } from "../../../lib/store/demo";
import { useDemoStore as useProgressStore } from "../../../lib/progress-store";
import { getLevelInfo } from "../../../lib/levels";
import { logout } from "../../../lib/auth";
import { Button } from "../../ui/button";
import { Dialog } from "../../ui/dialog";
import { Input, Label, Select } from "../../ui/input";
import { Disclosure, Row, Section, ToggleRow } from "./settings-shared";

export function AccountSection() {
  const router = useRouter();
  const settings = useDemoStore((s) => s.settings);
  const updateSettings = useDemoStore((s) => s.updateSettings);
  const profile = usePersistedStore((s) => s.profile);
  const xp = useProgressStore((s) => s.xp);
  const level = getLevelInfo(xp);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
      toast.success("Signed out");
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      <Section
        id="privacy"
        title="Account & privacy"
        description="Who can see your progress, and how your session works."
      >
        <Row className="items-start">
          <div className="min-w-0 flex-1">
            <Label htmlFor="visibility">Profile visibility</Label>
            <Select
              id="visibility"
              value={settings.profileVisibility}
              onChange={(e) =>
                updateSettings({
                  profileVisibility: e.target
                    .value as typeof settings.profileVisibility,
                })
              }
              className="mt-1.5 w-full max-w-xs"
            >
              <option value="everyone">Everyone</option>
              <option value="friends">Friends only</option>
              <option value="private">Private</option>
            </Select>
          </div>
        </Row>

        <ToggleRow
          className="border-t border-line"
          label="Show activity feed"
          detail="Let friends see your recent lessons and solves."
          checked={settings.activityVisible}
          onChange={(value) => updateSettings({ activityVisible: value })}
        />

        <ToggleRow
          className="border-t border-line"
          label="Appear on leaderboards"
          detail="Include your XP in the friends leaderboard."
          checked={settings.showInLeaderboard}
          onChange={(value) => updateSettings({ showInLeaderboard: value })}
        />

        <ToggleRow
          className="border-t border-line"
          label="Friend activity nudges"
          detail="When friends solve problems or hit milestones."
          checked={settings.pushFriends}
          onChange={(value) => updateSettings({ pushFriends: value })}
        />

        <Row className="border-t border-line">
          <dl className="w-full space-y-2 text-[13px]">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-3">Username</dt>
              <dd className="font-medium text-ink">@{profile.handle}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-3">Email</dt>
              <dd className="text-ink-3">Not connected</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-3">Level</dt>
              <dd className="font-medium text-ink">
                {level.level} · {level.title}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-3">Plan</dt>
              <dd className="font-medium text-ink">Demo build</dd>
            </div>
          </dl>
        </Row>

        <Row className="border-t border-line">
          <Button
            variant="secondary"
            size="sm"
            disabled={signingOut}
            onClick={handleSignOut}
          >
            <LogOut size={14} />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </Row>

        <div className="border-t border-line bg-hard-soft/40 px-5 py-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-hard" />
            <div>
              <p className="text-[13px] font-semibold text-hard">Danger zone</p>
              <p className="mt-1 text-xs leading-5 text-hard/90">
                Account deletion requires server-side confirmation and is
                disabled in this demo.
              </p>
              <Button
                variant="danger"
                size="sm"
                className="mt-3"
                onClick={() => setDeleteOpen(true)}
              >
                Delete account…
              </Button>
            </div>
          </div>
        </div>

        <Disclosure>
          <ShieldCheck size={11} className="mr-1 inline align-[-1px]" />
          Signing out clears your session cookie so you can switch between
          admin and learner accounts without conflicts.
        </Disclosure>
      </Section>

      <Dialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteConfirmText("");
        }}
        title="Delete account"
        description="This cannot be undone in production. Type DELETE to confirm."
        footer={
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={deleteConfirmText !== "DELETE"}
              onClick={() => {
                toast.error("Deletion unavailable", {
                  description:
                    "This demo has no account backend — nothing was deleted and nothing was changed.",
                });
                setDeleteOpen(false);
                setDeleteConfirmText("");
              }}
            >
              Confirm deletion
            </Button>
          </>
        }
      >
        <div>
          <Label htmlFor="delete-confirm">Type DELETE</Label>
          <Input
            id="delete-confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
            className="mt-1.5"
          />
          <p className="mt-2 text-xs text-ink-3">
            In this demo, confirming shows an honest notice instead of
            deleting anything.
          </p>
        </div>
      </Dialog>
    </>
  );
}
