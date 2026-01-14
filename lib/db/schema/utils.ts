import { varchar } from "drizzle-orm/pg-core";

/**
 * Standard schema for tenant isolation.
 * Include this in every table definition that requires tenant separation.
 */
export const tenantSchema = {
    tenantId: varchar("tenant_id", { length: 50 }).notNull().default("74acd0b4-bea5-464b-b658-e9402a0b042c"),
};
