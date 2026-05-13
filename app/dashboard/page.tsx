"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { APP_HOST } from '../../lib/app-config';

export default function DashboardIndexPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetch('/api/stores', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => {
        setStores(j.stores || []);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-[#081310]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            prodicii
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/auth/login');
            }}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Workspace</p>
            <h1 className="mt-2 text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Your stores
            </h1>
            <p className="mt-2 text-sm text-slate-400">Manage storefronts, payments, and product updates from one place.</p>
          </div>
          <Link
            href="/dashboard/new"
            className="shine inline-flex w-fit items-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
          >
            Create new store
          </Link>
        </div>

        {stores.length === 0 ? (
          <div className="surface rounded-[2rem] p-10 text-center">
            <p className="text-lg text-white">No stores yet.</p>
            <p className="mt-2 text-sm text-slate-400">Set up your first storefront and start sharing a checkout link today.</p>
            <Link
              href="/dashboard/new"
              className="shine mt-6 inline-flex rounded-full bg-brand px-6 py-3 font-semibold text-[var(--brand-ink)]"
            >
              Create your first store
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stores.map((s: any) => (
              <Link
                key={s._id}
                href={`/dashboard/${s._id}`}
                className="surface interactive-card rounded-[1.75rem] p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {s.logo ? (
                      <img src={s.logo} alt={s.name} className="h-12 w-12 rounded-2xl object-cover" />
                    ) : (
                      <div className="avatar-brand flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold">
                        {s.name[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{s.name}</p>
                      <p className="truncate text-xs text-slate-500 mt-1">
                        {s.customDomain && s.customDomain.includes('.') ? s.customDomain : `https://${APP_HOST}/${s.subdomain}`}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-brand">
                    Manage
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-slate-400">Theme</p>
                    <p className="mt-1 font-medium text-white">{s.theme === 'theme-two' ? 'Bold' : 'Minimal'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-slate-400">Payments</p>
                    <p className="mt-1 font-medium text-white">{s.upiId ? 'Connected' : 'Pending'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
