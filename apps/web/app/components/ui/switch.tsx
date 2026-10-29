"use client";

import { cn } from "@/app/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
  id?: string;
};

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  ariaLabel,
  id,
}: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "gc-focus-ring relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-transparent bg-accent" : "border-line-strong bg-surface-2",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
          checked ? "translate-x-[21px]" : "translate-x-[3px]",
        )}
        style={{ backgroundColor: checked ? "var(--c-accent-contrast)" : "var(--c-ink-4)" }}
      />
    </button>
  );
}
