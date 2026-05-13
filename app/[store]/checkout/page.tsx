import { connect } from '../../../lib/mongodb';
import Store from '../../../models/Store';
import Product from '../../../models/Product';
import Header from '../../../components/Header';
import CheckoutClient from '../../../components/CheckoutClient';
import { generateUpiLink } from '../../../lib/upi';
import { generateQrDataUrl } from '../../../lib/qr';

interface Props {
  params: { store: string };
  searchParams: { productId?: string };
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  await connect();
  const store = await Store.findOne({ subdomain: params.store, isActive: true }).lean() as any;
  const product = searchParams.productId
    ? await Product.findOne({ _id: searchParams.productId, storeId: store?._id, isActive: true }).lean() as any
    : null;

  if (!store || !product) {
    return (
      <main>
        <Header storeName={store?.name} />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-slate-400">Product or store not found.</p>
        </div>
      </main>
    );
  }

  const effectiveUpiId = product?.upiId || store?.upiId;

  const upiLink = effectiveUpiId
    ? generateUpiLink({ upiId: effectiveUpiId, storeName: store.name, amount: product.price })
    : null;

  const qrDataUrl = upiLink ? await generateQrDataUrl(upiLink) : null;

  return (
    <main>
      <Header storeName={store.name} />
      <div className="mx-auto grid max-w-screen-2xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="surface rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.22em] text-brand">Checkout</p>
          <h1 className="mt-3 text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Complete your purchase
          </h1>
          <p className="mt-2 text-sm text-slate-400">Pay directly via UPI, then submit your payment proof for verification.</p>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Order summary</h2>
            <div className="mt-4 flex items-center gap-4">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-500">[]</div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-white">{product.name}</p>
                <p className="text-sm text-slate-400">Qty: 1</p>
              </div>
              <p className="text-xl font-bold text-white">Rs {product.price}</p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="font-medium text-slate-300">Total</span>
              <span className="text-2xl font-bold text-brand">Rs {product.price}</span>
            </div>
          </div>
        </div>

        {effectiveUpiId ? (
          <CheckoutClient
            upiLink={upiLink!}
            qrDataUrl={qrDataUrl}
            productId={String(product._id)}
            amount={product.price}
            storeId={String(store._id)}
            storeName={store.name}
          />
        ) : (
          <div className="surface rounded-[2rem] p-6 text-sm text-amber-200">This product does not have a UPI ID and the store default is also missing.</div>
        )}
      </div>
    </main>
  );
}
