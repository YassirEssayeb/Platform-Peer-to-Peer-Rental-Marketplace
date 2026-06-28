'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Calendar, DollarSign, Clock, Plus, MessageCircle, ArrowRight, CheckCircle, XCircle, TrendingUp, ShoppingBag, Users } from 'lucide-react';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch('/api/bookings?role=owner').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([bData, pData]) => {
      setBookings(bData.bookings || []);
      setProducts(pData.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (!user || user.role === 'renter') {
    return <div className="page-container py-16 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Package className="w-7 h-7 text-gray-400" />
      </div>
      <p className="text-gray-500">This page is for item owners.</p>
      <Link href="/" className="mt-4 btn-secondary inline-flex">Go home</Link>
    </div>;
  }

  if (loading) {
    return <div className="page-container py-8"><div className="animate-pulse space-y-4">{Array.from({length:4}).map((_,i)=> <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}</div></div>;
  }

  const myProducts = products.filter(p => p.owner_id === user?.id);
  const activeBookings = bookings.filter(b => b.status === 'approved');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalEarned = completedBookings.reduce((sum: number, b: any) => sum + parseFloat(b.total_cost || '0'), 0);

  const handleConfirm = async (id: number, action: string) => {
    await fetch(`/api/bookings/${id}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    window.location.reload();
  };

  const stats = [
    { icon: Package, label: 'My Listings', value: myProducts.length, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { icon: Calendar, label: 'Active Rentals', value: activeBookings.length, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
    { icon: Clock, label: 'Pending Requests', value: pendingBookings.length, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
    { icon: DollarSign, label: 'Total Earned', value: `${totalEarned.toFixed(2)} DH`, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="page-container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.name}</p>
        </div>
        <Link href="/dashboard/products/new" className="btn-primary">
          <Plus className="w-4 h-4" /> List New Item
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 card-shadow-hover">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color.includes('emerald') ? '#059669' : stat.color.includes('blue') ? '#2563eb' : stat.color.includes('amber') ? '#d97706' : '#9333ea' }} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {[
          { icon: ShoppingBag, title: 'Manage Bookings', desc: 'View and manage all requests', href: '/dashboard/orders' },
          { icon: Package, title: 'My Products', desc: `${myProducts.length} items listed`, href: '/dashboard/products' },
          { icon: MessageCircle, title: 'Messages', desc: 'Chat with renters', href: '/chat' },
        ].map((card) => (
          <Link key={card.title} href={card.href} className="bg-white rounded-xl border border-gray-200 p-5 card-shadow-hover flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                <card.icon className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <span className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">{card.title}</span>
                <p className="text-sm text-gray-500">{card.desc}</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
          </Link>
        ))}
      </div>

      {pendingBookings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 card-shadow">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Booking Requests
          </h2>
          <div className="space-y-3">
            {pendingBookings.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{booking.product_name}</p>
                  <p className="text-sm text-gray-500">by {booking.renter_name} &middot; {booking.start_date?.split('T')[0]} to {booking.end_date?.split('T')[0]}</p>
                  <p className="text-sm font-semibold text-emerald-600 mt-0.5">{parseFloat(booking.total_cost).toFixed(2)} DH</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleConfirm(booking.id, 'approve')} className="bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => handleConfirm(booking.id, 'reject')} className="bg-red-50 text-red-700 px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-shadow">
        <div className="p-6 pb-0">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        {bookings.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto p-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-3 px-4 font-medium">Product</th>
                  <th className="pb-3 px-4 font-medium">Renter</th>
                  <th className="pb-3 px-4 font-medium">Dates</th>
                  <th className="pb-3 px-4 font-medium">Amount</th>
                  <th className="pb-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 10).map((b: any) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-900">{b.product_name}</td>
                    <td className="py-3.5 px-4 text-gray-600">{b.renter_name}</td>
                    <td className="py-3.5 px-4 text-gray-600 text-sm">{b.start_date?.split('T')[0]} - {b.end_date?.split('T')[0]}</td>
                    <td className="py-3.5 px-4 text-gray-900 font-medium">{parseFloat(b.total_cost).toFixed(2)} DH</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${
                        b.status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' :
                        b.status === 'approved' ? 'bg-blue-50 text-blue-700 ring-blue-600/10' :
                        b.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-amber-600/10' :
                        b.status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                        'bg-gray-100 text-gray-700 ring-gray-600/10'
                      }`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
