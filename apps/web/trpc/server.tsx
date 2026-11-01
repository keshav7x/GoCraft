import "server-only";

import { createTRPCClient, httpLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { cache } from "react";
import type { AppRouter } from "api";
import { makeQueryClient } from "./query-client";

// Stable getter: same QueryClient per request on the server.
export const getQueryClient = cache(makeQueryClient);

function getApiUrl() {
  return process.env.API_URL ?? "http://localhost:5000";
}

async function getRequestHeaders() {
  const h = await headers();
  return {
    cookie: h.get("cookie") ?? "",
  };
}

function makeServerClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${getApiUrl()}/trpc`,
        headers: getRequestHeaders,
      }),
    ],
  });
}

const serverClient = makeServerClient();

// The tRPC API lives on a separate Fastify server (apps/api),
// so the server-side proxy talks to it over HTTP instead of
// calling the router in-process.
export const trpc = createTRPCOptionsProxy({
  client: serverClient,
  queryClient: getQueryClient,
});

// Direct awaitable caller for Server Components (not stored in the QueryClient).
export const caller = serverClient;

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
