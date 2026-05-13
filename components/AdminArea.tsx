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
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    fetch(`/api/admin/stores/${storeId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => { if (j.store) setStore(j.store); else router.push('/dashboard'); });
  }, [storeId]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-brand font-bold text-lg">prodicii</Link>
          {store && (
            <span className="text-gray-400 text-sm hidden sm:block">/ {store.name}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {store && (
            <a
              href={store.customDomain && store.customDomain.includes('.') ? `https://${store.customDomain}` : `/${store.subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-brand transition-colors"
            >
              View store ↗
            </a>
          )}
          <button
            onClick={() => { localStorage.removeItem('token'); router.push('/auth/login'); }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 py-8 lg:px-8">
        {/* Tab nav */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'analytics' && <AdminAnalytics storeId={storeId} />}
        {tab === 'products' && <AdminProductForm storeId={storeId} />}
        {tab === 'orders' && <AdminOrders storeId={storeId} />}
        {tab === 'settings' && store && <AdminSettings store={store} onUpdate={setStore} />}
      </div>
    </div>
  );
}
