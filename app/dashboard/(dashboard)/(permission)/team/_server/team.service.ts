"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { settings } from "@/config/settings";
import { db } from "@/lib/db";
import type { TMember, TRole, TUser } from "@/lib/db/schema";
import { members } from "@/lib/db/schema";
import { users } from "@/lib/db/schema/auth/user";
import { sendEmail, sendInviteUserEmail } from "@/lib/email";
import { hashPassword } from "@/lib/hash";
import { generateInviteToken } from "@/lib/id-generator";

export type Member = TMember & {
  user: TUser | null;
  role: TRole | null;
};
async function getTeamMembers(): Promise<Member[]> {
  const members = await db.query.members.findMany({
    with: {
      user: true,
      role: true,
    },
    where: (t, { isNull }) => isNull(t.deletedAt),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });
  return members;
}

async function invite({
  email,
  orgOwner,
  role,
}: {
  email: string;
  orgOwner: string;
  role?: string;
}) {
  const inviteToken = generateInviteToken();
  const inviteTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  const inviteId = await db
    .insert(members)
    .values({
      roleId: role !== "owner" ? role : null,
      isOwner: role === "owner",
      email,
      inviteToken,
      tokenExpiredAt: inviteTokenExpiresAt,
    })
    .returning();

  if (inviteId) {
    const result = await sendInvite({
      email,
      orgOwner,
      inviteToken,
    });

    revalidatePath("./team", "page");
  }

  return inviteId;
}

async function updateMember({
  id,
  data,
}: {
  id: string;
  data: {
    isOwner?: boolean;
    roleId?: string | null;
  };
}) {
  const member = await db.update(members).set(data).where(eq(members.id, id));
  revalidatePath("./team", "page");
  return member;
}

async function sendInvite({
  email,
  orgOwner,
  inviteToken,
}: {
  email: string;
  orgOwner: string;
  inviteToken: string;
}) {
  const { NOTIFY_EMAIL, BASE_HOST } = await settings();
  const result = await sendInviteUserEmail({
    from: NOTIFY_EMAIL as string,
    to: [email],
    subject: `${orgOwner} has invited you to join`, // TODO: replace orgName to site name
    orgName: "",
    orgOwner,
    inviteLink: `${BASE_HOST}/dashboard/join?token=${inviteToken}`,
  });
  return result;
}

async function resendInvite(id: string) {
  const member = await db.query.members.findFirst({
    where: (t, { eq }) => and(eq(t.id, id), isNull(t.deletedAt)),
  });

  if (!member) {
    throw new Error("Member not found");
  }

  const inviteToken = generateInviteToken();
  const inviteTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await db
    .update(members)
    .set({
      inviteToken,
      tokenExpiredAt: inviteTokenExpiresAt,
    })
    .where(eq(members.id, id))
    .returning();

  const { email } = member;
  const result = await sendInvite({
    email,
    // orgName: organization.name,
    orgOwner: "TODO: replace with owner",
    inviteToken,
  });

  return result;
}

async function revokeInvite(id: string) {
  await db.delete(members).where(eq(members.id, id));
  // await db
  //   .update(members)
  //   .set({
  //     deletedAt: new Date(),
  //   })
  //   .where(eq(members.id, id));
}

async function leaveTeam(id: string) {
  await db.delete(members).where(eq(members.id, id));

  // await db
  //   .update(members)
  //   .set({
  //     deletedAt: new Date(),
  //   })
  //   .where(eq(members.id, id));
  revalidatePath("./team", "page");
}

async function addMember({
  email,
  roleId,
  initialPassword,
}: {
  email: string;
  roleId: string;
  initialPassword: string;
}) {
  // Check if email already exists in users or members table
  const existingUser = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.email, email),
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const existingMember = await db.query.members.findFirst({
    where: (t, { eq, isNull }) => and(eq(t.email, email), isNull(t.deletedAt)),
  });

  if (existingMember) {
    throw new Error("Email already exists in team");
  }

  const hashedPassword = await hashPassword(initialPassword);

  // Create user first
  const [user] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      name: email.split("@")[0], // Use email prefix as default name
      mustChangePassword: true, // Force password change on first login
    })
    .returning();

  // Create member record
  const [member] = await db
    .insert(members)
    .values({
      userId: user.id,
      roleId,
      isOwner: false,
      status: "joined",
      email,
    })
    .returning();

  revalidatePath("./team", "page");
  return { user, member };
}

export {
  getTeamMembers,
  invite,
  updateMember,
  resendInvite,
  revokeInvite,
  leaveTeam,
  addMember,
};
