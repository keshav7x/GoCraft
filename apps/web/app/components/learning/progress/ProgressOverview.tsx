"use client";

/**
 * Loading / error / empty states for learner data.
 */
export function DataState({
  loading,
  error,
  empty,
  emptyMessage = "Nothing here yet.",
  children,
}: {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-edge bg-panel-muted"
          />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3.5 text-[14px] leading-6 text-danger"
      >
        {error}
      </div>
    );
  }
  if (empty) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-inset px-6 py-10 text-center text-[14px] text-ink-muted">
        {emptyMessage}
      </div>
    );
  }
  return <>{children}</>;
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-edge bg-panel px-4 py-3.5 shadow-card">
      <div className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-0.5 text-[12.5px] text-ink-muted">{hint}</div>
    </div>
  );
}

/**
 * Overall curriculum progress summary (lessons done, XP, modules cleared).
 * Derived from `progress.getCurriculumProgress` + module stats.
 */
export function ProgressOverview({
  completedLessons,
  totalLessons,
  completedModules,
  totalModules,
  earnedXp,
}: {
  completedLessons: number;
  totalLessons: number;
  completedModules: number;
  totalModules: number;
  earnedXp: number;
}) {
  const pct =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Stat
        label="Lessons completed"
        value={`${completedLessons}/${totalLessons}`}
        hint={`${pct}% of published lessons`}
      />
      <Stat
        label="Modules cleared"
        value={`${completedModules}/${totalModules}`}
        hint="modules with every lesson done"
      />
      <Stat label="Total XP" value={String(earnedXp)} hint="earned so far" />
    </div>
  );
}

/**
 * Compact progress bar for one module (completed / total lessons).
 */
export function ModuleProgressRow({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="lesson progress"
        className="h-1.5 w-28 overflow-hidden rounded-full bg-panel-muted"
      >
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[12px] text-ink-muted">
        {completed}/{total}
      </span>
    </div>
  );
}
