export const runtime = "nodejs";

import { auth } from "@heiso/core/modules/auth/auth.config";
import { getAccount, getAccountByEmail } from "@heiso/core/server/user.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const email = session.user.email ?? "";

    if ((session.user as any).isAdminUser) {
      return NextResponse.json({
        id: userId,
        name: session.user.name,
        email: email,
        avatar: session.user.image,
        active: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        developer: { userId },
        membership: {
          id: 'admin',
          isOwner: true,
          role: {
            id: 'admin',
            name: 'Internal Admin',
            fullAccess: true,
          }
        }
      });
    }

    let data = userId ? await getAccount(userId) : null;

    if (!data && email) {
      data = await getAccountByEmail(email);
    }

    return NextResponse.json(data ?? null);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message ?? "Internal Server Error" },
      { status: 500 },
    );
  }
}
