import { authServiceClass } from "./auth.service";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { loginInputSchema, registerInputSchema, verifyEmailInputSchema } from "./auth.types";

const authService = new authServiceClass();

export const authRouter = router({
  register: publicProcedure
    .input(registerInputSchema)
    .mutation(async ({ input }) => {
      const data = await authService.register({
        name: input.name,
        email: input.email,
        password: input.password
      });
      return { ...data };
    }),

  login: publicProcedure
    .input(loginInputSchema)
    .mutation(async ({ input, ctx }) => {
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
        user: data.user
      };
    }),

  verifyEmail: publicProcedure
    .input(verifyEmailInputSchema)
    .mutation(async ({ input }) => {
      return await authService.verifyEmail(input.token);
    }),

  getMe: protectedProcedure.query(async (user) => {
    return await authService.getMe(user.ctx.user.userId)
  })
});
