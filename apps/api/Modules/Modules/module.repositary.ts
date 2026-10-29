import { eq, and, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { modulesTable, lessonsTable } from "../../Infra/Database/schema";

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

  async findAll(tx?: any): Promise<DBModule[]> {
    const client = this.getClient(tx);
    return await client
      .select()
      .from(modulesTable)
      .orderBy(modulesTable.moduleNo);
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

  async findLessonCounOfModule(moduleID:number,tx?: any): Promise<(DBModule & { lessonsCount: number })[]> {
    const client = this.getClient(tx);
    const results = await client
      .select({
        id: modulesTable.id,
        title: modulesTable.title,
        description: modulesTable.description,
        moduleNo: modulesTable.moduleNo,
        lessonsCount: sql<number>`cast(count(${lessonsTable.id}) as integer)`,
      })
      .from(modulesTable)
      .leftJoin(lessonsTable, eq(modulesTable.id, moduleID))
      .groupBy(modulesTable.id)
      .orderBy(modulesTable.moduleNo);
    return results;
  }
  
  async findWithLessonsCount(tx?: any): Promise<(DBModule & { lessonsCount: number })[]> {
    const client = this.getClient(tx);
    const results = await client
      .select({
        id: modulesTable.id,
        title: modulesTable.title,
        description: modulesTable.description,
        moduleNo: modulesTable.moduleNo,
        lessonsCount: sql<number>`cast(count(${lessonsTable.id}) as integer)`,
      })
      .from(modulesTable)
      .leftJoin(lessonsTable, eq(modulesTable.id, lessonsTable.moduleId))
      .groupBy(modulesTable.id)
      .orderBy(modulesTable.moduleNo);
    return results;
  }
}
