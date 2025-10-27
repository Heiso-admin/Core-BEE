"use server";

import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { auth } from "@/app/(auth)/auth.config";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";

async function getMembership() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Check if user is developer first
  const isDeveloper = await db.query.developers
    .findFirst({
      where: (t, { eq }) => eq(t.userId, userId),
    })
    .then(Boolean);

  // If user is developer, no need to query membership
  if (isDeveloper) {
    return { isDeveloper, membership: null };
  }

  // Get member details if not developer
  const membership = await db.query.members.findFirst({
    columns: {
      id: true,
      isOwner: true,
    },
    with: {
      role: {
        columns: {
          id: true,
          fullAccess: true,
        },
      },
    },
    where: (t, { eq }) => and(eq(t.userId, userId), eq(t.status, 'joined')),
  });

  return { isDeveloper, membership };
}

async function getInviteToken({ token }: { token: string }) {
  const member = await db.query.members.findFirst({
    where: (t, { eq }) => and(eq(t.inviteToken, token), isNull(t.deletedAt)),
  });

  if (!member) return null;

  if (!member.tokenExpiredAt || member.tokenExpiredAt < new Date()) {
    return null;
  }

  return member;
}

async function join(id: string, userId: string) {
  return await db
    .update(members)
    .set({
      userId,
      inviteToken: "",
      tokenExpiredAt: null,
      status: "joined",
    })
    .where(eq(members.id, id));
}

async function decline(id: string) {
  return await db
    .update(members)
    .set({
      inviteToken: "",
      tokenExpiredAt: null,
      status: "declined",
    })
    .where(eq(members.id, id));
}

async function removeJoinToken() {
  const cookieStore = await cookies();
  cookieStore.delete("join-token");
}

export { getMembership, getInviteToken, join, decline, removeJoinToken };
