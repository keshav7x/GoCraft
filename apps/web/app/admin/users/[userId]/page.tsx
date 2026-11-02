"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, Mail } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { EmptyState } from "@/app/components/ui/empty-state";
import { useCmsStore } from "@/app/lib/admin/store";
import { formatDate, formatRelative } from "@/app/lib/admin/format";
import type { AdminUser } from "@/app/lib/admin/types";
import { cn } from "@/app/lib/utils";

const STATUS_TONE: Record<AdminUser["status"], "success" | "danger" | "warning"> = {
  active: "success",
  suspended: "danger",
  invited: "warning",
};

export default function UserDetailPage() {
  const params = useParams<{ userId: string }>();
  const user = useCmsStore((state) => state.users.find((u) => u.id === params.userId));

  if (!user) {
    return (
      <EmptyState
        icon={BookOpen}
        title="User not found"
        description="This account may have been removed."
        action={
          <Link href="/admin/users" className="text-sm font-medium text-accent-strong hover:underline">
            Back to users
          </Link>
        }
      />
    );
  }

  const stats = [
    { label: "Enrolled modules", value: user.enrolledModules.length, icon: BookOpen },
    { label: "Lessons completed", value: user.lessonsCompleted, icon: Clock },
    { label: "Overall progress", value: `${user.progress}%`, icon: Clock },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 transition hover:text-ink"
      >
        <ArrowLeft size={14} />
        Users
      </Link>

      <div className="rounded-xl border border-edge bg-panel p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent-ink">
              {user.name.charAt(0)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">{user.name}</h1>
                <Badge variant={STATUS_TONE[user.status]}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </Badge>
              </div>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-3">
                <Mail size={13} />
                {user.email}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-ink-3">
            <p>Registered {formatDate(user.registeredAt)}</p>
            <p className="mt-0.5">Last active {formatRelative(user.lastActive)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-ink-3">{stat.label}</span>
                <stat.icon size={14} className="text-ink-4" />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <div className="border-b border-edge px-5 py-4">
          <h2 className="text-sm font-semibold tracking-tight">Learning progress</h2>
        </div>
        <CardContent className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              role="progressbar"
              aria-valuenow={user.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-line"
            >
              <div
                className={cn("h-full rounded-full transition-[width]", user.progress >= 60 ? "bg-easy" : "bg-accent")}
                style={{ width: `${user.progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold tabular-nums">{user.progress}%</span>
          </div>

          <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-4">
            Enrolled modules
          </h3>
          {user.enrolledModules.length === 0 ? (
            <p className="mt-2 text-sm text-ink-3">Not enrolled in any modules yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {user.enrolledModules.map((moduleName) => (
                <li
                  key={moduleName}
                  className="flex items-center justify-between rounded-lg border border-line px-3.5 py-2.5 text-sm"
                >
                  <span className="inline-flex items-center gap-2 font-medium">
                    <BookOpen size={14} className="text-ink-4" />
                    {moduleName}
                  </span>
                  <span className="text-xs text-ink-3">In progress</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
