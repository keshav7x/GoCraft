"use client";

import { cn } from "@/app/lib/utils";

export type SegmentOption<T extends string> = { value: T; label: string; count?: number };

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface-2 p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "gc-focus-ring rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors",
              active
                ? "bg-surface text-ink shadow-card ring-1 ring-inset ring-line"
                : "text-ink-3 hover:text-ink",
            )}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span className="ml-1.5 text-ink-4">{option.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
