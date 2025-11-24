"use server";

import { signIn, signOut } from '@/modules/auth/auth.config';
import { db } from "@/lib/db";
import { users as usersTable, members } from "@/lib/db/schema";
import { hashPassword } from "@/lib/hash";
import { verifyPassword as verifyPasswordHash } from "@/lib/hash";
import { and, eq, isNull, sql } from "drizzle-orm";

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
  } catch (error) {
    console.error("Error during login:", error);
    return false; // Return false to indicate login failure
  }
}

/**
 * Verify user password without creating a session.
 * Returns true if the email exists and the password matches.
 */
export async function verifyPasswordOnly(email: string, password: string): Promise<boolean> {
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

export async function signup({
  name,
  email,
  password,
}: {
  name?: string;
  email: string;
  password: string;
}): Promise<{ id: string; name: string } | null> {
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
      const nextStatus = 'joined';
      console.log('nextStatus: ', nextStatus);
      await db
        .update(members)
        .set({ userId: user.id, status: nextStatus, updatedAt: new Date() })
        .where(and(eq(members.email, email), isNull(members.deletedAt)));
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
}

export const oAuthLogout = async () => {
  await signOut({ redirectTo: "/" });
}
