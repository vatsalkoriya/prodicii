"use client";
import React, { useEffect, useState } from 'react';

const STATUS_STYLES: Record<string, string> = {
  pending_payment: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  payment_submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  payment_verified: 'bg-green-50 text-green-700 border-green-200',
  payment_rejected: 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pending',
  payment_submitted: 'Submitted',
  payment_verified: 'Verified',
  payment_rejected: 'Rejected',
};

export default function AdminOrders({ storeId }: { storeId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  async function fetchOrders(status = '') {
    setLoading(true);
    const token = localStorage.getItem('token');
    const qs = status ? `&status=${status}` : '';
    const res = await fetch(`/api/admin/orders?storeId=${storeId}${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const j = await res.json();
    setOrders(j.orders || []);
    setLoading(false);
  }

  useEffect(() => { fetchOrders(filter); }, [storeId, filter]);

  async function takeAction(orderId: string, action: 'approve' | 'reject') {
    const token = localStorage.getItem('token');
    await fetch('/api/admin/orders/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId, action }),
    });
    fetchOrders(filter);
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['', 'All'], ['payment_submitted', 'Needs Review'], ['payment_verified', 'Verified'], ['pending_payment', 'Pending'], ['payment_rejected', 'Rejected']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === val ? 'bg-brand text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">No orders found.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === o._id ? null : o._id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{o.orderNumber || o._id}</p>
                    <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  {o.customerSnapshot?.name && (
                    <p className="text-sm text-gray-600 hidden sm:block">{o.customerSnapshot.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-gray-900">₹{o.totalAmount}</p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[o.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                  <span className="text-gray-400 text-xs">{expanded === o._id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === o._id && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-gray-50">
                  {/* Products */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Items</p>
                    {o.products?.map((item: any, i: number) => (
                      <p key={i} className="text-sm text-gray-700">{item.name} × {item.qty} — ₹{item.price * item.qty}</p>
                    ))}
                  </div>

                  {/* Customer */}
                  {o.customerSnapshot && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Customer</p>
                      <p className="text-sm text-gray-700">{o.customerSnapshot.name} {o.customerSnapshot.phone && `· ${o.customerSnapshot.phone}`} {o.customerSnapshot.email && `· ${o.customerSnapshot.email}`}</p>
                    </div>
                  )}

                  {/* UTR */}
                  {o.utr && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">UTR</p>
                      <p className="text-sm font-mono text-gray-700">{o.utr}</p>
                    </div>
                  )}

                  {/* Screenshot */}
                  {o.screenshotUrl && (
                    <a href={o.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline">
                      View payment screenshot ↗
                    </a>
                  )}

                  {/* Actions */}
                  {o.status === 'payment_submitted' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => takeAction(o._id, 'approve')}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Approve Payment
                      </button>
                      <button
                        onClick={() => takeAction(o._id, 'reject')}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
