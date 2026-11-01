"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, BookOpen, GripVertical, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Dialog } from "@/app/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/app/components/ui/input";
import { EmptyState } from "@/app/components/ui/empty-state";
import { ConfirmDialog } from "./ConfirmDialog";
import { useCmsStore } from "@/app/lib/admin/store";
import { formatMinutes, DIFFICULTY_LABEL, DIFFICULTY_TONE } from "@/app/lib/admin/format";
import { slugify, type AdminDifficulty, type Lesson } from "@/app/lib/admin/types";
import { cn } from "@/app/lib/utils";

type LessonListProps = {
  moduleId: string;
};

export function LessonList({ moduleId }: LessonListProps) {
  const router = useRouter();
  const module = useCmsStore((state) => state.modules.find((m) => m.id === moduleId));
  const createLesson = useCmsStore((state) => state.createLesson);
  const deleteLesson = useCmsStore((state) => state.deleteLesson);
  const reorderLessons = useCmsStore((state) => state.reorderLessons);

  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("25");
  const [difficulty, setDifficulty] = useState<AdminDifficulty>("beginner");

  const lessons = module?.lessons ?? [];

  function resetForm() {
    setTitle("");
    setDescription("");
    setDuration("25");
    setDifficulty("beginner");
  }

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const lesson = createLesson(moduleId, {
      title: title.trim(),
      description: description.trim(),
      slug: slugify(title),
      estimatedDuration: Math.max(1, Number(duration) || 1),
      difficulty,
      status: "draft",
    });
    setAddOpen(false);
    resetForm();
    if (lesson) router.push(`/admin/lessons/${moduleId}/${lesson.id}`);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= lessons.length) return;
    reorderLessons(moduleId, from, to);
  }

  return (
    <div className="rounded-xl border border-edge bg-panel shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-edge px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Lessons</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {lessons.length} lesson{lessons.length === 1 ? "" : "s"} · drag to reorder
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} />
          Add Lesson
        </Button>
      </div>

      {lessons.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={BookOpen}
            title="No lessons yet"
            description="Add the first lesson to start composing blocks."
            action={
              <Button variant="accent" size="sm" onClick={() => setAddOpen(true)}>
                <Plus size={14} />
                Add Lesson
              </Button>
            }
          />
        </div>
      ) : (
        <ul
          className="divide-y divide-edge"
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
              move(dragIndex, overIndex);
            }
            setDragIndex(null);
            setOverIndex(null);
          }}
        >
          {lessons.map((lesson, index) => (
            <li
              key={lesson.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setOverIndex(index);
              }}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 transition-colors sm:px-5",
                dragIndex === index && "opacity-40",
                overIndex === index && dragIndex !== null && dragIndex !== index && "bg-accent-soft/50",
              )}
            >
              <span
                aria-hidden="true"
                className="cursor-grab text-ink-faint transition group-hover:text-ink-3 active:cursor-grabbing"
              >
                <GripVertical size={15} />
              </span>
              <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-ink-4">
                {index + 1}
              </span>

              <button
                type="button"
                onClick={() => router.push(`/admin/lessons/${moduleId}/${lesson.id}`)}
                className="gc-focus-ring min-w-0 flex-1 rounded-lg text-left"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium text-ink">{lesson.title}</span>
                  <Badge variant={lesson.status === "published" ? "success" : "neutral"}>
                    {lesson.status === "published" ? "Published" : "Draft"}
                  </Badge>
                  <Badge variant={DIFFICULTY_TONE[lesson.difficulty] ?? "neutral"}>
                    {DIFFICULTY_LABEL[lesson.difficulty]}
                  </Badge>
                </span>
                <span className="mt-0.5 block truncate text-xs text-ink-3">
                  /{lesson.slug} · {formatMinutes(lesson.estimatedDuration)} ·{" "}
                  {lesson.blocks.length} block{lesson.blocks.length === 1 ? "" : "s"}
                </span>
              </button>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  className="focus-ring rounded-lg p-1.5 text-ink-faint transition hover:bg-panel-muted hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === lessons.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="focus-ring rounded-lg p-1.5 text-ink-faint transition hover:bg-panel-muted hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${lesson.title}`}
                  onClick={() => setDeleteTarget(lesson)}
                  className="focus-ring rounded-lg p-1.5 text-ink-faint transition hover:bg-hard-soft hover:text-hard"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add lesson"
        description="Create a lesson inside this module, then compose its blocks."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleCreate} disabled={!title.trim()}>
              Create lesson
            </Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={handleCreate}>
          <div>
            <Label htmlFor="lesson-title">Lesson title</Label>
            <Input
              id="lesson-title"
              className="mt-1.5"
              placeholder="e.g. Goroutines and Channels"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="lesson-description">Description</Label>
            <Textarea
              id="lesson-description"
              className="mt-1.5 min-h-[72px]"
              placeholder="One-sentence summary of the lesson"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lesson-duration">Duration (min)</Label>
              <Input
                id="lesson-duration"
                type="number"
                min={1}
                className="mt-1.5"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lesson-difficulty">Difficulty</Label>
              <Select
                id="lesson-difficulty"
                className="mt-1.5"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as AdminDifficulty)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </div>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete lesson?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" and its ${deleteTarget.blocks.length} block(s) will be removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete lesson"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteLesson(moduleId, deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
