"use client";

import { useState } from "react";
import { VizShell } from "./viz-shared";

type WorkerState = "idle" | "waiting" | "critical" | "done";

/**
 * Mutex visualization: two goroutines competing for a shared resource,
 * with lock/unlock, critical section, and waiting states.
 */
export function MutexLockViz({
  title = "sync.Mutex: protecting shared state",
  description,
  takeaway = "Lock before touching shared state, Unlock when done. Only one goroutine may hold the lock at a time.",
  config,
}: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const [locked, setLocked] = useState(false);
  const [owner, setOwner] = useState<string | null>(null);
  const [workers, setWorkers] = useState<Record<string, WorkerState>>({
    A: "idle",
    B: "idle",
  });
  const [counter, setCounter] = useState(0);
  const [log, setLog] = useState<string[]>(["counter := 0  // shared variable"]);

  const pushLog = (line: string) =>
    setLog((prev) => [line, ...prev].slice(0, 6));

  const acquire = (name: string) => {
    if (locked) {
      setWorkers((w) => ({ ...w, [name]: "waiting" }));
      pushLog(`Goroutine ${name}: Lock() → waiting (mutex held by ${owner})`);
      return;
    }
    setLocked(true);
    setOwner(name);
    setWorkers((w) => ({ ...w, [name]: "critical" }));
    pushLog(`Goroutine ${name}: Lock() acquired — entered critical section`);
  };

  const release = (name: string) => {
    if (!locked || owner !== name) {
      pushLog(`Goroutine ${name}: Unlock() → not the owner, no-op`);
      return;
    }
    // Wake a waiter if any
    const waiter = (["A", "B"] as const).find(
      (n) => n !== name && workers[n] === "waiting"
    );
    setCounter((c) => c + 1);
    setLocked(false);
    setOwner(waiter ?? null);
    setWorkers((w) => ({
      ...w,
      [name]: "done",
      ...(waiter ? { [waiter]: "critical" as WorkerState } : {}),
    }));
    if (waiter) {
      setLocked(true);
      pushLog(
        `Goroutine ${name}: counter++ → Unlock() → ${waiter} acquires immediately`
      );
    } else {
      pushLog(`Goroutine ${name}: counter++ → Unlock() — mutex free`);
    }
  };

  const reset = () => {
    setLocked(false);
    setOwner(null);
    setWorkers({ A: "idle", B: "idle" });
    setCounter(0);
    setLog(["counter := 0  // shared variable"]);
  };

  const stateLabel: Record<WorkerState, string> = {
    idle: "idle",
    waiting: "waiting on Lock()",
    critical: "in critical section",
    done: "finished",
  };

  return (
    <VizShell
      title={title}
      description={description ?? "Two goroutines contend for one mutex around counter++."}
      takeaway={takeaway}
      status={
        locked
          ? `Mutex held by goroutine ${owner}`
          : "Mutex is free — a Lock() will succeed."
      }
      onReset={reset}
      controls={
        <>
          {(["A", "B"] as const).map((name) => (
            <div key={name} className="flex gap-1.5">
              <button
                type="button"
                onClick={() => acquire(name)}
                disabled={workers[name] === "critical"}
                className="rounded-md border border-accent-border bg-accent-soft px-2.5 py-1.5 text-[12px] font-medium text-accent-ink transition-colors hover:bg-accent/10 disabled:opacity-40"
              >
                {name}.Lock()
              </button>
              <button
                type="button"
                onClick={() => release(name)}
                disabled={workers[name] !== "critical"}
                className="rounded-md border border-edge bg-surface px-2.5 py-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:bg-panel-muted disabled:opacity-40"
              >
                {name}.Unlock()
              </button>
            </div>
          ))}
          <span className="ml-1 font-mono text-[11.5px] text-ink-faint">
            counter={counter}
          </span>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {(["A", "B"] as const).map((name) => {
          const state = workers[name]!;
          return (
            <div
              key={name}
              className={`rounded-lg border px-3 py-3 transition-colors ${
                state === "critical"
                  ? "border-accent-border bg-accent-soft"
                  : state === "waiting"
                    ? "border-warning/50 bg-warning-soft"
                    : "border-edge bg-inset"
              }`}
            >
              <div className="font-mono text-[13px] font-semibold text-ink">
                goroutine {name}
              </div>
              <div className="mt-1 text-[12px] text-ink-muted">
                {stateLabel[state]}
              </div>
            </div>
          );
        })}

        {/* Mutex + resource */}
        <div
          className={`rounded-lg border px-3 py-3 sm:col-span-3 ${
            locked ? "border-accent-border bg-accent-soft" : "border-edge bg-inset"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[13px] font-semibold text-ink">
                sync.Mutex {locked ? "🔒 locked" : "🔓 unlocked"}
              </div>
              <div className="mt-0.5 text-[12px] text-ink-muted">
                shared resource:{" "}
                <code className="font-mono">counter = {counter}</code>
              </div>
            </div>
            <div className="font-mono text-[11.5px] text-ink-faint">
              owner: {owner ?? "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1" aria-label="log">
        {log.map((line, i) => (
          <div
            key={`${line}-${i}`}
            className={`font-mono text-[11.5px] leading-5 ${
              i === 0 ? "text-ink-2" : "text-ink-faint"
            }`}
          >
            {line}
          </div>
        ))}
      </div>
    </VizShell>
  );
}
