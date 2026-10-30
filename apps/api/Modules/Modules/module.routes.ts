import { AppError } from "../../Infra/Error/errors";
import { protectedProcedure, router } from "../../trpc";
import { z } from "zod";
import { moduleService } from "./module.service";
import {
  createModuleSchema,
  getModuleByIdSchema,
  updateModuleSchema
} from "./modules.types";

const moduleServiceInstance = new moduleService();

export const moduleRouter = router({
  createModule: protectedProcedure
    .input(createModuleSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const module = await moduleServiceInstance.create(userId, input);
      if (!module) throw new AppError("Module could not be created", 400);
      return module;
    }),

  getModuleById: protectedProcedure
    .input(z.object({moduleId:z.number()}))
    .query(async ({ input, ctx }) => {
      const module = await moduleServiceInstance.getModuleById(input.moduleId, ctx.user.userId);
      if (!module) throw new AppError("Module not found", 404);
      return module;
    }),

  getAllModules: protectedProcedure
    .query(async ({ ctx }) => {
      return await moduleServiceInstance.getAllModules(ctx.user.userId);
    }),

  getAllModulesWithStats: protectedProcedure
    .query(async ({ ctx }) => {
      return await moduleServiceInstance.getAllModulesWithStats(ctx.user.userId);
    }),

  updateModule: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        data: updateModuleSchema
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const updated = await moduleServiceInstance.update(userId, input.id, input.data);
      if (!updated) throw new AppError("Module could not be updated", 400);
      return updated;
    }),

  deleteModule: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const success = await moduleServiceInstance.delete(userId, input.id);
      if (!success) throw new AppError("Module could not be deleted", 400);
      return { success: true };
    }),

  reorderModules: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.number().int(),
          targetModuleNo: z.number().int()
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      await moduleServiceInstance.reorderModules(userId, input);
      return { success: true };
    })
});
