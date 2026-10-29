import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const modulesTable = pgTable("modules", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  title: varchar({ length: 100 }).notNull(),
  description: varchar({ length: 500 }),
  moduleNo: integer().notNull().unique(),
});
