"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { Badge } from "@/app/components/ui/badge";
import { EmptyState } from "@/app/components/ui/empty-state";
import { SearchInput, Select } from "@/app/components/ui/input";
import { allLessons, useCmsStore } from "@/app/lib/admin/store";
import { formatMinutes, DIFFICULTY_LABEL, DIFFICULTY_TONE } from "@/app/lib/admin/format";

export default function LessonsPage() {
  const modules = useCmsStore((state) => state.modules);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");

  const lessons = allLessons(modules);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lessons
      .filter(({ module, lesson }) => {
        const matchesQuery =
          !q ||
          lesson.title.toLowerCase().includes(q) ||
          module.title.toLowerCase().includes(q) ||
          lesson.slug.includes(q);
        const matchesStatus = status === "all" || lesson.status === status;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => b.lesson.updatedAt.localeCompare(a.lesson.updatedAt));
  }, [lessons, query, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lessons"
        description="Every lesson across all modules, newest edits first."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          placeholder="Search lessons…"
          className="sm:max-w-xs sm:flex-1"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
        />
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => setStatus(event.target.value as "all" | "published" | "draft")}
          className="w-40"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No lessons found"
          description="Open a module and add a lesson to start authoring."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-edge bg-panel shadow-card">
          <ul className="divide-y divide-edge">
            {filtered.map(({ module, lesson }) => (
              <li key={lesson.id}>
                <Link
                  href={`/admin/lessons/${module.id}/${lesson.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-panel-muted"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {lesson.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-3">
                      {module.title} · /{lesson.slug} · {lesson.blocks.length} block
                      {lesson.blocks.length === 1 ? "" : "s"} ·{" "}
                      {formatMinutes(lesson.estimatedDuration)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge variant={DIFFICULTY_TONE[lesson.difficulty] ?? "neutral"}>
                      {DIFFICULTY_LABEL[lesson.difficulty]}
                    </Badge>
                    <Badge variant={lesson.status === "published" ? "success" : "neutral"}>
                      {lesson.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
