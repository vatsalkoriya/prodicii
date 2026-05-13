import { connect } from '../../lib/mongodb';
import Store from '../../models/Store';
import Product from '../../models/Product';
import { APP_URL } from '../../lib/app-config';

export async function GET() {
  let stores: any[] = [];
  let products: any[] = [];
  try {
    await connect();
    stores = await Store.find({ isActive: true }).select('subdomain updatedAt');
    products = await Product.find({ isActive: true }).select('slug storeId updatedAt').populate('storeId', 'subdomain');
  } catch (err) {
    console.warn('Sitemap generation: DB unavailable, falling back to minimal sitemap', err);
    // Proceed with empty lists so build/prerender won't fail when DB is not reachable
  }

  const urls: string[] = [
    `<url><loc>${APP_URL}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${APP_URL}/auth/login</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>`,
    `<url><loc>${APP_URL}/auth/register</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
  ];

  for (const s of stores) {
    urls.push(
      `<url><loc>${APP_URL}/${s.subdomain}</loc><lastmod>${new Date((s as any).updatedAt).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
    );
  }

  for (const p of products) {
    const subdomain = (p.storeId as any)?.subdomain;
    if (!subdomain) continue;
    urls.push(
      `<url><loc>${APP_URL}/${subdomain}/product/${p.slug}</loc><lastmod>${new Date((p as any).updatedAt).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
  });
}
