import {publicProcedure,router} from './trpc'
export const appRouter = router({
  health: publicProcedure.query(() => {
    return {
      status: "Ok",
      service: "gocraft-api",
      timestamp: new Date().toISOString(),
    }
  })
});

export type AppRouter = typeof appRouter;
