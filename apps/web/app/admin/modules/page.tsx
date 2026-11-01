"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { EmptyState } from "@/app/components/ui/empty-state";
import { buttonVariants } from "@/app/components/ui/button";
import { ModuleCard } from "@/app/components/admin/ModuleCard";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { useCmsStore } from "@/app/lib/admin/store";
import { cn } from "@/app/lib/utils";

export default function ModulesPage() {
  const router = useRouter();
  const modules = useCmsStore((state) => state.modules);
  const deleteModule = useCmsStore((state) => state.deleteModule);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const sorted = [...modules].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modules"
        description="Ordered modules of the GoCraft curriculum."
        actions={
          <Link href="/admin/modules/new" className={cn(buttonVariants({ variant: "accent" }))}>
            <Plus size={15} />
            Create Module
          </Link>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No modules yet"
          description="Create your first module — lessons and blocks come next."
          action={
            <Link href="/admin/modules/new" className={cn(buttonVariants({ variant: "accent" }))}>
              <Plus size={15} />
              Create Module
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onEdit={() => router.push(`/admin/modules/${module.id}/edit`)}
              onDelete={() => setDeleteTarget(module.id)}
            />
          ))}
        </div>
      )}

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
