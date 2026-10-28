import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm">
        <Icon size={20} strokeWidth={1.7} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-slate-500">
        {description}
      </p>
      {action &&
        (action.href ? (
          <a
            href={action.href}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-5")}
          >
            {action.label}
          </a>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-5")}
          >
            {action.label}
          </button>
        ))}
    </div>
  );
}
