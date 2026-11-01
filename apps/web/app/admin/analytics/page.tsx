"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/app/components/ui/page-header";
import { Card, CardContent } from "@/app/components/ui/card";
import { Select } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { ANALYTICS } from "@/app/lib/admin/mock-data";

const RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
] as const;

type Range = (typeof RANGES)[number]["value"];

const RANGE_FACTOR: Record<Range, number> = { "7d": 1, "30d": 3.4, "90d": 8.1 };

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("30d");
  const factor = RANGE_FACTOR[range];

  const totals = useMemo(
    () => [
      { label: "Total users", value: Math.round(ANALYTICS.totals.users * (1 + (factor - 1) * 0.12)), icon: Users },
      { label: "Active users", value: Math.round(ANALYTICS.totals.activeUsers * (0.9 + factor * 0.08)), icon: Activity },
      { label: "Module enrollments", value: Math.round(ANALYTICS.totals.enrollments * factor), icon: BookOpen },
      { label: "Lessons completed", value: Math.round(ANALYTICS.totals.lessonsCompleted * factor), icon: CheckCircle2 },
    ],
    [factor],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Mock engagement metrics for the GoCraft curriculum."
        actions={
          <Select
            aria-label="Date range"
            value={range}
            onChange={(event) => setRange(event.target.value as Range)}
            className="w-44"
          >
            {RANGES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {totals.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-ink-3">{stat.label}</span>
                <stat.icon size={14} className="text-ink-4" />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                {stat.value.toLocaleString()}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-easy">
                <TrendingUp size={11} />
                {Math.round(4 + factor * 1.7)}% vs previous period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-card">
          <div className="border-b border-edge px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">Daily active users</h2>
            <p className="mt-0.5 text-xs text-ink-muted">Sampled weekday activity.</p>
          </div>
          <CardContent className="px-3 py-4">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={ANALYTICS.dailyActive} margin={{ top: 6, right: 12, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="activeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--c-accent)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--c-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-line)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--c-ink-3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--c-ink-3)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--c-line)",
                    fontSize: 12,
                    boxShadow: "var(--shadow-pop)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="var(--c-accent)"
                  strokeWidth={2}
                  fill="url(#activeFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <div className="border-b border-edge px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">Enrollments</h2>
            <p className="mt-0.5 text-xs text-ink-muted">Weekly module signups.</p>
          </div>
          <CardContent className="px-3 py-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ANALYTICS.enrollmentsOverTime} margin={{ top: 6, right: 12, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-line)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--c-ink-3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--c-ink-3)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "var(--c-surface-2)" }}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--c-line)",
                    fontSize: 12,
                    boxShadow: "var(--shadow-pop)",
                  }}
                />
                <Bar dataKey="enrollments" fill="var(--c-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <div className="border-b border-edge px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">Popular modules</h2>
          </div>
          <ul className="divide-y divide-edge">
            {ANALYTICS.popularModules.map((module) => (
              <li key={module.name} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{module.name}</span>
                  <span className="text-xs tabular-nums text-ink-3">
                    {module.enrollments.toLocaleString()} enrolled
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${module.completion}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-ink-3">{module.completion}% completion rate</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="shadow-card">
          <div className="border-b border-edge px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">Popular lessons</h2>
          </div>
          <ul className="divide-y divide-edge">
            {ANALYTICS.popularLessons.map((lesson) => (
              <li key={lesson.name} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{lesson.name}</p>
                  <p className="truncate text-xs text-ink-3">{lesson.module}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums">{lesson.views.toLocaleString()}</p>
                  <p className="text-[11px] text-ink-3">{lesson.completion}% completed</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="shadow-card">
        <div className="border-b border-edge px-5 py-4">
          <h2 className="text-sm font-semibold tracking-tight">User activity</h2>
        </div>
        <ul className="divide-y divide-edge">
          {ANALYTICS.activity.map((entry, index) => (
            <li key={index} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">
                  <span className="font-medium">{entry.user}</span>{" "}
                  <span className="text-ink-3">{entry.action}</span>{" "}
                  <span className="font-medium">{entry.target}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="neutral">{entry.at}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="shadow-card">
        <div className="border-b border-edge px-5 py-4">
          <h2 className="text-sm font-semibold tracking-tight">Learning progress</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Overall lesson completion rate across all enrollments.
          </p>
        </div>
        <CardContent>
          <div className="flex items-center gap-5">
            <span className="text-4xl font-semibold tracking-tight tabular-nums text-accent-ink">
              {ANALYTICS.completionRate}%
            </span>
            <div className="flex-1">
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent transition-[width]"
                  style={{ width: `${ANALYTICS.completionRate}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-ink-3">
                {Math.round(ANALYTICS.totals.lessonsCompleted * factor).toLocaleString()} lessons
                completed in this period.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
