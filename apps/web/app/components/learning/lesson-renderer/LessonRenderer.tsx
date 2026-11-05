"use client";

import { useMemo } from "react";
import { BookOpen, Target } from "lucide-react";
import type { ParsedBlock } from "@/app/lib/curriculum/types";
import { isVisualBlock } from "@/app/lib/curriculum/visuals";
import { BlockContent, type BlockHandlers } from "./blocks";
import { cn } from "@/app/lib/utils";

/**
 * Renders a lesson body: metadata header + blocks in order.
 * Reused by learner view and admin preview so both stay in sync.
 *
 * `hideVisualizations` suppresses visualization blocks (they surface in
 * the Visual Lab instead) while leaving the reading flow intact.
 * `wide` drops the narrow reading measure — used when no Visual Lab is
 * docked, so content isn't unnecessarily narrow.
 */
export function LessonRenderer({
  title,
  description,
  learningObjectives,
  blocks,
  handlers,
  showMeta = true,
  hideVisualizations = false,
  wide = false,
}: {
  title: string;
  description?: string | null;
  learningObjectives?: string[] | null;
  blocks: ParsedBlock[];
  handlers?: BlockHandlers;
  showMeta?: boolean;
  hideVisualizations?: boolean;
  wide?: boolean;
}) {
  const ordered = useMemo(
    () => [...blocks].sort((a, b) => a.row.orderNo - b.row.orderNo),
    [blocks],
  );

  const valid = ordered.filter((b) => b.payload !== null);
  const visible = hideVisualizations
    ? valid.filter((b) => !isVisualBlock(b))
    : valid;

  if (valid.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-inset px-6 py-10 text-center">
        <BookOpen className="mx-auto mb-2 h-5 w-5 text-ink-faint" aria-hidden />
        <p className="text-[14px] text-ink-muted">
          This lesson has no content blocks yet.
        </p>
      </div>
    );
  }

  return (
    <article className={cn("w-full", wide ? "max-w-[960px]" : "max-w-[76ch]")}>
      {showMeta && (
        <header className="mb-8">
          <h1 className="text-[28px] font-semibold leading-[1.15] tracking-tight text-ink sm:text-[34px]">
            {title}
          </h1>
          {description && (
            <p className="mt-2.5 max-w-2xl text-[15.5px] leading-7 text-ink-muted">
              {description}
            </p>
          )}
          {learningObjectives && learningObjectives.length > 0 && (
            <div className="mt-5 border-l-2 border-accent-border pl-4">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                <Target size={12} className="text-accent" />
                What you&apos;ll learn
              </div>
              <ul className="mt-2 grid gap-1.5 text-[13.5px] leading-6 text-ink-2 sm:grid-cols-2">
                {learningObjectives.map((obj, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>
      )}

      <div className="space-y-6">
        {visible.map(({ row, payload }) => (
          <section
            key={row.id}
            data-block-id={row.id}
            data-block-type={row.type}
          >
            <BlockContent
              block={payload!}
              blockId={row.id}
              handlers={handlers}
            />
          </section>
        ))}
        {visible.length === 0 && (
          <p className="text-[13px] text-ink-faint">
            The interactive parts of this lesson live in the Visual Lab →
          </p>
        )}
      </div>
    </article>
  );
}
