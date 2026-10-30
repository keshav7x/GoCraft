
import Redis from "ioredis";
import { envConfig } from "../../config";

const redisUrl = envConfig.REDIS_URL!;

if (!redisUrl) {
  throw new Error("REDIS_URL is not configured");
}

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

redis.on("connect", () => {
  console.info("[Redis] Connecting...");
});

redis.on("ready", () => {
  console.info("[Redis] Ready");
});

redis.on("error", (error) => {
  console.error("[Redis] Connection error:", error.message);
});

redis.on("close", () => {
  console.warn("[Redis] Connection closed");
});
