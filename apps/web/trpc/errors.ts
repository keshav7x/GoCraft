import { TRPCClientError } from "@trpc/client";

/** True only when the API rejected the call for missing/invalid auth. */
export function isAuthError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    const code = error.data?.code;
    return code === "UNAUTHORIZED" || code === "FORBIDDEN";
  }
  return false;
}
