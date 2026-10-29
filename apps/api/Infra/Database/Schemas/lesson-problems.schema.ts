import { integer, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { lessonsTable } from "./lessons.schema";
import { problemsTable } from "./problems.schema";

export const lessonProblemsTable = pgTable(
  "lesson_problems",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    lessonId: integer()
      .notNull()
      .references(() => lessonsTable.id, { onDelete: "cascade" }),
    problemId: integer()
      .notNull()
      .references(() => problemsTable.id, { onDelete: "cascade" }),
    orderNo: integer().notNull(),
  },
  (table) => [
    uniqueIndex("lesson_problem_unique").on(table.lessonId, table.problemId),
  ],
);
