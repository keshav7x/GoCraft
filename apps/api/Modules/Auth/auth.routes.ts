import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { loginInputSchema, registerInputSchema, verifyEmailInputSchema } from "./auth.types";
import type { DBUser, UserResponse } from "./auth.types";
import { AppError } from "../../Infra/Error/errors";
import { authService as AuthService } from "../../Infra/container/services";

const authService = AuthService

const TRPC_ERROR_CODE_BY_STATUS: Record<number, TRPCError["code"]> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "BAD_REQUEST",
  500: "INTERNAL_SERVER_ERROR",
};

const rethrowAsTrpcError = (error: unknown): never => {
  if (error instanceof AppError) {
    throw new TRPCError({
      code: TRPC_ERROR_CODE_BY_STATUS[error.statusCode] ?? "INTERNAL_SERVER_ERROR",
      message: error.message,
      cause: error,
    });
  }
  throw error;
};

export const toUserResponse = ({
  password: _password,
  isDelete: _isDelete,
  ...user
}: DBUser): UserResponse => user;

export const authRouter = router({
  register: publicProcedure
    .input(registerInputSchema)
    .mutation(async ({ input }) => {
      try {
        const data = await authService.register({
          name: input.name,
          email: input.email,
          password: input.password
        });
        return { user: toUserResponse(data) };
      } catch (error) {
        rethrowAsTrpcError(error);
      }
    }),

  login: publicProcedure
    .input(loginInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const data = await authService.login({
          email: input.email,
          password: input.password
        });

        ctx.res.cookie("session_token", data.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7
        });

        return {
          user: toUserResponse(data.user)
        };
      } catch (error) {
        rethrowAsTrpcError(error);
      }
    }),

  verifyEmail: publicProcedure
    .input(verifyEmailInputSchema)
    .mutation(async ({ input }) => {
      return await authService.verifyEmail(input.token);
    }),

  getMe: protectedProcedure.query(async ({ ctx }) => {
    const user = await authService.getMe(ctx.user.userId);
    return user ? toUserResponse(user) : null;
  })
});
