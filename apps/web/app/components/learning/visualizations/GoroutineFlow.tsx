"use client";

import { useEffect, useRef, useState } from "react";
import { VizShell } from "./viz-shared";

type Task = { id: string; label: string; durationMs: number };

const DEFAULT_TASKS: Task[] = [
  { id: "user", label: "fetchUser()", durationMs: 3000 },
  { id: "posts", label: "fetchPosts()", durationMs: 4500 },
  { id: "comments", label: "fetchComments()", durationMs: 2000 },
];

/**
 * Concurrent execution timeline. Shows independent tasks making progress
 * on a shared wall-clock axis — concurrency, not necessarily parallelism.
 */
export function GoroutineFlowViz({
  title = "Goroutines: concurrent progress",
  description,
  takeaway = "Goroutines are multiplexed onto OS threads. They make progress independently; parallelism requires multiple cores.",
  config,
}: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const tasks: Task[] = Array.isArray(config?.tasks)
    ? (config.tasks as Task[])
    : DEFAULT_TASKS;

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const totalMs = Math.max(...tasks.map((t) => t.durationMs), 1);
  const wallMs = Math.max(totalMs, 1);

  const stop = () => {
    setRunning(false);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const play = () => {
    if (running) return;
    setRunning(true);
    startRef.current = performance.now() - elapsed;
    const tick = (now: number) => {
      const t = now - startRef.current;
      setElapsed(t);
      if (t >= wallMs) {
        setElapsed(wallMs);
        stop();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const pause = () => stop();

  const reset = () => {
    stop();
    setElapsed(0);
  };

  useEffect(() => () => stop(), []);

  const doneCount = tasks.filter((t) => elapsed >= t.durationMs).length;
  const status = running
    ? `Running… ${doneCount}/${tasks.length} tasks complete at t=${(elapsed / 1000).toFixed(1)}s`
    : elapsed >= wallMs
      ? `All ${tasks.length} tasks finished. Wall time ≈ ${(wallMs / 1000).toFixed(1)}s (slowest task).`
      : elapsed > 0
        ? `Paused at t=${(elapsed / 1000).toFixed(1)}s`
        : "Press Play — watch the three fetches progress independently.";

  return (
    <VizShell
      title={title}
      description={description ?? "go fetchUser(); go fetchPosts(); go fetchComments() on one timeline."}
      takeaway={takeaway}
      status={status}
      onReset={reset}
      controls={
        <>
          <button
            type="button"
            onClick={play}
            disabled={running || elapsed >= wallMs}
            className="rounded-md border border-accent-border bg-accent-soft px-3 py-1.5 text-[12.5px] font-medium text-accent-ink transition-colors hover:bg-accent/10 disabled:opacity-40"
          >
            Play
          </button>
          <button
            type="button"
            onClick={pause}
            disabled={!running}
            className="rounded-md border border-edge bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:bg-panel-muted disabled:opacity-40"
          >
            Pause
          </button>
          <span className="ml-1 font-mono text-[11.5px] text-ink-faint">
            t = {(elapsed / 1000).toFixed(1)}s
          </span>
        </>
      }
    >
      <div className="space-y-3">
        {tasks.map((task) => {
          const progress = Math.min(elapsed / task.durationMs, 1);
          const done = progress >= 1;
          return (
            <div key={task.id} className="flex items-center gap-3">
              <div className="w-36 shrink-0 truncate font-mono text-[12.5px] text-ink-2">
                {task.label}
              </div>
              <div className="relative h-6 flex-1 overflow-hidden rounded-md border border-edge bg-inset">
                <div
                  className={`absolute inset-y-0 left-0 transition-[width] duration-100 ${
                    done ? "bg-success/70" : "bg-accent/60"
                  }`}
                  style={{ width: `${progress * 100}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(progress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${task.label} progress`}
                />
                <span className="absolute inset-y-0 right-2 flex items-center font-mono text-[11px] text-ink-muted">
                  {done ? "done" : `${(task.durationMs / 1000).toFixed(1)}s`}
                </span>
              </div>
            </div>
          );
        })}

        <div className="flex justify-between border-t border-edge pt-2 font-mono text-[11px] text-ink-faint">
          <span>0s</span>
          <span>{(wallMs / 1000).toFixed(1)}s wall clock</span>
        </div>

        <p className="rounded-lg border border-edge bg-inset px-3 py-2 text-[12.5px] leading-5 text-ink-muted">
          Concurrency ≠ parallelism: these tasks interleave progress. They run in
          parallel only if the runtime schedules them on separate cores.
        </p>
      </div>
    </VizShell>
  );
}
