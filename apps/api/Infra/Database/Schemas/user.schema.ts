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
} from "../enum"

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