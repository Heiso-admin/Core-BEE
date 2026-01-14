"use server";

import { db } from "@heiso/core/lib/db";
import { ensureTenantContext } from "@heiso/core/lib/db/rls";
import { members, users as usersTable } from "@heiso/core/lib/db/schema";
import {
  hashPassword,
  verifyPassword as verifyPasswordHash,
} from "@heiso/core/lib/hash";
import { signIn, signOut } from "@heiso/core/modules/auth/auth.config";
import { ensureMemberReviewOnFirstLogin } from "@heiso/core/modules/auth/_server/user.service";

import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";

export async function login(username: string, password: string) {
  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false, // Prevent automatic redirection after successful login
    });

    await db
      .update(usersTable)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(usersTable.email, username));

    return true;
  } catch (error: any) {
    if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error during login:", error);
    return false; // Return false to indicate login failure
  }
}

/**
 * Verify user password without creating a session.
 * Returns true if the email exists and the password matches.
 */
export async function verifyPasswordOnly(
  email: string,
  password: string,
): Promise<boolean> {
  try {
    const user = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.email, email),
      columns: { id: true, password: true },
    });
    if (!user) return false;

    const isMatch = await verifyPasswordHash(password, user.password);
    return !!isMatch;
  } catch (error) {
    console.error("Error during verifyPasswordOnly:", error);
    return false;
  }
}

export async function signup(input: {
  name?: string;
  email: string;
  password: string;
}): Promise<{ id: string; name: string } | null> {
  const name = input.name?.trim();
  const email = input.email.trim();
  const { password } = input;

  // Ensure RLS context for Server Action
  await ensureTenantContext();

  try {
    // 先檢查是否已存在 user（可能由邀請流程預先建立）
    const existing = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.email, email),
      columns: { id: true, name: true },
    });

    let user: { id: string; name: string } | null = null;

    if (existing) {
      // 已存在則更新密碼與姓名，避免重複建立
      const hashed = await hashPassword(password);
      const [updated] = await db
        .update(usersTable)
        .set({
          name: name ?? existing.name ?? email.split("@")[0],
          password: hashed,
          mustChangePassword: false,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, existing.id))
        .returning({ id: usersTable.id, name: usersTable.name });
      user = updated ?? null;
    } else {
      // 不存在則建立新使用者
      const [created] = await db
        .insert(usersTable)
        .values({
          email,
          name: name ?? email.split("@")[0],
          password: await hashPassword(password),
        })
        .returning({ id: usersTable.id, name: usersTable.name });
      user = created ?? null;
    }

    // 建立成功，更改為審查，但如果目前資料庫中只有一個使用者，則直接加入
    if (user?.id) {
      // const [{ total }] = await db
      //   .select({ total: sql<number>`count(*)` })
      //   .from(usersTable);

      // const nextStatus = total === 1 ? "joined" : "review";
      // 不需要審查，直接加入
      const nextStatus = "joined";
      console.log("nextStatus: ", nextStatus);

      const headerList = await headers();
      const tenantId = headerList.get("x-tenant-id") || undefined;

      console.log("[DEBUG] Signup: extracted tenantId from headers:", tenantId);

      // Ensure member exists and bind user (Auto-create first owner if needed)
      await ensureMemberReviewOnFirstLogin(email, user.id, tenantId);
    }
    return user;
  } catch (error) {
    console.error("Error during signup:", error);
    return null; // Return false to indicate signup failure
  }
}

export async function logout() {
  try {
    await signOut({
      redirect: false,
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return false; // Return false to indicate login failure
  }
}

/**
 * Check if there is at least one user in DB.
 */
export async function hasAnyUser() {
  const first = await db.query.users.findFirst({
    columns: { id: true },
  });
  return !!first;
}

export const oAuthLogin = async (provider: string) => {
  await signIn(provider);
};

export const oAuthLogout = async () => {
  await signOut({ redirectTo: "/" });
};
