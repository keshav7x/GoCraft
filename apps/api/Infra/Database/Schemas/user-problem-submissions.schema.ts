import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema";
import { problemsTable } from "./problems.schema";

export const userProblemSubmissionsTable = pgTable(
  "user_problem_submissions",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer().notNull().references(() => usersTable.id),
    problemId: integer().notNull().references(() => problemsTable.id),
    isPassed: boolean().notNull().default(false),
    codeSolution: text(),
    selectedAnswer: varchar({ length: 255 }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
);
