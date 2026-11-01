import { lessonBlocksTable } from "../../Infra/Database/schema"
import { db } from "../../Infra/Database";
import { LessonRepository } from "../Lessons/lesson.repositary";
import { type DBLessonBlockInsert, type DBLessonBlock } from "./block.types";
import { eq, and, sql } from "drizzle-orm";

export class blockRepositaryClass {
  constructor(
    private readonly blockDB = db,
    private readonly lessonRepo = new LessonRepository(db)
  ) {}

  private getClient(tx?: any) {
    return tx ?? this.blockDB;
  }

  public lessonExist = async (lessonId: number, tx?: any): Promise<boolean> => {
    const lesson = await this.lessonRepo.findById(lessonId, tx);
    return !!lesson;
  };

  public blockExist = async (blockID: number, tx?: any): Promise<boolean> => {
    const client = this.getClient(tx);
    const result = await client
      .select()
      .from(lessonBlocksTable)
      .where(eq(lessonBlocksTable.id, blockID))
      .limit(1);
    return result.length > 0;
  };

  public create = async (lessonId: number, input: Omit<DBLessonBlockInsert, "lessonId">, tx?: any): Promise<DBLessonBlock> => {
    const client = this.getClient(tx);
    const [block] = await client
      .insert(lessonBlocksTable)
      .values({
        ...input,
        lessonId
      })
      .returning();
    return block;
  };

  public createMany = async (blocks: DBLessonBlockInsert[], tx?: any): Promise<DBLessonBlock[]> => {
    const client = this.getClient(tx);
    return await client
      .insert(lessonBlocksTable)
      .values(blocks)
      .returning();
  };

  public findById = async (blockId: number, tx?: any): Promise<DBLessonBlock | undefined> => {
    const client = this.getClient(tx);
    const [block] = await client
      .select()
      .from(lessonBlocksTable)
      .where(eq(lessonBlocksTable.id, blockId))
      .limit(1);
    return block;
  };

  public findBlocksByLessonId = async (lessonId: number, tx?: any): Promise<DBLessonBlock[]> => {
    const client = this.getClient(tx);
    return await client
      .select()
      .from(lessonBlocksTable)
      .where(eq(lessonBlocksTable.lessonId, lessonId))
      .orderBy(lessonBlocksTable.orderNo);
  };

  public update = async (blockId: number, input: Partial<DBLessonBlockInsert>, tx?: any): Promise<DBLessonBlock | undefined> => {
    const client = this.getClient(tx);
    const [block] = await client
      .update(lessonBlocksTable)
      .set(input)
      .where(eq(lessonBlocksTable.id, blockId))
      .returning();
    return block;
  };

  public delete = async (blockId: number, tx?: any): Promise<boolean> => {
    const client = this.getClient(tx);
    const result = await client
      .delete(lessonBlocksTable)
      .where(eq(lessonBlocksTable.id, blockId))
      .returning({ id: lessonBlocksTable.id });
    return result.length > 0;
  };

  public deleteBlocksByLessonId = async (lessonId: number, tx?: any): Promise<void> => {
    const client = this.getClient(tx);
    await client
      .delete(lessonBlocksTable)
      .where(eq(lessonBlocksTable.lessonId, lessonId));
  };

  public incrementOrderNumbers = async (lessonId: number, fromOrderNo: number, tx?: any): Promise<void> => {
    const client = this.getClient(tx);
    await client
      .update(lessonBlocksTable)
      .set({
        orderNo: sql`${lessonBlocksTable.orderNo} + 1`
      })
      .where(
        and(
          eq(lessonBlocksTable.lessonId, lessonId),
          sql`${lessonBlocksTable.orderNo} >= ${fromOrderNo}`
        )
      );
  };

  public findMaxOrderNo = async (lessonId: number, tx?: any): Promise<number> => {
    const client = this.getClient(tx);
    const [result] = await client
      .select({ maxOrderNo: sql`MAX(${lessonBlocksTable.orderNo})` })
      .from(lessonBlocksTable)
      .where(eq(lessonBlocksTable.lessonId, lessonId));
    return result.maxOrderNo ?? 0;
  };
}
