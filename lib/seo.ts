/** SEO utilities — JSON-LD structured data and meta tag helpers */

interface ProductJsonLdParams {
  name: string;
  price: number;
  image?: string;
  description?: string;
  url: string;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock';
}

export function productJsonLd({
  name,
  price,
  image,
  description,
  url,
  currency = 'INR',
  availability = 'InStock',
}: ProductJsonLdParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    url,
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url,
    },
  };
}

interface StoreJsonLdParams {
  name: string;
  description?: string;
  url: string;
  logo?: string;
}

export function storeJsonLd({ name, description, url, logo }: StoreJsonLdParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name,
    description,
    url,
    ...(logo ? { logo } : {}),
  };
}
