import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { lessonsTable } from "../../Infra/Database/schema";
import { createBlockSchema } from "../Block/block.types";
import { contentStatusSchema } from "../Modules/modules.types";

export type DBLesson = InferSelectModel<typeof lessonsTable>;
export type DBLessonInsert = InferInsertModel<typeof lessonsTable>;

export type LessonResponse = DBLesson;

const slugSchema = z
  .string()
  .min(1)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");

export const createLessonSchema = z.object({
  moduleId: z.number().int(),
  title: z.string().min(1).max(100),
  lessonNo: z.number().int(),
  estimatedTimeMinutes: z.number().int().min(0).optional(),
  xpReward: z.number().int().min(0).optional(),
  contents: z.array(z.any()).optional(),
  slug: slugSchema.optional(),
  description: z.string().max(1000).optional(),
  learningObjectives: z.array(z.string().max(300)).max(10).optional(),
  status: contentStatusSchema.optional(),
  blocks: z.array(createBlockSchema).max(200).optional(),
});

export const updateLessonSchema = z.object({
  moduleId: z.number().int().optional(),
  title: z.string().min(1).max(100).optional(),
  lessonNo: z.number().int().optional(),
  estimatedTimeMinutes: z.number().int().min(0).optional(),
  xpReward: z.number().int().min(0).optional(),
  contents: z.array(z.any()).optional(),
  slug: slugSchema.optional(),
  description: z.string().max(1000).optional(),
  learningObjectives: z.array(z.string().max(300)).max(10).optional(),
  status: contentStatusSchema.optional(),
});

export const getLessonByIdSchema = z.object({
  id: z.number().int(),
});

export const getLessonsByModuleIdSchema = z.object({
  moduleId: z.number().int(),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type GetLessonByIdInput = z.infer<typeof getLessonByIdSchema>;
export type GetLessonsByModuleIdInput = z.infer<typeof getLessonsByModuleIdSchema>;
