'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Plus, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';

export default function MyProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    if (!user) return;
    fetch('/api/products')
      .then(r => r.json())
      .then(d => {
        setProducts((d.products || d.data || []).filter((p: any) => p.owner_id === user.id).map((p: any) => ({
          ...p, title: p.name, price: p.daily_price, category: p.category_name,
          images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        })));
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  if (!user || user.role === 'renter') {
    return <div className="page-container py-16 text-center">
      <p className="text-gray-500">Access denied.</p>
      <Link href="/" className="mt-4 btn-secondary inline-flex">Go home</Link>
    </div>;
  }

  if (loading) {
    return <div className="page-container py-8"><div className="animate-pulse space-y-4">{Array.from({length:4}).map((_,i)=> <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}</div></div>;
  }

  return (
    <div className="page-container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500">{products.length} item{products.length !== 1 ? 's' : ''} listed</p>
        </div>
        <Link href="/dashboard/products/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center card-shadow">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No products yet</h3>
          <p className="text-gray-500 mt-1 mb-6">List your first item to start earning.</p>
          <Link href="/dashboard/products/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Add New Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-gray-500">
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">City</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                          {p.images && p.images[0] ? (
                            <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{p.title}</p>
                          <p className="text-xs text-gray-400">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-900 font-medium">{parseFloat(p.price).toFixed(2)} DH<small className="text-gray-400 font-normal">/day</small></td>
                    <td className="py-3.5 px-4 text-gray-600">{p.city}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${
                        p.status === 'approved' || !p.status ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' :
                        p.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-amber-600/10' :
                        p.status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                        'bg-gray-100 text-gray-700 ring-gray-600/10'
                      }`}>{p.status || 'active'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/products/${p.id}`} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
