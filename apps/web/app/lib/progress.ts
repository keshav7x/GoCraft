import { CURRICULUM } from "@/app/lib/demo/curriculum";
import type { CourseModule, Lesson } from "@/app/lib/demo/types";
import { percent } from "@/app/lib/utils";

export type ModuleStatus = "locked" | "available" | "in-progress" | "completed";

export type ModuleProgress = {
  done: number;
  total: number;
  readyDone: number;
  readyTotal: number;
  pct: number;
  status: ModuleStatus;
};

export function lessonIsDone(completed: string[], moduleId: string, lessonId: string): boolean {
  return completed.includes(`${moduleId}/${lessonId}`);
}

export function moduleProgress(
  module: CourseModule,
  completed: string[],
): ModuleProgress {
  const total = module.lessons.length;
  const ready = module.lessons.filter((lesson) => lesson.status === "ready");
  const done = module.lessons.filter((lesson) =>
    lessonIsDone(completed, module.id, lesson.id),
  ).length;
  const readyDone = ready.filter((lesson) =>
    lessonIsDone(completed, module.id, lesson.id),
  ).length;

  const unlocked = isModuleUnlocked(module, completed);
  let status: ModuleStatus;
  if (!unlocked) status = "locked";
  else if (done === total) status = "completed";
  else if (done > 0) status = "in-progress";
  else status = "available";

  return {
    done,
    total,
    readyDone,
    readyTotal: ready.length,
    pct: percent(done, total),
    status,
  };
}

export function isModuleUnlocked(module: CourseModule, completed: string[]): boolean {
  if (module.prerequisites.length === 0) return true;
  return module.prerequisites.every((prereqId) => {
    const prereq = CURRICULUM.find((entry) => entry.id === prereqId);
    if (!prereq) return true;
    const ready = prereq.lessons.filter((lesson) => lesson.status === "ready");
    if (ready.length === 0) return true;
    return ready.every((lesson) => lessonIsDone(completed, prereq.id, lesson.id));
  });
}

export function curriculumTotals(completed: string[]) {
  let total = 0;
  let done = 0;
  let readyTotal = 0;
  let readyDone = 0;
  let totalMinutes = 0;

  for (const module of CURRICULUM) {
    for (const lesson of module.lessons) {
      total += 1;
      if (lesson.status === "ready") {
        readyTotal += 1;
        totalMinutes += lesson.minutes;
      }
      if (lessonIsDone(completed, module.id, lesson.id)) {
        done += 1;
        if (lesson.status === "ready") readyDone += 1;
      }
    }
  }

  return {
    total,
    done,
    readyTotal,
    readyDone,
    pct: percent(done, total),
    readyPct: percent(readyDone, readyTotal),
    totalMinutes,
  };
}

export type ContinueTarget =
  | { kind: "lesson"; module: CourseModule; lesson: Lesson }
  | { kind: "next-module"; module: CourseModule }
  | null;

export function findContinueTarget(completed: string[]): ContinueTarget {
  for (const module of CURRICULUM) {
    if (!isModuleUnlocked(module, completed)) continue;
    for (const lesson of module.lessons) {
      if (lesson.status !== "ready") continue;
      if (!lessonIsDone(completed, module.id, lesson.id)) {
        return { kind: "lesson", module, lesson };
      }
    }
  }
  for (const module of CURRICULUM) {
    if (isModuleUnlocked(module, completed)) {
      return { kind: "next-module", module };
    }
  }
  return null;
}

export function adjacentLessons(moduleId: string, lessonId: string) {
  const flat = CURRICULUM.flatMap((module) =>
    module.lessons.map((lesson) => ({ module, lesson })),
  );
  const index = flat.findIndex(
    (entry) => entry.module.id === moduleId && entry.lesson.id === lessonId,
  );
  return {
    previous: index > 0 ? flat[index - 1] : undefined,
    next: index !== -1 && index < flat.length - 1 ? flat[index + 1] : undefined,
  };
}
