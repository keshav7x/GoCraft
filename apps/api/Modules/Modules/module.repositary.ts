import { and, eq, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { lessonsTable } from "../../Infra/Database/schema";
import { modulesTable } from "../../Infra/Database/schema";
export type DBModule = typeof modulesTable.$inferSelect;
export type DBModuleInsert = typeof modulesTable.$inferInsert;

export class ModuleRepository {
  constructor(private readonly moduleDb: NodePgDatabase<any>) {}

  private getClient = (tx?: any) => {
    if (tx) return tx;
    return this.moduleDb;
  };



  async create(data: DBModuleInsert, tx?: any){
    const client = this.getClient(tx);
    const [result] = await client
      .insert(modulesTable)
      .values(data)
      .returning();
    return result;
  }

  async findById(id: number, tx?: any): Promise<DBModule | undefined> {
    const client = this.getClient(tx);
    const [result] = await client
      .select()
      .from(modulesTable)
      .where(eq(modulesTable.id, id))
      .limit(1);
    return result;
  }

  async findByModuleNo(moduleNo: number, tx?: any): Promise<DBModule | undefined> {
    const client = this.getClient(tx);
    const [result] = await client
      .select()
      .from(modulesTable)
      .where(eq(modulesTable.moduleNo, moduleNo))
      .limit(1);
    return result;
  }

  async findBySlug(slug: string, tx?: any): Promise<DBModule | undefined> {
    const client = this.getClient(tx);
    const [result] = await client
      .select()
      .from(modulesTable)
      .where(eq(modulesTable.slug, slug))
      .limit(1);
    return result;
  }

  async findAll(status?: "draft" | "published" | "archived", tx?: any): Promise<DBModule[]> {
    const client = this.getClient(tx);
    const query = client.select().from(modulesTable).orderBy(modulesTable.moduleNo);
    if (status) {
      return await query.where(eq(modulesTable.status, status));
    }
    return await query;
  }

  async update(id: number, data: Partial<DBModuleInsert>, tx?: any): Promise<DBModule | undefined> {
    const client = this.getClient(tx);
    const [result] = await client
      .update(modulesTable)
      .set(data)
      .where(eq(modulesTable.id, id))
      .returning();
    return result;
  }

  async delete(id: number, tx?: any): Promise<boolean> {
    const client = this.getClient(tx);
    const result = await client
      .delete(modulesTable)
      .where(eq(modulesTable.id, id))
      .returning({ id: modulesTable.id });
    return result.length > 0;
  }

  async deleteLessonsByModuleId(moduleId: number, tx?: any): Promise<void> {
    const client = this.getClient(tx);
    await client
      .delete(lessonsTable)
      .where(eq(lessonsTable.moduleId, moduleId));
  }

  async findLessonCountOfModule(moduleID: number, tx?: any): Promise<(DBModule & { lessonsCount: number })[]> {
    const client = this.getClient(tx);
    const results = await client
      .select({
        module: modulesTable,
        lessonsCount: sql<number>`cast(count(${lessonsTable.id}) as integer)`,
      })
      .from(modulesTable)
      .leftJoin(lessonsTable, eq(lessonsTable.moduleId, modulesTable.id))
      .where(and(
        eq(modulesTable.id, moduleID),
        eq(modulesTable.status,"published")
      ))
      .groupBy(modulesTable.id)
      .orderBy(modulesTable.moduleNo);
    return results.map((r: { module: DBModule; lessonsCount: number }) => ({
      ...r.module,
      lessonsCount: r.lessonsCount,
    }));
  }

  async findWithLessonsCount(status?: "draft" | "published" | "archived", tx?: any): Promise<(DBModule & { lessonsCount: number })[]> {
    const client = this.getClient(tx);
    let results = await client
      .select({
        module: modulesTable,
        lessonsCount: sql<number>`cast(count(${lessonsTable.id}) as integer)`,
      })
      .from(modulesTable)
      .leftJoin(lessonsTable, eq(modulesTable.id, lessonsTable.moduleId))
      .groupBy(modulesTable.id)
      .orderBy(modulesTable.moduleNo);
    if (status) {
      results = results.filter(
        (r: { module: DBModule; lessonsCount: number }) => r.module.status === status
      );
    }
    return results.map((r: { module: DBModule; lessonsCount: number }) => ({
      ...r.module,
      lessonsCount: r.lessonsCount,
    }));
  }
}
