import type { HTMLAttributes } from "react";
import type { Difficulty } from "../../lib/demo/types";
import { cn } from "../../lib/utils";

type Tone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "outline"
  | "Easy"
  | "Medium"
  | "Hard"
  | "easy"
  | "medium"
  | "hard";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  /** Current API */
  variant?: Tone;
  /** Legacy alias kept so both component generations render correctly */
  tone?: Tone;
};

const TONES: Record<Tone, string> = {
  neutral: "border-line bg-surface-2 text-ink-3",
  accent: "border-accent bg-accent-soft text-accent-ink",
  Easy: "border-easy/20 bg-easy-soft text-easy",
  Medium: "border-medium/25 bg-medium-soft text-medium",
  Hard: "border-hard/20 bg-hard-soft text-hard",
  easy: "border-easy/20 bg-easy-soft text-easy",
  medium: "border-medium/25 bg-medium-soft text-medium",
  hard: "border-hard/20 bg-hard-soft text-hard",
  success: "border-easy/20 bg-easy-soft text-easy",
  warning: "border-medium/25 bg-medium-soft text-medium",
  danger: "border-hard/20 bg-hard-soft text-hard",
  outline: "border-line bg-white text-ink-3",
};

export function Badge({
  className,
  variant,
  tone = "neutral",
  ...props
}: BadgeProps) {
  const resolved = variant ?? tone;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4",
        TONES[resolved] ?? TONES.neutral,
        className,
      )}
      {...props}
    />
  );
}

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  const label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const resolved = (["Easy", "Medium", "Hard"].includes(label) ? label : "neutral") as Tone;
  return (
    <Badge variant={resolved} className={className}>
      {label}
    </Badge>
  );
}
