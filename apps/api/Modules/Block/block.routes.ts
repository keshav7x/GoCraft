import { AppError } from "../../Infra/Error/errors";
import { protectedProcedure, router } from "../../trpc";
import { z } from "zod";
import { blockService as BlockService} from "../../Infra/container/services";
import { addBlocksSchema, createBlockSchema, updateBlockSchema } from "./block.types";
import { blockTypeEnum } from "../../Infra/Database/enum";

const blockService = BlockService;

export const blockRouter = router({
  createBlock: protectedProcedure
    .input(createBlockSchema.extend({ lessonId: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const { lessonId, ...blockData } = input;
      //@ts-ignore
      const block = await blockService.createBlock(userId, lessonId, blockData);
      if (!block) throw new AppError("Block could not be created", 400);
      return block;
    }),

  addBlocks: protectedProcedure
    .input(addBlocksSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const blocks = await blockService.addBlocksToLesson(userId, input.lessonId, input.blocks);
      return blocks;
    }),

  updateBlock: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        data: updateBlockSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const updatedBlock = await blockService.updateBlock(userId, input.id, input.data);
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

  saveBlocks: protectedProcedure
    .input(
      z.object({
        lessonId: z.number().int(),
        blocks: z
          .array(
            z.object({
              id: z.number().int().optional(),
              type: z.string().min(1).max(50),
              content: z.record(z.string(), z.unknown()),
              problemId: z.number().int().nullable().optional(),
            })
          )
          .max(200),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      return await blockService.saveBlocks(userId, input.lessonId, input.blocks);
    }),
});
