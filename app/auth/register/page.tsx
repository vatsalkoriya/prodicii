"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const j = await res.json();
    setLoading(false);
    if (j.token) {
      localStorage.setItem('token', j.token);
      router.push('/dashboard/new');
    } else {
      setError(j.error || 'Registration failed');
    }
  }

  return (
    <div className="grid min-h-screen items-center px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-screen-2xl gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div className="surface-light order-2 mx-auto w-full max-w-md rounded-[2.2rem] p-8 sm:p-9 lg:order-1">
          <Link href="/" className="block text-xl font-bold text-brand" style={{ fontFamily: 'var(--font-display)' }}>
            prodicii
          </Link>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">Create your store</h1>
          <p className="mt-2 text-sm leading-7 text-slate-500">Launch a sharp storefront, take direct UPI payments, and start selling without platform commission.</p>

          {error && (
            <div className="mb-4 mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="field" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input type="password" placeholder="Minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="field" />
            </div>
            <button type="submit" disabled={loading} className="shine w-full rounded-2xl bg-brand py-3 text-base font-semibold text-[var(--brand-ink)] transition hover:bg-[#52e09d] disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="surface order-1 overflow-hidden rounded-[2.2rem] p-8 lg:order-2">
          <p className="section-label">What you unlock</p>
          <h2 className="mt-5 max-w-2xl text-5xl font-black leading-[0.94] tracking-[-0.04em] text-white" style={{ fontFamily: 'var(--font-display)' }}>
            One signup away from a more credible selling surface.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
            The setup is optimized for speed, but the result still looks intentionally designed across storefront, checkout, and seller workspace.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Store setup', 'Claim your space, plug in UPI, and publish the first version quickly.'],
              ['Digital product support', 'Attach docs, ZIPs, and external resources directly to products.'],
              ['Seller operations', 'Track submissions, orders, and product readiness from one workspace.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[1.6rem] border border-white/8 bg-white/4 p-5">
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 browser-shell rounded-[1.8rem] p-4">
            <div className="browser-topbar">
              <div className="flex items-center gap-2">
                <span className="browser-dot bg-rose-400" />
                <span className="browser-dot bg-amber-300" />
                <span className="browser-dot bg-emerald-400" />
              </div>
              <div className="browser-address">Launch checklist</div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {['Set subdomain', 'Add UPI ID', 'Upload products', 'Attach files', 'Publish store', 'Share link'].map((item, index) => (
                <div key={item} className={`rounded-2xl border px-4 py-4 text-sm ${index < 4 ? 'border-emerald-400/20 bg-emerald-400/10 text-white' : 'border-white/8 bg-white/4 text-slate-300'}`}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
