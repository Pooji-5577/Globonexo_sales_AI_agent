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

function isAuthorized(request) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;
  if (!user || !pass) return true;

  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Basic ')) return false;

  const decoded = atob(header.slice('Basic '.length));
  const separatorIndex = decoded.indexOf(':');
  const suppliedUser = decoded.slice(0, separatorIndex);
  const suppliedPass = decoded.slice(separatorIndex + 1);

  return suppliedUser === user && suppliedPass === pass;
}

export function middleware(request) {
  if (!isAuthorized(request)) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Globonexo Sales"' },
    });
  }

  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get('refresh_token'));

  if (!hasSession && !PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
