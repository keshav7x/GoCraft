"use client";

import { fetchSession } from "@/app/lib/trpc";

export type SimulatedRole = "admin" | "user";

const SIM_ROLE_KEY = "gocraft-sim-role";

/** Explicit UI-preview flag; null when never set this browser. */
export function readSimulatedRole(): SimulatedRole | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(SIM_ROLE_KEY);
  return value === "user" || value === "admin" ? value : null;
}

export function writeSimulatedRole(role: SimulatedRole) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SIM_ROLE_KEY, role);
}

export function clearSimulatedRole() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SIM_ROLE_KEY);
}

/** Real session role from the API; null when signed out or API unreachable. */
export async function fetchRealRole(): Promise<SimulatedRole | null> {
  try {
    const session = await fetchSession();
    if (session && "userType" in session) {
      const userType = (session as { userType?: string }).userType;
      if (userType === "admin" || userType === "user") return userType;
    }
  } catch {
    // Signed out or API down — treat as no session.
  }
  return null;
}

/**
 * UI routing role: explicit preview flag wins, then real session, then "user".
 * Server procedures always enforce the real session role independently of this.
 * Prefer fetchRealRole() for access-control checks (admin studio gate, etc.).
 */
export async function resolveRole(): Promise<SimulatedRole> {
  const simulated = readSimulatedRole();
  if (simulated) return simulated;
  const real = await fetchRealRole();
  if (real) return real;
  return "user";
}

export function homePathForRole(role: SimulatedRole): string {
  return role === "admin" ? "/admin" : "/";
}
