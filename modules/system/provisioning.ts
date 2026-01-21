
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { CMS_DEFAULT_MENUS, DEFAULT_ROLES } from '../../config/initDefaults';
import { menus, navigations, navigationMenus } from "@heiso/core/lib/db/schema";
import { generateNavigationId } from "@heiso/core/lib/id-generator";
import { eq } from "drizzle-orm";
import path from "path";

export async function provisionTenantDb(dbUrl: string, modules: string[], tenantId: string) {
    console.log(`[Provisioning] Starting for DB: ${dbUrl} with modules: ${modules.join(', ')}`);
    
    // 1. Connection
    // Connection must be 'postgres' (not 'drizzle-orm/postgres-js' client type exactly, but the driver)
    const migrationClient = postgres(dbUrl, { max: 1 });
    const db = drizzle(migrationClient);

    // Helper to find migrations folder in Monorepo
    const findCoreMigrations = async (startDir: string): Promise<string | null> => {
        const { join, resolve } = await import("path");
        const { existsSync } = await import("fs");
        
        let current = startDir;
        for (let i = 0; i < 5; i++) { // Max depth 5
             const target = join(current, 'packages/core/drizzle');
             if (existsSync(target)) return target;
             
             // Check if we are inside packages/core already
             const localTarget = join(current, 'drizzle');
             if (existsSync(join(current, 'package.json')) && existsSync(localTarget)) {
                 // Verify package name if needed, or just assume
                 return localTarget;
             }

             const parent = resolve(current, '..');
             if (parent === current) break;
             current = parent;
        }
        return null;
    };

    const migrationsFolder = await findCoreMigrations(process.cwd());
    
    if (!migrationsFolder) {
        console.error(`[Provisioning] Could not locate 'packages/core/drizzle' from ${process.cwd()}`);
        return; // Cannot migrate
    }

    try {
        console.log(`[Provisioning] Running migrations from ${migrationsFolder}...`);
        try {
            await migrate(db, { migrationsFolder });
            console.log(`[Provisioning] Migrations applied successfully.`);
        } catch (e: any) {
            // Robust check for "Table already exists"
            // Postgres error code 42P07: relation "..." already exists
            const code = e.code || e.cause?.code;
            const msg = e.message || e.cause?.message || "";
            
            if (code === '42P07' || msg.includes("already exists")) {
                console.warn('[Provisioning] Tables already exist (Migration skipped). Proceeding to seed defaults...');
            } else {
                console.error('[Provisioning] Migration failed:', e);
                throw e;
            }
        }

        // 3. Seed Default Data
        await seedDefaults(db, modules, tenantId);

    } catch (error) {
        console.error('[Provisioning] Error during provisioning:', error);
        throw error;
    } finally {
        await migrationClient.end();
    }
}

async function seedDefaults(db: any, modules: string[], tenantId: string) {
    // 1. Seed 'menus' (Dashboard RBAC Menus)
    // Check if menus exist specifically for THIS tenant
    const existingMenus = await db.select().from(menus).where(eq(menus.tenantId, tenantId)).limit(1);
    
    if (existingMenus.length === 0) {
        console.log('[Provisioning] Seeding "menus" table for tenant:', tenantId);
        await db.transaction(async (tx: any) => {
            let orderCounter = 1000;
            for (const mod of modules) {
                const modMenus = CMS_DEFAULT_MENUS[mod as keyof typeof CMS_DEFAULT_MENUS];
                if (modMenus) {
                    for (const group of modMenus) {
                        const groupName = group.group;
                        if (group.items && group.items.length > 0) {
                            for (const item of group.items) {
                                 await tx.insert(menus).values({
                                     tenantId: tenantId,
                                     title: item.meta?.title || item.name,
                                     path: item.meta?.url || '#',
                                     icon: item.meta?.icon,
                                     group: groupName,
                                     order: orderCounter++,
                                     updatedAt: new Date(),
                                 });
                            }
                        }
                    }
                }
            }
        });
    } else {
        console.log(`[Provisioning] Menus already exist for tenant ${tenantId}. Skipping.`);
    }

    // 2. Seed 'roles'
    if (modules.includes('role')) {

        const { roles } = await import('@heiso/core/lib/db/schema');
        
        const existingRoles = await db.select().from(roles).where(eq(roles.tenantId, tenantId)).limit(1);
        if (existingRoles.length === 0) {
            console.log('[Provisioning] Seeding "roles" table for tenant:', tenantId);
            await db.transaction(async (tx: any) => {
                for (const r of DEFAULT_ROLES) {
                    await tx.insert(roles).values({
                        tenantId: tenantId,
                        name: r.name,
                        description: r.description,
                        fullAccess: r.fullAccess,
                    });
                }
            });
        } else {
             console.log(`[Provisioning] Roles already exist for tenant ${tenantId}. Skipping.`);
        }
    }

    // 3. Seed 'navigations' (Feature Menus - Main Website/Nav)
    // Check if Main Navigation exists for THIS tenant
    const existingNav = await db.select().from(navigations).where(
        // and(eq(navigations.slug, 'main'), eq(navigations.tenantId, tenantId))
        // Since we are using raw postgres connection without RLS active in this context (usually),
        // we MUST filter by tenantId to avoid collision in Shared DB.
        eq(navigations.tenantId, tenantId)
    ).limit(1);
    
    if (existingNav.length > 0) {
        console.log(`[Provisioning] Navigations already exist for tenant ${tenantId}. Skipping.`);
        return;
    }

    console.log('[Provisioning] Seeding "navigations" table for tenant:', tenantId);
    await db.transaction(async (tx: any) => {
        const navId = generateNavigationId();
        const PLACEHOLDER_USER_ID = 'system_init'; 

        await tx.insert(navigations).values({
            id: navId,
            userId: PLACEHOLDER_USER_ID, 
            slug: 'main',
            name: 'Main Menu',
            description: 'Default system generated menu',
            tenantId: tenantId,
        });

        let orderCounter = 0;
        for (const mod of modules) {
            const modMenus = CMS_DEFAULT_MENUS[mod as keyof typeof CMS_DEFAULT_MENUS];
            if (modMenus) {
                // Flatten items for navigation_menus?
                // The config structure is Group -> Items.
                for (const group of modMenus) {
                     if (group.items) {
                        for (const item of group.items) {
                            await tx.insert(navigationMenus).values({
                                navigationId: navId,
                                slug: (item.name || 'item').toLowerCase().replace(/\s+/g, '-'),
                                title: item.meta?.title || item.name,
                                link: item.meta?.url || '#',
                                linkType: 'link',
                                enabled: true,
                                order: orderCounter++,
                                tenantId: tenantId, 
                            });
                        }
                     }
                }
            }
        }
    });
}
