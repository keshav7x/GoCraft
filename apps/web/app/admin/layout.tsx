"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/app/components/admin/AdminShell";
import { resolveRole } from "@/app/lib/admin/role";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    resolveRole().then((role) => {
      if (cancelled) return;
      if (role !== "admin") {
        router.replace("/");
      } else {
        setAllowed(true);
      }
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
