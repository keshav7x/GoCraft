import { integer, jsonb, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { contentStatusEnum } from "../enum";
import { modulesTable } from "./modules.schema";

export const lessonsTable = pgTable(
  "lessons",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    moduleId: integer()
      .notNull()
      .references(() => modulesTable.id),
    title: varchar({ length: 100 }).notNull(),
    lessonNo: integer().notNull(),
    estimatedTimeMinutes: integer().notNull().default(0),
    xpReward: integer().notNull().default(0),
    contents: jsonb().notNull().default([]),
    slug: varchar({ length: 140 }),
    description: varchar({ length: 1000 }),
    learningObjectives: jsonb().notNull().default([]),
    status: contentStatusEnum().notNull().default("draft"),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lessons_module_slug_unique").on(table.moduleId, table.slug)],
);
