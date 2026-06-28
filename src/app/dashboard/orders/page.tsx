'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, CheckCircle, XCircle, ArrowLeft, Package } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = () => {
    if (!user) return;
    fetch('/api/bookings?role=owner')
      .then(r => r.json())
      .then(d => { setBookings(d.bookings || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [user]);

  const handleConfirm = async (id: number, action: string) => {
    await fetch(`/api/bookings/${id}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    fetchBookings();
  };

  if (!user || user.role === 'renter') {
    return <div className="page-container py-16 text-center">
      <p className="text-gray-500">Access denied.</p>
      <Link href="/" className="mt-4 btn-secondary inline-flex">Go home</Link>
    </div>;
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) {
    return <div className="page-container py-8"><div className="animate-pulse space-y-4">{Array.from({length:4}).map((_,i)=> <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}</div></div>;
  }

  const statusFilters = ['all', 'pending', 'approved', 'active', 'completed', 'rejected', 'cancelled'];

  return (
    <div className="page-container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {statusFilters.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === s ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center card-shadow">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No bookings found</h3>
          <p className="text-gray-500 mt-1">No bookings match the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-gray-500">
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Renter</th>
                  <th className="py-3.5 px-4 font-semibold">Dates</th>
                  <th className="py-3.5 px-4 font-semibold">Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-900">{b.product_name}</td>
                    <td className="py-3.5 px-4 text-gray-600">{b.renter_name}</td>
                    <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                      {b.start_date?.split('T')[0]} - {b.end_date?.split('T')[0]}
                    </td>
                    <td className="py-3.5 px-4 text-gray-900 font-medium">{parseFloat(b.total_cost).toFixed(2)} DH</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${
                        b.status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' :
                        b.status === 'approved' ? 'bg-blue-50 text-blue-700 ring-blue-600/10' :
                        b.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-amber-600/10' :
                        b.status === 'active' ? 'bg-purple-50 text-purple-700 ring-purple-600/10' :
                        b.status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                        'bg-gray-100 text-gray-700 ring-gray-600/10'
                      }`}>{b.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {b.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleConfirm(b.id, 'approve')}
                            className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => handleConfirm(b.id, 'reject')}
                            className="bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                      {b.status !== 'pending' && b.status !== 'cancelled' && (
                        <Link href={`/chat/${b.renter_id}`} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                          Contact Renter
                        </Link>
                      )}
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
