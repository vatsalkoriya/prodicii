"use client";
import React, { useState } from 'react';

interface Props {
  upiLink: string;
  qrDataUrl?: string | null;
  productId: string;
  amount: number;
  storeId: string;
  storeName: string;
}

type Step = 'pay' | 'confirm' | 'done';

export default function CheckoutClient({ upiLink, qrDataUrl, productId, amount, storeId, storeName }: Props) {
  const [step, setStep] = useState<Step>('pay');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [utr, setUtr] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createOrder() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        storeId,
        products: [{ productId, qty: 1 }],
        customer: name ? { name, phone: phone || undefined } : undefined,
      }),
    });
    const j = await res.json();
    setLoading(false);
    if (j.ok) {
      setOrderId(j.orderId);
      setOrderNumber(j.orderNumber);
      setStep('confirm');
    } else {
      setError(j.error || 'Failed to create order');
    }
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setError('');
    const res = await fetch('/api/orders/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderId, utr: utr.trim().toUpperCase(), screenshotUrl: screenshotUrl || undefined }),
    });
    const j = await res.json();
    setLoading(false);
    if (j.ok) {
      setStep('done');
    } else {
      setError(j.error || 'Failed to submit payment');
    }
  }

  const steps = [
    ['1', 'Pay'],
    ['2', 'Confirm'],
    ['3', 'Done'],
  ];

  if (step === 'done') {
    return (
      <div className="surface rounded-[2rem] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-2xl text-brand">OK</div>
        <h2 className="mt-5 text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Payment submitted
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Order <span className="font-mono font-semibold text-white">{orderNumber}</span> is being verified by {storeName}.
        </p>
      </div>
    );
  }

  return (
    <div className="surface rounded-[2rem] p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        {steps.map(([index, label]) => {
          const active = (step === 'pay' && index === '1') || (step === 'confirm' && index === '2');
          const complete = step === 'confirm' && index === '1';
          return (
            <div key={index} className="flex flex-1 items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                  active || complete
                    ? 'border-emerald-400/50 bg-emerald-400/10 text-brand'
                    : 'border-white/10 bg-white/5 text-slate-500'
                }`}
              >
                {index}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step {index}</p>
                <p className="text-sm font-medium text-white">{label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {step === 'pay' && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-200">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="field-dark" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-200">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" className="field-dark" />
            </div>
          </div>

          {qrDataUrl && (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-center">
              <p className="text-sm font-medium text-slate-300">Scan to pay Rs {amount}</p>
              <img src={qrDataUrl} alt="UPI QR Code" className="mx-auto mt-4 h-52 w-52 rounded-2xl border border-white/10 bg-white p-3" />
              <p className="mt-3 text-xs text-slate-500">Or open your UPI app directly.</p>
            </div>
          )}

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <div className="flex flex-col gap-3">
            <a
              href={upiLink}
              className="rounded-2xl bg-brand py-3 text-center text-base font-semibold text-[var(--brand-ink)] transition hover:bg-[#52e09d]"
            >
              Open UPI app - Pay Rs {amount}
            </a>
            <button
              onClick={createOrder}
              disabled={loading}
              className="rounded-2xl border border-white/10 bg-white/5 py-3 text-base font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              {loading ? 'Creating order...' : "I've paid - enter UTR"}
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <form onSubmit={submitPayment} className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Confirm payment
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Order {orderNumber}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-200">UTR / Transaction ID</label>
            <input
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="12 to 22 character transaction ID"
              required
              className="field-dark"
            />
            <p className="mt-2 text-xs text-slate-500">Find this in your UPI app transaction history.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-200">Payment screenshot URL</label>
            <input
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              placeholder="https://..."
              className="field-dark"
            />
          </div>

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={loading || !utr}
            className="shine w-full rounded-2xl bg-brand py-3 text-base font-semibold text-[var(--brand-ink)] transition hover:bg-[#52e09d] disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Submit payment proof'}
          </button>
        </form>
      )}
    </div>
  );
}
