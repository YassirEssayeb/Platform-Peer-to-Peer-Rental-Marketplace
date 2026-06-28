'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, MapPin, Phone, Save, Package, Star, Calendar, Shield, CreditCard } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || '');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(''); setSaving(true);
    const res = await fetch(`/api/users/${user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, city, phone, avatar: null }),
    });
    const data = await res.json();
    if (res.ok) { setMessage('Profile updated successfully!'); await refreshUser(); }
    else setMessage(data.error || 'Error updating profile');
    setSaving(false);
  };

  if (!user) return <div className="page-container py-16 text-center"><p className="text-gray-500">Please login.</p></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6 card-shadow">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 capitalize flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
              <Shield className="w-3.5 h-3.5" /> {user.role}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Mail, label: 'Email', value: user.email },
            { icon: MapPin, label: 'City', value: user.city || 'Not set' },
            { icon: CreditCard, label: 'Wallet Balance', value: `${parseFloat(user.wallet_balance as any).toFixed(2)} DH`, color: 'text-emerald-600' },
            { icon: Star, label: 'Member Since', value: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider mb-1">
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </div>
              <p className={`font-medium ${item.color || 'text-gray-900'} truncate`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 card-shadow">
        <h2 className="font-semibold text-gray-900 mb-5">Edit Profile</h2>

        {message && (
          <div className={`p-3.5 rounded-xl text-sm mb-4 flex items-center gap-2.5 ${
            message.includes('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${message.includes('Error') ? 'bg-red-500' : 'bg-emerald-500'} mt-0.5 shrink-0`} />
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field pl-10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={city} onChange={e => setCity(e.target.value)} className="input-field pl-10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field pl-10" placeholder="+212 6XX XXX XXX" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary mt-6">
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </button>
      </form>
    </div>
  );
}
