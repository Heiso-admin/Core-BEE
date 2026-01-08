import { auth } from "@heiso/core/modules/auth/auth.config";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const next = url.searchParams.get("next");

  // 若使用者已加入，無需設定 token，直接回 Dashboard
  const session = await auth();
  if (session?.member?.status === "joined") {
    return NextResponse.redirect("/dashboard");
  }

  // 未登入：先寫入 cookie（若有 token），再導向 Login 並帶 join 標記
  if (!session?.user) {
    const res = NextResponse.redirect("/login?join=1");
    if (token) {
      res.cookies.set("join-token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
        secure: process.env.NODE_ENV === "production",
      });
    }
    return res;
  }

  // 預設導回 Join 頁並攜帶 token（若存在）
  const target = next
    ? next
    : token
      ? `/join?token=${encodeURIComponent(token)}`
      : "/join";

  const res = NextResponse.redirect(target);

  if (token) {
    res.cookies.set("join-token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      // 可視情境調整存活時間；此處先設為一天
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return res;
}
