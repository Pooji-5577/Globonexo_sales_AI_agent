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
  '/refund',
  '/cookies',
  '/about',
  '/contact',
  '/help',
  '/faq',
  '/callback',
];

const SESSION_COOKIE_NAMES = [
  'access_token',
  'refresh_token',
  'session',
  'impersonation_token',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
  const hasSession = SESSION_COOKIE_NAMES.some(name => Boolean(request.cookies.get(name)));

  if (!hasSession && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
