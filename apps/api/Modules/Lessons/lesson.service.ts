import { LessonRepository } from "./lesson.repositary";
import { db } from "../../Infra/Database";
import type { DBLesson, DBLessonInsert } from "./lessons.types";
import type { DBLessonBlock, BlockContentInput } from "../Block/block.types";
import { validateBlockContent } from "../Block/block.types";
import { sanitizeQuizForLearner, parseLessonBlock } from "../Block/block.schemas";
import { authRepositoryClass } from "../Auth/auth.repositary";
import { ModuleRepository } from "../Modules/module.repositary";
import { blockRepositaryClass } from "../Block/block.repositary";
import { AppError } from "../../Infra/Error/errors";
import { OutboxRepository } from "../../Infra/OutBox/outbox.repo";

export type CreateLessonWithBlocksInput = DBLessonInsert & {
  blocks?: BlockContentInput[];
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

function validateBlocks(blocks: BlockContentInput[]): void {
  for (const block of blocks) {
    if (block.type && block.content !== undefined && block.content !== null) {
      try {
        validateBlockContent(block.type, block.content);
      } catch (err) {
        throw new AppError(err instanceof Error ? err.message : "Invalid block content", 400);
      }
    }
  }
}

function sanitizeBlocksForLearner(blocks: DBLessonBlock[]): DBLessonBlock[] {
  return blocks.map((block) => {
    const parsed = parseLessonBlock(block.type, block.content ?? {});
    if (!parsed) return block;
    if (parsed.type === "quiz") {
      return { ...block, content: sanitizeQuizForLearner(parsed) };
    }
    return block;
  });
}

export class lessonService {
  constructor(
    private readonly Db: typeof db,
    private readonly lessonRepo: LessonRepository,
    private readonly moduleRepo: ModuleRepository,
    private readonly blockRepo: blockRepositaryClass,
    private readonly authRepo: authRepositoryClass,
    private readonly outBoxRepo: OutboxRepository
  ) { }


  create = async (
    userId: number,
    input: CreateLessonWithBlocksInput
  ): Promise<DBLesson & { blocks: DBLessonBlock[] }> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!input.title) throw new AppError("Lesson title is required", 400);
    if (!input.moduleId) throw new AppError("No module ID provided", 400);

    const { blocks, ...lessonData } = input;
    if (blocks) validateBlocks(blocks);

    const lesson = await this.Db.transaction(async (tx: any) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const module = await this.moduleRepo.findById(lessonData.moduleId, tx);
      if (!module) throw new AppError("Module not found", 404);

      const slug = lessonData.slug || slugify(lessonData.title);
      const existingLessons = await this.lessonRepo.findByModuleId(lessonData.moduleId, undefined, tx);
      if (existingLessons.some((l) => l.slug === slug)) {
        throw new AppError("A lesson with this slug already exists in the module", 409);
      }

      const newLesson = await this.lessonRepo.create(
        {
          ...lessonData,
          slug,
          status: lessonData.status ?? "draft",
          updatedAt: new Date(),
        },
        tx
      );
      if (!newLesson) throw new AppError("Lesson can't be created", 400);

      let createdBlocks: DBLessonBlock[] = [];
      if (blocks && blocks.length > 0) {
        createdBlocks = await this.blockRepo.createMany(
          blocks.map((block, index) => ({
            ...block,
            lessonId: newLesson.id,
            orderNo: block.orderNo ?? index + 1,
            content: (block.content ?? {}) as Record<string, unknown>,
          })),
          tx
        );
      }

      await this.outBoxRepo.create(
        {
          type: "LESSON_CREATED",
          payload: { ...newLesson, blocks: createdBlocks },
        },
        tx
      );

      return { ...newLesson, blocks: createdBlocks };
    });
    return lesson;
  };

  getLessonById = async (id: number, userId: number) => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!id) throw new AppError("No lesson ID provided", 400);

    const isAdmin = await this.authRepo.isAdmin(userId);

    const result = await this.Db.transaction(async (tx) => {
      const stats = await this.lessonRepo.findWithProblemsCount(id, tx);
      const currentLessonStats = stats[0];
      if (!currentLessonStats) throw new AppError("Lesson not found", 404);

      const { problemsCount, ...lesson } = currentLessonStats;

      const module = await this.moduleRepo.findById(lesson.moduleId, tx);
      if (!module) throw new AppError("Module not found", 404);

      if (!isAdmin) {
        if (lesson.status !== "published" || module.status !== "published") {
          throw new AppError("Lesson not found", 404);
        }
      }

      const blocks = await this.blockRepo.findBlocksByLessonId(id, tx);

      return {
        lesson,
        module,
        problemsCount,
        blocks: isAdmin ? blocks : sanitizeBlocksForLearner(blocks),
      };
    });
    return result;
  };

  getAllLessons = async (userId: number): Promise<DBLesson[]> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    const isAdmin = await this.authRepo.isAdmin(userId);
    return await this.lessonRepo.findAll(isAdmin ? undefined : "published");
  };

  getAllLessonsByModuleId = async (userId: number, moduleId: number): Promise<DBLesson[]> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!moduleId) throw new AppError("No module ID provided", 400);

    const isAdmin = await this.authRepo.isAdmin(userId);

    const module = await this.moduleRepo.findById(moduleId);
    if (!module) throw new AppError("Module not found", 404);
    if (!isAdmin && module.status !== "published") {
      throw new AppError("Module not found", 404);
    }

    return await this.lessonRepo.findByModuleId(
      moduleId,
      isAdmin ? undefined : "published"
    );
  };

  update = async (userId: number, id: number, input: Partial<DBLessonInsert>): Promise<DBLesson> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!id) throw new AppError("No lesson ID provided", 400);

    const updatedLesson = await this.Db.transaction(async (tx) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const existing = await this.lessonRepo.findById(id, tx);
      if (!existing) throw new AppError("Lesson not found", 404);

      if (input.moduleId) {
        const module = await this.moduleRepo.findById(input.moduleId, tx);
        if (!module) throw new AppError("Module not found", 404);
      }

      if (input.slug && input.slug !== existing.slug) {
        const siblings = await this.lessonRepo.findByModuleId(
          input.moduleId ?? existing.moduleId,
          undefined,
          tx
        );
        if (siblings.some((l) => l.slug === input.slug && l.id !== id)) {
          throw new AppError("A lesson with this slug already exists in the module", 409);
        }
      }

      const result = await this.lessonRepo.update(
        id,
        { ...input, updatedAt: new Date() },
        tx
      );
      if (!result) throw new AppError("Lesson could not be updated", 400);

      await this.outBoxRepo.create(
        { type: "LESSON_UPDATED", payload: result },
        tx
      );

      return result;
    });
    return updatedLesson;
  };

  publish = async (userId: number, id: number): Promise<DBLesson> => {
    return this.update(userId, id, { status: "published" });
  };

  archive = async (userId: number, id: number): Promise<DBLesson> => {
    return this.update(userId, id, { status: "archived" });
  };

  delete = async (userId: number, id: number): Promise<boolean> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!id) throw new AppError("No lesson ID provided", 400);

    const success = await this.Db.transaction(async (tx) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const existing = await this.lessonRepo.findById(id, tx);
      if (!existing) throw new AppError("Lesson not found", 404);

      const deleted = await this.lessonRepo.delete(id, tx);
      if (!deleted) throw new AppError("Lesson could not be deleted", 400);

      await this.outBoxRepo.create(
        { type: "LESSON_DELETED", payload: { id } },
        tx
      );

      return true;
    });
    return success;
  };

  reorderLessons = async (userId: number, movementPairs: { id: number; targetLessonNo: number }[]): Promise<void> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!movementPairs || movementPairs.length === 0) throw new AppError("Invalid payload data", 400);

    await this.Db.transaction(async (tx) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      for (const pair of movementPairs) {
        await this.lessonRepo.update(pair.id, { lessonNo: pair.targetLessonNo }, tx);
      }

      await this.outBoxRepo.create(
        { type: "LESSONS_REORDERED", payload: { movementPairs } },
        tx
      );
    });
  }
}
