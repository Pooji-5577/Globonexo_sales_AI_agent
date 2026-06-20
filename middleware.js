import { NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/forgot',
  '/pricing',
  '/terms',
  '/privacy',
  '/callback',
];

const AUTH_ONLY_PATHS = ['/login', '/signup'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get('refresh_token'));

  if (hasSession && AUTH_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!hasSession && !PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
