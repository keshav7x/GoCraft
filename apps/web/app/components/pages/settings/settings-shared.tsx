"use client";

import { Check, Info } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../../lib/utils";
import { Switch } from "../../ui/switch";

export const AVATAR_COLORS: { id: string; className: string; label: string }[] = [
  { id: "ink", className: "bg-ink text-white", label: "Ink" },
  { id: "blue", className: "bg-accent-600 text-white", label: "Go cyan" },
  { id: "emerald", className: "bg-emerald-600 text-white", label: "Emerald" },
  { id: "violet", className: "bg-violet-600 text-white", label: "Violet" },
  { id: "amber", className: "bg-amber-500 text-white", label: "Amber" },
  { id: "rose", className: "bg-rose-500 text-white", label: "Rose" },
];

export function avatarClass(id: string | undefined): string {
  return AVATAR_COLORS.find((c) => c.id === id)?.className ?? AVATAR_COLORS[0]!.className;
}

export function Section({
  id,
  title,
  description,
  badge,
  children,
}: {
  id: string;
  title: string;
  description: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">
            {title}
          </h2>
          <p className="mt-0.5 text-[13px] leading-5 text-ink-3">
            {description}
          </p>
        </div>
        {badge ? <div className="shrink-0 pb-0.5">{badge}</div> : null}
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-card">
        {children}
      </div>
    </section>
  );
}

export function Row({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-5 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ToggleRow({
  label,
  detail,
  checked,
  onChange,
  disabled,
  note,
  className,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  note?: string;
  className?: string;
}) {
  return (
    <Row className={cn("items-start", className)}>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-xs leading-5 text-ink-3">{detail}</p>
        {note ? (
          <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-panel-muted px-1.5 py-0.5 text-[11px] text-ink-3">
            <Info size={11} className="shrink-0" />
            {note}
          </p>
        ) : null}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        ariaLabel={label}
        disabled={disabled}
      />
    </Row>
  );
}

export function Disclosure({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 border-t border-line bg-panel-muted/50 px-5 py-3">
      <Info size={13} className="mt-0.5 shrink-0 text-ink-4" />
      <p className="text-[11px] leading-4 text-ink-3">{children}</p>
    </div>
  );
}

export function CountUp({
  value,
  reduce,
}: {
  value: number;
  reduce: boolean | null;
}) {
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 750;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  return <>{display.toLocaleString()}</>;
}

/** Transient "Saved" confirmation for immediate-save preference rows. */
export function SavedChip({ show }: { show: boolean }) {
  return (
    <span
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-easy/25 bg-easy-soft px-2 py-0.5 text-[11px] font-medium text-easy transition-opacity duration-200",
        show ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Check size={11} strokeWidth={2.5} />
      Saved
    </span>
  );
}

/** Returns a flash trigger + current state for the SavedChip. */
export function useSavedFlash(): { saved: boolean; flash: () => void } {
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | null>(null);

  const flash = useCallback(() => {
    setSaved(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSaved(false), 1600);
  }, []);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  return { saved, flash };
}

/** Small labeled field wrapper with optional error message. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink">
          {label}
        </label>
        {hint ? <span className="text-[11px] text-ink-3">{hint}</span> : null}
      </div>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-hard">
          {error}
        </p>
      ) : null}
    </div>
  );
}
