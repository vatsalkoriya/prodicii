import { APP_URL } from '../../lib/app-config';

export function GET() {
  const baseUrl = APP_URL.replace(/\/$/, '');
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
