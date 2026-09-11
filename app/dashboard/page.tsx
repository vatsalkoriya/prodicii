"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { APP_HOST } from '../../lib/app-config';
import { ArrowUpRight, LogOut, Plus, Store as StoreIcon } from 'lucide-react';

export default function DashboardIndexPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function loadStores() {
      const token = localStorage.getItem('token');
      if (!token) {
        if (active) setLoading(false);
        router.replace('/auth/login');
        return;
      }

      try {
        const res = await fetch('/api/stores', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          router.replace('/auth/login');
          return;
        }

        const j = await res.json();
        if (!active) return;
        setStores(j.stores || []);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStores().catch(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return <div className="app-page flex min-h-screen items-center justify-center text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="app-page min-h-screen">
      <header className="app-header">
        <div className="app-shell flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>prodicii</Link>
            <span className="hidden rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:inline-flex">Workspace</span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/auth/login');
            }}
            className="app-button app-button-ghost"
          >
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </header>

      <div className="app-shell px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="app-eyebrow">Seller command center</p>
            <h1 className="app-title mt-3">Your stores</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">A focused workspace for launching storefronts, keeping payments ready, and shipping better product experiences.</p>
          </div>
          <Link
            href="/dashboard/new"
            className="app-button app-button-primary w-fit"
          >
            <Plus size={16} aria-hidden="true" />
            Create new store
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [stores.length ? String(stores.length).padStart(2, '0') : '00', 'Storefronts', 'spaces you control'],
            ['UPI', 'Payment rail', 'ready when you are'],
            ['24/7', 'Availability', 'always shareable'],
            ['0%', 'Platform fee', 'keep your margin'],
          ].map(([value, label, note]) => (
            <div key={label} className="app-panel p-4 sm:p-5">
              <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">{label}</p>
              <p className="mt-1 text-xs text-slate-500">{note}</p>
            </div>
          ))}
        </div>

        {stores.length === 0 ? (
          <div className="app-panel grid place-items-center rounded-[1.15rem] px-6 py-16 text-center">
            <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-brand/25 bg-brand/10 text-brand"><StoreIcon size={25} /></div>
            <p className="text-lg font-semibold text-white">No stores yet.</p>
            <p className="mt-2 text-sm text-slate-400">Set up your first storefront and start sharing a checkout link today.</p>
            <Link
              href="/dashboard/new"
              className="app-button app-button-primary mt-6"
            >
              <Plus size={16} aria-hidden="true" />
              Create your first store
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stores.map((s: any) => (
              <Link
                key={s._id}
                href={`/dashboard/${s._id}`}
                className="app-panel interactive-card rounded-[1.15rem] p-5"
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
                  <span className="app-status">Manage <ArrowUpRight size={12} /></span>
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
