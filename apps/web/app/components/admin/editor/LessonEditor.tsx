"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSyncExternalStore, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, ChevronRight, Eye, Plus, Send, Undo2 } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/input";
import { EmptyState } from "@/app/components/ui/empty-state";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { BlockEditorHost } from "./BlockEditorHost";
import { BlockPicker } from "./BlockPicker";
import { BlockToolbar } from "./BlockToolbar";
import { LessonPreview } from "./LessonPreview";
import { useCmsStore } from "@/app/lib/admin/store";
import { slugify, type Block, type BlockType } from "@/app/lib/admin/types";
import { cn } from "@/app/lib/utils";

type PickerState = { open: boolean; index: number; replaceId: string | null };

/* URL-backed preview flag as an external store — SSR-safe with no effect setState. */
const previewListeners = new Set<() => void>();

function subscribePreview(onChange: () => void) {
  previewListeners.add(onChange);
  return () => {
    previewListeners.delete(onChange);
  };
}

function getPreviewSnapshot() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "1";
}

function setPreviewMode(next: boolean) {
  const url = new URL(window.location.href);
  if (next) url.searchParams.set("preview", "1");
  else url.searchParams.delete("preview");
  window.history.replaceState(null, "", url);
  for (const listener of [...previewListeners]) listener();
}

