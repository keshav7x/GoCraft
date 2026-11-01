"use client";

import { fetchSession } from "@/app/lib/trpc";

export type SimulatedRole = "admin" | "user";

const SIM_ROLE_KEY = "gocraft-sim-role";

export function readSimulatedRole(): SimulatedRole {
  if (typeof window === "undefined") return "admin";
  const value = window.localStorage.getItem(SIM_ROLE_KEY);
  return value === "user" ? "user" : "admin";
}

export function writeSimulatedRole(role: SimulatedRole) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SIM_ROLE_KEY, role);
}

/**
 * Resolves the effective role for entry routing.
 * Prefers the real session role (available after login); falls back to the
 * locally simulated role so the frontend-only CMS remains reachable.
 */
export async function resolveRole(): Promise<SimulatedRole> {
  try {
    const session = await fetchSession();
    if (session && "userType" in session) {
      const userType = (session as { userType?: string }).userType;
      if (userType === "admin" || userType === "user") return userType;
    }
  } catch {
    // No backend session — use the simulated role instead.
  }
  return readSimulatedRole();
}

export function homePathForRole(role: SimulatedRole): string {
  return role === "admin" ? "/admin" : "/";
}
