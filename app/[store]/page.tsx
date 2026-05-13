import { connect } from '../../lib/mongodb';
import Store from '../../models/Store';
import Product from '../../models/Product';
import Domain from '../../models/Domain';
import Header from '../../components/Header';
import ThemeOne from '../../components/themes/ThemeOne';
import ThemeTwo from '../../components/themes/ThemeTwo';
import { storeJsonLd } from '../../lib/seo';
import { APP_URL } from '../../lib/app-config';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

interface Props {
  params: { store: string };
}

async function resolveStore(storeParam: string) {
  await connect();
  // Try subdomain first
  let store = await Store.findOne({ subdomain: storeParam, isActive: true }).lean();
  if (store) return store;

  // Try custom domain (injected by middleware)
  const hdrs = headers();
  const customDomain = hdrs.get('x-store-custom-domain');
  if (customDomain) {
    const domain = await Domain.findOne({ domainName: customDomain, verificationStatus: 'verified' });
    if (domain) store = await Store.findById(domain.storeId).lean();
  }
  return store;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await resolveStore(params.store) as any;
  if (!store) return { title: 'Store not found' };
  return {
    title: store.name,
    description: store.description || `Shop at ${store.name}`,
    openGraph: {
      title: store.name,
      description: store.description || `Shop at ${store.name}`,
      url: `${APP_URL}/${store.subdomain}`,
      ...(store.logo ? { images: [store.logo] } : {}),
    },
  };
}

export default async function StorePage({ params }: Props) {
  const store = await resolveStore(params.store) as any;
  const products = store
    ? await Product.find({ storeId: store._id, isActive: true }).limit(40).lean()
    : [];

  if (!store) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Store not found</h1>
          <p className="text-gray-500 mt-2">This store doesn&apos;t exist or has been deactivated.</p>
        </div>
      </main>
    );
  }

  const jsonLd = storeJsonLd({
    name: store.name,
    description: store.description,
    url: `${APP_URL}/${store.subdomain}`,
    logo: store.logo,
  });

  const sections = store.homepageSections || {};

  return (
    <main>
      <Header storeName={store.name} />
      {store.theme === 'theme-two' ? (
        <ThemeTwo store={store} products={products} sections={sections} />
      ) : (
        <ThemeOne store={store} products={products} sections={sections} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
