import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('refreshToken')?.value;
  const path = req.nextUrl.pathname;

  // Paths requiring authentication
  const isDashboardRoute = path === '/' || path.startsWith('/generator') || path.startsWith('/cards') || path === '/profile';
  const isAdminRoute = path.startsWith('/admin');

  if (isDashboardRoute || isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const JWT_REFRESH_SECRET = new TextEncoder().encode(
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'
      );
      const { payload } = await jose.jwtVerify(token, JWT_REFRESH_SECRET);
      
      if (isAdminRoute && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch (err) {
      // Invalid token, clear it to avoid loops
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('refreshToken');
      return response;
    }
  }

  // Paths for guests only (redirect to dashboard if logged in)
  const isGuestRoute = path === '/login' || path === '/register';
  if (isGuestRoute && token) {
    try {
      const JWT_REFRESH_SECRET = new TextEncoder().encode(
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'
      );
      await jose.jwtVerify(token, JWT_REFRESH_SECRET);
      return NextResponse.redirect(new URL('/', req.url));
    } catch {
      // Token is invalid, let them stay but clear the invalid cookie
      const response = NextResponse.next();
      response.cookies.delete('refreshToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/generator/:path*',
    '/cards/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
