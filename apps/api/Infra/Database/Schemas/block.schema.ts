import { lessonsTable } from "./lessons.schema";
import { blockTypeEnum } from "../enum";
import { pgEnum, pgTable, integer, varchar, text, jsonb } from "drizzle-orm/pg-core";
import { problemsTable } from "./problems.schema";
export const lessonBlocksTable = pgTable("lesson_blocks", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  lessonId: integer().notNull().references(() => lessonsTable.id, { onDelete: "cascade" }),
   type: blockTypeEnum().notNull(),
   orderNo: integer().notNull(),
   contentValue: text(),
   problemId: integer().references(() => problemsTable.id, { onDelete: "set null" }),
   properties: jsonb().notNull().default({}),

})
