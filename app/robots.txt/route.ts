import { APP_URL } from '../../lib/app-config';

export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /auth/

Sitemap: ${APP_URL}/sitemap.xml`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' },
  });
}
