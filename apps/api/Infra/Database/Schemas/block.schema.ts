import { lessonsTable } from "./lessons.schema";
import { pgTable, integer, varchar, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { problemsTable } from "./problems.schema";

export const lessonBlocksTable = pgTable("lesson_blocks", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  lessonId: integer()
    .notNull()
    .references(() => lessonsTable.id, { onDelete: "cascade" }),
  // Was pgEnum("block_type"); now free-form varchar validated by zod
  // (Modules/Block/block.schemas.ts) so new block types don't need enum migrations.
  type: varchar({ length: 50 }).notNull(),
  orderNo: integer().notNull(),
  contentValue: text(),
  problemId: integer().references(() => problemsTable.id, { onDelete: "set null" }),
  properties: jsonb().notNull().default({}),
  // Canonical type-specific payload (discriminated by `type`).
  content: jsonb().notNull().default({}),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
