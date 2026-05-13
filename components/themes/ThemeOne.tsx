import React from 'react';
import ProductCard from '../ProductCard';
import Link from 'next/link';

export default function ThemeOne({ store, products, sections }: any) {
  const featured = products.filter((p: any) => p.isFeatured);

  return (
    <div className="min-h-screen">
      <section className="grid-glow relative overflow-hidden px-4 py-20 text-center">
        {store.bannerImage && (
          <>
            <img
              src={store.bannerImage}
              alt={`${store.name} banner`}
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#071412]/50 via-[#071412]/72 to-[#071412]" />
          </>
        )}
        {store.logo && (
          <img src={store.logo} alt={store.name} className="relative mx-auto mb-5 h-20 w-20 rounded-[1.5rem] object-cover shadow-lg" />
        )}
        <p className="relative text-sm uppercase tracking-[0.22em] text-brand">Curated storefront</p>
        <h1 className="relative mt-3 text-5xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          {store.name}
        </h1>
        <p className="relative mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300">
          {sections?.hero?.subtitle || store.description || 'Welcome to our store'}
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <span className="pill text-sm">Direct UPI checkout</span>
          <span className="pill text-sm">Fast product browsing</span>
          {store.socialLinks?.instagram && (
            <a href={store.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="pill text-sm text-white hover:text-brand">
              Instagram
            </a>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-screen-2xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        {featured.length > 0 && (
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Highlights</p>
                <h2 className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Featured products
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p: any) => (
                <ProductCard key={p._id} product={p} store={store.subdomain} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Catalog</p>
              <h2 className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                All products
              </h2>
            </div>
            <p className="hidden text-sm text-slate-400 md:block">{products.length} active listings</p>
          </div>
          {products.length === 0 ? (
            <div className="surface rounded-[1.75rem] p-10 text-center text-slate-400">No products yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p: any) => (
                <ProductCard key={p._id} product={p} store={store.subdomain} />
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="border-t border-white/10 px-4 py-10 text-center text-sm text-slate-400">
        {store.contactEmail && (
          <p>
            Contact:{' '}
            <a href={`mailto:${store.contactEmail}`} className="text-brand hover:underline">
              {store.contactEmail}
            </a>
          </p>
        )}
        <p className="mt-1">
          Powered by{' '}
          <Link href="/" className="text-brand hover:underline">
            prodicii
          </Link>
        </p>
      </footer>
    </div>
  );
}
