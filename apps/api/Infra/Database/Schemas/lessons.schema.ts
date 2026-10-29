import { integer, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";
import { modulesTable } from "./modules.schema";

export const lessonsTable = pgTable("lessons", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  moduleId: integer().notNull().references(() => modulesTable.id),
  title: varchar({ length: 100 }).notNull(),
  lessonNo: integer().notNull(),
  estimatedTimeMinutes: integer().notNull().default(0),
  xpReward: integer().notNull().default(0),
  contents: jsonb().notNull().default([]),
});
