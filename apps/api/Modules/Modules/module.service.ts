import { ModuleRepository } from "./module.repositary";
import { db } from "../../Infra/Database";
import type { DBModuleInsert, DBModule } from "./modules.types";
import { authRepositoryClass } from "../Auth/auth.repositary";
import { AppError } from "../../Infra/Error/errors";
import { OutboxRepository } from "../../Infra/OutBox/outbox.repo";
import { redis } from "../../Infra/Redis/redis";

export class moduleService {

  constructor(
    private readonly Db:typeof db,
    private readonly moduleRepo:ModuleRepository,
    private readonly authRepo :authRepositoryClass,
    private readonly outBoxRepo :OutboxRepository
  ) {}

  create = async (userId: number, input: DBModuleInsert): Promise<DBModule> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!input.title || input.title.length < 10) {
      throw new AppError("Title not found or must be greater than 10 characters", 400);
    }

    const isAdmin = await this.authRepo.isAdmin(userId);
    if (!isAdmin) throw new AppError("Unauthorized access", 401);

    const module = await this.Db.transaction(async (tx) => {

      const newModule = await this.moduleRepo.create(input, tx);
      if (!newModule) throw new AppError("Module can't be created", 400);

      await this.outBoxRepo.create({
        type: "MODULE_CREATED",
        payload: newModule
      }, tx);

      return newModule;
    });
    return module;
  };

  getModuleById = async (id: number, userId: number) => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!id) throw new AppError("No module ID provided", 400);

    const cacheKey = `module-${id}`
    const cacheModule = await redis.get(cacheKey)
    if (cacheModule !== null) {
      return JSON.parse(cacheModule)
    }
    const result = await this.Db.transaction(async (tx) => {
      const stats = await this.moduleRepo.findLessonCountOfModule(id, tx);
      const currentModuleStats = stats[0];
      if (!currentModuleStats) throw new AppError("Module not found", 404);

      const { lessonsCount, ...module } = currentModuleStats;

      return {
        module,
        lessonCount: lessonsCount
      };
    });
    return result;
  };

  getAllModules = async (userId: number): Promise<DBModule[]> => {
    if (!userId) throw new AppError("Unauthorized access", 401);

    return await this.moduleRepo.findAll();
  };

  getAllModulesWithStats = async (userId: number): Promise<(DBModule & { lessonsCount: number })[]> => {
    if (!userId) throw new AppError("Unauthorized access", 401);

    return await this.moduleRepo.findWithLessonsCount();
  };

  update = async (userId: number, id: number, input: Partial<DBModuleInsert>): Promise<DBModule> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!id) throw new AppError("No module ID provided", 400);
    if (input.title && input.title.length < 10) {
      throw new AppError("Title must be greater than 10 characters", 400);
    }

    const updatedModule = await this.Db.transaction(async (tx) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const existing = await this.moduleRepo.findById(id, tx);
      if (!existing) throw new AppError("Module not found", 404);

      const result = await this.moduleRepo.update(id, input, tx);
      if (!result) throw new AppError("Module could not be updated", 400);

      await this.outBoxRepo.create({
        type: "MODULE_UPDATED",
        payload: result
      }, tx);

      return result;
    });
    return updatedModule;
  };

  delete = async (userId: number, id: number): Promise<boolean> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!id) throw new AppError("No module ID provided", 400);

    const success = await this.Db.transaction(async (tx) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const existing = await this.moduleRepo.findById(id, tx);
      if (!existing) throw new AppError("Module not found", 404);

      await this.moduleRepo.deleteLessonsByModuleId(id, tx);

      const deleted = await this.moduleRepo.delete(id, tx);
      if (!deleted) throw new AppError("Module could not be deleted", 400);

      await this.outBoxRepo.create({
        type: "MODULE_DELETED",
        payload: { id }
      }, tx);

      return true;
    });
    return success;
  };

  reorderModules = async (userId: number, movementPairs: { id: number; targetModuleNo: number }[]): Promise<void> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!movementPairs || movementPairs.length === 0) throw new AppError("Invalid payload data", 400);

    await this.Db.transaction(async (tx) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      for (const pair of movementPairs) {
        await this.moduleRepo.update(pair.id, { moduleNo: -pair.id }, tx);
      }

      for (const pair of movementPairs) {
        await this.moduleRepo.update(pair.id, { moduleNo: pair.targetModuleNo }, tx);
      }

      await this.outBoxRepo.create({
        type: "MODULES_REORDERED",
        payload: { movementPairs }
      }, tx);
    });
  };
}
