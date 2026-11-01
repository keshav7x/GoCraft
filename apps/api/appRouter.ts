import { authRouter, toUserResponse } from './Modules/Auth/auth.routes';
import { blockRouter } from './Modules/Block/block.routes';
import { lessonRouter } from './Modules/Lessons/lesson.routes';
import { moduleRouter } from './Modules/Modules/module.routes';


import {publicProcedure,protectedProcedure,router} from './trpc'
import { authServiceClass } from './Modules/Auth/auth.service';

const authService = new authServiceClass();

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
  lesson:lessonRouter
  
});

export type AppRouter = typeof appRouter;
