"use client";
import React, { useState, useEffect } from 'react';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  inventory: number;
  image?: string;
  upiId?: string;
  sku?: string;
  isActive: boolean;
  isFeatured: boolean;
  description?: string;
  category?: string;
  attachments?: ProductAttachment[];
  externalLinks?: ProductLink[];
}

interface ProductAttachment {
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
}

interface ProductLink {
  label: string;
  url: string;
}

const emptyForm = {
  name: '',
  slug: '',
  price: '',
  upiId: '',
  inventory: '0',
  description: '',
  category: '',
  sku: '',
  isFeatured: false,
};

export default function AdminProductForm({ storeId }: { storeId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<ProductAttachment[]>([]);
  const [externalLinks, setExternalLinks] = useState<ProductLink[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function fetchProducts() {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/products?storeId=${storeId}`, { headers: { Authorization: `Bearer ${token}` } });
    const j = await res.json();
    setProducts(j.products || []);
  }

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  function set(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleNameChange(v: string) {
    set('name', v);
    if (!editId) {
      set('slug', v.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
    }
  }

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/uploads/image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const j = await res.json();
    return j.url;
  }

  async function uploadAttachment(file: File): Promise<ProductAttachment> {
    const fd = new FormData();
    fd.append('file', file);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/uploads/file', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const j = await res.json();
    if (!res.ok || !j.file) {
      throw new Error(j.error || 'Attachment upload failed');
    }
    return j.file;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');

      let imageUrl: string | undefined;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const uploadedAttachments = await Promise.all(attachmentFiles.map(uploadAttachment));
      const cleanedLinks = externalLinks.filter((link) => link.label.trim() && link.url.trim());

      const body: any = {
        name: form.name,
        slug: form.slug,
        price: Number(form.price),
        upiId: form.upiId || undefined,
        inventory: Number(form.inventory),
        description: form.description,
        category: form.category,
        sku: form.sku,
        isFeatured: form.isFeatured,
        storeId,
        attachments: [...attachments, ...uploadedAttachments],
        externalLinks: cleanedLinks,
        ...(imageUrl ? { image: imageUrl } : {}),
      };

      const url = editId ? `/api/products/${editId}` : '/api/products';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      setLoading(false);
      if (j.ok) {
        setMessage(editId ? 'Product updated.' : 'Product added.');
        setForm(emptyForm);
        setImageFile(null);
        setAttachmentFiles([]);
        setAttachments([]);
        setExternalLinks([]);
        setEditId(null);
        setShowForm(false);
        fetchProducts();
      } else {
        setMessage(j.error || 'Error saving product');
      }
    } catch (error: any) {
      setLoading(false);
      setMessage(error?.message || 'Error saving product');
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchProducts();
  }

  function startEdit(p: Product) {
    setEditId(p._id);
    setForm({
      name: p.name,
      slug: p.slug,
      price: String(p.price),
      upiId: p.upiId || '',
      inventory: String(p.inventory),
      description: p.description || '',
      category: p.category || '',
      sku: p.sku || '',
      isFeatured: p.isFeatured,
    });
    setAttachments(p.attachments || []);
    setExternalLinks(p.externalLinks || []);
    setAttachmentFiles([]);
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditId(null);
    setForm(emptyForm);
    setImageFile(null);
    setAttachmentFiles([]);
    setAttachments([]);
    setExternalLinks([]);
    setMessage('');
  }

  function formatBytes(size?: number) {
    if (!size) return null;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Products ({products.length})</h2>
        <button
          onClick={() => {
            const nextShowForm = !showForm;
            setShowForm(nextShowForm);
            resetForm();
          }}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900">{editId ? 'Edit Product' : 'New Product'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => set('slug', e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product UPI ID</label>
              <input
                value={form.upiId}
                onChange={(e) => set('upiId', e.target.value)}
                placeholder="optional@upi"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-400">Optional. If set, this product uses its own QR code instead of the store UPI ID.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inventory</label>
              <input type="number" min="0" value={form.inventory} onChange={(e) => set('inventory', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input value={form.sku} onChange={(e) => set('sku', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-brand hover:file:bg-teal-100 transition"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Files</label>
              <input
                type="file"
                multiple
                onChange={(e) => setAttachmentFiles(Array.from(e.target.files || []).slice(0, 10))}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-brand hover:file:bg-teal-100 transition"
              />
              <p className="mt-1 text-xs text-gray-400">Upload any file type up to 5 MB each, including ZIP, PDF, docs, and design files.</p>
              {(attachments.length > 0 || attachmentFiles.length > 0) && (
                <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {attachments.map((file, index) => (
                    <div key={`${file.url}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{file.name}</p>
                        <p className="truncate text-xs text-slate-500">{formatBytes(file.size)} {file.mimeType ? `- ${file.mimeType}` : ''}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachments((current) => current.filter((_, i) => i !== index))}
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {attachmentFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{file.name}</p>
                        <p className="truncate text-xs text-slate-500">{formatBytes(file.size)} - pending upload</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachmentFiles((current) => current.filter((_, i) => i !== index))}
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">File Links</label>
                <button
                  type="button"
                  onClick={() => setExternalLinks((current) => [...current, { label: '', url: '' }])}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  + Add link
                </button>
              </div>
              <div className="space-y-3">
                {externalLinks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-400">
                    Add Google Drive, Dropbox, GitHub, or any external file URL.
                  </div>
                )}
                {externalLinks.map((link, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 p-3">
                    <div className="grid gap-3">
                      <input
                        value={link.label}
                        onChange={(e) =>
                          setExternalLinks((current) =>
                            current.map((item, i) => (i === index ? { ...item, label: e.target.value } : item))
                          )
                        }
                        placeholder="Label, e.g. Source ZIP"
                        className={inputClass}
                      />
                      <input
                        value={link.url}
                        onChange={(e) =>
                          setExternalLinks((current) =>
                            current.map((item, i) => (i === index ? { ...item, url: e.target.value } : item))
                          )
                        }
                        placeholder="https://..."
                        className={inputClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setExternalLinks((current) => current.filter((_, i) => i !== index))}
                      className="mt-3 text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      Remove link
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} className="rounded" />
            Featured product
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="bg-brand text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
              {loading ? 'Saving...' : editId ? 'Update' : 'Add Product'}
            </button>
            {message && <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
          No products yet. Add your first product above.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Price</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">UPI</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />}
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.slug}</p>
                        {!!(p.attachments?.length || p.externalLinks?.length) && (
                          <p className="text-xs text-slate-500">
                            {(p.attachments?.length || 0) + (p.externalLinks?.length || 0)} resources attached
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">Rs {p.price}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.upiId || 'Store default'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.inventory > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {p.inventory > 0 ? `${p.inventory} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => startEdit(p)} className="text-xs text-gray-500 hover:text-brand transition-colors px-2 py-1 rounded hover:bg-gray-100">Edit</button>
                      <button onClick={() => deleteProduct(p._id)} className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
