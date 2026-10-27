import { pgEnum } from "drizzle-orm/pg-core";

export const xpEventTypeEnum = pgEnum("xp_event_type", [
  "LESSON_COMPLETED",
  "PROBLEM_SOLVED",
  "XP_ADJUSTMENT",
]);

