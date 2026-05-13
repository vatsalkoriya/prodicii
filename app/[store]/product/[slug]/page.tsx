import { connect } from '../../../../lib/mongodb';
import Product from '../../../../models/Product';
import Store from '../../../../models/Store';
import Header from '../../../../components/Header';
import CheckoutClient from '../../../../components/CheckoutClient';
import { productJsonLd } from '../../../../lib/seo';
import { generateUpiLink } from '../../../../lib/upi';
import { APP_URL } from '../../../../lib/app-config';
import type { Metadata } from 'next';
import Link from 'next/link';

interface Props {
  params: { store: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connect();
  const store = await Store.findOne({ subdomain: params.store }).lean() as any;
  const product = await Product.findOne({ slug: params.slug, storeId: store?._id }).lean() as any;
  if (!product) return { title: 'Product not found' };
  return {
    title: product.seo?.metaTitle || product.name,
    description: product.seo?.metaDescription || product.description || `Buy ${product.name} at Rs ${product.price}`,
    openGraph: {
      title: product.name,
      description: product.description,
      ...(product.image ? { images: [product.image] } : {}),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  await connect();
  const store = await Store.findOne({ subdomain: params.store }).lean() as any;
  const product = await Product.findOne({ slug: params.slug, storeId: store?._id, isActive: true }).lean() as any;

  const effectiveUpiId = product?.upiId || store?.upiId;

  const upiLink = product && effectiveUpiId
    ? generateUpiLink({ upiId: effectiveUpiId, storeName: store.name, amount: product.price })
    : null;

  const jsonLd = product
    ? productJsonLd({
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        url: `${APP_URL}/${params.store}/product/${product.slug}`,
        availability: product.inventory > 0 ? 'InStock' : 'OutOfStock',
      })
    : null;

  return (
    <main>
      <Header storeName={store?.name} />
      <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8">
        {product ? (
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="surface rounded-[2rem] p-4">
              <div className="aspect-square overflow-hidden rounded-[1.5rem] bg-white/5">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl text-slate-500">[]</div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface rounded-[2rem] p-8">
                {product.category && (
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">{product.category}</span>
                )}
                <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  {product.name}
                </h1>
                {product.description && (
                  <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300">{product.description}</p>
                )}
                <p className="mt-5 text-4xl font-bold text-brand">Rs {product.price}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {product.inventory > 0 ? (
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      {product.inventory} in stock
                    </span>
                  ) : (
                    <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-300">
                      Out of stock
                    </span>
                  )}
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                    {product.upiId ? 'Product-specific UPI QR' : 'Direct UPI checkout'}
                  </span>
                </div>
              </div>

              {(product.attachments?.length > 0 || product.externalLinks?.length > 0) && (
                <div className="surface rounded-[2rem] p-6">
                  <h2 className="text-lg font-semibold text-white">Files and Links</h2>
                  <p className="mt-2 text-sm text-slate-400">Download product resources or open the provided reference links.</p>
                  <div className="mt-5 space-y-3">
                    {(product.attachments || []).map((file: any, index: number) => (
                      <a
                        key={`${file.url}-${index}`}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/10"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{file.name}</p>
                          <p className="truncate text-xs text-slate-400">{file.mimeType || 'File'}{file.size ? ` - ${Math.max(file.size / (1024 * 1024), 0.01).toFixed(2)} MB` : ''}</p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-brand">Download</span>
                      </a>
                    ))}
                    {(product.externalLinks || []).map((link: any, index: number) => (
                      <a
                        key={`${link.url}-${index}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/10"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{link.label}</p>
                          <p className="truncate text-xs text-slate-400">{link.url}</p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-brand">Open</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {product.inventory > 0 && effectiveUpiId ? (
                <CheckoutClient
                  upiLink={upiLink!}
                  productId={String(product._id)}
                  amount={product.price}
                  storeId={String(store._id)}
                  storeName={store.name}
                />
              ) : !effectiveUpiId ? (
                <div className="surface rounded-[2rem] p-6 text-sm text-slate-400">This product has no UPI ID and the store default payment is not set.</div>
              ) : null}

              <Link href={`/${params.store}`} className="inline-flex text-sm font-medium text-slate-400 transition hover:text-white">
                Back to {store?.name || 'store'}
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-slate-400">Product not found.</p>
            <Link href={`/${params.store}`} className="mt-4 inline-block text-brand hover:underline">
              Back to store
            </Link>
          </div>
        )}
      </div>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </main>
  );
}
