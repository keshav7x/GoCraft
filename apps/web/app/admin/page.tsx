"use client";

import Link from "next/link";
import {
  BookOpen,
  Clock,
  FileEdit,
  FolderKanban,
  Plus,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { EmptyState } from "@/app/components/ui/empty-state";
import { buttonVariants } from "@/app/components/ui/button";
import { allLessons, useCmsStore } from "@/app/lib/admin/store";
import { formatRelative } from "@/app/lib/admin/format";
import { cn } from "@/app/lib/utils";

export default function AdminOverviewPage() {
  const modules = useCmsStore((state) => state.modules);
  const lessons = allLessons(modules);

  const publishedModules = modules.filter((m) => m.status === "published").length;
  const draftModules = modules.filter((m) => m.status === "draft").length;
  const draftLessons = lessons.filter((l) => l.lesson.status === "draft").length;

  const recent = [...lessons]
    .sort((a, b) => b.lesson.updatedAt.localeCompare(a.lesson.updatedAt))
    .slice(0, 5);

  const stats = [
    { label: "Modules", value: modules.length, icon: FolderKanban },
    { label: "Published modules", value: publishedModules, icon: TrendingUp },
    { label: "Draft modules", value: draftModules, icon: FileEdit },
    { label: "Total lessons", value: lessons.length, icon: BookOpen },
    { label: "Draft lessons", value: draftLessons, icon: Clock },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="A quick pulse on your curriculum before you start editing."
        actions={
          <Link
            href="/admin/modules/new"
            className={cn(buttonVariants({ variant: "accent" }))}
          >
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

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recently edited</CardTitle>
            <Link href="/admin/content" className="text-xs font-medium text-accent-strong hover:underline">
              View all content
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-edge px-0 py-0">
            {recent.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No lessons yet"
                description="Create a module and add your first lesson to get started."
                className="m-4"
              />
            ) : (
              recent.map(({ module, lesson }) => (
                <Link
                  key={lesson.id}
                  href={`/admin/lessons/${module.id}/${lesson.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-panel-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{lesson.title}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-3">{module.title}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant={lesson.status === "published" ? "success" : "neutral"}>
                      {lesson.status === "published" ? "Published" : "Draft"}
                    </Badge>
                    <span className="hidden text-xs text-ink-3 sm:block">
                      {formatRelative(lesson.updatedAt)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 py-4">
            {[
              { label: "Create a module", href: "/admin/modules/new", icon: Plus },
              { label: "Browse the content dashboard", href: "/admin/content", icon: FolderKanban },
              { label: "Open the media library", href: "/admin/media", icon: BookOpen },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg border border-edge px-3.5 py-3 text-sm font-medium text-ink transition hover:border-edge-strong hover:bg-panel-muted"
              >
                <action.icon size={15} className="text-accent-strong" />
                {action.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
