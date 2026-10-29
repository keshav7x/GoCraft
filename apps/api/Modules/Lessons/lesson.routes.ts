import { AppError } from "../../Infra/Error/errors";
import { protectedProcedure, router } from "../../trpc";
import { z } from "zod";
import { lessonService } from "./lesson.service";
import {
  createLessonSchema,
  getLessonByIdSchema,
  getLessonsByModuleIdSchema,
  updateLessonSchema
} from "./lessons.types";

const lessonServiceInstance = new lessonService();

export const lessonRouter = router({
  createLesson: protectedProcedure
    .input(createLessonSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const lesson = await lessonServiceInstance.create(userId, input);
      if (!lesson) throw new AppError("Lesson could not be created", 400);
      return lesson;
    }),

  getLessonById: protectedProcedure
    .input(getLessonByIdSchema)
    .query(async ({ input, ctx }) => {
      const lesson = await lessonServiceInstance.getLessonById(input.id, ctx.user.userId);
      if (!lesson) throw new AppError("Lesson not found", 404);
      return lesson;
    }),

  getAllLessons: protectedProcedure
    .query(async ({ ctx }) => {
      return await lessonServiceInstance.getAllLessons(ctx.user.userId);
    }),

  getLessonsByModuleId: protectedProcedure
    .input(getLessonsByModuleIdSchema)
    .query(async ({ input, ctx }) => {
      return await lessonServiceInstance.getAllLessonsByModuleId(ctx.user.userId, input.moduleId);
    }),

  updateLesson: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        data: updateLessonSchema
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const updated = await lessonServiceInstance.update(userId, input.id, input.data);
      if (!updated) throw new AppError("Lesson could not be updated", 400);
      return updated;
    }),

  deleteLesson: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const success = await lessonServiceInstance.delete(userId, input.id);
      if (!success) throw new AppError("Lesson could not be deleted", 400);
      return { success: true };
    }),

  reorderLessons: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.number().int(),
          targetLessonNo: z.number().int()
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      await lessonServiceInstance.reorderLessons(userId, input);
      return { success: true };
    })
});
