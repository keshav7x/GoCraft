import { cn } from "../../lib/utils";

type ProgressProps = {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  ariaLabel?: string;
};

export function Progress({
  value,
  max = 100,
  className,
  barClassName,
  ariaLabel,
}: ProgressProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={ariaLabel}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-panel-muted",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-accent transition-[width] duration-500 ease-out",
          barClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
