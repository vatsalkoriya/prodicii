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
    <main className="min-h-screen bg-[#040A09]">
      <Header storeName={store.name} />
      <div className="mx-auto grid max-w-screen-xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-8">
        
        {/* Left Column: Order Summary */}
        <div className="flex flex-col">
          <p className="text-sm uppercase tracking-[0.22em] text-brand font-semibold">Checkout</p>
          <h1 className="mt-3 text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {product.price === 0 ? 'Get your product' : 'Complete your purchase'}
          </h1>
          <p className="mt-3 text-base text-slate-400 leading-relaxed">
            {product.price === 0 
              ? 'This product is completely free. Access your files directly below.' 
              : 'Pay directly via UPI, then submit your payment proof for quick verification.'}
          </p>

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-8 shadow-2xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Order summary</h2>
            <div className="flex items-center gap-5">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-24 w-24 rounded-[1.25rem] object-cover shadow-lg border border-white/10" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-[1.25rem] border border-dashed border-white/20 bg-white/5 text-slate-500 shadow-inner">No image</div>
              )}
              <div className="flex-1">
                <p className="text-lg font-semibold text-white">{product.name}</p>
                <p className="text-sm text-slate-400 mt-1">Qty: 1</p>
              </div>
              <p className="text-2xl font-bold text-white">Rs {product.price}</p>
            </div>
            
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
              <span className="text-lg font-medium text-slate-300">Total Due</span>
              <span className="text-3xl font-black text-brand tracking-tight">
                {product.price === 0 ? 'Free' : `Rs ${product.price}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Payment or Files */}
        <div className="flex flex-col justify-center">
          {product.price === 0 ? (
            <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-10 text-center shadow-xl backdrop-blur-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand/20 mb-6 shadow-inner border border-brand/30">
                <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>Access your product</h2>
              <p className="text-slate-300 mb-10 max-w-md mx-auto leading-relaxed">Here are the files and links included with this product. Click below to access them immediately.</p>
              
              <div className="w-full max-w-sm mx-auto space-y-4">
                {product.attachments?.map((att: any, i: number) => (
                  <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-5 rounded-2xl border border-white/10 bg-black/40 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand/20 p-2 rounded-lg text-brand group-hover:bg-brand group-hover:text-black transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <span className="font-semibold text-white text-left">{att.name}</span>
                    </div>
                    <span className="text-sm font-bold text-brand uppercase tracking-wider">Get</span>
                  </a>
                ))}
                
                {product.externalLinks?.map((link: any, i: number) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-5 rounded-2xl border border-white/10 bg-black/40 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-cyan-400/20 p-2 rounded-lg text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                      </div>
                      <span className="font-semibold text-white text-left">{link.label}</span>
                    </div>
                    <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Open</span>
                  </a>
                ))}

                {(!product.attachments?.length && !product.externalLinks?.length) && (
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-slate-400 italic">
                    The seller hasn't added any files or links to this product yet.
                  </div>
                )}
              </div>
            </div>
          ) : effectiveUpiId ? (
            <CheckoutClient
              upiLink={upiLink!}
              qrDataUrl={qrDataUrl}
              productId={String(product._id)}
              amount={product.price}
              storeId={String(store._id)}
              storeName={store.name}
            />
          ) : (
            <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-10 text-center shadow-xl backdrop-blur-sm">
               <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 mb-6 shadow-inner border border-red-500/30">
                  <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
               </div>
               <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>Payment Not Available</h2>
               <p className="text-slate-300 max-w-sm mx-auto leading-relaxed">
                 This product cannot be purchased right now because the store owner hasn't configured a UPI ID to receive payments.
               </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
