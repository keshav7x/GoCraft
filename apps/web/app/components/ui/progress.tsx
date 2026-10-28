import { cn } from "../../lib/utils";

type ProgressProps = {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  label?: string;
  "aria-label"?: string;
};

export function Progress({
  value,
  max = 100,
  className,
  barClassName,
  label,
  "aria-label": ariaLabel,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const percent = max === 0 ? 0 : Math.round((clamped / max) * 100);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel ?? label}
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80"
      >
        <div
          className={cn(
            "h-full rounded-full bg-slate-950 transition-[width] duration-500 ease-out",
            barClassName,
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {label && (
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          {label}
        </div>
      )}
    </div>
  );
}
