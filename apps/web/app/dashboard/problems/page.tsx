import { Suspense } from "react";
import { ProblemsClient } from "./ProblemsClient";

export const metadata = {
  title: "Problems — GoCraft",
};

export default function ProblemsPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-panel-muted" />}>
      <ProblemsClient />
    </Suspense>
  );
}
