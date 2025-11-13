"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/hash";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function updatePassword(userId: string, data: unknown) {
  const result = passwordSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Invalid password format");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isValid = await verifyPassword(
    result.data.currentPassword,
    user.password,
  );
  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await hashPassword(result.data.newPassword);
  await db
    .update(users)
    .set({
      password: hashedPassword,
      mustChangePassword: false, // Reset the flag after password change
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  revalidatePath("/dashboard/account/authentication");
}

export async function toggle2FA(userId: string, enabled: boolean) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  await db
    .update(users)
    .set({
      twoFactorEnabled: enabled,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  revalidatePath("/dashboard/account/authentication");
}

// 查詢會員（含角色），支援以 userId 或 email 查找
export async function findMembershipByUserOrEmail(params: { userId?: string; email?: string }) {
  const { userId, email } = params || {};
  const membershipById = userId
    ? await db.query.members.findFirst({
        columns: { id: true, status: true, isOwner: true, userId: true, email: true },
        with: { role: { columns: { id: true, name: true, fullAccess: true } } },
        where: (t, { and, eq, isNull }) => and(eq(t.userId, userId), isNull(t.deletedAt)),
      })
    : null;

  const membership = membershipById ?? (email
    ? await db.query.members.findFirst({
        columns: { id: true, status: true, isOwner: true, userId: true, email: true },
        with: { role: { columns: { id: true, name: true, fullAccess: true } } },
        where: (t, { and, eq, isNull }) => and(eq(t.email, email!), isNull(t.deletedAt)),
      })
    : null);

  return membership;
}
