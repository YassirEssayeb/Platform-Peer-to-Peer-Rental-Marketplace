'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Package, Calendar, DollarSign, TrendingUp, ArrowLeft, BarChart3, PieChart } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <div className="page-container py-16 text-center">
      <p className="text-gray-500">Admin access required.</p>
      <Link href="/" className="mt-4 btn-secondary inline-flex">Go home</Link>
    </div>;
  }

  if (loading) {
    return <div className="page-container py-8"><div className="animate-pulse space-y-4">{Array.from({length:6}).map((_,i)=> <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}</div></div>;
  }

  const s = data || {};

  const statsCards = [
    { icon: Users, label: 'Total Users', value: s.totalUsers || 0, bg: 'bg-blue-50' },
    { icon: Package, label: 'Total Products', value: s.totalProducts || 0, bg: 'bg-emerald-50' },
    { icon: Calendar, label: 'Total Bookings', value: s.totalBookings || 0, bg: 'bg-amber-50' },
    { icon: DollarSign, label: 'Total Revenue', value: `${(s.totalRevenue || 0).toFixed(2)} DH`, bg: 'bg-purple-50' },
    { icon: TrendingUp, label: 'Avg. Booking Value', value: `${(s.averageBookingValue || 0).toFixed(2)} DH`, bg: 'bg-rose-50' },
    { icon: Package, label: 'Pending Products', value: s.pendingProducts || 0, bg: 'bg-amber-50' },
  ];

  const bookingsByMonth = s.bookingsByMonth || [];
  const topProducts = s.topProducts || [];
  const usersByRole = s.usersByRole || { renters: 0, owners: 0, admins: 0 };

  return (
    <div className="page-container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Platform performance and metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statsCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 card-shadow">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 card-shadow">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" /> Bookings by Month
          </h2>
          {bookingsByMonth.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-sm">No booking data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="pb-3 font-medium">Month</th>
                    <th className="pb-3 font-medium text-right">Bookings</th>
                    <th className="pb-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsByMonth.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2.5 text-gray-900 font-medium">{row.month || row.label}</td>
                      <td className="py-2.5 text-right text-gray-600">{row.count || 0}</td>
                      <td className="py-2.5 text-right text-gray-900 font-medium">{(row.revenue || 0).toFixed(2)} DH</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 card-shadow">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-600" /> Users by Role
          </h2>
          <div className="space-y-5">
            {[
              { role: 'Renters', count: usersByRole.renters || 0, color: 'bg-blue-500' },
              { role: 'Owners', count: usersByRole.owners || 0, color: 'bg-emerald-500' },
              { role: 'Admins', count: usersByRole.admins || 0, color: 'bg-purple-500' },
            ].map((r) => {
              const total = (usersByRole.renters || 0) + (usersByRole.owners || 0) + (usersByRole.admins || 0);
              const pct = total > 0 ? ((r.count / total) * 100).toFixed(1) : '0';
              return (
                <div key={r.role}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700 font-medium">{r.role}</span>
                    <span className="text-gray-500">{r.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`${r.color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 card-shadow">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" /> Top Products
        </h2>
        {topProducts.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-sm">No product data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Owner</th>
                  <th className="pb-3 font-medium text-right">Bookings</th>
                  <th className="pb-3 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-900 font-medium">{p.title || p.name}</td>
                    <td className="py-2.5 text-gray-600">{p.owner_name || 'Unknown'}</td>
                    <td className="py-2.5 text-right text-gray-600">{p.bookingCount || p.bookings_count || 0}</td>
                    <td className="py-2.5 text-right text-gray-900 font-medium">{(p.revenue || 0).toFixed(2)} DH</td>
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
