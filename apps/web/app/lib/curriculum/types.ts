import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "api";
import {
  parseLessonBlock,
  type LessonBlockPayload,
  type VisualizationType,
  type QuizQuestion,
} from "api/schemas";

export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type Module = RouterOutputs["module"]["getAllModulesWithStats"][number];
export type ModuleDetail = RouterOutputs["module"]["getModuleById"];
export type Lesson = RouterOutputs["lesson"]["getAllLessons"][number];
export type LessonDetail = RouterOutputs["lesson"]["getLessonById"];
export type BlockRow = RouterOutputs["lesson"]["getLessonById"]["blocks"][number];
export type ProgressRow = RouterOutputs["progress"]["getMyProgress"][number];
export type LessonProgress = RouterOutputs["progress"]["getLessonProgress"];
export type ModuleProgress = RouterOutputs["progress"]["getModuleProgress"];
export type CurriculumProgress = RouterOutputs["progress"]["getCurriculumProgress"];

export type { LessonBlockPayload, VisualizationType, QuizQuestion };

/** Block row + validated content payload (null when content fails validation). */
export type ParsedBlock = {
  row: BlockRow;
  payload: LessonBlockPayload | null;
};

export function parseBlockRow(row: BlockRow): ParsedBlock {
  // Content comes back as unknown JSONB; validate against the shared union.
  return { row, payload: parseLessonBlock(row.type, row.content) };
}

export function parseBlocks(rows: BlockRow[]): ParsedBlock[] {
  return rows.map(parseBlockRow);
}

/** Lesson detail blocks sorted by orderNo and parsed once. */
export function lessonBlocks(detail: LessonDetail): ParsedBlock[] {
  return parseBlocks([...detail.blocks].sort((a, b) => a.orderNo - b.orderNo));
}

export const MODULE_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const LESSON_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

/** Progress statuses come back as free strings from the API. */
export type ProgressStatus = "not started" | "in progress" | "completed";

export function isCompleted(status: string | undefined | null): boolean {
  return status === "completed";
}
