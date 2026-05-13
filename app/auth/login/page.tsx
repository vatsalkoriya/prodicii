"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const j = await res.json();
    setLoading(false);
    if (j.token) {
      localStorage.setItem('token', j.token);
      router.push('/dashboard');
    } else {
      setError(j.error || 'Login failed');
    }
  }

  return (
    <div className="grid min-h-screen items-center px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-screen-2xl gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <div className="surface hidden overflow-hidden rounded-[2.2rem] p-8 lg:block">
          <p className="section-label">Seller workspace</p>
          <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[0.94] tracking-[-0.04em] text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Sign in to the control room behind your storefront.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
            Review orders, switch themes, upload files, and keep the payment flow tight from one modern workspace.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Order review', 'See proof submissions and verification status quickly.'],
              ['Product ops', 'Manage files, links, inventory, and pricing in one flow.'],
              ['Store launch', 'Publish on your subdomain and move to custom domain later.'],
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
              <div className="browser-address">Workspace overview</div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {['Stores live', 'Payments verified', 'Resources attached'].map((item, index) => (
                <div key={item} className="mini-stat">
                  <p className="text-3xl font-bold text-white">{['04', '92%', '31'][index]}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="surface-light mx-auto w-full max-w-md rounded-[2.2rem] p-8 sm:p-9">
          <Link href="/" className="block text-xl font-bold text-brand" style={{ fontFamily: 'var(--font-display)' }}>
            prodicii
          </Link>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">Welcome back</h1>
          <p className="mt-2 text-sm leading-7 text-slate-500">Sign in to manage stores, products, downloadable assets, and live orders.</p>

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
              <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="field" />
            </div>
            <button type="submit" disabled={loading} className="shine w-full rounded-2xl bg-brand py-3 text-base font-semibold text-[var(--brand-ink)] transition hover:bg-[#52e09d] disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-semibold text-brand hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
