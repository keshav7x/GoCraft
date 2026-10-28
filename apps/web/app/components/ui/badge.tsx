import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type BadgeVariant =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "outline";

const badgeStyles: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-700",
  accent: "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-200",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  outline: "bg-white text-slate-600 ring-1 ring-inset ring-slate-200",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
        badgeStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

const difficultyStyles: Record<string, string> = {
  Easy: "text-emerald-700 bg-emerald-50 ring-emerald-200",
  Medium: "text-amber-700 bg-amber-50 ring-amber-200",
  Hard: "text-rose-700 bg-rose-50 ring-rose-200",
};

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: "Easy" | "Medium" | "Hard";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        difficultyStyles[difficulty],
        className,
      )}
    >
      {difficulty}
    </span>
  );
}
