import { integer, pgTable, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { lessonStatusEnum } from "../enum";
import { usersTable } from "./user.schema";
import { lessonsTable } from "./lessons.schema";

export const userLessonProgressTable = pgTable(
  "user_lesson_progress",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: integer()
      .notNull()
      .references(() => usersTable.id),
    lessonId: integer()
      .notNull()
      .references(() => lessonsTable.id),
    status: lessonStatusEnum().notNull().default("not started"),
    completedAt: timestamp(),
    startedAt: timestamp(),
    lastAccessedAt: timestamp(),
    lastBlockId: integer(),
    completedBlockIds: integer().array().notNull().default([]),
    xpAwarded: integer().notNull().default(0),
  },
  (table) => [
    uniqueIndex("user_lesson_progress_user_lesson_unique").on(
      table.userId,
      table.lessonId,
    ),
  ],
);
