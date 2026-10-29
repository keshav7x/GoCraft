import type { ReactNode } from "react";
import { Toaster } from "sonner";
import DashboardShell from "../components/Dashboard/DashboardShell";
import { XpToast } from "../components/shared/XpToast";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardShell>
      {children}
      <XpToast />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "gocraft-toast",
          },
        }}
        theme="system"
      />
    </DashboardShell>
  );
}
