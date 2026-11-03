"use client";

import { trpcClient } from "@/app/lib/trpc";
import { clearSimulatedRole } from "@/app/lib/admin/role";

/**
 * Clears the session cookie via the API and resets local preview state.
 * Safe to call when already signed out.
 */
export async function logout(): Promise<void> {
  try {
    await trpcClient.auth.logout.mutate();
  } catch {
    // Cookie clear is best-effort; continue with local cleanup.
  }
  clearSimulatedRole();
}
