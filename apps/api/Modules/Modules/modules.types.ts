import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { modulesTable } from "../../Infra/Database/schema";

export type DBModule = InferSelectModel<typeof modulesTable>;
export type DBModuleInsert = InferInsertModel<typeof modulesTable>;

export type ModuleResponse = DBModule;

export const createModuleSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  moduleNo: z.number().int(),
});


export const updateModuleSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  moduleNo: z.number().int().optional(),
});

export const getModuleByIdSchema = z.object({
  id: z.number().int(),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type GetModuleByIdInput = z.infer<typeof getModuleByIdSchema>;
