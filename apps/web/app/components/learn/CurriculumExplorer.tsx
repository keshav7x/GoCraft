"use client";

import type { CurriculumModule, Lesson } from "../../lib/demo/types";
import { useDemoStore } from "../../lib/progress-store";
import { Card } from "../ui/card";
import { ModuleRow } from "./ModuleRow";

type PlannedModule = {
  id: string;
  title: string;
  objective: string;
  order: number;
  prerequisiteIds: string[];
};

export function CurriculumExplorer({
  modules,
  planned,
}: {
  modules: CurriculumModule[];
  planned: PlannedModule[];
}) {
  const completedLessonIds = useDemoStore((s) => s.completedLessonIds);

  function moduleCompleted(id: string) {
    const module = modules.find((m) => m.id === id);
    if (!module) return false;
    return module.lessons.every((l) =>
      completedLessonIds.includes(`${module.id}/${l.id}`),
    );
  }

  const plannedModules: CurriculumModule[] = planned.map((p) => ({
    id: p.id,
    title: p.title,
    objective: p.objective,
    icon: "puzzle",
    order: p.order,
    prerequisites: p.prerequisiteIds,
    lessons: [] as Lesson[],
  }));

  return (
    <div className="space-y-8">
      <section aria-label="Published modules">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Published modules
          </h2>
          <p className="hidden text-[11.5px] text-ink-faint md:block">
            Hover a topic to preview what you&apos;ll learn
          </p>
        </div>
        <Card className="mt-3 overflow-hidden shadow-card">
          {modules.map((module, index) => (
            <ModuleRow
              key={module.id}
              module={module}
              index={index}
              prereqCompleted={module.prerequisites.every(moduleCompleted)}
            />
          ))}
        </Card>
      </section>

      <section aria-label="Planned modules">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            On the roadmap
          </h2>
          <p className="hidden text-[11.5px] text-ink-faint md:block">
            Locked until prerequisites are met
          </p>
        </div>
        <p className="mt-1 max-w-2xl text-[12.5px] leading-5 text-ink-muted">
          These modules are part of the curriculum outline. Lessons are still
          being written — they are not available yet.
        </p>
        <Card className="mt-3 overflow-hidden shadow-card">
          {plannedModules.map((module, index) => (
            <ModuleRow
              key={module.id}
              module={module}
              index={index}
              prereqCompleted={false}
            />
          ))}
        </Card>
      </section>
    </div>
  );
}
