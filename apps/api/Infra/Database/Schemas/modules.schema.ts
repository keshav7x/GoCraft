import { integer, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { contentStatusEnum } from "../enum";

export const modulesTable = pgTable(
  "modules",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    title: varchar({ length: 100 }).notNull(),
    description: varchar({ length: 500 }),
    moduleNo: integer().notNull().unique(),
    slug: varchar({ length: 120 }),
    shortDescription: varchar({ length: 300 }),
    coverImage: varchar({ length: 500 }),
    difficulty: varchar({ length: 20 }).notNull().default("beginner"),
    status: contentStatusEnum().notNull().default("draft"),
    estimatedDuration: integer().notNull().default(0),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => [uniqueIndex("modules_slug_unique").on(table.slug)],
);
