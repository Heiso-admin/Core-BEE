import { sql } from "drizzle-orm";
import { varchar } from "drizzle-orm/pg-core";

/**
 * Standard schema for tenant isolation.
 * Include this in every table definition that requires tenant separation.
 */
export const tenantSchema = {
    tenantId: varchar("tenant_id", { length: 50 }).notNull().default(sql`current_setting('app.current_tenant_id', true)`),
};
