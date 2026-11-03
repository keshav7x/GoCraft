"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function RootError({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center text-slate-950">
      <div>
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="mt-1.5 max-w-md text-sm text-slate-600">
          An unexpected error occurred. Try again, or return to the home page.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
