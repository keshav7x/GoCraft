import type { ReactNode } from "react";
import { Toaster } from "sonner";
import DashboardShell from "../components/Dashboard/DashboardShell";
import { XpToast } from "../components/shared/XpToast";
import { ExitPreviewBanner } from "../components/shared/ExitPreviewBanner";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardShell>
      <ExitPreviewBanner />
      {children}
      <XpToast />
      <Toaster position="bottom-right" richColors />
    </DashboardShell>
  );
}
