import { AppError } from "../../Infra/Error/errors";
import { protectedProcedure, router } from "../../trpc";
import { z } from "zod";
import { BlockService } from "./block.service";
import { blockTypeEnum } from "../../Infra/Database/enum";

const blockService = new BlockService();

export const blockRouter = router({
  createBlock: protectedProcedure
    .input(
      z.object({
        lessonId: z.number().int(),
        type: blockTypeEnum,
        contentValue: z.string().nullable().optional(),
        problemId: z.number().int().nullable().optional(),
        orderNo: z.number().int().optional(),
        properties: z.record(z.string(), z.any()).optional().default({}),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const { lessonId, ...blockData } = input;
      const block = await blockService.createBlock(userId, lessonId, blockData as any);
      if (!block) throw new AppError("Block could not be created", 400);
      return block;
    }),

  updateBlock: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        data: z.object({
          contentValue: z.string().nullable().optional(),
          problemId: z.number().int().nullable().optional(),
          orderNo: z.number().int().optional(),
          properties: z.record(z.string(), z.any()).optional(),
        }).partial()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const updatedBlock = await blockService.updateBlock(userId, input.id, input.data as any);
      if (!updatedBlock) throw new AppError("Block could not be updated", 400);
      return updatedBlock;
    }),

  deleteBlock: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const success = await blockService.deleteBlock(userId, input.id);
      if (!success) throw new AppError("Block could not be deleted", 400);
      return { success: true };
    }),

  reorderBlocksInLesson: protectedProcedure
    .input(
      z.object({
        lessonId: z.number().int(),
        orderedBlockIds: z.array(z.number().int()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      await blockService.reorderBlocksInLesson(userId, input.lessonId, input.orderedBlockIds);
      return { success: true };
    }),

  getBlocksByLesson: protectedProcedure
    .input(z.object({ lessonId: z.number().int() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      return await blockService.getBlocksByLesson(userId, input.lessonId);
    }),
});
