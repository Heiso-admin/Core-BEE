"use server";

import { signIn, signOut } from '@/modules/auth/auth.config';
import { db } from "@/lib/db";
import { users as usersTable } from "@/lib/db/schema";
import { hashPassword } from "@/lib/hash";

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
