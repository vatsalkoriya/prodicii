"use client";
import React, { useEffect, useState } from 'react';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  submittedOrders: number;
  verifiedOrders: number;
  rejectedOrders: number;
  revenue: number;
  productCount: number;
  customerCount: number;
  dailyRevenue: Record<string, number>;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminAnalytics({ storeId }: { storeId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`/api/admin/analytics?storeId=${storeId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => { setStats(j); setLoading(false); });
  }, [storeId]);

  if (loading) return <div className="text-gray-400 py-10 text-center">Loading analytics...</div>;
  if (!stats) return null;

  const maxRevenue = Math.max(...Object.values(stats.dailyRevenue), 1);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} sub="Verified payments" />
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Products" value={stats.productCount} />
        <StatCard label="Customers" value={stats.customerCount} />
      </div>

      {/* Order status breakdown */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Pending', value: stats.pendingOrders, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Submitted', value: stats.submittedOrders, color: 'text-blue-600 bg-blue-50' },
            { label: 'Verified', value: stats.verifiedOrders, color: 'text-green-600 bg-green-50' },
            { label: 'Rejected', value: stats.rejectedOrders, color: 'text-red-600 bg-red-50' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl px-4 py-3 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day revenue chart (CSS bar chart) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue — Last 7 Days</h3>
        <div className="flex items-end gap-2 h-32">
          {Object.entries(stats.dailyRevenue).map(([date, rev]) => (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{rev > 0 ? `₹${rev}` : ''}</span>
              <div
                className="w-full bg-brand rounded-t-md transition-all"
                style={{ height: `${Math.max(4, (rev / maxRevenue) * 100)}%` }}
              />
              <span className="text-xs text-gray-400">{date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
