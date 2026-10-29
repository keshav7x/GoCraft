import {
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { xpEventTypeEnum } from "../enum";
import { usersTable } from "./user.schema";

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
