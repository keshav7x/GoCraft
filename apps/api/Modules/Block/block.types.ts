import { z } from "zod";
import { lessonsTable, lessonBlocksTable } from "../../Infra/Database/schema";
import { blockTypeEnum } from "../../Infra/Database/enum";

export type DBLesson = typeof lessonsTable.$inferSelect;
export type DBLessonInsert = typeof lessonsTable.$inferInsert;
export type DBLessonBlock = typeof lessonBlocksTable.$inferSelect;
export type DBLessonBlockInsert = typeof lessonBlocksTable.$inferInsert;

export const blockTypeEnumSchema = z.enum(blockTypeEnum.enumValues);
export type BlockType = (typeof blockTypeEnum.enumValues)[number];

export const blockPropertiesSchema = z.object({
  language: z.string().optional(),
  caption: z.string().optional(),
  altText: z.string().optional(),
}).catchall(z.any());

export const createBlockSchema = z.object({
  type: blockTypeEnumSchema,
  contentValue: z.string().nullable().optional(),
  problemId: z.number().int().nullable().optional(),
  orderNo: z.number().int().optional(),
  properties: blockPropertiesSchema.optional().default({}),
});

export const updateBlockSchema = z.object({
  contentValue: z.string().nullable().optional(),
  problemId: z.number().int().nullable().optional(),
  orderNo: z.number().int().optional(),
  properties: blockPropertiesSchema.optional(),
}).partial();

export const addBlocksSchema = z.object({
  lessonId: z.number().int(),
  blocks: z.array(createBlockSchema).min(1),
});

export type CreateBlockInput = z.infer<typeof createBlockSchema>;
export type UpdateBlockInput = z.infer<typeof updateBlockSchema>;
export type AddBlocksInput = z.infer<typeof addBlocksSchema>;

export type BlockContentInput = Omit<DBLessonBlockInsert, "lessonId" | "orderNo"> & {
  orderNo?: number;
};
