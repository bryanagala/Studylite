import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://studylite:studylite@127.0.0.1:5433/studylite";

declare global {
  // eslint-disable-next-line no-var
  var __studyliteSql: ReturnType<typeof postgres> | undefined;
}

function needsSsl(url: string) {
  return !(
    url.includes("127.0.0.1") ||
    url.includes("localhost") ||
    url.includes("@postgres:")
  );
}

function getClient() {
  const options = {
    max: process.env.NODE_ENV === "production" ? 1 : 10,
    idle_timeout: 20,
    connect_timeout: 30,
    // Railway / cloud Postgres require TLS from Vercel
    ssl: needsSsl(connectionString) ? ("require" as const) : undefined,
    // Safer for serverless / pooled connections
    prepare: false,
  };

  if (process.env.NODE_ENV === "production") {
    return postgres(connectionString, options);
  }
  if (!global.__studyliteSql) {
    global.__studyliteSql = postgres(connectionString, options);
  }
  return global.__studyliteSql;
}

export function getDb() {
  return drizzle(getClient(), { schema });
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL || process.env.USE_LOCAL_DB === "true");
}
