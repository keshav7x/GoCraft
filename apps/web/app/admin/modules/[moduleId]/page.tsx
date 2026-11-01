"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Eye,
  Pencil,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Dialog } from "@/app/components/ui/dialog";
import { EmptyState } from "@/app/components/ui/empty-state";
import { LessonList } from "@/app/components/admin/LessonList";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { useCmsStore } from "@/app/lib/admin/store";
import { formatMinutes, DIFFICULTY_LABEL, DIFFICULTY_TONE } from "@/app/lib/admin/format";
import { cn } from "@/app/lib/utils";

export default function ModuleWorkspacePage() {
  const params = useParams<{ moduleId: string }>();
  const router = useRouter();
  const moduleId = params.moduleId;

  const module = useCmsStore((state) => state.modules.find((m) => m.id === moduleId));
  const setModuleStatus = useCmsStore((state) => state.setModuleStatus);
  const deleteModule = useCmsStore((state) => state.deleteModule);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!module) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Module not found"
        description="It may have been deleted. Head back to your modules."
        action={
          <Link href="/admin/modules" className="text-sm font-medium text-accent-strong hover:underline">
            Back to modules
          </Link>
        }
      />
    );
  }

  const isPublished = module.status === "published";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/modules"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 transition hover:text-ink"
        >
          <ArrowLeft size={14} />
          Modules
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(true)}>
            <Eye size={14} />
            Preview Module
          </Button>
          <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/modules/${module.id}/edit`)}>
            <Pencil size={14} />
            Edit Module
          </Button>
          {isPublished ? (
            <Button variant="secondary" size="sm" onClick={() => setConfirmPublish(true)}>
              <Undo2 size={14} />
              Unpublish
            </Button>
          ) : (
            <Button variant="accent" size="sm" onClick={() => setConfirmPublish(true)}>
              <Send size={14} />
              Publish Module
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-edge bg-panel shadow-card">
          {module.coverImage ? (
            <div className="aspect-[16/6] border-b border-edge bg-panel-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={module.coverImage} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{module.title}</h1>
              <Badge variant={isPublished ? "success" : "neutral"}>
                {isPublished ? "Published" : "Draft"}
              </Badge>
              <Badge variant={DIFFICULTY_TONE[module.difficulty] ?? "neutral"}>
                {DIFFICULTY_LABEL[module.difficulty]}
              </Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">{module.description}</p>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-3">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen size={13} />
                {module.lessons.length} lesson{module.lessons.length === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} />
                {formatMinutes(module.estimatedDuration)}
              </span>
              <span>Order #{module.displayOrder}</span>
            </div>

            {module.objectives.length > 0 ? (
              <div className="mt-5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-4">
                  Learning objectives
                </h2>
                <ul className="mt-2 space-y-1.5">
                  {module.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-ink-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-panel p-5 shadow-card">
          <h2 className="text-sm font-semibold tracking-tight">Publication</h2>
          <p className="mt-1 text-xs leading-5 text-ink-muted">
            {isPublished
              ? "This module is visible to learners. Unpublishing hides it and its published lessons."
              : "This module is a draft. Publish it when the lessons inside are ready."}
          </p>
          <div
            className={cn(
              "mt-4 rounded-lg border px-3 py-2.5 text-xs font-medium",
              isPublished
                ? "border-easy/25 bg-easy-soft text-easy"
                : "border-line bg-panel-muted text-ink-3",
            )}
          >
            Status: {isPublished ? "Published" : "Draft"} · Updated{" "}
            {new Date(module.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <LessonList moduleId={module.id} />

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`Preview: ${module.title}`}
        description="How learners see this module."
        className="max-w-lg"
        footer={
          <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
            Close preview
          </Button>
        }
      >
        <ul className="max-h-[50vh] space-y-2 overflow-y-auto gc-scrollbar">
          {module.lessons.map((lesson, index) => (
            <li key={lesson.id}>
              <Link
                href={`/admin/lessons/${module.id}/${lesson.id}?preview=1`}
                onClick={() => setPreviewOpen(false)}
                className="gc-focus-ring flex items-center gap-3 rounded-lg border border-edge px-3.5 py-3 transition hover:border-edge-strong hover:bg-panel-muted"
              >
                <span className="w-5 text-center text-xs font-semibold tabular-nums text-ink-4">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{lesson.title}</span>
                  <span className="block truncate text-xs text-ink-3">{lesson.description}</span>
                </span>
                <Badge variant={lesson.status === "published" ? "success" : "neutral"}>
                  {lesson.status === "published" ? "Published" : "Draft"}
                </Badge>
              </Link>
            </li>
          ))}
          {module.lessons.length === 0 ? (
            <li className="py-6 text-center text-sm text-ink-3">No lessons yet.</li>
          ) : null}
        </ul>
      </Dialog>

      <ConfirmDialog
        open={confirmPublish}
        title={isPublished ? "Unpublish module?" : "Publish module?"}
        description={
          isPublished
            ? "Learners will no longer see this module in their catalog."
            : "This module will become visible to learners. You can unpublish at any time."
        }
        confirmLabel={isPublished ? "Unpublish" : "Publish"}
        danger={isPublished}
        onCancel={() => setConfirmPublish(false)}
        onConfirm={() => {
          setModuleStatus(module.id, isPublished ? "draft" : "published");
          toast.success(isPublished ? "Module unpublished" : "Module published");
          setConfirmPublish(false);
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete module?"
        description={`"${module.title}" and its ${module.lessons.length} lesson(s) will be permanently removed.`}
        confirmLabel="Delete module"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteModule(module.id);
          toast.success("Module deleted");
          router.push("/admin/modules");
        }}
      />
    </div>
  );
}
