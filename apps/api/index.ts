import Fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "./appRouter";
import fastifyCookie from "@fastify/cookie";

const server = Fastify({
  logger: true,
});


async function main() {
  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext: () => ({}),
    },
  });
  server.register(fastifyCookie, {
    secret:process.env.COOKIE_SECRET!
  })
  
  server.get("/health", async () => {
    return {
      status: "ok",
      service: "gocraft-api",
    };
  });
  const port = Number(4000);

  await server.listen({
    port,
    host: "0.0.0.0",
  });
  console.log(`Server is listening on port ${port}`)

}

main().catch((error: unknown) => {
  server.log.error(error);
  process.exitCode = 1;
});
