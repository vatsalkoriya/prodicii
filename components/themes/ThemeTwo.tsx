import React from 'react';
import ProductCard from '../ProductCard';
import Link from 'next/link';

export default function ThemeTwo({ store, products, sections }: any) {
  const featured = products.filter((p: any) => p.isFeatured);

  return (
    <div className="storefront-page storefront-theme-two min-h-screen">
      <section className="storefront-hero relative overflow-hidden px-4 py-24">
        {store.bannerImage && (
          <>
            <img
              src={store.bannerImage}
              alt={`${store.name} banner`}
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060f0d] via-[#060f0d]/82 to-[#060f0d]/65" />
          </>
        )}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
        <div className="relative mx-auto grid max-w-screen-2xl items-center gap-10 sm:px-2 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="app-eyebrow">Bold layout</p>
            <h1 className="app-title mt-3 text-5xl sm:text-6xl" style={{ fontFamily: 'var(--font-display)' }}>
              {store.name}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              {sections?.hero?.subtitle || store.description || 'Quality products, great prices'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="pill text-sm">UPI enabled</span>
              {store.socialLinks?.instagram && (
                <a href={store.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="pill text-sm hover:text-brand">
                  Instagram
                </a>
              )}
            </div>
          </div>
          <div className="surface rounded-[2rem] p-4">
            {sections?.hero?.image ? (
              <img src={sections.hero.image} alt="hero" className="h-[360px] w-full rounded-[1.5rem] object-cover" />
            ) : (
              <div className="flex h-[360px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-emerald-400/10 to-sky-400/10 text-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Storefront mood</p>
                  <p className="mt-3 text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    Sharp visuals. Fast checkout.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="app-shell space-y-16 px-4 py-14 sm:px-6 lg:px-8">
        {featured.length > 0 && (
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="app-eyebrow">Top picks</p>
                <h2 className="storefront-section-title mt-2">
                  Featured collection
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p: any) => (
                <ProductCard key={p._id} product={p} store={store.subdomain} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="app-eyebrow">Browse</p>
              <h2 className="storefront-section-title mt-2">
                All products
              </h2>
            </div>
          </div>
          {products.length === 0 ? (
            <div className="surface rounded-[1.75rem] p-10 text-center text-slate-400">No products yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
