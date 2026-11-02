"use client";

import { useState } from "react";
import { MemCell, VizShell } from "./viz-shared";

/**
 * Slice memory: underlying array, len/cap, append with and without
 * reallocation. Makes the hidden backing array visible.
 */
export function SliceMemoryViz({
  title = "Slice: len, cap & append",
  description,
  takeaway = "A slice is a header (ptr, len, cap) over an backing array. Append grows cap and may reallocate.",
  config,
}: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const initial = Array.isArray(config?.initial)
    ? (config.initial as number[]).slice(0, 8)
    : [10, 20, 30];

  const [values, setValues] = useState<number[]>(initial);
  const [cap, setCap] = useState(Math.max(initial.length * 2, 4));
  const [reallocated, setReallocated] = useState(false);
  const [message, setMessage] = useState(
    `s := []int{${initial.join(", ")}} — len=${initial.length}, cap=${cap}`
  );

  const reset = () => {
    setValues(initial);
    setCap(Math.max(initial.length * 2, 4));
    setReallocated(false);
    setMessage(`s := []int{${initial.join(", ")}} — len=${initial.length}, cap=${cap}`);
  };

  const appendValue = () => {
    const nextVal = (values[values.length - 1] ?? 0) + 10;
    if (values.length + 1 > cap) {
      // reallocation: double capacity, new backing array
      const newCap = cap * 2;
      setValues([...values, nextVal]);
      setCap(newCap);
      setReallocated(true);
      setMessage(
        `append(s, ${nextVal}) — len exceeded cap (${cap}), so Go allocated a NEW backing array of cap ${newCap} and copied the elements.`
      );
    } else {
      setValues([...values, nextVal]);
      setReallocated(false);
      setMessage(
        `append(s, ${nextVal}) — fits in place: len=${values.length + 1}, cap=${cap}. Same backing array.`
      );
    }
  };

  const cells = Array.from({ length: Math.max(cap, values.length) }, (_, i) => ({
    index: i,
    value: values[i],
    filled: i < values.length,
  }));

  return (
    <VizShell
      title={title}
      description={description ?? "Append elements and watch len/cap — and when the backing array is reallocated."}
      takeaway={takeaway}
      status={message}
      onReset={reset}
      controls={
        <>
          <button
            type="button"
            onClick={appendValue}
            className="rounded-md border border-accent-border bg-accent-soft px-3 py-1.5 text-[12.5px] font-medium text-accent-ink transition-colors hover:bg-accent/10"
          >
            s = append(s, …)
          </button>
          <span className="ml-1 font-mono text-[11.5px] text-ink-faint">
            len={values.length} · cap={cap}
          </span>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Backing array {reallocated && <span className="text-accent">(newly allocated)</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cells.map((c) => (
              <div key={c.index} className="text-center">
                <MemCell
                  value={c.filled ? String(c.value) : "·"}
                  tone={c.filled ? (reallocated && c.index === values.length - 1 ? "accent" : "neutral") : "muted"}
                  highlight={reallocated && c.filled && c.index >= Math.floor(values.length / 2)}
                />
                <div className="mt-1 font-mono text-[10.5px] text-ink-faint">
                  [{c.index}]
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-edge bg-inset px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-ink-faint">
              Slice header
            </div>
            <div className="mt-1 space-y-0.5 font-mono text-[12.5px] text-ink-2">
              <div>ptr → backing[0]</div>
              <div>len = {values.length}</div>
              <div>cap = {cap}</div>
            </div>
          </div>
          <div className="rounded-lg border border-edge bg-inset px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-ink-faint">
              Go code
            </div>
            <pre className="mt-1 overflow-x-auto font-mono text-[12px] leading-5 text-ink-2">
{`s := []int{${initial.join(", ")}}
s = append(s, ${values[values.length - 1] ?? "…"})`}
            </pre>
          </div>
        </div>
      </div>
    </VizShell>
  );
}
