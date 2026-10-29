import { pgEnum } from "drizzle-orm/pg-core";

export const outboxStatusEnum = pgEnum("outbox_status", ["pending", "processed", "failed"]);
export const xpEventTypeEnum = pgEnum("xp_event_type", ["lesson_completion", "problem_solved"]);
export const lessonStatusEnum = pgEnum("lesson_status", ["not started", "in progress", "completed"]);
export const userType = pgEnum("user_type", ["user", "admin"]);
export const problemTypeEnum = pgEnum("problem_type", ["coding", "true_false", "multiple_choice"]);
