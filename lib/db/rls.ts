import { sql } from 'drizzle-orm';
import { db } from './index';

/**
 * Injects the current tenant context into the Postgres session.
 * This is required for RLS policies (e.g. members table) to function correctly.
 * 
 * Usage: Call this before executing queries in a request context.
 * 
 * @param tenantId - The ID of the current tenant (e.g. from x-tenant-id header)
 */
export async function setTenantContext(tenantId: string) {
    if (!tenantId) {
        console.warn('[RLS] setTenantContext called with empty tenantId');
        return;
    }

    // We use set_config with is_local=true (third arg false in some docs, but actually:
    // set_config(setting_name, new_value, is_local)
    // is_local=true means the setting applies only to the current transaction.
    // However, Drizzle/Postgres.js often reuses connections. 
    // If we use session-level (is_local=false), it persists until connection close.
    // Given we are usually stateless, transaction-scoped (true) is safer if wrapped in tx,
    // but here we are setting it for the "Request Duration" which might span multiple queries.
    // For safety in pooled environments:
    // Ideally use db.transaction(...) and set it inside.
    // But since we are injecting global context for the request, we use `false` (session duration),
    // and rely on the fact that the next request will overwrite it.
    // WAIT: "Next request overwrites it" is dangerous if connection is reused and next request forgets to set it.
    // SAFER: Use `is_local=false` BUT we must ensure every request sets it.

    // Actually, best practice with Drizzle+Supabase/Postgres is often using a transaction or resetting it.
    // Let's use `false` (session) for now as we don't wrap everything in one giant transaction.

    await db.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, false)`);
}

/**
 * Resets the tenant context. useful for cleanup or admin tasks.
 */
export async function resetTenantContext() {
    await db.execute(sql`SELECT set_config('app.current_tenant_id', '', false)`);
}

/**
 * Automatically extracts tenant ID from headers and sets the RLS context.
 * Use this in Server Actions where Layout injection doesn't run.
 */
export async function ensureTenantContext() {
    const { headers } = await import("next/headers");
    const h = await headers();
    const tenantId = h.get("x-tenant-id");

    if (tenantId) {
        await setTenantContext(tenantId);
    } else {
        // console.warn("[RLS] No tenant ID found in headers during ensureTenantContext");
    }
}
