import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { TenantTier } from "@heiso/hive/types";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const client = postgres(process.env.DATABASE_URL);

// class MyLogger implements Logger {
//   logQuery(query: string, params: unknown[]): void {
//     console.log({ query, params });
//   }
// }

const db = drizzle({ client, schema });
// We should probably set timezone on connection, but global usage is fine for Shared DB.
db.execute("SET TIME ZONE 'Asia/Shanghai'");

export async function closeDb() {
  // Ensure all connections are closed so scripts can exit cleanly
  await client.end({ timeout: 0 });
}

export { db };

/**
 * Hybrid Connection Factory
 * Returns either the Shared DB (RLS) or an Isolated DB client based on Tier.
 */
export function getDbClient(tier?: TenantTier, connectionString?: string | null) {
  // 1. Enterprise / Custom with dedicated string -> Isolated DB
  if ((tier === 'ENTERPRISE' || tier === 'CUSTOM') && connectionString) {
    const isoClient = postgres(connectionString);
    const isoDb = drizzle({ client: isoClient, schema });
    // Optional: Set timezone for isolated DB too
    isoDb.execute("SET TIME ZONE 'Asia/Shanghai'");
    return isoDb;
  }

  // 2. Default -> Shared DB
  return db;
}

