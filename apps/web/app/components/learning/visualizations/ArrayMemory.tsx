"use client";

import { useState } from "react";
import { MemCell, VizShell } from "./viz-shared";

/**
 * Fixed-size array memory: index access, value updates, no reallocation.
 */
export function ArrayMemoryViz({
  title = "Arrays: fixed size, value semantics",
  description,
  takeaway = "An array has a fixed length and copies on assignment — b := a copies every element.",
  config,
}: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const size = typeof config?.size === "number" ? Math.min(config.size, 10) : 4;
  const initialValues = Array.isArray(config?.values)
    ? (config.initialValues as number[]).slice(0, size)
    : [1, 2, 3, 4];

  const makeArr = () =>
    Array.from({ length: size }, (_, i) => initialValues[i] ?? 0);

  const [a, setA] = useState<number[]>(makeArr);
  const [b, setB] = useState<number[] | null>(null);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [message, setMessage] = useState(
    `var a [${size}]int — fixed length ${size}, stored inline.`
  );

  const reset = () => {
    setA(makeArr());
    setB(null);
    setHighlight(null);
    setMessage(`var a [${size}]int — fixed length ${size}, stored inline.`);
  };

  const readIndex = (i: number) => {
    setHighlight(i);
    setMessage(`a[${i}] → ${a[i]}  (reading element at index ${i})`);
  };

  const writeIndex = (i: number) => {
    const next = [...a];
    next[i] = (next[i] ?? 0) + 1;
    setA(next);
    setHighlight(i);
    setMessage(`a[${i}] = ${next[i]}  — in-place update, no resizing.`);
  };

  const copyToB = () => {
    setB([...a]);
    setMessage(
      `b := a  — array assignment COPIES all ${size} elements. Changing b will not change a.`
    );
  };

  const mutateB = () => {
    if (!b) return;
    const next = [...b];
    next[0] = (next[0] ?? 0) + 100;
    setB(next);
    setMessage(
      `b[0] = ${next[0]}  — only b changed; a[0] is still ${a[0]} because arrays are values.`
    );
  };

  return (
    <VizShell
      title={title}
      description={description ?? "Read and write by index, then copy the array to see value semantics."}
      takeaway={takeaway}
      status={message}
      onReset={reset}
      controls={
        <>
          <button
            type="button"
            onClick={copyToB}
            className="rounded-md border border-edge bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:bg-panel-muted"
          >
            b := a (copy)
          </button>
          <button
            type="button"
            onClick={mutateB}
            disabled={!b}
            className="rounded-md border border-edge bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:bg-panel-muted disabled:opacity-40"
          >
            b[0] += 100
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            a [{size}]int
          </div>
          <div className="flex flex-wrap gap-1.5">
            {a.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => readIndex(i)}
                onDoubleClick={() => writeIndex(i)}
                className="text-center focus-ring rounded-md"
                aria-label={`Read a[${i}]`}
              >
                <MemCell
                  value={String(v)}
                  highlight={highlight === i}
                  tone={highlight === i ? "accent" : "neutral"}
                />
                <div className="mt-1 font-mono text-[10.5px] text-ink-faint">[{i}]</div>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11.5px] text-ink-faint">
            Click to read · double-click to increment
          </p>
        </div>

        {b && (
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
              b [{size}]int <span className="text-accent">(independent copy)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {b.map((v, i) => (
                <MemCell
                  key={i}
                  value={String(v)}
                  tone={i === 0 && v !== a[0] ? "accent" : "neutral"}
                  highlight={i === 0 && v !== a[0]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </VizShell>
  );
}
