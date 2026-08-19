import { NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/pricing',
  '/terms',
  '/privacy',
  '/refund',
  '/cookies',
  '/about',
  '/contact',
  '/help',
  '/faq',
  '/solutions',
  '/platform',
  '/voice',
  '/accuracy',
  '/callback',
];

const SESSION_COOKIE_NAMES = [
  'access_token',
  'refresh_token',
  'session',
  'impersonation_token',
];

const SITE_USERNAME = process.env.SITE_AUTH_USER;
const SITE_PASSWORD = process.env.SITE_AUTH_PASSWORD;
const SITE_AUTH_COOKIE = 'site_auth_ok';

function unauthorizedResponse() {
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
      'Content-Type': 'text/plain',
    },
  });
}

function isAuthorized(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) return false;

  try {
    const decoded = atob(authHeader.split(' ')[1]);
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex === -1) return false;

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);
    return username === SITE_USERNAME && password === SITE_PASSWORD;
  } catch {
    return false;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // TEMPORARILY DISABLED: site-wide Basic Auth gate. Re-enable by restoring
  // this block when SITE_AUTH_USER / SITE_AUTH_PASSWORD should protect the app.
  // const alreadyPassedSiteAuth = request.cookies.get(SITE_AUTH_COOKIE)?.value === '1';
  //
  // if (!alreadyPassedSiteAuth && !isAuthorized(request)) {
  //   return unauthorizedResponse();
  // }
  const alreadyPassedSiteAuth = true;

  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
  const hasSession = SESSION_COOKIE_NAMES.some(name => Boolean(request.cookies.get(name)));

  if (!hasSession && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  if (!alreadyPassedSiteAuth) {
    response.cookies.set(SITE_AUTH_COOKIE, '1', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api).*)'],
};
