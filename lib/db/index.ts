import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { TenantTier } from "../../types/tenant";

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
  // 1. Enterprise / Custom
  // If connectionString looks like a URL, use it directly (Different Server/Cluster)
  // Otherwise, treat it as a Database Name on the same server (Supabase/Same Cluster)
  if ((tier === 'ENTERPRISE' || tier === 'CUSTOM') && connectionString) {
    let isoClient;

    if (connectionString.startsWith("postgres://") || connectionString.startsWith("postgresql://")) {
      isoClient = postgres(connectionString);
    } else {
      // Reuse credentials from default DB, but switch database name
      if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
      isoClient = postgres(process.env.DATABASE_URL, {
        // @ts-ignore
        database: connectionString,
        onnotice: () => { }, // prevent noise
      });
    }

    const isoDb = drizzle({ client: isoClient, schema });
    // Optional: Set timezone for isolated DB too
    isoDb.execute("SET TIME ZONE 'Asia/Shanghai'");
    return isoDb;
  }

  // 2. Default -> Shared DB
  return db;
}

