/* ------------------------------------------------------------------ */
/* Premium access — integration point for Rabbit Hole.                 */
/*                                                                      */
/* STATUS: this repository has NO implemented premium/entitlement       */
/* system. Inspected before writing this file:                         */
/*   - apps/api tRPC context (apps/api/context.ts) only resolves a     */
/*     demo `user` (verifySessionToken treats "valid-token" as valid);  */
/*   - no membership, plan, tier, or entitlement tables exist in the    */
/*     Drizzle schema; no subscription logic exists anywhere;          */
/*   - the web app has no session cookie, no auth middleware, and no    */
/*     API client (NEXT_PUBLIC_API_URL is referenced once for an OAuth  */
/*     redirect and no .env file exists).                               */
/*                                                                      */
/* What this file deliberately does NOT do:                             */
/*   - It does not fabricate a verification result or claim a check     */
/*     passed that did not run. `verified: false` below is literal.     */
/*   - It does not invent a subscription schema.                        */
/*                                                                      */
/* INTEGRATION POINT — when a real entitlement system exists:           */
/*   1. Implement verifyPremiumEntitlement() to read the session        */
/*      (cookies()/headers() in a server component, or a tRPC query      */
/*      against apps/api) and return the user's premium status.         */
/*   2. Nothing else needs to change: both                               */
/*      app/dashboard/rabbit-hole/page.tsx and the [slug] route already */
/*      call getRabbitHoleAccess() on the server and render a locked    */
/*      state when granted === false.                                   */
/*   3. For real security, enforce again in apps/api's tRPC router —    */
/*      hiding the sidebar item is not access control.                  */
/* ------------------------------------------------------------------ */

export type PremiumAccess = {
  /** Whether access is currently granted. */
  granted: boolean;
  /** Whether an entitlement system actually verified this request. */
  verified: boolean;
  /** Machine-readable reason; "entitlement-system-not-implemented" means no check ran. */
  reason: "entitlement-system-not-implemented" | "no-premium-entitlement";
};

/**
 * Server-side premium check for Rabbit Hole.
 *
 * Call this from server components only (both Rabbit Hole routes already do).
 * Until an entitlement system exists it grants access with
 * `verified: false` — the feature is usable, and the lock code path is
 * real the moment `granted` starts returning false.
 */
export async function getRabbitHoleAccess(): Promise<PremiumAccess> {
  // Nothing to verify against yet: no session cookie, no entitlement API.
  return {
    granted: true,
    verified: false,
    reason: "entitlement-system-not-implemented",
  };
}
