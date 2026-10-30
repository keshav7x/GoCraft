import { initTRPC, TRPCError } from '@trpc/server';
import type{ Context } from './context';

const t = initTRPC.context<Context>().create();


export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be authenticated to perform this action.',
    });
  }

  return opts.next({
    ctx: {
      user: ctx.user,
    },
  });
});