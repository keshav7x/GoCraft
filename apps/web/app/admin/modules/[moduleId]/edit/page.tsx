"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderKanban } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { EmptyState } from "@/app/components/ui/empty-state";
import { ModuleEditor } from "@/app/components/admin/ModuleEditor";
import { useCmsStore } from "@/app/lib/admin/store";

export default function EditModulePage() {
  const params = useParams<{ moduleId: string }>();
  const router = useRouter();
  const moduleId = params.moduleId;

  const module = useCmsStore((state) => state.modules.find((m) => m.id === moduleId));
  const updateModule = useCmsStore((state) => state.updateModule);

  if (!module) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Module not found"
        description="It may have been deleted."
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title={`Edit ${module.title}`} description="Update module metadata and cover." />
      <ModuleEditor
        initial={module}
        submitLabel="Save changes"
        onSubmit={(input) => {
          updateModule(module.id, input);
          toast.success("Module updated");
          router.push(`/admin/modules/${module.id}`);
        }}
      />
    </div>
  );
}
