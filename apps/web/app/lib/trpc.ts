import { createTRPCClient, httpLink, TRPCClientError } from "@trpc/client";
import type { AppRouter } from "../../../api/appRouter";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: "/api/trpc",
    }),
  ],
});

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof trpcClient.me.query>>
>;

export async function fetchSession(): Promise<SessionUser | null> {
  try {
    return await trpcClient.me.query();
  } catch {
    return null;
  }
}

export function getTrpcErrorInfo(error: unknown): {
  code: string | null;
  message: string;
  isNetworkError: boolean;
} {
  if (error instanceof TRPCClientError) {
    return {
      code: error.data?.code ?? null,
      message: error.message,
      isNetworkError: !error.data,
    };
  }

  return {
    code: null,
    message: "Something went wrong. Please try again.",
    isNetworkError: false,
  };
}
