import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { modulesTable } from "../../Infra/Database/schema";

export type DBModule = InferSelectModel<typeof modulesTable>;
export type DBModuleInsert = InferInsertModel<typeof modulesTable>;

export type ModuleResponse = DBModule;

export const contentStatusSchema = z.enum(["draft", "published", "archived"]);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

export const moduleDifficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);
export type ModuleDifficulty = z.infer<typeof moduleDifficultySchema>;

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");

export const createModuleSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  moduleNo: z.number().int(),
  slug: slugSchema.optional(),
  shortDescription: z.string().max(300).optional(),
  coverImage: z.string().max(500).optional(),
  difficulty: moduleDifficultySchema.optional(),
  status: contentStatusSchema.optional(),
  estimatedDuration: z.number().int().min(0).optional(),
});

export const updateModuleSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  moduleNo: z.number().int().optional(),
  slug: slugSchema.optional(),
  shortDescription: z.string().max(300).optional(),
  coverImage: z.string().max(500).optional(),
  difficulty: moduleDifficultySchema.optional(),
  status: contentStatusSchema.optional(),
  estimatedDuration: z.number().int().min(0).optional(),
});

export const getModuleByIdSchema = z.object({
  id: z.number().int(),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type GetModuleByIdInput = z.infer<typeof getModuleByIdSchema>;
