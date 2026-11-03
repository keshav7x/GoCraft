import type { ReactNode } from "react";
import { Toaster } from "sonner";
import DashboardShell from "@/app/components/Dashboard/DashboardShell";
import { XpToast } from "@/app/components/shared/XpToast";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell>
      {children}
      <XpToast />
      <Toaster position="bottom-right" richColors />
    </DashboardShell>
  );
}
