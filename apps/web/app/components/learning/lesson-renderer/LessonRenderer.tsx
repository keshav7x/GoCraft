"use client";

import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import type { ParsedBlock } from "@/app/lib/curriculum/types";
import { BlockContent, type BlockHandlers } from "./blocks";

/**
 * Renders a lesson body: metadata header + blocks in order.
 * Reused by learner view and admin preview so both stay in sync.
 */
export function LessonRenderer({
  title,
  description,
  learningObjectives,
  blocks,
  handlers,
  showMeta = true,
}: {
  title: string;
  description?: string | null;
  learningObjectives?: string[] | null;
  blocks: ParsedBlock[];
  handlers?: BlockHandlers;
  showMeta?: boolean;
}) {
  const ordered = useMemo(
    () => [...blocks].sort((a, b) => a.row.orderNo - b.row.orderNo),
    [blocks]
  );

  const valid = ordered.filter((b) => b.payload !== null);

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
    <article className="mx-auto w-full max-w-3xl">
      {showMeta && (
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-[15px] leading-7 text-ink-muted">
              {description}
            </p>
          )}
          {learningObjectives && learningObjectives.length > 0 && (
            <div className="mt-4 rounded-xl border border-edge bg-panel px-4 py-3 shadow-card">
              <div className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">
                What you&apos;ll learn
              </div>
              <ul className="mt-1.5 list-inside list-disc space-y-1 text-[13.5px] leading-6 text-ink-2">
                {learningObjectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          )}
        </header>
      )}

      <div className="space-y-6">
        {valid.map(({ row, payload }) => (
          <section key={row.id} data-block-id={row.id} data-block-type={row.type}>
            <BlockContent
              block={payload!}
              blockId={row.id}
              handlers={handlers}
            />
          </section>
        ))}
      </div>
    </article>
  );
}
