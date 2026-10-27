import { and, eq, gt } from "drizzle-orm";
import { db } from "../../Infra/Database";
import { usersTable, verificationTokensTable } from "../../Infra/Database/schema";
import type { UserCreateInput,VerificationTokenInsertInput } from "../../Types/auth.types";
export class authRepositoryClass {
  constructor(
    private readonly authDB = db,
    private readonly users = usersTable,
    private readonly tokens = verificationTokensTable
  ) { }

  private getClient = (tx?: any) => {
    if (tx) return tx;
    return this.authDB;
  };

  findUserByEmail = async (email: string) => {
    const [user] = await this.authDB
      .select()
      .from(this.users)
      .where(eq(this.users.email, email))
      .limit(1);

    return user ?? null;
  };

  findUserById = async (id: number) => {
    const [user] = await this.authDB
      .select()
      .from(this.users)
      .where(eq(this.users.id, id))
      .limit(1);

    return user ?? null;
  };

  create = async (input: UserCreateInput, tx?: any) => {
    const DbClient = this.getClient(tx);
    const [user] = await DbClient.insert(this.users).values(input).returning();
    return user;
  };

  softDelete = async (userId: number, tx?: any) => {
    const DbClient = this.getClient(tx);
    const [user] = await DbClient.update(this.users)
      .set({ isDelete: true })
      .where(eq(this.users.id, userId))
      .returning();
    return user;
  };

  delete = async (userId: number, tx?: any) => {
    const DbClient = this.getClient(tx);
    const [user] = await DbClient.delete(this.users)
      .where(eq(this.users.id, userId))
      .returning();
    return user;
  };

  update = async (userId: number, input: Partial<UserCreateInput>, tx?: any) => {
    const DbClient = this.getClient(tx);
    const [user] = await DbClient.update(this.users)
      .set(input)
      .where(eq(this.users.id, userId))
      .returning();
    return user;
  };

  verifyUser = async (userId: number, tx?: any) => {
    const DbClient = this.getClient(tx);
    const [user] = await DbClient.update(this.users)
      .set({ emailVerified: true })
      .where(eq(this.users.id, userId))
      .returning();
    return user;
  };

  getXp = async (userId: number, tx?: any) => {
    const DbClient = this.getClient(tx);
    const [result] = await DbClient.select({
      xp: this.users.xp
    })
      .from(this.users)
      .where(eq(this.users.id, userId));

    return result?.xp ?? 0;
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
