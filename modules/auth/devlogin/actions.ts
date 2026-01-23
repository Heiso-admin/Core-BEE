"use server";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { adminUsers } from "@heiso/hive/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@heiso/core/lib/hash";

// Server Action to check status
export async function checkAdminStatus(email: string) {
    const HIVE_DATABASE_URL = process.env.HIVE_DATABASE_URL;
    if (!HIVE_DATABASE_URL) return { error: "No Database connection" };

    try {
        const client = postgres(HIVE_DATABASE_URL);
        const db = drizzle(client);
        // Cast to any to avoid Drizzle version mismatch types
        const user = await db.select().from(adminUsers as any).where(eq((adminUsers as any).email, email)).limit(1);
        await client.end();

        if (user.length === 0) return { error: "User not found" };
        return { lastLoginAt: user[0].lastLoginAt };
    } catch (e) {
        console.error(e);
        return { error: "Database error" };
    }
}

// Server Action to update password
export async function updateAdminPassword(email: string, newPassword: string) {
    const HIVE_DATABASE_URL = process.env.HIVE_DATABASE_URL;
    if (!HIVE_DATABASE_URL) return { error: "No Database connection" };

    try {
        const passwordHash = await hashPassword(newPassword);
        const client = postgres(HIVE_DATABASE_URL);
        const db = drizzle(client);

        await db.update(adminUsers as any)
            .set({ password: passwordHash }) // lastLoginAt will be updated by signIn logic
            .where(eq((adminUsers as any).email, email));

        await client.end();
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update password" };
    }
}
