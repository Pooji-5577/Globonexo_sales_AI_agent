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
  '/onboarding',
  '/celebrate',
];

const AUTH_ONLY_PATHS = ['/login', '/signup'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get('globonexo_session'));
  const onboardingDone = Boolean(request.cookies.get('onboarding_complete'));

  const isLoggedIn = hasSession || onboardingDone;

  if (isLoggedIn && AUTH_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isLoggedIn && !PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
