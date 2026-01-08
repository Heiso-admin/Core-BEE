import { getInviteToken } from "@heiso/core/app/(auth)/(member)/join/_server/member.service";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") || "";

  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: "missing_token" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const membership = await getInviteToken({ token });
    if (!membership) {
      return new Response(
        JSON.stringify({ ok: false, error: "invalid_token" }),
        {
          status: 404,
          headers: { "content-type": "application/json" },
        },
      );
    }
    return new Response(JSON.stringify({ ok: true, membership }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("[join/validate] error:", err);
    return new Response(JSON.stringify({ ok: false, error: "server_error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
