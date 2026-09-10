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

function getClient() {
  if (process.env.NODE_ENV === "production") {
    return postgres(connectionString, { max: 10 });
  }
  if (!global.__studyliteSql) {
    global.__studyliteSql = postgres(connectionString, { max: 10 });
  }
  return global.__studyliteSql;
}

export function getDb() {
  return drizzle(getClient(), { schema });
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL || process.env.USE_LOCAL_DB === "true");
}
