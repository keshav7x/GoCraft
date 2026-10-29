import { eq, and, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  userLessonProgressTable,
  xpEventsTable,
  usersTable,
  userProblemSubmissionsTable
} from "../../Infra/Database/schema";

type DBUserLessonProgress = typeof userLessonProgressTable.$inferSelect;
type DBUserLessonProgressInsert = typeof userLessonProgressTable.$inferInsert;
type DBXpEventInsert = typeof xpEventsTable.$inferInsert;
type DBUserProblemSubmissionInsert = typeof userProblemSubmissionsTable.$inferInsert;

export class ProgressRepository {
  constructor(private readonly moduleDb: NodePgDatabase<any>) {}

  private getClient = (tx?: any) => {
    if (tx) return tx;
    return this.moduleDb;
  };

  async getLessonProgress(
    userId: number,
    lessonId: number,
    tx?: any
  ): Promise<DBUserLessonProgress | undefined> {
    const client = this.getClient(tx);
    const [result] = await client
      .select()
      .from(userLessonProgressTable)
      .where(
        and(
          eq(userLessonProgressTable.userId, userId),
          eq(userLessonProgressTable.lessonId, lessonId)
        )
      )
      .limit(1);
    return result;
  }

  async getUserProgressList(userId: number, tx?: any): Promise<DBUserLessonProgress[]> {
    const client = this.getClient(tx);
    return await client
      .select()
      .from(userLessonProgressTable)
      .where(eq(userLessonProgressTable.userId, userId));
  }

  async createProgress(
    data: DBUserLessonProgressInsert,
    tx?: any
  ): Promise<DBUserLessonProgress> {
    const client = this.getClient(tx);
    const [result] = await client
      .insert(userLessonProgressTable)
      .values(data)
      .returning();
    return result;
  }

  async updateProgressStatus(
    userId: number,
    lessonId: number,
    status: "not started" | "in progress" | "completed",
    completedAt?: Date | null,
    tx?: any
  ): Promise<DBUserLessonProgress | undefined> {
    const client = this.getClient(tx);
    const [result] = await client
      .update(userLessonProgressTable)
      .set({
        status,
        completedAt: completedAt ?? undefined
      })
      .where(
        and(
          eq(userLessonProgressTable.userId, userId),
          eq(userLessonProgressTable.lessonId, lessonId)
        )
      )
      .returning();
    return result;
  }

  async logXpEvent(xpEvent: DBXpEventInsert, tx?: any): Promise<void> {
    const client = this.getClient(tx);
    await client
      .insert(xpEventsTable)
      .values(xpEvent)
      .onConflictDoNothing();
  }

  async updateUserXp(userId: number, amount: number, tx?: any): Promise<void> {
    const client = this.getClient(tx);
    await client
      .update(usersTable)
      .set({
        xp: sql`${usersTable.xp} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, userId));
  }

  async submitProblemResult(submission: DBUserProblemSubmissionInsert, tx?: any) {
    const client = this.getClient(tx);
    const [result] = await client
      .insert(userProblemSubmissionsTable)
      .values(submission)
      .returning();
    return result;
  }

  async completeLessonAndAwardXp(
    userId: number,
    lessonId: number,
    xpAmount: number,
    sourceId: string,
    tx?: any
  ): Promise<void> {
    const runWorkflow = async (transactionContext: any) => {
      await this.updateProgressStatus(userId, lessonId, "completed", new Date(), transactionContext);
      await this.logXpEvent({
        userId,
        amount: xpAmount,
        type: "lesson_completion",
        sourceId: String(sourceId)
      }, transactionContext);
      await this.updateUserXp(userId, xpAmount, transactionContext);
    };

    if (tx) {
      await runWorkflow(tx);
    } else {
      await this.moduleDb.transaction(async (newTx) => {
        await runWorkflow(newTx);
      });
    }
  }

  async solveProblemAndAwardXp(
    userId: number,
    problemId: number,
    xpAmount: number,
    submission: Omit<DBUserProblemSubmissionInsert, "userId" | "problemId" | "isPassed">,
    tx?: any
  ): Promise<void> {
    const runWorkflow = async (transactionContext: any) => {
      await this.submitProblemResult({
        ...submission,
        userId,
        problemId,
        isPassed: true
      }, transactionContext);

      await this.logXpEvent({
        userId,
        amount: xpAmount,
        type: "problem_solved",
        sourceId: String(problemId)
      }, transactionContext);

      await this.updateUserXp(userId, xpAmount, transactionContext);
    };

    if (tx) {
      await runWorkflow(tx);
    } else {
      await this.moduleDb.transaction(async (newTx) => {
        await runWorkflow(newTx);
      });
    }
  }
}
