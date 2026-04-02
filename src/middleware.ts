import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('auth');
  const admin = request.cookies.get('admin');
  
  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!auth || !admin || admin.value !== 'true') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect /dashboard routes
  if (!auth && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Optional: Redirect auth'd users away from login/signup towards correct dashboard
  if (auth && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    if (admin && admin.value === 'true') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/signup'],
};
