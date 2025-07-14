import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const token = req.cookies.get('auth_token')?.value;
  const { pathname } = req.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const { role } = payload;

      // Role-based access control
      if (pathname.startsWith('/dashboard/teacher') && role !== 'teacher') {
        return NextResponse.redirect(new URL('/dashboard/student', req.url));
      }

      if (pathname.startsWith('/dashboard/student') && role !== 'student') {
        return NextResponse.redirect(new URL('/dashboard/teacher', req.url));
      }

      return NextResponse.next();
    } catch (err) {
      // Token is invalid or expired
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.set('auth_token', '', { maxAge: 0 });
      return response;
    }
  }

  // Redirect authenticated users from login/register pages
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret);
        const url = req.nextUrl.clone();
        url.pathname = payload.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student';
        return NextResponse.redirect(url);
      } catch (err) {
        // Invalid token, allow access to login/register and clear cookie
        const response = NextResponse.next();
        response.cookies.set('auth_token', '', { maxAge: 0 });
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
