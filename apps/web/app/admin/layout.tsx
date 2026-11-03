"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/app/components/admin/AdminShell";
import { clearSimulatedRole, fetchRealRole } from "@/app/lib/admin/role";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchRealRole().then((realRole) => {
      if (cancelled) return;
      // Admin UI is gated by the real session role only — the simulate
      // flag is a preview and never grants (or revokes) studio access.
      if (realRole !== "admin") {
        router.replace("/");
        return;
      }
      // A real admin re-entering the studio exits any user preview.
      clearSimulatedRole();
      setAllowed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!allowed) {
    return (
      <div data-accent="emerald" className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-sm text-ink-3">Checking admin access…</p>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
