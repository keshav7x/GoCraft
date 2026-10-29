import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import {
  outboxStatusEnum
}from "../enum"

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