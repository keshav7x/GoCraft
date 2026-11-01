"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Code2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { PageHeader } from "@/app/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input, Label } from "@/app/components/ui/input";
import { readSimulatedRole, writeSimulatedRole, type SimulatedRole } from "@/app/lib/admin/role";
import { cn } from "@/app/lib/utils";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [role, setRole] = useState<SimulatedRole>("admin");
  const [name, setName] = useState("Admin");
  const [email, setEmail] = useState("admin@gocraft.dev");
  const [autosave, setAutosave] = useState(true);
  const [confirmPublish, setConfirmPublish] = useState(true);

  useEffect(() => {
    setRole(readSimulatedRole());
  }, []);

  function switchRole(next: SimulatedRole) {
    writeSimulatedRole(next);
    setRole(next);
    if (next === "user") {
      toast.success("Switched to USER — redirecting to GoCraft");
      router.push("/");
    } else {
      toast.success("Switched to ADMIN role");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Toaster position="bottom-right" richColors />
      <PageHeader
        title="Settings"
        description="Admin workspace preferences for this demo session."
      />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Admin profile</CardTitle>
          <CardDescription>Shown in the top navigation of the content studio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="admin-name">Display name</Label>
            <Input
              id="admin-name"
              className="mt-1.5"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              className="mt-1.5"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button
            variant="accent"
            size="sm"
            onClick={() => toast.success("Profile saved (local demo only)")}
          >
            <Check size={14} />
            Save profile
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Simulated role</CardTitle>
          <CardDescription>
            Role-based entry: ADMIN lands on /admin, USER lands on the learner home.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {(["admin", "user"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => switchRole(option)}
                className={cn(
                  "focus-ring rounded-lg border px-4 py-3 text-left transition",
                  role === option
                    ? "border-accent bg-accent-soft text-accent-ink"
                    : "border-edge text-ink-3 hover:border-edge-strong hover:bg-panel-muted hover:text-ink",
                )}
              >
                <span className="block text-sm font-semibold uppercase tracking-wide">
                  {option}
                </span>
                <span className="mt-0.5 block text-[11px] normal-case tracking-normal opacity-80">
                  {option === "admin" ? "Full content studio access" : "Learner experience only"}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Editor preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            {
              key: "autosave" as const,
              title: "Autosave drafts",
              description: "Save lesson changes automatically while editing.",
              value: autosave,
              set: setAutosave,
            },
            {
              key: "confirmPublish" as const,
              title: "Confirm before publishing",
              description: "Show a confirmation dialog when publishing modules and lessons.",
              value: confirmPublish,
              set: setConfirmPublish,
            },
          ].map((row) => (
            <label
              key={row.key}
              className="flex cursor-pointer items-start justify-between gap-4 rounded-lg px-3 py-3 transition hover:bg-panel-muted"
            >
              <span>
                <span className="block text-sm font-medium text-ink">{row.title}</span>
                <span className="mt-0.5 block text-xs text-ink-3">{row.description}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={row.value}
                onClick={() => {
                  row.set(!row.value);
                  toast.success(`${row.title} ${!row.value ? "enabled" : "disabled"}`);
                }}
                className={cn(
                  "focus-ring relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors",
                  row.value ? "bg-accent" : "bg-line-strong",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    row.value ? "translate-x-[18px]" : "translate-x-0.5",
                  )}
                />
              </button>
            </label>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-ink-3">
        <Code2 size={13} />
        All changes are stored in local mock state only.
      </div>
    </div>
  );
}
