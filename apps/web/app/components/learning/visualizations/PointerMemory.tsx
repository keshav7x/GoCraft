"use client";

import { useMemo, useState } from "react";
import { MemCell, VizShell, VizEmpty } from "./viz-shared";

type Phase = "declare" | "address" | "pointer" | "deref" | "update";

const PHASES: { key: Phase; label: string; status: string }[] = [
  { key: "declare", label: "1 · Declare", status: "age := 19 creates a variable holding 19." },
  { key: "address", label: "2 · Address", status: "Every variable lives at a memory address (simulated: 0xc000)." },
  { key: "pointer", label: "3 · Pointer", status: "ptr := &age stores age's address — ptr is a *int." },
  { key: "deref", label: "4 · Dereference", status: "*ptr reads the value at that address: 19." },
  { key: "update", label: "5 · Update", status: "*ptr = 30 writes through the pointer — age is now 30." },
];

/**
 * Interactive variable ↔ pointer memory diagram.
 * Steps: declare → address → pointer → dereference → update through pointer.
 */
export function PointerMemoryViz({
  title = "Variables & Pointers in Memory",
  description,
  takeaway = "A pointer holds an address. Dereferencing reads or writes the value stored there.",
  config,
}: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const initialAge = typeof config?.initialAge === "number" ? config.initialAge : 19;
  const [step, setStep] = useState(0);
  const [age, setAge] = useState(initialAge);

  const phase = PHASES[Math.min(step, PHASES.length - 1)]!;
  const phaseIndex = PHASES.findIndex((p) => p.key === phase.key);

  const reset = () => {
    setStep(0);
    setAge(initialAge);
  };

  const next = () => {
    if (phaseIndex === PHASES.length - 1) return;
    const nextStep = phaseIndex + 1;
    setStep(nextStep);
    if (PHASES[nextStep]!.key === "update") {
      setAge(30);
    }
  };

  const prev = () => setStep(Math.max(0, phaseIndex - 1));

  const address = "0xc000014098";
  const showAddress = phaseIndex >= 1;
  const showPointer = phaseIndex >= 2;
  const showDeref = phaseIndex >= 3;
  const showUpdate = phaseIndex >= 4;

  if (!initialAge && initialAge !== 0) {
    return <VizEmpty message="This visualization needs an initial numeric value." />;
  }

  return (
    <VizShell
      title={title}
      description={
        description ??
        "Walk through age := 19, ptr := &age, *ptr, and updating the original variable."
      }
      takeaway={takeaway}
      status={phase.status}
      onReset={reset}
      controls={
        <>
          <button
            type="button"
            onClick={prev}
            disabled={phaseIndex === 0}
            className="rounded-md border border-edge bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:bg-panel-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={next}
            disabled={phaseIndex === PHASES.length - 1}
            className="rounded-md border border-accent-border bg-accent-soft px-3 py-1.5 text-[12.5px] font-medium text-accent-ink transition-colors hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next step
          </button>
          <span className="ml-1 font-mono text-[11.5px] text-ink-faint">
            {phaseIndex + 1}/{PHASES.length}
          </span>
        </>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Variable */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Stack
          </div>
          <div className="space-y-2">
            <MemCell
              label="age (int)"
              value={showUpdate ? "30" : String(age)}
              address={showAddress ? address : undefined}
              highlight={showUpdate}
              tone={showUpdate ? "accent" : "neutral"}
            />
            {showPointer && (
              <MemCell
                label="ptr (*int)"
                value={address}
                address="0xc0000140a0"
                tone="muted"
                highlight
              />
            )}
          </div>
        </div>

        {/* Meaning panel */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            What the code means
          </div>
          <pre className="overflow-x-auto rounded-lg border border-edge bg-inset px-3 py-2.5 font-mono text-[12.5px] leading-6 text-ink-2">
{`age := ${initialAge}
${showPointer ? `ptr := &age\n` : ""}${showDeref ? `fmt.Println(*ptr) // ${showUpdate ? 30 : age}\n` : ""}${showUpdate ? `*ptr = 30 // age becomes 30` : ""}`}
          </pre>
          {showDeref && (
            <div className="rounded-lg border border-accent-border bg-accent-soft px-3 py-2 text-[12.5px] leading-5 text-accent-ink">
              *ptr follows the address held by <code className="font-mono">ptr</code>{" "}
              and touches the same memory as{" "}
              <code className="font-mono">age</code>.
            </div>
          )}
        </div>
      </div>

      {/* Arrow between ptr and age */}
      {showPointer && (
        <div
          className="mt-4 flex items-center gap-2 text-[12px] text-ink-muted"
          aria-hidden
        >
          <span className="h-px flex-1 bg-line-strong" />
          <span className="font-mono">ptr ──points to──▶ age @ {address}</span>
          <span className="h-px flex-1 bg-line-strong" />
        </div>
      )}
    </VizShell>
  );
}
