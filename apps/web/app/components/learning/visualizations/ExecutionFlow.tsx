"use client";

import { useState } from "react";
import { VizShell, VizEmpty } from "./viz-shared";

type ExecStep = { line: number; note: string; vars?: Record<string, string> };

const DEFAULT_CODE = `package main

import "fmt"

func main() {
    x := 1
    y := x + 2
    fmt.Println(y)
}`;

const DEFAULT_STEPS: ExecStep[] = [
  { line: 5, note: "Enter main().", vars: {} },
  { line: 6, note: "x := 1 — declare x with value 1.", vars: { x: "1" } },
  { line: 7, note: "y := x + 2 — read x (1), add 2, store 3 in y.", vars: { x: "1", y: "3" } },
  { line: 8, note: "fmt.Println(y) — print 3.", vars: { x: "1", y: "3" } },
  { line: 9, note: "main returns. Program exits with code 0.", vars: { x: "1", y: "3" } },
];

/**
 * Step-by-step execution flow: program counter, source highlight,
 * and variable state at each step.
 */
export function ExecutionFlowViz({
  title = "Execution flow, step by step",
  description,
  takeaway = "Execution is sequential within a function: each statement completes before the next begins.",
  config,
}: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const code =
    typeof config?.code === "string" && config.code.trim()
      ? config.code
      : DEFAULT_CODE;
  const steps: ExecStep[] =
    Array.isArray(config?.steps) && config.steps.length > 0
      ? (config.steps as ExecStep[])
      : DEFAULT_STEPS;

  const [idx, setIdx] = useState(0);
  const step = steps[Math.min(idx, steps.length - 1)];

  if (!step) {
    return <VizEmpty message="No execution steps configured for this visualization." />;
  }

  const lines = code.split("\n");
  const reset = () => setIdx(0);
  const prev = () => setIdx(Math.max(0, idx - 1));
  const next = () => setIdx(Math.min(steps.length - 1, idx + 1));
  const atEnd = idx >= steps.length - 1;

  return (
    <VizShell
      title={title}
      description={description ?? "Move the program counter through each statement and inspect variable state."}
      takeaway={takeaway}
      status={`Step ${idx + 1}/${steps.length} · line ${step.line} — ${step.note}`}
      onReset={reset}
      controls={
        <>
          <button
            type="button"
            onClick={prev}
            disabled={idx === 0}
            className="rounded-md border border-edge bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:bg-panel-muted disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={next}
            disabled={atEnd}
            className="rounded-md border border-accent-border bg-accent-soft px-3 py-1.5 text-[12.5px] font-medium text-accent-ink transition-colors hover:bg-accent/10 disabled:opacity-40"
          >
            Next
          </button>
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-[1fr_200px]">
        {/* Source with current-line highlight */}
        <div className="overflow-hidden rounded-lg border border-edge bg-inset">
          <div className="flex items-center justify-between border-b border-edge px-3 py-1.5">
            <span className="font-mono text-[11.5px] text-ink-faint">main.go</span>
            <span className="font-mono text-[11.5px] text-ink-faint">
              ▶ line {step.line}
            </span>
          </div>
          <pre className="overflow-x-auto px-0 py-2 font-mono text-[12.5px] leading-6">
            {lines.map((line, i) => {
              const lineNo = i + 1;
              const active = lineNo === step.line;
              return (
                <div
                  key={lineNo}
                  className={`flex ${active ? "bg-accent-soft" : ""}`}
                >
                  <span className="w-9 shrink-0 select-none pr-2 text-right text-ink-faint">
                    {lineNo}
                  </span>
                  <span
                    className={`flex-1 pl-2 pr-3 ${active ? "text-accent-ink" : "text-ink-2"}`}
                  >
                    {line || " "}
                  </span>
                </div>
              );
            })}
          </pre>
        </div>

        {/* Variable state */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Variables
          </div>
          {step.vars && Object.keys(step.vars).length > 0 ? (
            <div className="space-y-1.5">
              {Object.entries(step.vars).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded-md border border-edge bg-surface px-2.5 py-1.5"
                >
                  <span className="font-mono text-[12.5px] text-ink-2">{k}</span>
                  <span className="font-mono text-[12.5px] font-semibold text-ink">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12.5px] text-ink-faint">No variables yet.</p>
          )}

          <div className="rounded-md border border-edge bg-inset px-2.5 py-2 text-[12px] leading-5 text-ink-muted">
            {step.note}
          </div>
        </div>
      </div>
    </VizShell>
  );
}
