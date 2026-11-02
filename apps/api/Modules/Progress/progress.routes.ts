import { z } from "zod";
import { protectedProcedure, router } from "../../trpc";
import { progressService } from "../../Infra/container/services";

const progress = progressService;

export const progressRouter = router({
  /** All of the current user's lesson progress rows. */
  getMyProgress: protectedProcedure.query(async ({ ctx }) => {
    return await progress.getMyProgress(ctx.user.userId);
  }),

  /** Progress for one lesson (null if never opened). */
  getLessonProgress: protectedProcedure
    .input(z.object({ lessonId: z.number().int() }))
    .query(async ({ input, ctx }) => {
      return await progress.getLessonProgress(ctx.user.userId, input.lessonId);
    }),

  /** Per-lesson statuses for a module. */
  getModuleProgress: protectedProcedure
    .input(z.object({ moduleId: z.number().int() }))
    .query(async ({ input, ctx }) => {
      return await progress.getModuleProgress(ctx.user.userId, input.moduleId);
    }),

  /** Published-lesson progress across the curriculum (for lists/dashboard). */
  getCurriculumProgress: protectedProcedure.query(async ({ ctx }) => {
    return await progress.getCurriculumProgress(ctx.user.userId);
  }),

  /** Open/resume a lesson. Does not award XP. */
  startLesson: protectedProcedure
    .input(
      z.object({
        lessonId: z.number().int(),
        lastBlockId: z.number().int().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await progress.startLesson(
        ctx.user.userId,
        input.lessonId,
        input.lastBlockId
      );
    }),

  /** Server-graded quiz answer. Awards quiz XP at most once per block. */
  submitQuizAnswer: protectedProcedure
    .input(
      z.object({
        lessonId: z.number().int(),
        blockId: z.number().int(),
        questionId: z.string().min(1).max(100),
        answer: z.union([z.string().max(3000), z.boolean()]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await progress.submitQuizAnswer(ctx.user.userId, input);
    }),

  /** Records a challenge attempt. Never executes code server-side. */
  submitChallenge: protectedProcedure
    .input(
      z.object({
        lessonId: z.number().int(),
        blockId: z.number().int(),
        code: z.string().max(20000).optional(),
        answer: z.string().max(3000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await progress.submitChallenge(ctx.user.userId, input);
    }),

  /**
   * Completes a lesson. XP is awarded server-side exactly once
   * (advisory lock + xp_events unique index).
   */
  completeLesson: protectedProcedure
    .input(z.object({ lessonId: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      return await progress.completeLesson(ctx.user.userId, input.lessonId);
    }),
});
