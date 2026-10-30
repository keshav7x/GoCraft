import Fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "./appRouter";
import { createContext } from "./context";
import fastifyCookie from "@fastify/cookie";

const server = Fastify({
  logger: true,
});

//Import routes
import { authRouter } from "./Modules/Auth/auth.routes";
import { envConfig } from "./config";
import { registerUploadRoutes } from "./Modules/Upload/upload.route";
import { startOutboxWorker } from "./Infra/OutBox/outbox.worker";

async function main() {
  server.register(fastifyCookie, {
    secret:process.env.COOKIE_SECRET!
  })
  registerUploadRoutes(server);
  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
    },
  });


  server.get("/health", async () => {
    return {
      status: "ok",
      service: "gocraft-api",
    };
  });
  const port = Number(envConfig.PORT || 5000);

  await server.listen({
    port,
    host: "0.0.0.0",
  });
  console.log(`Server is listening on port ${port}`)

  startOutboxWorker();
}

main().catch((error: unknown) => {
  server.log.error(error);
  process.exitCode = 1;
});
