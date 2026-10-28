import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight size={13} className="text-slate-300" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-xs font-medium text-slate-500 transition hover:text-slate-950"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                className={cn(
                  "text-xs font-medium",
                  isLast ? "text-slate-900" : "text-slate-500",
                )}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
