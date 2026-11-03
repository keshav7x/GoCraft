"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearSimulatedRole,
  fetchRealRole,
  readSimulatedRole,
} from "@/app/lib/admin/role";

/**
 * Shown when a signed-in admin is previewing the learner experience.
 * One click restores the studio (clears the preview flag).
 */
export function ExitPreviewBanner() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [real, simulated] = await Promise.all([
        fetchRealRole(),
        Promise.resolve(readSimulatedRole()),
      ]);
      if (cancelled) return;
      setVisible(real === "admin" && simulated === "user");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  function exitPreview(href?: string) {
    setBusy(true);
    clearSimulatedRole();
    setVisible(false);
    if (href) {
      router.push(href);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-accent/30 bg-accent-soft px-4 py-2 text-sm sm:px-6">
      <p className="text-ink-2">
        <span className="font-semibold text-accent-ink">Previewing learner view.</span>{" "}
        Server actions still use your admin account.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => exitPreview()}
          className="focus-ring rounded-lg border border-accent/40 bg-panel px-3 py-1.5 text-[13px] font-medium text-accent-ink transition hover:bg-panel-muted disabled:opacity-60"
        >
          Exit preview
        </button>
        <Link
          href="/admin"
          onClick={() => exitPreview("/admin")}
          className="focus-ring rounded-lg bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-contrast transition hover:opacity-90"
        >
          Open studio
        </Link>
      </div>
    </div>
  );
}
