"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function updateAvatar(userId: string, avatar: string) {
  try {
    const result = await db
      .update(users)
      .set({
        avatar,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      data: result[0],
      message: "Avatar updated successfully",
    };
  } catch (error) {
    console.error("Failed to update avatar:", error);

    return {
      success: false,
      error: "Failed to update avatar, please try again later",
    };
  }
}

// Function to update nickname
export async function updateNickname(userId: string, name: string) {
  try {
    await db
      .update(users)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: "Nickname updated successfully",
    };
  } catch (error) {
    console.error("Failed to update nickname:", error);

    return {
      success: false,
      error: "Failed to update nickname, please try again later",
    };
  }
}
