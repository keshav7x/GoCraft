"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, FileEdit, FolderKanban, Plus, TrendingUp } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { EmptyState } from "@/app/components/ui/empty-state";
import { SearchInput, Select } from "@/app/components/ui/input";
import { buttonVariants } from "@/app/components/ui/button";
import { ModuleCard } from "@/app/components/admin/ModuleCard";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { allLessons, useCmsStore } from "@/app/lib/admin/store";
import { formatRelative } from "@/app/lib/admin/format";
import { cn } from "@/app/lib/utils";

type StatusFilter = "all" | "published" | "draft";
type SortKey = "recent" | "title" | "order" | "lessons";

export default function ContentDashboardPage() {
  const router = useRouter();
  const modules = useCmsStore((state) => state.modules);
  const deleteModule = useCmsStore((state) => state.deleteModule);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const lessons = allLessons(modules);
  const publishedModules = modules.filter((m) => m.status === "published").length;
  const draftModules = modules.filter((m) => m.status === "draft").length;
  const draftLessons = lessons.filter((l) => l.lesson.status === "draft").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = modules.filter((m) => {
      const matchesQuery =
        !q || m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
      const matchesStatus = status === "all" || m.status === status;
      return matchesQuery && matchesStatus;
    });
    list = [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "order") return a.displayOrder - b.displayOrder;
      if (sort === "lessons") return b.lessons.length - a.lessons.length;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
    return list;
  }, [modules, query, status, sort]);

  const recentModules = [...modules]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);
  const recentLessons = [...lessons]
    .sort((a, b) => b.lesson.updatedAt.localeCompare(a.lesson.updatedAt))
    .slice(0, 5);

  const stats = [
    { label: "All modules", value: modules.length, icon: FolderKanban },
    { label: "Published modules", value: publishedModules, icon: TrendingUp },
    { label: "Draft modules", value: draftModules, icon: FileEdit },
    { label: "Total lessons", value: lessons.length, icon: BookOpen },
    { label: "Draft lessons", value: draftLessons, icon: FileEdit },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Content"
        description="Everything in your curriculum — modules, lessons and their publishing state."
        actions={
          <Link href="/admin/modules/new" className={cn(buttonVariants({ variant: "accent" }))}>
            <Plus size={15} />
            Create Module
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-ink-3">{stat.label}</span>
                <stat.icon size={14} className="text-ink-4" />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            placeholder="Search modules…"
            className="sm:max-w-xs sm:flex-1"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
          />
          <div className="flex items-center gap-2">
            <Select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              className="w-40"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
            <Select
              aria-label="Sort modules"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="w-44"
            >
              <option value="recent">Recently edited</option>
              <option value="title">Title A–Z</option>
              <option value="order">Display order</option>
              <option value="lessons">Most lessons</option>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No modules match"
            description="Adjust your search or filters, or create a new module to get started."
            action={
              <Link href="/admin/modules/new" className={cn(buttonVariants({ variant: "accent" }))}>
                <Plus size={15} />
                Create Module
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onEdit={() => router.push(`/admin/modules/${module.id}/edit`)}
                onDelete={() => setDeleteTarget(module.id)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <div className="border-b border-edge px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">Recently edited modules</h2>
          </div>
          <ul className="divide-y divide-edge">
            {recentModules.map((module) => (
              <li key={module.id}>
                <Link
                  href={`/admin/modules/${module.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-panel-muted"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{module.title}</span>
                    <span className="block text-xs text-ink-3">
                      {formatRelative(module.updatedAt)}
                    </span>
                  </span>
                  <Badge variant={module.status === "published" ? "success" : "neutral"}>
                    {module.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="shadow-card">
          <div className="border-b border-edge px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">Recently edited lessons</h2>
          </div>
          <ul className="divide-y divide-edge">
            {recentLessons.map(({ module, lesson }) => (
              <li key={lesson.id}>
                <Link
                  href={`/admin/lessons/${module.id}/${lesson.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-panel-muted"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{lesson.title}</span>
                    <span className="block truncate text-xs text-ink-3">
                      {module.title} · {formatRelative(lesson.updatedAt)}
                    </span>
                  </span>
                  <Badge variant={lesson.status === "published" ? "success" : "neutral"}>
                    {lesson.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete module?"
        description="The module, its lessons and all lesson blocks will be removed. This cannot be undone."
        confirmLabel="Delete module"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteModule(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
