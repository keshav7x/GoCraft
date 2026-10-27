import { type InferInsertModel } from 'drizzle-orm';
import { usersTable, verificationTokensTable } from "../Infra/Database/schema";
export type UserCreateInput = InferInsertModel<typeof usersTable>;
export type VerificationTokenInsertInput = typeof verificationTokensTable.$inferInsert;