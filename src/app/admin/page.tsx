'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Package, Calendar, DollarSign, Shield, TrendingUp, Settings, ArrowRight, AlertTriangle, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <div className="page-container py-16 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Shield className="w-7 h-7 text-gray-400" />
      </div>
      <p className="text-gray-500">Admin access required.</p>
      <Link href="/" className="mt-4 btn-secondary inline-flex">Go home</Link>
    </div>;
  }

  if (loading) {
    return <div className="page-container py-8"><div className="animate-pulse space-y-4">{Array.from({length:4}).map((_,i)=> <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}</div></div>;
  }

  const s = stats || {};

  const statCards = [
    { icon: Users, label: 'Total Users', value: s.totalUsers || 0, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', href: '/admin/users' },
    { icon: Package, label: 'Total Products', value: s.totalProducts || 0, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', href: '/admin/products' },
    { icon: Calendar, label: 'Total Bookings', value: s.totalBookings || 0, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', href: '/admin/analytics' },
    { icon: DollarSign, label: 'Total Revenue', value: `${(s.totalRevenue || 0).toFixed(2)} DH`, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', href: '/admin/analytics' },
  ];

  return (
    <div className="page-container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-xl border border-gray-200 p-5 card-shadow-hover">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color.includes('emerald') ? '#059669' : stat.color.includes('blue') ? '#2563eb' : stat.color.includes('amber') ? '#d97706' : '#9333ea' }} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { icon: Users, title: 'User Management', desc: 'Manage users, roles, and account status', href: '/admin/users', color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Shield, title: 'Product Moderation', desc: 'Approve or reject product listings', href: '/admin/products', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: BarChart3, title: 'Analytics', desc: 'View platform metrics and reports', href: '/admin/analytics', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((card) => (
          <Link key={card.title} href={card.href} className="bg-white rounded-xl border border-gray-200 p-6 card-shadow-hover group">
            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{card.desc}</p>
            <span className="text-sm font-medium text-emerald-600 group-hover:gap-2 transition-all inline-flex items-center gap-1">
              Access <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </div>

      {s.pendingProducts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-amber-800">{s.pendingProducts} product{s.pendingProducts !== 1 ? 's' : ''} pending moderation</span>
              <p className="text-sm text-amber-600">Review and approve new product listings.</p>
            </div>
          </div>
          <Link href="/admin/products" className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors whitespace-nowrap">
            Review Now
          </Link>
        </div>
      )}
    </div>
  );
}
