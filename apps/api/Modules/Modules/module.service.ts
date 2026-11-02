import { ModuleRepository } from "./module.repositary";
import { db } from "../../Infra/Database";
import type { DBModuleInsert, DBModule } from "./modules.types";
import { authRepositoryClass } from "../Auth/auth.repositary";
import { AppError } from "../../Infra/Error/errors";
import { OutboxRepository } from "../../Infra/OutBox/outbox.repo";
import { redis } from "../../Infra/Redis/redis";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export class moduleService {
  constructor(
    private readonly Db: typeof db,
    private readonly moduleRepo: ModuleRepository,
    private readonly authRepo: authRepositoryClass,
    private readonly outBoxRepo: OutboxRepository
  ) {}

  private async requireAdmin(userId: number, tx?: any): Promise<void> {
    const isAdmin = await this.authRepo.isAdmin(userId, tx);
    if (!isAdmin) throw new AppError("Unauthorized access", 401);
  }

  private async invalidateCache(id: number): Promise<void> {
    await redis.del(`module-${id}`).catch(() => undefined);
  }

  create = async (userId: number, input: DBModuleInsert): Promise<DBModule> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!input.title || input.title.length < 3) {
      throw new AppError("Title is required and must be at least 3 characters", 400);
    }

    await this.requireAdmin(userId);

    const module = await this.Db.transaction(async (tx) => {
      const slug = input.slug ?? slugify(input.title);
      const existing = await this.moduleRepo.findBySlug(slug, tx);
      if (existing) throw new AppError("A module with this slug already exists", 409);

      const newModule = await this.moduleRepo.create(
        { ...input, slug, status: input.status ?? "draft" },
        tx
      );
      if (!newModule) throw new AppError("Module can't be created", 400);

      await this.outBoxRepo.create(
        {
          type: "MODULE_CREATED",
          payload: newModule,
        },
        tx
      );

      return newModule;
    });
    return module;
  };

  getModuleById = async (id: number, userId: number) => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!id) throw new AppError("No module ID provided", 400);

    const isAdmin = await this.authRepo.isAdmin(userId);

    const cacheKey = `module-${id}`;
    if (isAdmin) {
      const cacheModule = await redis.get(cacheKey);
      if (cacheModule !== null) {
        const parsed = JSON.parse(cacheModule);
        // Cached entries may be stale w.r.t. role — only serve to admins.
        return parsed;
      }
    }

    const result = await this.Db.transaction(async (tx) => {
      const stats = await this.moduleRepo.findLessonCountOfModule(id, tx);
      const currentModuleStats = stats[0];
      if (!currentModuleStats) throw new AppError("Module not found", 404);

      const { lessonsCount, ...module } = currentModuleStats;

      if (!isAdmin && module.status !== "published") {
        throw new AppError("Module not found", 404);
      }

      return {
        module,
        lessonCount: lessonsCount,
      };
    });

    if (isAdmin) {
      await redis
        .set(cacheKey, JSON.stringify(result), "EX", 60)
        .catch(() => undefined);
    }
    return result;
  };

  getModuleBySlug = async (slug: string, userId: number) => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!slug) throw new AppError("No module slug provided", 400);

    const isAdmin = await this.authRepo.isAdmin(userId);
    const module = await this.moduleRepo.findBySlug(slug);
    if (!module) throw new AppError("Module not found", 404);
    if (!isAdmin && module.status !== "published") {
      throw new AppError("Module not found", 404);
    }

    const stats = await this.moduleRepo.findLessonCountOfModule(module.id);
    const withCount = stats[0];
    return {
      module: withCount ? (({ lessonsCount, ...m }) => m)(withCount) : module,
      lessonCount: withCount?.lessonsCount ?? 0,
    };
  };

  getAllModules = async (userId: number): Promise<DBModule[]> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    const isAdmin = await this.authRepo.isAdmin(userId);
    return await this.moduleRepo.findAll(isAdmin ? undefined : "published");
  };

  getAllModulesWithStats = async (
    userId: number
  ): Promise<(DBModule & { lessonsCount: number })[]> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    const isAdmin = await this.authRepo.isAdmin(userId);
    return await this.moduleRepo.findWithLessonsCount(
      isAdmin ? undefined : "published"
    );
  };

  update = async (
    userId: number,
    id: number,
    input: Partial<DBModuleInsert>
  ): Promise<DBModule> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!id) throw new AppError("No module ID provided", 400);
    if (input.title && input.title.length < 3) {
      throw new AppError("Title must be at least 3 characters", 400);
    }

    const updatedModule = await this.Db.transaction(async (tx) => {
      await this.requireAdmin(userId, tx);

      const existing = await this.moduleRepo.findById(id, tx);
      if (!existing) throw new AppError("Module not found", 404);

      if (input.slug && input.slug !== existing.slug) {
        const clash = await this.moduleRepo.findBySlug(input.slug, tx);
        if (clash && clash.id !== id) {
          throw new AppError("A module with this slug already exists", 409);
        }
      }

      const result = await this.moduleRepo.update(
        id,
        { ...input, updatedAt: new Date() },
        tx
      );
      if (!result) throw new AppError("Module could not be updated", 400);

      await this.outBoxRepo.create(
        {
          type: "MODULE_UPDATED",
          payload: result,
        },
        tx
      );

      return result;
    });

    await this.invalidateCache(id);
    return updatedModule;
  };

  setStatus = async (
    userId: number,
    id: number,
    status: "draft" | "published" | "archived"
  ): Promise<DBModule> => {
    return this.update(userId, id, { status });
  };

  publish = async (userId: number, id: number): Promise<DBModule> => {
    return this.setStatus(userId, id, "published");
  };

  archive = async (userId: number, id: number): Promise<DBModule> => {
    return this.setStatus(userId, id, "archived");
  };

  delete = async (userId: number, id: number): Promise<boolean> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!id) throw new AppError("No module ID provided", 400);

    const success = await this.Db.transaction(async (tx) => {
      await this.requireAdmin(userId, tx);

      const existing = await this.moduleRepo.findById(id, tx);
      if (!existing) throw new AppError("Module not found", 404);

      await this.moduleRepo.deleteLessonsByModuleId(id, tx);

      const deleted = await this.moduleRepo.delete(id, tx);
      if (!deleted) throw new AppError("Module could not be deleted", 400);

      await this.outBoxRepo.create(
        {
          type: "MODULE_DELETED",
          payload: { id },
        },
        tx
      );

      return true;
    });

    await this.invalidateCache(id);
    return success;
  };

  reorderModules = async (
    userId: number,
    movementPairs: { id: number; targetModuleNo: number }[]
  ): Promise<void> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!movementPairs || movementPairs.length === 0) {
      throw new AppError("Invalid payload data", 400);
    }

    await this.Db.transaction(async (tx) => {
      await this.requireAdmin(userId, tx);

      for (const pair of movementPairs) {
        await this.moduleRepo.update(pair.id, { moduleNo: -pair.id }, tx);
      }

      for (const pair of movementPairs) {
        await this.moduleRepo.update(
          pair.id,
          { moduleNo: pair.targetModuleNo, updatedAt: new Date() },
          tx
        );
      }

      await this.outBoxRepo.create(
        {
          type: "MODULES_REORDERED",
          payload: { movementPairs },
        },
        tx
      );
    });

    for (const pair of movementPairs) {
      await this.invalidateCache(pair.id);
    }
  };
}
