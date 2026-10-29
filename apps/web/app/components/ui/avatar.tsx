import { cn } from "../../lib/utils";

type AvatarProps = {
  initials: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
  className?: string;
};

const SIZES = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-16 w-16 text-lg",
} as const;

export function Avatar({
  initials,
  color = "bg-slate-900",
  size = "md",
  online,
  className,
}: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-full font-semibold text-white",
          SIZES[size],
          color,
        )}
        aria-hidden
      >
        {initials}
      </span>
      {online !== undefined ? (
        <span
          aria-label={online ? "Online" : "Offline"}
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-panel",
            online ? "bg-easy" : "bg-ink-faint",
          )}
        />
      ) : null}
    </span>
  );
}
