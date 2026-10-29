"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { CurriculumModule } from "../../lib/demo/types";
import { useDemoStore } from "../../lib/progress-store";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

type ModuleStatus =
  | "completed"
  | "in-progress"
  | "available"
  | "locked"
  | "planned";

export function getModuleStatus(
  module: CurriculumModule,
  completedLessonIds: string[],
): { status: ModuleStatus; done: number; total: number } {
  const total = module.lessons.length;
  const done = module.lessons.filter((l) =>
    completedLessonIds.includes(`${module.id}/${l.id}`),
  ).length;

  if (total === 0) return { status: "planned", done: 0, total: 0 };
  if (done === total) return { status: "completed", done, total };
  if (done > 0) return { status: "in-progress", done, total };
  return { status: "available", done, total };
}

const STATUS_META: Record<
  ModuleStatus,
  { label: string; tone: "success" | "accent" | "neutral" }
> = {
  completed: { label: "Completed", tone: "success" },
  "in-progress": { label: "In progress", tone: "accent" },
  available: { label: "Available", tone: "neutral" },
  locked: { label: "Locked", tone: "neutral" },
  planned: { label: "In development", tone: "neutral" },
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function ModuleRow({
  module,
  prereqCompleted,
  index,
}: {
  module: CurriculumModule;
  prereqCompleted: boolean;
  index: number;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  const completedLessonIds = useDemoStore((s) => s.completedLessonIds);
  const { status, done, total } = getModuleStatus(module, completedLessonIds);
  const locked =
    status === "planned" ||
    (status === "available" && !prereqCompleted);
  const meta = STATUS_META[locked ? "locked" : status];
  const interactive = !locked;
  const minutes = module.lessons.reduce((n, l) => n + l.minutes, 0);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.045, ease: EASE }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      className={cn(
        "group relative transition-colors duration-200",
        interactive
          ? "hover:bg-panel-muted/50"
          : "bg-panel-muted/30 opacity-90",
      )}
    >
      {interactive ? (
        <Link
          href={`/dashboard/learn/${module.id}`}
          className="focus-ring block"
        >
          <RowLine
            index={index}
            module={module}
            meta={meta}
            done={done}
            total={total}
            minutes={minutes}
            locked={false}
          />
        </Link>
      ) : (
        <div aria-disabled>
          <RowLine
            index={index}
            module={module}
            meta={meta}
            done={done}
            total={total}
            minutes={minutes}
            locked
          />
        </div>
      )}

      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.28, ease: EASE }}
        className="overflow-hidden"
        aria-hidden={!open}
      >
        <div className="flex gap-4 px-5 pb-4 pt-0.5">
          <span className="w-5 shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              What you&apos;ll learn
            </p>
            <p className="mt-1 max-w-3xl text-[13px] leading-5 text-ink-muted">
              {module.objective}
            </p>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}

function RowLine({
  index,
  module,
  meta,
  done,
  total,
  minutes,
  locked,
}: {
  index: number;
  module: CurriculumModule;
  meta: { label: string; tone: "success" | "accent" | "neutral" };
  done: number;
  total: number;
  minutes: number;
  locked: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <span className="w-5 shrink-0 text-[11px] font-medium tabular-nums text-ink-faint">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <h3 className="truncate text-[14px] font-semibold tracking-tight text-ink">
          {module.title}
        </h3>
        <Badge tone={meta.tone} className="shrink-0">
          {meta.label}
        </Badge>
        {total > 0 ? (
          <span className="hidden shrink-0 items-center text-[11.5px] tabular-nums text-ink-muted sm:flex">
            {done}/{total} lessons
            <span className="mx-1.5 text-ink-faint">·</span>
            {minutes} min
          </span>
        ) : (
          <span className="hidden shrink-0 text-[11.5px] text-ink-faint sm:inline">
            Coming soon
          </span>
        )}
      </div>

      {locked ? (
        <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-edge bg-panel px-3 text-[13px] font-medium text-ink-faint">
          <Lock size={13} />
          <span className="hidden sm:inline">Lesson locked</span>
          <span className="sm:hidden">Locked</span>
        </span>
      ) : (
        <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(11,13,16,0.16)] transition-colors group-hover:bg-ink/90">
          <span className="hidden sm:inline">Continue learning</span>
          <span className="sm:hidden">Continue</span>
          <ChevronRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </span>
      )}
    </div>
  );
}
