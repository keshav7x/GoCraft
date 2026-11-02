"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/app/components/ui/page-header";
import { ModuleEditor } from "@/app/components/admin/ModuleEditor";
import { useCmsStore } from "@/app/lib/admin/store";

export default function NewModulePage() {
  const router = useRouter();
  const createModule = useCmsStore((state) => state.createModule);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Create module"
        description="Define the module shell first — you can add lessons right after."
      />
      <ModuleEditor
        submitLabel="Create module"
        onSubmit={(input) => {
          const module = createModule(input);
          toast.success(`Module "${module.title}" created`);
          router.push(`/admin/modules/${module.id}`);
        }}
      />
    </div>
  );
}
