"use client";

import { Suspense } from "react";
import { LessonEditor } from "@/app/components/admin/editor/LessonEditor";

export default function LessonEditorPage() {
  return (
    <Suspense
      fallback={<p className="py-20 text-center text-sm text-ink-3">Loading editor…</p>}
    >
      <LessonEditor />
    </Suspense>
  );
}
