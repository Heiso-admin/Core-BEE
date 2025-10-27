import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth.config';

export default auth(async (req) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-current-pathname', req.nextUrl.pathname);

  if (!req.auth) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    const token = req.nextUrl.searchParams.get('token');
    if (token) {
      // Set token to cookie with 7 days expiration
      response.cookies.set('join-token', token, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    }
    return response;
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    '/((?!api|public|_next/static|_next/image|images|favicon.ico|login|signup|auth).*)',
  ],
};
