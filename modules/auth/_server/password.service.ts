"use server";

import { and, eq, gt } from "drizzle-orm";
import { settings } from "@/config";
import { db } from "@/lib/db";
import { userPasswordReset, users as usersTable } from "@/lib/db/schema";
import { sendForgotPasswordEmail } from "@/lib/email";
import { hashPassword } from "@/lib/hash";
import { generateId } from "@/lib/id-generator";
// import { users as usersTable } from '@/lib/db/schema';

/**
 * Request password reset: generate token, persist, and send reset email
 */
export async function requestPasswordReset(email: string) {
  const user = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return { ok: true };
  }

  const token = generateId(undefined, 32);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db.insert(userPasswordReset).values({
    userId: user.id,
    token,
    expiresAt,
    used: false,
  });

  const { NOTIFY_EMAIL, BASE_HOST } = await settings();
  const resetLink = `${BASE_HOST}/auth/reset-password?token=${token}`;

  await sendForgotPasswordEmail({
    from: NOTIFY_EMAIL as string,
    to: [email],
    subject: "Reset your password",
    resetLink,
    name: user.name ?? "",
  });

  return { ok: true };
}

/**
 * Reset password using token: validate, update user password, mark token used
 */
export async function resetPassword(token: string, newPassword: string) {
  const record = await db.query.userPasswordReset.findFirst({
    where: (t, { and, eq, gt }) =>
      and(eq(t.token, token), eq(t.used, false), gt(t.expiresAt, new Date())),
  });

  if (!record) {
    throw new Error("Invalid or expired reset token");
  }

  const hashedPassword = await hashPassword(newPassword);

  await db
    .update(usersTable)
    .set({ password: hashedPassword, mustChangePassword: false })
    .where(eq(usersTable.id, record.userId));

  await db
    .update(userPasswordReset)
    .set({ used: true })
    .where(eq(userPasswordReset.id, record.id));

  return { ok: true };
}
