"use client";

import { useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/app/components/ui/button";

/**
 * Common chrome for every visualization: title, description, controls slot,
 * reset action, and a takeaway line. Keeps visualizations feeling like
 * educational tools rather than decorative images.
 */
export function VizShell({
  title,
  description,
  controls,
  onReset,
  children,
  takeaway,
  status,
}: {
  title: string;
  description?: string;
  controls?: ReactNode;
  onReset?: () => void;
  children: ReactNode;
  takeaway?: string;
  status?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <figure className="overflow-hidden rounded-xl border border-edge bg-panel shadow-card">
      <figcaption className="border-b border-edge px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold tracking-tight text-ink">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 max-w-2xl text-[13px] leading-5 text-ink-muted">
                {description}
              </p>
            ) : null}
          </div>
          {onReset ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="shrink-0 text-ink-muted"
              aria-label={`Reset ${title}`}
            >
              <RotateCcw size={13} className={reduce ? "" : "transition-transform"} />
              Reset
            </Button>
          ) : null}
        </div>
        {controls ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">{controls}</div>
        ) : null}
      </figcaption>

      <div className="px-4 py-4 sm:px-5">{children}</div>

      {(takeaway || status) && (
        <div className="border-t border-edge bg-inset px-4 py-3 sm:px-5">
          {status ? (
            <p
              role="status"
              aria-live="polite"
              className="mb-1 text-[12.5px] font-medium text-accent-ink"
            >
              {status}
            </p>
          ) : null}
          {takeaway ? (
            <p className="text-[12.5px] leading-5 text-ink-muted">
              <span className="font-medium text-ink-2">Takeaway · </span>
              {takeaway}
            </p>
          ) : null}
        </div>
      )}
    </figure>
  );
}

/** Small labeled memory cell used by pointer/slice/array visualizations. */
export function MemCell({
  label,
  value,
  address,
  tone = "neutral",
  highlight = false,
}: {
  label?: string;
  value: string;
  address?: string;
  tone?: "neutral" | "accent" | "muted" | "danger";
  highlight?: boolean;
}) {
  const toneClass =
    tone === "accent"
      ? "border-accent-border bg-accent-soft"
      : tone === "muted"
        ? "border-edge bg-inset text-ink-muted"
        : tone === "danger"
          ? "border-danger/30 bg-danger-soft"
          : "border-edge bg-surface";

  return (
    <div
      className={`min-w-[88px] rounded-lg border px-3 py-2 text-center transition-colors ${toneClass} ${
        highlight ? "ring-2 ring-accent/40" : ""
      }`}
    >
      {label ? (
        <div className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
          {label}
        </div>
      ) : null}
      <div className="font-mono text-[15px] font-semibold text-ink">{value}</div>
      {address ? (
        <div className="mt-0.5 font-mono text-[11px] text-ink-faint">{address}</div>
      ) : null}
    </div>
  );
}

export function VizEmpty({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-inset px-4 py-6 text-center text-[13px] text-ink-muted">
      {message}
    </div>
  );
}
