"use client";
import React, { useState } from 'react';
import { APP_HOST } from '../lib/app-config';

interface Props {
  store: any;
  onUpdate: (store: any) => void;
}

export default function AdminSettings({ store, onUpdate }: Props) {
  const [form, setForm] = useState({
    name: store.name || '',
    upiId: store.upiId || '',
    description: store.description || '',
    bannerImage: store.bannerImage || '',
    contactEmail: store.contactEmail || '',
    theme: store.theme || 'theme-one',
    customDomain: store.customDomain || '',
    returnPolicy: store.returnPolicy || '',
    instagram: store.socialLinks?.instagram || '',
    facebook: store.socialLinks?.facebook || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadBanner(file: File) {
    setUploadingBanner(true);
    setMessage('');
    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/uploads/image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const j = await res.json();
    setUploadingBanner(false);

    if (j.ok && j.url) {
      set('bannerImage', j.url);
      setMessage('Banner uploaded. Save settings to publish it.');
      return;
    }

    setMessage(j.error || 'Banner upload failed');
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const token = localStorage.getItem('token');
    const body: any = {
      name: form.name,
      upiId: form.upiId,
      description: form.description,
      bannerImage: form.bannerImage || undefined,
      contactEmail: form.contactEmail || undefined,
      theme: form.theme,
      customDomain: form.customDomain || undefined,
      returnPolicy: form.returnPolicy || undefined,
      socialLinks: {
        instagram: form.instagram || undefined,
        facebook: form.facebook || undefined,
      },
    };
    const res = await fetch(`/api/admin/stores/${store._id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    setSaving(false);
    if (j.ok) {
      onUpdate(j.store);
      setMessage('Settings saved.');
    } else {
      setMessage(j.error || 'Failed to save');
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition';

  return (
    <form onSubmit={save} className="max-w-2xl space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">General</h2>
        
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Your Store URL</p>
          <a 
            href={store.customDomain ? `https://${store.customDomain}` : `https://${APP_HOST}/${store.subdomain}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm font-medium text-brand hover:underline"
          >
            {store.customDomain ? `https://${store.customDomain}` : `https://${APP_HOST}/${store.subdomain}`}
          </a>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
          <input type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Branding</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
          <input
            placeholder="https://your-banner-image..."
            value={form.bannerImage}
            onChange={(e) => set('bannerImage', e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-gray-400 mt-1">Recommended: wide image, at least 1600px wide.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Banner Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadBanner(file);
            }}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-brand hover:file:bg-teal-100 transition"
          />
          {form.bannerImage && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
              <img src={form.bannerImage} alt="Store banner preview" className="h-40 w-full object-cover" />
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">{uploadingBanner ? 'Uploading banner...' : 'Uploaded banners appear in the store hero section.'}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Payments</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
          <input placeholder="yourname@upi" value={form.upiId} onChange={(e) => set('upiId', e.target.value)} className={inputClass} />
          <p className="text-xs text-gray-400 mt-1">Customers will pay to this UPI ID.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Theme</h2>
        <div className="grid grid-cols-2 gap-3">
          {(['theme-one', 'theme-two'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('theme', t)}
              className={`border-2 rounded-xl p-4 text-sm font-medium transition-colors ${
                form.theme === t ? 'border-brand text-brand bg-teal-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {t === 'theme-one' ? 'Theme One - Minimal' : 'Theme Two - Bold'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Custom Domain</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
          <input placeholder="shop.yourdomain.com" value={form.customDomain} onChange={(e) => set('customDomain', e.target.value)} className={inputClass} />
          <p className="text-xs text-gray-400 mt-1">Point a CNAME record to <code className="bg-gray-100 px-1 rounded">{APP_HOST}</code> then enter your domain here.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Social Links</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
          <input placeholder="https://instagram.com/yourstore" value={form.instagram} onChange={(e) => set('instagram', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
          <input placeholder="https://facebook.com/yourstore" value={form.facebook} onChange={(e) => set('facebook', e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Return Policy</h2>
        <textarea value={form.returnPolicy} onChange={(e) => set('returnPolicy', e.target.value)} rows={4} placeholder="Describe your return/refund policy..." className={inputClass} />
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving || uploadingBanner} className="bg-brand text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {message && <p className={`text-sm ${message.includes('saved') || message.includes('uploaded') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
      </div>
    </form>
  );
}
