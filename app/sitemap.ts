import type { MetadataRoute } from 'next';
import { connect } from '../lib/mongodb';
import Store from '../models/Store';
import Product from '../models/Product';
import Domain from '../models/Domain';
import { APP_URL } from '../lib/app-config';

export const revalidate = 3600;

type StoreDoc = {
  _id: string;
  subdomain: string;
  customDomain?: string | null;
  updatedAt?: Date;
};

type ProductDoc = {
  slug: string;
  storeId: string;
  updatedAt?: Date;
};

const appUrl = APP_URL.replace(/\/$/, '');
const appHost = new URL(appUrl).host;
const now = new Date();

function isDomainLike(value: string) {
  return value.includes('.') && !/\s/.test(value);
}

function normalizeDomain(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .toLowerCase();
}

function normalizeSubdomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function lastModified(value?: Date) {
  if (!value) return now;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? now : date;
}

function storeBaseUrls(store: StoreDoc, domainByStoreId: Map<string, string>) {
  const subdomain = normalizeSubdomain(store.subdomain);
  if (!subdomain) return [];

  const urls = [`https://${subdomain}.${appHost}`];
  const customDomain = store.customDomain
    ? normalizeDomain(store.customDomain)
    : domainByStoreId.get(store._id);

  if (customDomain && customDomain !== appHost && isDomainLike(customDomain)) {
    urls.push(`https://${customDomain}`);
  }

  return urls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await connect();

    const stores = (await Store.find({ isActive: true })
      .select('subdomain customDomain updatedAt')
      .lean()) as unknown as StoreDoc[];

    const verifiedDomains = await Domain.find({ verificationStatus: 'verified' })
      .select('domainName storeId')
      .lean();

    const domainByStoreId = new Map<string, string>();
    for (const domain of verifiedDomains) {
      const domainName = normalizeDomain(String(domain.domainName));
      if (isDomainLike(domainName)) {
        domainByStoreId.set(String(domain.storeId), domainName);
      }
    }

    const storeIds = stores.map((store) => store._id);
    const products = storeIds.length
      ? ((await Product.find({ storeId: { $in: storeIds }, isActive: true })
          .select('storeId slug updatedAt')
          .lean()) as unknown as ProductDoc[])
      : [];

    const productsByStoreId = new Map<string, ProductDoc[]>();
    for (const product of products) {
      const key = String(product.storeId);
      const current = productsByStoreId.get(key) || [];
      current.push(product);
      productsByStoreId.set(key, current);
    }

    const urls: MetadataRoute.Sitemap = [
      {
        url: appUrl,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1,
      },
    ];

    for (const store of stores) {
      const baseUrls = storeBaseUrls(store, domainByStoreId);
      if (!baseUrls.length) continue;

      const storeProducts = productsByStoreId.get(store._id) || [];
      const lastmod = lastModified(store.updatedAt);

      for (const baseUrl of baseUrls) {
        urls.push({
          url: baseUrl,
          lastModified: lastmod,
          changeFrequency: 'daily',
          priority: 0.8,
        });

        for (const product of storeProducts) {
          const slug = normalizeSlug(product.slug);
          if (!slug) continue;

          urls.push({
            url: `${baseUrl}/product/${slug}`,
            lastModified: lastModified(product.updatedAt),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    }

    return urls;
  } catch (error) {
    console.error('Failed to generate sitemap:', error);

    return [
      {
        url: appUrl,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}
