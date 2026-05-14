import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APP_HOST } from './lib/app-config';

/**
 * Multi-tenancy middleware.
 *
 * Routing logic:
 *  1. storename.prodicci.vercel.app  -> rewrite to /[store] with store=storename
 *  2. custom-domain.com       -> rewrite to /[store] with store resolved from DB
 *     (custom domain lookup happens in the page itself via x-forwarded-host header)
 *
 * We inject `x-store-host` so server components can resolve the store without
 * re-parsing the hostname.
 */

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const url = req.nextUrl.clone();

  // Skip Next.js internals and API routes
  const { pathname } = url;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next();
  }

  // Strip port for local dev (e.g. localhost:3000)
  const hostWithoutPort = hostname.split(':')[0];

  // Case 1: subdomain routing -> storename.prodicci.vercel.app
  if (hostWithoutPort.endsWith(`.${APP_HOST}`)) {
    const subdomain = hostWithoutPort.replace(`.${APP_HOST}`, '');

    // Don't rewrite for www or the root domain itself
    if (subdomain && subdomain !== 'www') {
      // Only rewrite if not already on a store path
      if (!pathname.startsWith(`/${subdomain}`)) {
        url.pathname = `/${subdomain}${pathname === '/' ? '' : pathname}`;
      }
      const res = NextResponse.rewrite(url);
      res.headers.set('x-store-subdomain', subdomain);
      return res;
    }
  }

  // Case 2: custom domain -> pass the full host so the page can look it up
  if (
    hostWithoutPort !== APP_HOST &&
    hostWithoutPort !== `www.${APP_HOST}` &&
    hostWithoutPort !== 'localhost'
  ) {
    const res = NextResponse.rewrite(new URL(`/[store]${pathname}`, req.url));
    res.headers.set('x-store-custom-domain', hostWithoutPort);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/|static/|favicon.ico|sitemap.xml|robots.txt).*)'],
};
