import { connect } from '../../lib/mongodb';
import Store from '../../models/Store';
import Product from '../../models/Product';
import { APP_URL } from '../../lib/app-config';

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function formatDate(date: any) {
  try {
    if (!date) return new Date().toISOString();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export async function GET() {
  let stores: any[] = [];
  let products: any[] = [];
  
  try {
    await connect();
    stores = await Store.find({ isActive: true }).select('subdomain updatedAt').lean();
    products = await Product.find({ isActive: true })
      .select('slug storeId updatedAt')
      .populate('storeId', 'subdomain')
      .lean();
  } catch (err) {
    console.error('Sitemap generation DB error:', err);
  }

  const baseUrl = APP_URL.replace(/\/$/, '');

  const urls: string[] = [
    `<url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${baseUrl}/auth/login</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>`,
    `<url><loc>${baseUrl}/auth/register</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
  ];

  for (const s of stores) {
    if (!s.subdomain) continue;
    const loc = escapeXml(`${baseUrl}/${s.subdomain}`);
    const lastmod = formatDate(s.updatedAt);
    urls.push(
      `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
    );
  }

  for (const p of products) {
    const subdomain = (p.storeId as any)?.subdomain;
    if (!subdomain || !p.slug) continue;
    const loc = escapeXml(`${baseUrl}/${subdomain}/product/${p.slug}`);
    const lastmod = formatDate(p.updatedAt);
    urls.push(
      `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59' 
    },
  });
}
