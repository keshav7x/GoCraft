"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users as UsersIcon } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Dialog } from "@/app/components/ui/dialog";
import { EmptyState } from "@/app/components/ui/empty-state";
import { SearchInput, Select } from "@/app/components/ui/input";
import { useCmsStore } from "@/app/lib/admin/store";
import { formatDate } from "@/app/lib/admin/format";
import type { AdminUser } from "@/app/lib/admin/types";

const STATUS_TONE = {
  active: "success",
  suspended: "danger",
  invited: "warning",
} as const;

export default function UsersPage() {
  const users = useCmsStore((state) => state.users);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | AdminUser["status"]>("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery =
        !q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
      const matchesStatus = status === "all" || user.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [users, query, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Learner accounts, enrollments and progress."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          placeholder="Search by name or email…"
          className="sm:max-w-xs sm:flex-1"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
        />
        <Select
          aria-label="Filter by account status"
          value={status}
          onChange={(event) => setStatus(event.target.value as "all" | AdminUser["status"])}
          className="w-44"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="invited">Invited</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users match"
          description="Try a different search term or status filter."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-edge bg-panel shadow-card">
          <div className="hidden grid-cols-[1.4fr_1.4fr_repeat(4,minmax(0,0.7fr))] gap-3 border-b border-edge bg-panel-muted px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-4 md:grid">
            <span>Name</span>
            <span>Email</span>
            <span>Registered</span>
            <span>Lessons</span>
            <span>Progress</span>
            <span>Status</span>
          </div>
          <ul className="divide-y divide-edge">
            {filtered.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => setSelected(user)}
                  className="gc-focus-ring grid w-full grid-cols-1 gap-2 px-5 py-3.5 text-left transition hover:bg-panel-muted md:grid-cols-[1.4fr_1.4fr_repeat(4,minmax(0,0.7fr))] md:items-center md:gap-3"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-ink">
                      {user.name.charAt(0)}
                    </span>
                    <span className="truncate text-sm font-medium text-ink">{user.name}</span>
                  </span>
                  <span className="truncate text-sm text-ink-3">{user.email}</span>
                  <span className="text-xs text-ink-3">{formatDate(user.registeredAt)}</span>
                  <span className="text-sm tabular-nums text-ink-2">{user.lessonsCompleted}</span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                      <span
                        className="block h-full rounded-full bg-accent"
                        style={{ width: `${user.progress}%` }}
                      />
                    </span>
                    <span className="text-xs tabular-nums text-ink-3">{user.progress}%</span>
                  </span>
                  <span>
                    <Badge variant={STATUS_TONE[user.status]}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "User"}
        description={selected?.email}
        className="max-w-lg"
        footer={
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Registered", value: formatDate(selected.registeredAt) },
                { label: "Last active", value: formatDate(selected.lastActive) },
                { label: "Lessons completed", value: String(selected.lessonsCompleted) },
                {
                  label: "Account status",
                  value: selected.status.charAt(0).toUpperCase() + selected.status.slice(1),
                },
              ].map((entry) => (
                <div key={entry.label} className="rounded-lg border border-edge bg-inset px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-4">
                    {entry.label}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-ink">{entry.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-4">
                Learning progress
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${selected.progress}%` }}
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums">{selected.progress}%</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-4">
                Enrolled modules
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.enrolledModules.length === 0 ? (
                  <p className="text-sm text-ink-faint">No enrollments yet.</p>
                ) : (
                  selected.enrolledModules.map((moduleName) => (
                    <Badge key={moduleName} variant="accent">
                      {moduleName}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <Link
              href="/admin/analytics"
              className="inline-block text-sm font-medium text-accent-strong hover:underline"
            >
              View in analytics →
            </Link>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
