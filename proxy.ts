import { auth } from "@heiso/core/modules/auth/auth.config";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-current-pathname", req.nextUrl.pathname);

  // 未登入：針對匹配的路由導向到 /login
  if (!req.auth) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    const token = req.nextUrl.searchParams.get("token");
    if (token) {
      // Set token to cookie with 7 days expiration
      response.cookies.set("join-token", token, {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }
    return response;
  }

  // 已登入：若會員狀態非 joined，導向 /pending
  if (!req.auth.user.isDeveloper) {
    const memberStatus = req.auth?.member?.status ?? null;
    const pathname = req.nextUrl.pathname;

    if (memberStatus && memberStatus !== "joined" && pathname !== "/pending") {
      const pendingUrl = new URL("/pending", req.url);
      return NextResponse.redirect(pendingUrl);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    // 排除不需要強制登入的路徑：login、signup、auth、pending、join
    "/((?!api|public|_next/static|_next/image|images|favicon.ico|login|signup|auth|pending|join).*)",
  ],
};
