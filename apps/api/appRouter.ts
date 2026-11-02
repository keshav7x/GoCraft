import { authRouter, toUserResponse } from './Modules/Auth/auth.routes';
import { blockRouter } from './Modules/Block/block.routes';
import { lessonRouter } from './Modules/Lessons/lesson.routes';
import { moduleRouter } from './Modules/Modules/module.routes';
import { progressRouter } from './Modules/Progress/progress.routes';


import {publicProcedure,protectedProcedure,router} from './trpc'
import { authServiceClass } from './Modules/Auth/auth.service';
import { authService as AuthService} from './Infra/container/services';

const authService = AuthService

export const appRouter = router({
  health: publicProcedure.query(() => {
    return {
      status: "Ok",
      service: "gocraft-api",
      timestamp: new Date().toISOString(),
    }
  }),
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await authService.getMe(ctx.user.userId);
    return user ? toUserResponse(user) : null;
  }),
  auth: authRouter,
  module: moduleRouter,
  block: blockRouter,
  lesson:lessonRouter,
  progress: progressRouter

});

export type AppRouter = typeof appRouter;
