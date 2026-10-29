import { integer, jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { problemTypeEnum } from "../enum";

export const problemsTable = pgTable("problems", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  type: problemTypeEnum().notNull(),
  xpReward: integer().notNull().default(0),
  metadata: jsonb().notNull().default({}),
});
