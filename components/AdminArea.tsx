"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminProductForm from './AdminProductForm';
import AdminOrders from './AdminOrders';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';

type Tab = 'analytics' | 'products' | 'orders' | 'settings';

export default function AdminArea({ storeId }: { storeId: string }) {
  const [tab, setTab] = useState<Tab>('analytics');
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function loadStore() {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const res = await fetch(`/api/admin/stores/${storeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.replace('/auth/login');
        return;
      }

      if (res.status === 403 || res.status === 404) {
        router.replace('/dashboard');
        return;
      }

      const j = await res.json();
      if (!active) return;
      if (j.store) {
        setStore(j.store);
      } else {
        router.replace('/dashboard');
      }
      setLoading(false);
    }

    loadStore().catch(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [router, storeId]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="admin-page min-h-screen">
      {/* Top bar */}
      <header className="admin-topbar flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-lg font-bold text-slate-900">prodicii</Link>
          {store && (
            <span className="admin-muted hidden text-sm sm:block">/ {store.name}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {store && (
            <a
              href={store.customDomain && store.customDomain.includes('.') ? `https://${store.customDomain}` : `/${store.subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-muted text-sm transition-colors hover:text-slate-900"
            >
              View store ↗
            </a>
          )}
          <button
            onClick={() => { localStorage.removeItem('token'); router.push('/auth/login'); }}
            className="admin-muted text-sm transition-colors hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="app-shell px-4 py-8 lg:px-8">
        {/* Tab nav */}
        <div className="mb-8 flex w-fit gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`admin-tab rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? 'admin-tab-active' : ''
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-panel px-6 py-10 text-center text-slate-400">
            Loading store workspace...
          </div>
        ) : (
          <>
            {tab === 'analytics' && <AdminAnalytics storeId={storeId} />}
            {tab === 'products' && <AdminProductForm storeId={storeId} />}
            {tab === 'orders' && <AdminOrders storeId={storeId} />}
            {tab === 'settings' && store && <AdminSettings store={store} onUpdate={setStore} />}
          </>
        )}
      </div>
    </div>
  );
}
