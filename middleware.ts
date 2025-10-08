import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';



export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  const publicRoutes = ['/', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has token and trying to access auth pages, redirect to vault
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/vault', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/vault', '/login', '/signup'],
};