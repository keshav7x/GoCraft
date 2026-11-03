"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div>
        <h1 className="text-lg font-semibold text-ink">Something went wrong</h1>
        <p className="mt-1.5 max-w-md text-sm text-ink-muted">
          We couldn&apos;t load this page. This is usually a temporary issue —
          try again, or head back home.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="gc-focus-ring rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="gc-focus-ring rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-2 transition hover:bg-surface-2"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
