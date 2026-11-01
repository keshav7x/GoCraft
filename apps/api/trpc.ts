import { initTRPC, TRPCError } from '@trpc/server';
import type{ Context } from './context';
import { AppError } from './Infra/Error/errors';

const t = initTRPC.context<Context>().create();

const TRPC_CODE_BY_STATUS = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'PAYLOAD_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'UNPROCESSABLE_CONTENT',
  429: 'TOO_MANY_REQUESTS',
} as const;

// Services throw AppError (see Infra/Error/errors.ts) with an HTTP status.
// Translate that into a TRPCError so clients receive a proper error code
// (e.g. CONFLICT for a duplicate email) instead of a generic
// INTERNAL_SERVER_ERROR with no machine-readable status.
const appErrorMapper = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof AppError) {
      const code =
        TRPC_CODE_BY_STATUS[error.statusCode as keyof typeof TRPC_CODE_BY_STATUS] ??
        'INTERNAL_SERVER_ERROR';
      throw new TRPCError({ code, message: error.message });
    }
    throw error;
  }
});

const baseProcedure = t.procedure.use(appErrorMapper);

export const router = t.router;
export const publicProcedure = baseProcedure;
export const protectedProcedure = baseProcedure.use(async (opts) => {
  const { ctx } = opts;
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