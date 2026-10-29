import { LessonRepository } from "./lesson.repositary";
import { db } from "../../Infra/Database";
import type { DBLesson, DBLessonInsert } from "./lessons.types";
import { authRepositoryClass } from "../Auth/auth.repositary";
import { ModuleRepository } from "../Modules/module.repositary";
import { AppError } from "../../Infra/Error/errors";
import { OutboxRepository } from "../../Infra/OutBox/outbox.repo";

export class lessonService {
  private Db = db;
  constructor(
    private readonly lessonRepo = new LessonRepository(db),
    private readonly moduleRepo = new ModuleRepository(db),
    private readonly authRepo = new authRepositoryClass(db),
    private readonly outBoxRepo = new OutboxRepository()
  ) {}

  create = async (userId: number, input: DBLessonInsert): Promise<DBLesson> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!input.title) throw new AppError("Lesson title is required", 400);
    if (!input.moduleId) throw new AppError("No module ID provided", 400);

    const lesson = await this.Db.transaction(async (tx) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const module = await this.moduleRepo.findById(input.moduleId, tx);
      if (!module) throw new AppError("Module not found", 404);

      const newLesson = await this.lessonRepo.create(input, tx);
      if (!newLesson) throw new AppError("Lesson can't be created", 400);

      await this.outBoxRepo.create({
        type: "LESSON_CREATED",
        payload: newLesson
      }, tx);

      return newLesson;
    });
    return lesson;
  };

  getLessonById = async (id: number, userId: number) => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!id) throw new AppError("No lesson ID provided", 400);

    const result = await this.Db.transaction(async (tx) => {
      const stats = await this.lessonRepo.findWithProblemsCount(id, tx);
      const currentLessonStats = stats[0];
      if (!currentLessonStats) throw new AppError("Lesson not found", 404);

      const { problemsCount, ...lesson } = currentLessonStats;

      return {
        lesson,
        problemsCount
      };
    });
    return result;
  };

  getAllLessons = async (userId: number): Promise<DBLesson[]> => {
    if (!userId) throw new AppError("Unauthorized access", 401);

    return await this.lessonRepo.findAll();
  };

  getAllLessonsByModuleId = async (userId: number, moduleId: number): Promise<DBLesson[]> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!moduleId) throw new AppError("No module ID provided", 400);

    const module = await this.moduleRepo.findById(moduleId);
    if (!module) throw new AppError("Module not found", 404);

    return await this.lessonRepo.findByModuleId(moduleId);
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

      const result = await this.lessonRepo.update(id, input, tx);
      if (!result) throw new AppError("Lesson could not be updated", 400);

      await this.outBoxRepo.create({
        type: "LESSON_UPDATED",
        payload: result
      }, tx);

      return result;
    });
    return updatedLesson;
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

      await this.outBoxRepo.create({
        type: "LESSON_DELETED",
        payload: { id }
      }, tx);

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
        await this.lessonRepo.update(pair.id, { lessonNo: -pair.id }, tx);
      }

      for (const pair of movementPairs) {
        await this.lessonRepo.update(pair.id, { lessonNo: pair.targetLessonNo }, tx);
      }

      await this.outBoxRepo.create({
        type: "LESSONS_REORDERED",
        payload: { movementPairs }
      }, tx);
    });
  };
}
