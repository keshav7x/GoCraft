import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { envConfig } from "../../config";

const { Pool } = pg;

const connectionString = envConfig.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

export const pool = new Pool({
  connectionString,

  max: 10,

  idleTimeoutMillis: 0,

  connectionTimeoutMillis: 5000,

  keepAlive: true,
});

pool.on("connect", () => {
  console.log("[DB] New connection established");
});

pool.on("acquire", () => {
  console.log("[DB] Connection acquired");
});

pool.on("remove", () => {
  console.log("[DB] Connection removed");
});

pool.on("error", (error) => {
  console.error("[DB] Unexpected pool error:", error);
});

export const db = drizzle({ client: pool });
