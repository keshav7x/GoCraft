import { z } from "zod";
import { lessonsTable, lessonBlocksTable } from "../../Infra/Database/schema";
import {
  blockTypeEnum,
  lessonBlockSchema,
  type LessonBlockPayload,
} from "./block.schemas";

export type DBLesson = typeof lessonsTable.$inferSelect;
export type DBLessonInsert = typeof lessonsTable.$inferInsert;
export type DBLessonBlock = typeof lessonBlocksTable.$inferSelect;
export type DBLessonBlockInsert = typeof lessonBlocksTable.$inferInsert;

export { blockTypeEnum };
export type BlockType = z.infer<typeof blockTypeEnum>;
export type { LessonBlockPayload };

/** Legacy free-form properties (kept for rows written before `content`). */
export const blockPropertiesSchema = z
  .object({
    language: z.string().optional(),
    caption: z.string().optional(),
    altText: z.string().optional(),
  })
  .catchall(z.any());

/**
 * Create/update input for a content block.
 * `content` is validated by the discriminated union in block.schemas.ts.
 */
export const createBlockSchema = z.object({
  type: blockTypeEnum,
  content: z.record(z.string(), z.unknown()),
  problemId: z.number().int().nullable().optional(),
  orderNo: z.number().int().optional(),
});

export const updateBlockSchema = z
  .object({
    content: z.record(z.string(), z.unknown()),
    problemId: z.number().int().nullable().optional(),
    orderNo: z.number().int().optional(),
  })
  .partial();

export const addBlocksSchema = z.object({
  lessonId: z.number().int(),
  blocks: z.array(createBlockSchema).min(1).max(200),
});

/** Full payload validation — parse `content` against the type's schema. */
export function validateBlockContent(
  type: string,
  content: unknown,
): LessonBlockPayload {
  const parsed = lessonBlockSchema.safeParse({ type, content });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(
      `Invalid ${type} block content${issue ? `: ${issue.path.join(".")} ${issue.message}` : ""}`,
    );
  }
  return parsed.data;
}

export type CreateBlockInput = z.infer<typeof createBlockSchema>;
export type UpdateBlockInput = z.infer<typeof updateBlockSchema>;
export type AddBlocksInput = z.infer<typeof addBlocksSchema>;

export type BlockContentInput = Omit<DBLessonBlockInsert, "lessonId" | "orderNo"> & {
  orderNo?: number;
};
