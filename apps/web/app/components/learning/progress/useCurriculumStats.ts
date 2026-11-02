"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  type CurriculumProgress,
  type Module,
} from "@/app/lib/curriculum/types";
import { getTrpcErrorInfo } from "@/app/lib/trpc";
import { DataState, ProgressOverview } from "./progress/ProgressOverview";

/**
 * Aggregates curriculum progress rows per module.
 * Returns moduleId → completed lesson count, plus totals.
 */
export function useCurriculumStats(modules: Module[] | undefined) {
  const trpc = useTRPC();
  const progressQuery = useQuery(
    trpc.progress.getCurriculumProgress.queryOptions()
  );

  const progress = (progressQuery.data ?? []) as CurriculumProgress;

  const stats = useMemo(() => {
    const byModule = new Map<number, number>();
    let completedLessons = 0;
    for (const row of progress) {
      if (row.status !== "completed") continue;
      completedLessons += 1;
      byModule.set(row.moduleId, (byModule.get(row.moduleId) ?? 0) + 1);
    }

    const totalLessons =
      modules?.reduce((n, m) => n + m.lessonsCount, 0) ?? 0;
    const totalModules = modules?.length ?? 0;
    const completedModules =
      modules?.filter(
        (m) =>
          m.lessonsCount > 0 &&
          (byModule.get(m.id) ?? 0) >= m.lessonsCount
      ).length ?? 0;

    return {
      byModule,
      completedLessons,
      totalLessons,
      completedModules,
      totalModules,
      loading: progressQuery.isLoading,
      error: progressQuery.error
        ? getTrpcErrorInfo(progressQuery.error).message
        : null,
    };
  }, [progress, modules, progressQuery.isLoading, progressQuery.error]);

  return { ...stats, progress, refetch: progressQuery.refetch };
}

/** Lessons in `rows` that are completed, keyed by lessonId. */
export function completedLessonSet(
  rows: CurriculumProgress | undefined
): Set<number> {
  const set = new Set<number>();
  for (const row of rows ?? []) {
    if (row.status === "completed") set.add(row.lessonId);
  }
  return set;
}

export { DataState, ProgressOverview };
