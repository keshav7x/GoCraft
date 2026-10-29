import DashboardShell from "@/app/components/Dashboard/DashboardShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
