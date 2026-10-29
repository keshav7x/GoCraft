import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import {
  outboxStatusEnum,
  xpEventTypeEnum,
  lessonStatusEnum,
  userType,
  problemTypeEnum
} from "./enum";

export const outboxEventsTable = pgTable("outbox_events", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nextAllowedAttemptAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  aggregateType: varchar({ length: 255 }).notNull(),
  aggregateId: varchar({ length: 255 }).notNull(),
  payload: jsonb().notNull(),
  status: outboxStatusEnum().notNull().default("pending"),
  retryCount: integer().notNull().default(0),
  errorReason: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp({ withTimezone: true }),
});

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  isDelete: boolean().default(false),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar().notNull(),
  emailVerified: boolean().notNull().default(false),
  xp: integer().notNull().default(0),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  userType: userType().notNull().default("user"),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const verificationTokensTable = pgTable("verification_tokens", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  token: varchar({ length: 255 }).notNull().unique(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const xpEventsTable = pgTable(
  "xp_events",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer().notNull().references(() => usersTable.id),
    type: xpEventTypeEnum().notNull(),
    amount: integer().notNull(),
    sourceId: varchar({ length: 255 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("xp_events_user_type_source_unique").on(
      table.userId,
      table.type,
      table.sourceId,
    ),
  ],
);

export const modulesTable = pgTable("modules", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  title: varchar({ length: 100 }).notNull(),
  description: varchar({ length: 500 }),
  moduleNo: integer().notNull().unique(),
});

export const lessonsTable = pgTable("lessons", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  moduleId: integer().notNull().references(() => modulesTable.id),
  title: varchar({ length: 100 }).notNull(),
  lessonNo: integer().notNull(),
  estimatedTimeMinutes: integer().notNull().default(0),
  xpReward: integer().notNull().default(0),
  contents: jsonb().notNull().default([]),
});

export const problemsTable = pgTable("problems", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  type: problemTypeEnum().notNull(),
  xpReward: integer().notNull().default(0),
  metadata: jsonb().notNull().default({}),
});

export const lessonProblemsTable = pgTable("lesson_problems", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  lessonId: integer().notNull().references(() => lessonsTable.id, { onDelete: "cascade" }),
  problemId: integer().notNull().references(() => problemsTable.id, { onDelete: "cascade" }),
  orderNo: integer().notNull(),
}, (table) => [
  uniqueIndex("lesson_problem_unique").on(table.lessonId, table.problemId)
]);

export const userLessonProgressTable = pgTable(
  "user_lesson_progress",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: integer().notNull().references(() => usersTable.id),
    lessonId: integer().notNull().references(() => lessonsTable.id),
    status: lessonStatusEnum().notNull().default("not started"),
    completedAt: timestamp(),
  },
);

export const userProblemSubmissionsTable = pgTable("user_problem_submissions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id),
  problemId: integer().notNull().references(() => problemsTable.id),
  isPassed: boolean().notNull().default(false),
  codeSolution: text(),
  selectedAnswer: varchar({ length: 255 }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
