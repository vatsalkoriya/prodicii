import { APP_URL } from '../../lib/app-config';
import { NextRequest } from 'next/server';

export function GET(req: NextRequest) {
  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = host ? `${protocol}://${host}` : APP_URL.replace(/\/$/, '');
  
  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /auth/

Sitemap: ${baseUrl}/sitemap.xml`;

  return new Response(body, {
    headers: { 
      'Content-Type': 'text/plain; charset=utf-8', 
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' 
    },
  });
}
