import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Package } from 'lucide-react';

export default function ProductCard({ product, store }: any) {
  return (
    <div className="product-card group interactive-card overflow-hidden rounded-[1.15rem] border border-white/10 bg-white/[0.045] shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <Link href={`/${store}/product/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-white/5">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-500"><Package size={42} strokeWidth={1.2} /></div>
          )}
        </div>
      </Link>
      <div className="p-5">
        <Link href={`/${store}/product/${product.slug}`}>
          <h3 className="truncate text-base font-semibold text-white transition-colors hover:text-brand">{product.name}</h3>
        </Link>
        {product.category && <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{product.category}</p>}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-bold text-brand">Rs {product.price}</p>
          {product.inventory === 0 ? <span className="app-status !border-rose-400/25 !bg-rose-400/10 !text-rose-300">Out of stock</span> : <span className="app-status">Available</span>}
        </div>
        {product.inventory > 0 && (
          <Link
            href={`/${store}/checkout?productId=${product._id}`}
            className="app-button app-button-primary mt-4 w-full"
          >
            Buy now <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
