"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { APP_HOST } from '../../../lib/app-config';

export default function NewStorePage() {
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  function handleNameChange(v: string) {
    setName(v);
    setSubdomain(v.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const res = await fetch('/api/stores', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, subdomain, upiId }),
    });
    const j = await res.json();
    setLoading(false);
    if (j.ok) {
      router.push(`/dashboard/${j.storeId}`);
    } else {
      setError(j.error || 'Failed to create store');
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-[#081310]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            prodicii
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-screen-2xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="surface rounded-[2rem] p-8">
          <p className="text-sm uppercase tracking-[0.22em] text-brand">Quick setup</p>
          <h1 className="mt-3 text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Open a new store in a few steps.
          </h1>
          <div className="mt-8 space-y-4">
            {[
              'Store name auto-generates your subdomain.',
              'UPI ID can be added now or later.',
              'You can switch theme and update content anytime.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="surface-light rounded-[2rem] p-8">
          <h2 className="text-2xl font-bold text-slate-950">Store details</h2>
          <p className="mt-2 text-sm text-slate-500">You can refine branding, products, and domain settings after creation.</p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Store name</label>
              <input
                placeholder="My Awesome Store"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Store URL Path</label>
              <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:ring-4 focus-within:ring-brand/10">
                <span className="border-r border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">https://{APP_HOST}/</span>
                <input
                  placeholder="mystore"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                  className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">UPI ID</label>
              <input
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="field"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="shine w-full rounded-2xl bg-brand py-3 text-base font-semibold text-[var(--brand-ink)] transition hover:bg-[#52e09d] disabled:opacity-60"
            >
              {loading ? 'Creating store...' : 'Create store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
