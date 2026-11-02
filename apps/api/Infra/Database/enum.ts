import { pgEnum } from "drizzle-orm/pg-core";

export const outboxStatusEnum = pgEnum("outbox_status", ["pending", "processed", "failed"]);
export const xpEventTypeEnum = pgEnum("xp_event_type", ["lesson_completion", "problem_solved", "quiz_completed", "challenge_solved"]);
export const lessonStatusEnum = pgEnum("lesson_status", ["not started", "in progress", "completed"]);
export const userType = pgEnum("user_type", ["user", "admin"]);
export const problemTypeEnum = pgEnum("problem_type", ["coding", "true_false", "multiple_choice"]);
export const contentStatusEnum = pgEnum("content_status", ["draft", "published", "archived"]);

// Legacy enum kept for migration compatibility; lesson_blocks.type is now varchar(50)
// validated by the zod discriminated union in Modules/Block/block.schemas.ts.
export const blockTypeEnum = pgEnum("block_type", ["h1","h2","h3","text","image","code_example","problem","b","i","visual","answer","multiple select"
]);
