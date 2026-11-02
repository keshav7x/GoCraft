"use client";

import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { BlockRenderer } from "./BlockRenderer";
import { formatMinutes, DIFFICULTY_LABEL, DIFFICULTY_TONE } from "@/app/lib/admin/format";
import type { Lesson, Module } from "@/app/lib/admin/types";

type LessonPreviewProps = {
  module: Module;
  lesson: Lesson;
  prevLesson?: Lesson | null;
  nextLesson?: Lesson | null;
  onExit?: () => void;
  previewHrefBase?: string;
};

export function LessonPreview({
  module,
  lesson,
  prevLesson,
  nextLesson,
  onExit,
  previewHrefBase = "/admin/lessons",
}: LessonPreviewProps) {
  const index = module.lessons.findIndex((l) => l.id === lesson.id);
  const previous =
    prevLesson !== undefined ? prevLesson : index > 0 ? module.lessons[index - 1] : null;
  const following =
    nextLesson !== undefined
      ? nextLesson
      : index >= 0 && index < module.lessons.length - 1
        ? module.lessons[index + 1]
        : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-[60px] z-10 -mx-4 mb-6 flex items-center justify-between gap-3 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-medium" />
          Preview mode — this is how learners see the lesson
        </p>
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 py-1.5 text-xs font-medium text-ink-2 transition hover:bg-panel-muted"
          >
            <X size={13} />
            Exit preview
          </button>
        ) : null}
      </div>

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-3">
        <Link href="/admin/content" className="transition hover:text-ink">
          Content
        </Link>
        <ChevronRight size={13} className="text-ink-faint" />
        <Link href={`/admin/modules/${module.id}`} className="transition hover:text-ink">
          {module.title}
        </Link>
        <ChevronRight size={13} className="text-ink-faint" />
        <span className="font-medium text-ink">{lesson.title}</span>
      </nav>

      <header className="mt-5 space-y-3 border-b border-line pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={DIFFICULTY_TONE[lesson.difficulty] ?? "neutral"}>
            {DIFFICULTY_LABEL[lesson.difficulty]}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-ink-3">
            <Clock size={12} />
            {formatMinutes(lesson.estimatedDuration)}
          </span>
          {module.lessons.length > 0 ? (
            <span className="text-xs text-ink-3">
              Lesson {index + 1} of {module.lessons.length}
            </span>
          ) : null}
        </div>
        <h1 className="text-[32px] font-semibold leading-tight tracking-tight text-ink">
          {lesson.title}
        </h1>
        {lesson.description ? (
          <p className="text-[15px] leading-7 text-ink-muted">{lesson.description}</p>
        ) : null}
      </header>

      <article className="space-y-5 py-8">
        {lesson.blocks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-sm text-ink-3">
            This lesson has no content blocks yet.
          </p>
        ) : (
          lesson.blocks.map((block) => <BlockRenderer key={block.id} block={block} />)
        )}
      </article>

      <nav className="flex items-stretch justify-between gap-3 border-t border-line py-6">
        {previous ? (
          <Link
            href={`${previewHrefBase}/${module.id}/${previous.id}?preview=1`}
            className="gc-focus-ring group max-w-[45%] rounded-xl border border-line bg-panel px-4 py-3 transition hover:border-edge-strong"
          >
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-3">
              <ChevronLeft size={12} />
              Previous
            </span>
            <span className="mt-0.5 block truncate text-sm font-medium group-hover:text-accent-strong">
              {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {following ? (
          <Link
            href={`${previewHrefBase}/${module.id}/${following.id}?preview=1`}
            className="gc-focus-ring group max-w-[45%] rounded-xl border border-line bg-panel px-4 py-3 text-right transition hover:border-edge-strong"
          >
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-3">
              Next
              <ChevronRight size={12} />
            </span>
            <span className="mt-0.5 block truncate text-sm font-medium group-hover:text-accent-strong">
              {following.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {onExit ? (
        <div className="pb-8 text-center">
          <button
            type="button"
            onClick={onExit}
            className="focus-ring inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-strong hover:underline"
          >
            <ArrowLeft size={14} />
            Back to the editor
          </button>
        </div>
      ) : null}
    </div>
  );
}
