'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Shield, ShieldOff, ArrowLeft, Search } from 'lucide-react';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = () => {
    if (!user) return;
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users || d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [user]);

  const handleAction = async (userId: number, action: string, value?: string) => {
    await fetch('/api/admin/users', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, value }),
    });
    fetchUsers();
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

  const filtered = users.filter((u: any) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">{users.length} total users</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name or email..."
          className="input-field sm:w-80 pl-10" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-gray-500">
                <th className="py-3.5 px-4 font-semibold">User</th>
                <th className="py-3.5 px-4 font-semibold">Role</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Products</th>
                <th className="py-3.5 px-4 font-semibold">Bookings</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <select value={u.role} onChange={e => handleAction(u.id, 'changeRole', e.target.value)}
                      className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white">
                      <option value="renter">Renter</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${u.status === 'active' || !u.status ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' : u.status === 'blocked' ? 'bg-red-50 text-red-700 ring-red-600/10' : 'bg-gray-100 text-gray-700 ring-gray-600/10'}`}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{u.productCount || u.products_count || 0}</td>
                  <td className="py-3.5 px-4 text-gray-600">{u.bookingCount || u.bookings_count || 0}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => handleAction(u.id, 'toggleBlock')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        u.status === 'blocked'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      }`}>
                      {u.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
