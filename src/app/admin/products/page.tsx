'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Package, CheckCircle, XCircle, ArrowLeft, Search, Eye } from 'lucide-react';

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProducts = () => {
    if (!user) return;
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(d => {
        setProducts((d.products || d.data || []).map((p: any) => ({
          ...p, images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        })));
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [user]);

  const handleAction = async (productId: number, action: string) => {
    await fetch('/api/admin/products', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, action }),
    });
    fetchProducts();
  };

  if (!user || user.role !== 'admin') {
    return <div className="page-container py-16 text-center">
      <p className="text-gray-500">Admin access required.</p>
      <Link href="/" className="mt-4 btn-secondary inline-flex">Go home</Link>
    </div>;
  }

  if (loading) {
    return <div className="page-container py-8"><div className="animate-pulse space-y-4">{Array.from({length:6}).map((_,i)=> <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}</div></div>;
  }

  const filtered = products.filter((p: any) => {
    const matchesSearch = (p.name || p.title)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (statusFilter === 'all' || p.status === statusFilter);
  });

  return (
    <div className="page-container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Moderation</h1>
          <p className="text-gray-500">{products.length} total products</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products or owners..."
            className="input-field pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'active', 'rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-medium capitalize transition-all ${
                statusFilter === s ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center card-shadow">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
          <p className="text-gray-500 mt-1">No products match your search or filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-gray-500">
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Owner</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">City</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: any) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                          {p.images && p.images[0] ? (
                            <img src={p.images[0]} alt={p.name || p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{p.name || p.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{p.owner_name || 'Unknown'}</td>
                    <td className="py-3.5 px-4 text-gray-900 font-medium">{parseFloat(p.daily_price || p.price).toFixed(2)} DH</td>
                    <td className="py-3.5 px-4 text-gray-600">{p.city}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${
                        p.status === 'approved' || !p.status ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' :
                        p.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-amber-600/10' :
                        p.status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                        'bg-gray-100 text-gray-700 ring-gray-600/10'
                      }`}>{p.status || 'approved'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/products/${p.id}`} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => handleAction(p.id, 'approve')}
                              className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button onClick={() => handleAction(p.id, 'reject')}
                              className="bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {p.status === 'approved' && (
                          <button onClick={() => handleAction(p.id, 'reject')}
                            className="bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Unlist
                          </button>
                        )}
                        {p.status === 'rejected' && (
                          <button onClick={() => handleAction(p.id, 'approve')}
                            className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
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
