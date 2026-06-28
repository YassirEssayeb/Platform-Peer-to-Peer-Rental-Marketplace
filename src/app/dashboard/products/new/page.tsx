'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';

export default function NewProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [form, setForm] = useState({
    title: '', description: '', category: '', price: '', priceUnit: 'day',
    weeklyPrice: '', securityDeposit: '', city: '',
  });

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || d.data || [])).catch(() => {});
  }, []);

  if (!user || user.role === 'renter') {
    return <div className="page-container py-16 text-center">
      <p className="text-gray-500">Access denied.</p>
      <Link href="/" className="mt-4 btn-secondary inline-flex">Go home</Link>
    </div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const addImageField = () => setImageUrls(prev => [...prev, '']);
  const removeImageField = (index: number) => setImageUrls(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const images = imageUrls.filter(url => url.trim());
    const payload = {
      ...form, price: parseFloat(form.price),
      weeklyPrice: form.weeklyPrice ? parseFloat(form.weeklyPrice) : null,
      securityDeposit: form.securityDeposit ? parseFloat(form.securityDeposit) : 0,
      images,
    };
    try {
      const res = await fetch('/api/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');
      router.push('/dashboard/products');
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/dashboard/products" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to My Products
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">List New Item</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 card-shadow">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-xl">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required className="input-field" placeholder="e.g. Professional Camera Canon EOS R5" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="input-field" placeholder="Describe your item, condition, pickup details..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} required className="select-field">
              <option value="">Select category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.slug || cat.name.toLowerCase()}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
            <input type="text" name="city" value={form.city} onChange={handleChange} required className="input-field" placeholder="e.g. Casablanca" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Daily Price * (DH)</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01" className="input-field" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Weekly Price (DH)</label>
            <input type="number" name="weeklyPrice" value={form.weeklyPrice} onChange={handleChange} min="0" step="0.01" className="input-field" placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Security Deposit (DH)</label>
            <input type="number" name="securityDeposit" value={form.securityDeposit} onChange={handleChange} min="0" step="0.01" className="input-field" placeholder="Optional" />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Images (URLs)</label>
            <button type="button" onClick={addImageField} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add another
            </button>
          </div>
          <div className="space-y-2.5">
            {imageUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <input type="url" value={url} onChange={e => handleImageChange(i, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="input-field flex-1" />
                {imageUrls.length > 1 && (
                  <button type="button" onClick={() => removeImageField(i)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : 'Create Listing'}
          </button>
          <Link href="/dashboard/products" className="btn-ghost text-sm">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
