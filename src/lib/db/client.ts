import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

const rawUrl =
  process.env.DATABASE_URL ||
  "postgres://studylite:studylite@127.0.0.1:5433/studylite";

declare global {
  // eslint-disable-next-line no-var
  var __studyliteSql: ReturnType<typeof postgres> | undefined;
}

function isLocalUrl(url: string) {
  return (
    url.includes("127.0.0.1") ||
    url.includes("localhost") ||
    url.includes("@postgres:")
  );
}

/** Ensure remote URLs request TLS (Railway / Vercel). */
export function resolveDatabaseUrl(url: string) {
  if (isLocalUrl(url)) return url;
  if (/[?&]sslmode=/i.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}sslmode=require`;
}

const connectionString = resolveDatabaseUrl(rawUrl.trim());

function getClient() {
  if (process.env.NODE_ENV === "production" && isLocalUrl(connectionString)) {
    throw new Error(
      "DATABASE_URL is missing or points to localhost. Set the Railway public URL in Vercel env vars (Production)."
    );
  }

  const options = {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 30,
    prepare: false as const,
    ssl: isLocalUrl(connectionString)
      ? undefined
      : ({ rejectUnauthorized: false } as const),
  };

  // Reuse one client across warm serverless invocations
  if (!global.__studyliteSql) {
    global.__studyliteSql = postgres(connectionString, options);
  }
  return global.__studyliteSql;
}

export function getDb() {
  return drizzle(getClient(), { schema });
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDatabaseHostHint() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return "missing";
  return (url.match(/@([^:/]+)/) || [])[1] || "unknown";
}

export function formatDbError(err: unknown) {
  if (!(err instanceof Error)) return "Database error";
  const parts = [err.message];
  const cause = (err as Error & { cause?: unknown }).cause;
  if (cause instanceof Error && cause.message) {
    parts.push(cause.message);
  } else if (typeof cause === "string") {
    parts.push(cause);
  }
  parts.push(`dbHost=${getDatabaseHostHint()}`);
  return parts.join(" | ");
}
