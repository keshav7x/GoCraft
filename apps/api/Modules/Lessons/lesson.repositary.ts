import { eq, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { lessonsTable, lessonProblemsTable, userLessonProgressTable } from "../../Infra/Database/schema";

export type DBLesson = typeof lessonsTable.$inferSelect;
export type DBLessonInsert = typeof lessonsTable.$inferInsert;

export class LessonRepository {
  constructor(private readonly lessonDb: NodePgDatabase<any>) {}

  private getClient = (tx?: any) => {
    if (tx) return tx;
    return this.lessonDb;
  };

  async create(data: DBLessonInsert, tx?: any) {
    const client = this.getClient(tx);
    const [result] = await client
      .insert(lessonsTable)
      .values(data)
      .returning();
    return result;
  }

  async findById(id: number, tx?: any): Promise<DBLesson | undefined> {
    const client = this.getClient(tx);
    const [result] = await client
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.id, id))
      .limit(1);
    return result;
  }

  async findByModuleId(
    moduleId: number,
    status?: "draft" | "published" | "archived",
    tx?: any
  ): Promise<DBLesson[]> {
    const client = this.getClient(tx);
    let results = await client
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.moduleId, moduleId))
      .orderBy(lessonsTable.lessonNo);
    if (status) {
      results = results.filter((l: DBLesson) => l.status === status);
    }
    return results;
  }

  async findAll(
    status?: "draft" | "published" | "archived",
    tx?: any
  ): Promise<DBLesson[]> {
    const client = this.getClient(tx);
    let results = await client
      .select()
      .from(lessonsTable)
      .orderBy(lessonsTable.lessonNo);
    if (status) {
      results = results.filter((l: DBLesson) => l.status === status);
    }
    return results;
  }

  async update(
    id: number,
    data: Partial<DBLessonInsert>,
    tx?: any
  ): Promise<DBLesson | undefined> {
    const client = this.getClient(tx);
    const [result] = await client
      .update(lessonsTable)
      .set(data)
      .where(eq(lessonsTable.id, id))
      .returning();
    return result;
  }

  async delete(id: number, tx?: any): Promise<boolean> {
    const client = this.getClient(tx);
    await client
      .delete(userLessonProgressTable)
      .where(eq(userLessonProgressTable.lessonId, id));
    const result = await client
      .delete(lessonsTable)
      .where(eq(lessonsTable.id, id))
      .returning({ id: lessonsTable.id });
    return result.length > 0;
  }

  async findMaxLessonNo(moduleId: number, tx?: any): Promise<number> {
    const client = this.getClient(tx);
    const [result] = await client
      .select({ max: sql<number>`coalesce(max(${lessonsTable.lessonNo}), 0)` })
      .from(lessonsTable)
      .where(eq(lessonsTable.moduleId, moduleId));
    return result?.max ?? 0;
  }

  async findWithProblemsCount(
    id: number,
    tx?: any
  ): Promise<(DBLesson & { problemsCount: number })[]> {
    const client = this.getClient(tx);
    const results = await client
      .select({
        lesson: lessonsTable,
        problemsCount: sql<number>`cast(count(${lessonProblemsTable.id}) as integer)`,
      })
      .from(lessonsTable)
      .leftJoin(
        lessonProblemsTable,
        eq(lessonProblemsTable.lessonId, lessonsTable.id)
      )
      .where(eq(lessonsTable.id, id))
      .groupBy(lessonsTable.id);
    return results.map((r: { lesson: DBLesson; problemsCount: number }) => ({
      ...r.lesson,
      problemsCount: r.problemsCount,
    }));
  }

  async findPublishedByModuleId(moduleId: number, tx?: any): Promise<DBLesson[]> {
    return this.findByModuleId(moduleId, "published", tx);
  }
}
