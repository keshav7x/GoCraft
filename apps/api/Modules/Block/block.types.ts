import { z } from "zod";
import { lessonsTable,lessonBlocksTable } from "../../Infra/Database/schema";
import { blockTypeEnum } from "../../Infra/Database/enum";

export type DBLesson = typeof lessonsTable.$inferSelect;
export type DBLessonInsert = typeof lessonsTable.$inferInsert;
export type DBLessonBlock = typeof lessonBlocksTable.$inferSelect;
export type DBLessonBlockInsert = typeof lessonBlocksTable.$inferInsert;

export const blockPropertiesSchema = z.object({
  language: z.string().optional(), 
  caption: z.string().optional(),  
  altText: z.string().optional(),  
}).catchall(z.any());

export const createBlockSchema = z.object({
  type: blockTypeEnum,
  contentValue: z.string().nullable().optional(),
  problemId: z.number().int().nullable().optional(),
  properties: blockPropertiesSchema.default({}),
});

export const createLessonInputSchema = z.object({
  moduleId: z.number().int(),
  title: z.string().min(1).max(100),
  lessonNo: z.number().int(),
  estimatedTimeMinutes: z.number().int().default(0),
  xpReward: z.number().int().default(0),
  blocks: z.array(createBlockSchema).default([]),
});

export type CreateLessonInput = z.infer<typeof createLessonInputSchema>;
