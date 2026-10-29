import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { lessonsTable } from "../../Infra/Database/schema";

export type DBLesson = InferSelectModel<typeof lessonsTable>;
export type DBLessonInsert = InferInsertModel<typeof lessonsTable>;

export type LessonResponse = DBLesson;

export const createLessonSchema = z.object({
  moduleId: z.number().int(),
  title: z.string().min(1).max(100),
  lessonNo: z.number().int(),
  estimatedTimeMinutes: z.number().int().min(0).optional(),
  xpReward: z.number().int().min(0).optional(),
  contents: z.array(z.any()).optional(),
});

export const updateLessonSchema = z.object({
  moduleId: z.number().int().optional(),
  title: z.string().min(1).max(100).optional(),
  lessonNo: z.number().int().optional(),
  estimatedTimeMinutes: z.number().int().min(0).optional(),
  xpReward: z.number().int().min(0).optional(),
  contents: z.array(z.any()).optional(),
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