export function LessonEditor() {
  const params = useParams<{ moduleId: string; lessonId: string }>();
  const router = useRouter();
  const { moduleId, lessonId } = params;

  const module = useCmsStore((state) => state.modules.find((m) => m.id === moduleId));
  const lesson = module?.lessons.find((l) => l.id === lessonId);

  const updateLesson = useCmsStore((state) => state.updateLesson);
  const setLessonStatus = useCmsStore((state) => state.setLessonStatus);
  const addBlock = useCmsStore((state) => state.addBlock);
  const updateBlockData = useCmsStore((state) => state.updateBlockData);
  const replaceBlockType = useCmsStore((state) => state.replaceBlockType);
  const deleteBlock = useCmsStore((state) => state.deleteBlock);
  const duplicateBlock = useCmsStore((state) => state.duplicateBlock);
  const moveBlock = useCmsStore((state) => state.moveBlock);

  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const previewMode = useSyncExternalStore(subscribePreview, getPreviewSnapshot, getPreviewSnapshot);
  const [picker, setPicker] = useState<PickerState>({
    open: false,
    index: 0,
    replaceId: null,
  });
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const touch = () => setDirty(true);

  if (!module || !lesson) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Lesson not found"
        description="It may have been deleted, or the module no longer exists."
        action={
          <Link href="/admin/modules" className="text-sm font-medium text-accent-strong hover:underline">
            Back to modules
          </Link>
        }
      />
    );
  }

  const blocks = lesson.blocks;
  const isPublished = lesson.status === "published";
  const index = module.lessons.findIndex((l) => l.id === lesson.id);
  const prev = index > 0 ? module.lessons[index - 1] : null;
  const next = index < module.lessons.length - 1 ? module.lessons[index + 1] : null;

  function saveDraft() {
    setDirty(false);
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    toast.success("Draft saved");
  }

  function openPicker(at: number, replaceId: string | null) {
    setPicker({ open: true, index: at, replaceId });
  }

  function handlePick(type: BlockType) {
    if (picker.replaceId) {
      replaceBlockType(moduleId, lessonId, picker.replaceId, type);
    } else {
      addBlock(moduleId, lessonId, type, picker.index);
    }
    touch();
  }

  function handleBlockKeyDown(event: React.KeyboardEvent<HTMLElement>, block: Block, blockIndex: number) {
    if (event.key !== "/") return;
    const target = event.target as HTMLElement;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      if (target.value !== "") return;
      event.preventDefault();
      openPicker(blockIndex, block.id);
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= blocks.length) return;
    moveBlock(moduleId, lessonId, from, to);
    touch();
  }

  if (previewMode) {
    return (
      <LessonPreview
        module={module}
        lesson={lesson}
        prevLesson={prev}
        nextLesson={next}
        onExit={() => setPreviewMode(false)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px] text-ink-3">
          <Link href="/admin/modules" className="inline-flex items-center gap-1 transition hover:text-ink">
            <ArrowLeft size={13} />
            Modules
          </Link>
          <ChevronRight size={13} className="text-ink-faint" />
          <Link href={`/admin/modules/${module.id}`} className="truncate transition hover:text-ink">
            {module.title}
          </Link>
          <ChevronRight size={13} className="text-ink-faint" />
          <span className="truncate font-medium text-ink">{lesson.title || "Untitled lesson"}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {dirty ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-medium/30 bg-medium-soft px-2.5 py-1.5 text-[11px] font-medium text-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-medium" />
              Unsaved changes
            </span>
          ) : savedAt ? (
            <span className="text-[11px] text-ink-3">Saved · {savedAt}</span>
          ) : (
            <Badge variant={isPublished ? "success" : "neutral"}>
              {isPublished ? "Published" : "Draft"}
            </Badge>
          )}
          <Button variant="secondary" size="sm" onClick={() => setPreviewMode(true)}>
            <Eye size={14} />
            Preview
          </Button>
          {isPublished ? (
            <Button variant="secondary" size="sm" onClick={() => setConfirmPublish(true)}>
              <Undo2 size={14} />
              Unpublish
            </Button>
          ) : (
            <Button variant="accent" size="sm" onClick={() => setConfirmPublish(true)}>
              <Send size={14} />
              Publish
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={saveDraft} disabled={!dirty}>
            Save draft
          </Button>
        </div>
      </div>

      <div>
        <input
          value={lesson.title}
          onChange={(event) => {
            updateLesson(moduleId, lessonId, {
              title: event.target.value,
              slug: slugify(event.target.value),
            });
            touch();
          }}
          placeholder="Lesson title"
          className="w-full border-0 bg-transparent text-3xl font-semibold tracking-tight text-ink outline-none placeholder:text-ink-faint"
        />
        <Textarea
          value={lesson.description}
          onChange={(event) => {
            updateLesson(moduleId, lessonId, { description: event.target.value });
            touch();
          }}
          placeholder="Add a short description for this lesson…"
          rows={2}
          className="mt-2 resize-none border-0 bg-transparent px-0 text-[15px] leading-7 text-ink-muted shadow-none hover:border-0 focus:border-0 focus-visible:ring-0"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2 border-b border-line pb-5 text-[11px] text-ink-3">
          <span>/{lesson.slug}</span>
          <span aria-hidden="true">·</span>
          <span>
            {blocks.length} block{blocks.length === 1 ? "" : "s"}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Type{" "}
            <kbd className="rounded border border-line bg-panel-muted px-1 py-0.5 text-[10px] font-medium">
              /
            </kbd>{" "}
            in an empty block to insert
          </span>
        </div>
      </div>

      <div
        className="space-y-1 pb-10"
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => {
          if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
            move(dragIndex, overIndex);
          }
          setDragIndex(null);
          setOverIndex(null);
        }}
      >
        {blocks.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Start building this lesson"
            description="Add text, code, visuals or assessments. Type “/” in an empty block to open the picker."
            action={
              <Button variant="accent" size="sm" onClick={() => openPicker(0, null)}>
                <Plus size={14} />
                Add first block
              </Button>
            }
          />
        ) : (
          blocks.map((block, blockIndex) => (
            <div
              key={block.id}
              onKeyDown={(event) => handleBlockKeyDown(event, block, blockIndex)}
              onDragOver={(event) => {
                event.preventDefault();
                setOverIndex(blockIndex);
              }}
              className={cn(
                "group relative rounded-xl border border-edge bg-panel px-4 pb-4 pt-5 shadow-card transition-colors",
                dragIndex === blockIndex && "opacity-40",
                overIndex === blockIndex &&
                  dragIndex !== null &&
                  dragIndex !== blockIndex &&
                  "border-accent/50 bg-accent-soft/30",
              )}
            >
              <BlockToolbar
                onDuplicate={() => {
                  duplicateBlock(moduleId, lessonId, block.id);
                  touch();
                }}
                onDelete={() => {
                  deleteBlock(moduleId, lessonId, block.id);
                  touch();
                }}
                onInsertBelow={() => openPicker(blockIndex + 1, null)}
                dragProps={{
                  draggable: true,
                  onDragStart: () => setDragIndex(blockIndex),
                  onDragEnd: () => {
                    setDragIndex(null);
                    setOverIndex(null);
                  },
                }}
              />
              <BlockEditorHost
                block={block}
                update={(patch) => {
                  updateBlockData(moduleId, lessonId, block.id, patch);
                  touch();
                }}
                onTypeChange={(type) => {
                  replaceBlockType(moduleId, lessonId, block.id, type);
                  touch();
                }}
              />
            </div>
          ))
        )}

        {blocks.length > 0 ? (
          <div className="flex items-center gap-2 pt-4">
            <Button variant="secondary" size="sm" onClick={() => openPicker(blocks.length, null)}>
              <Plus size={15} />
              Add Block
            </Button>
            <span className="text-[11px] text-ink-3">or type “/” in an empty paragraph</span>
          </div>
        ) : null}
      </div>

      <nav className="flex items-center justify-between gap-3 border-t border-line pt-6">
        {prev ? (
          <button
            type="button"
            onClick={() => router.push(`/admin/lessons/${module.id}/${prev.id}`)}
            className="gc-focus-ring max-w-[45%] rounded-lg text-left"
          >
            <span className="block text-[11px] text-ink-3">Previous lesson</span>
            <span className="block truncate text-sm font-medium hover:text-accent-strong">
              {prev.title}
            </span>
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button
            type="button"
            onClick={() => router.push(`/admin/lessons/${module.id}/${next.id}`)}
            className="gc-focus-ring max-w-[45%] rounded-lg text-right"
          >
            <span className="block text-[11px] text-ink-3">Next lesson</span>
            <span className="block truncate text-sm font-medium hover:text-accent-strong">
              {next.title}
            </span>
          </button>
        ) : (
          <span />
        )}
      </nav>

      <BlockPicker
        open={picker.open}
        onClose={() => setPicker((state) => ({ ...state, open: false }))}
        onSelect={handlePick}
      />

      <ConfirmDialog
        open={confirmPublish}
        title={isPublished ? "Unpublish lesson?" : "Publish lesson?"}
        description={
          isPublished
            ? "Learners will no longer have access to this lesson until it is published again."
            : "This lesson will become visible to learners inside its module."
        }
        confirmLabel={isPublished ? "Unpublish" : "Publish"}
        danger={isPublished}
        onCancel={() => setConfirmPublish(false)}
        onConfirm={() => {
          setLessonStatus(moduleId, lessonId, isPublished ? "draft" : "published");
          if (!isPublished && module.status === "draft") {
            useCmsStore.getState().setModuleStatus(moduleId, "published");
          }
          setDirty(false);
          toast.success(isPublished ? "Lesson unpublished" : "Lesson published");
          setConfirmPublish(false);
        }}
      />
    </div>
  );
}

export default LessonEditor;
