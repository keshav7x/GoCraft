import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { xpEventTypeEnum } from "./enum";


export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  name: varchar({ length: 255 }).notNull(),
  isDelete:boolean().default(false),
  email: varchar({ length: 255 }).notNull().unique(),

  emailVerified: boolean().notNull().default(false),
  xp: integer().notNull().default(0),
  createdAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const verificationTokensTable = pgTable("verification_tokens", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }), 

  token: varchar({ length: 255 }).notNull().unique(),
  
  
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});


export const xpEventsTable = pgTable(
  "xp_events",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    userId: integer()
      .notNull()
      .references(() => usersTable.id),

    type: xpEventTypeEnum().notNull(),

    amount: integer().notNull(),

    sourceId: varchar({ length: 255 }).notNull(),

    createdAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("xp_events_user_type_source_unique").on(
      table.userId,
      table.type,
      table.sourceId,
    ),
  ],
);
