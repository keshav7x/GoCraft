import { and, eq, gt } from "drizzle-orm";
import { db } from "../../Infra/Database";
import { verificationTokensTable } from "../../Infra/Database/schema";

export type VerificationTokenInsertInput = typeof verificationTokensTable.$inferInsert;

export class VerificationRepositoryClass {
  constructor(
    private readonly authDB = db,
    private readonly tokens = verificationTokensTable
  ) {}

  private getClient = (tx?: any) => {
    if (tx) return tx;
    return this.authDB;
  };

  createVerificationToken = async (input: VerificationTokenInsertInput, tx?: any) => {
    const DbClient = this.getClient(tx);
    const [tokenRecord] = await DbClient.insert(this.tokens)
      .values(input)
      .returning();
    return tokenRecord;
  };

  findValidVerificationToken = async (tokenString: string, tx?: any) => {
    const DbClient = this.getClient(tx);
    const [tokenRecord] = await DbClient.select()
      .from(this.tokens)
      .where(
        and(
          eq(this.tokens.token, tokenString),
          gt(this.tokens.expiresAt, new Date())
        )
      )
      .limit(1);

    return tokenRecord ?? null;
  };

  deleteVerificationToken = async (tokenId: number, tx?: any) => {
    const DbClient = this.getClient(tx);
    const [deletedToken] = await DbClient.delete(this.tokens)
      .where(eq(this.tokens.id, tokenId))
      .returning();
    return deletedToken;
  };

  deleteUserVerificationTokens = async (userId: number, tx?: any) => {
    const DbClient = this.getClient(tx);
    return await DbClient.delete(this.tokens)
      .where(eq(this.tokens.userId, userId))
      .returning();
  };
}
