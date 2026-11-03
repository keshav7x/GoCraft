"use client";

import { useMemo } from "react";
import { VizShell, VizEmpty } from "./viz-shared";

type Side = {
  title?: string;
  description?: string;
  items?: string[];
  advantages?: string[];
  disadvantages?: string[];
};

/**
 * Side-by-side comparison. Accepts either the authored shape
 * ({ left: {...}, right: {...}, summary }) or the structured
 * { sides: [...] } / { advantages, disadvantages } variants.
 */
export function ComparisonViz({
  title = "Comparison",
  description,
  takeaway,
  config,
}: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const sides = useMemo<Side[]>(() => {
    if (Array.isArray(config?.sides)) {
      return (config!.sides as Side[]).filter((s) => s && typeof s === "object");
    }
    const left = config?.left;
    const right = config?.right;
    if (left && right && typeof left === "object" && typeof right === "object") {
      return [left as Side, right as Side];
    }
    if (left && typeof left === "object") return [left as Side];
    return [];
  }, [config]);

  const summary =
    typeof config?.summary === "string" && config.summary.trim()
      ? config.summary.trim()
      : null;

  if (sides.length === 0) {
    return (
      <VizEmpty message="No comparison sides configured. Pass left/right (or sides: [...]) in the block config." />
    );
  }

  return (
    <VizShell
      title={title}
      description={description}
      takeaway={takeaway ?? summary ?? undefined}
    >
      <div
        className={`grid gap-3 px-4 pb-4 sm:px-5 ${
          sides.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        {sides.map((side, i) => {
          const items = side.items ?? side.advantages ?? [];
          const downsides = side.disadvantages ?? [];
          return (
            <div
              key={i}
              className="rounded-xl border border-edge bg-surface p-4"
            >
              <h4 className="text-[14px] font-semibold text-ink">
                {side.title ?? `Option ${i + 1}`}
              </h4>
              {side.description && (
                <p className="mt-1 text-[13px] leading-5 text-ink-muted">
                  {side.description}
                </p>
              )}
              {items.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {items.map((item, j) => (
                    <li
                      key={j}
                      className="flex gap-2 text-[13px] leading-5 text-ink-2"
                    >
                      <span className="mt-0.5 text-accent">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {downsides.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {downsides.map((item, j) => (
                    <li
                      key={j}
                      className="flex gap-2 text-[13px] leading-5 text-ink-2"
                    >
                      <span className="mt-0.5 text-warning">−</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </VizShell>
  );
}
