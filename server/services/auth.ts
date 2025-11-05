"use server";

import { signIn, signOut } from '@/modules/auth/auth.config';
import { db } from "@/lib/db";
import { users as usersTable, members } from "@/lib/db/schema";
import { hashPassword } from "@/lib/hash";
import { and, eq, isNull, sql } from "drizzle-orm";

export async function login(username: string, password: string) {
  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false, // Prevent automatic redirection after successful login
    });

    return true;
  } catch (error) {
    console.error("Error during login:", error);
    return false; // Return false to indicate login failure
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
    const [user] = await db
      .insert(usersTable)
      .values({
        email,
        name: name ?? email.split("@")[0],
        password: await hashPassword(password),
      })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
      });

    // 建立成功，更改為審查，但如果目前資料庫中只有一個使用者，則直接加入
    if (user?.id) {
      const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(usersTable);

      const nextStatus = total === 1 ? "joined" : "review";
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
