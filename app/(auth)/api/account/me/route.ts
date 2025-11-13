export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth.config";
import { getAccount, getAccountByEmail } from "@/server/user.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const email = session.user.email ?? "";

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