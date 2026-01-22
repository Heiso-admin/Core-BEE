import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { TenantTier } from "../../types/tenant";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Global cache to prevent connection exhaustion in dev (hot-reloading)
const globalForDb = globalThis as unknown as {
  isoClients: Map<string, postgres.Sql>;
  sharedClient: postgres.Sql | undefined;
};

if (!globalForDb.isoClients) globalForDb.isoClients = new Map();

// Shared Client
export const client =
  globalForDb.sharedClient ?? postgres(process.env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") globalForDb.sharedClient = client;

// class MyLogger implements Logger {
//   logQuery(query: string, params: unknown[]): void {
//     console.log({ query, params });
//   }
// }

const db = drizzle({ client, schema });
// We should probably set timezone on connection, but global usage is fine for Shared DB.
// Only execute if strict shared DB
// db.execute("SET TIME ZONE 'Asia/Shanghai'");

export async function closeDb() {
  // Ensure all connections are closed so scripts can exit cleanly
  await client.end({ timeout: 0 });
  for (const [key, cachedClient] of globalForDb.isoClients.entries()) {
    await cachedClient.end({ timeout: 0 });
    globalForDb.isoClients.delete(key);
  }
}

export { db };

export type Db = typeof db;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Transaction = Parameters<Parameters<Db["transaction"]>[0]>[0];

/**
 * Hybrid Connection Factory
 * Returns either the Shared DB (RLS) or an Isolated DB client based on Tier.
 * Accepts an optional custom schema for extending apps (e.g. CMS).
 */
export function getDbClient<TS extends Record<string, unknown> = typeof schema>(
  tier?: TenantTier,
  connectionString?: string | null,
  customSchema?: TS,
) {
  const targetSchema = (customSchema || schema) as TS;

  // 1. Enterprise / Custom
  // If connectionString looks like a URL, use it directly (Different Server/Cluster)
  // Otherwise, treat it as a Database Name on the same server (Supabase/Same Cluster)
  if ((tier === "ENTERPRISE" || tier === "CUSTOM") && connectionString) {
    let isoClient = globalForDb.isoClients.get(connectionString);

    if (!isoClient) {
      if (
        connectionString.startsWith("postgres://") ||
        connectionString.startsWith("postgresql://")
      ) {
        isoClient = postgres(connectionString);
      } else {
        // Reuse credentials from default DB, but switch database name
        if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
        isoClient = postgres(process.env.DATABASE_URL, {
          // @ts-ignore
          database: connectionString,
          onnotice: () => {}, // prevent noise
        });
      }
      globalForDb.isoClients.set(connectionString, isoClient);
    }

    const isoDb = drizzle({ client: isoClient, schema: targetSchema });
    // Optional: Set timezone for isolated DB too
    isoDb.execute("SET TIME ZONE 'Asia/Shanghai'");
    return isoDb;
  }

  // 2. Default -> Shared DB
  // If custom schema is requested, we must create a lightweight drizzle instance
  // reusing the SAME shared client but with the new schema.
  if (customSchema) {
    return drizzle({ client, schema: customSchema });
  }

  return db as unknown as ReturnType<typeof drizzle<TS>>;
}

