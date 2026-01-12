import { sql, type ExtractTablesWithRelations } from "drizzle-orm";
import { type PgTransaction } from "drizzle-orm/pg-core";
import { type PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Type for Transaction (Shared DB)
type Transaction = PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

/**
 * Sets the RLS context for the current transaction.
 * MUST be called at the beginning of any transaction that accesses RLS-protected tables on the Shared DB.
 * 
 * @param tx The transaction object
 * @param tenantId The Tenant ID to switch context to
 */
export async function setRlsContext(tx: Transaction, tenantId: string) {
    // Use set_config with 'is_local' = true so it only lasts for the transaction
    await tx.execute(sql`SELECT set_config('app.current_tenant', ${tenantId}, true)`);
}
