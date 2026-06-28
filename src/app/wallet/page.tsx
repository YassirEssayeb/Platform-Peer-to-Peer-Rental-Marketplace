'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, CreditCard, Send } from 'lucide-react';

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [addAmount, setAddAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPayments = () => {
    fetch('/api/payments').then(r => r.json()).then(d => setPayments(d.payments || [])).catch(() => {});
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(''); setLoading(true);
    try {
      const res = await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: parseFloat(addAmount) }) });
      const data = await res.json();
      if (res.ok) { setMessage(`Added ${addAmount} DH successfully!`); setAddAmount(''); fetchPayments(); await refreshUser(); }
      else setMessage(data.error || 'Failed');
    } catch { setMessage('Error'); }
    setLoading(false);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(''); setLoading(true);
    try {
      const res = await fetch('/api/payments/withdraw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: parseFloat(withdrawAmount) }) });
      const data = await res.json();
      if (res.ok) { setMessage(`Withdrew ${withdrawAmount} DH successfully!`); setWithdrawAmount(''); fetchPayments(); await refreshUser(); }
      else setMessage(data.error || 'Failed');
    } catch { setMessage('Error'); }
    setLoading(false);
  };

  if (!user) return <div className="page-container py-16 text-center"><p className="text-gray-500">Please login.</p></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Digital Wallet</h1>

      <div className="gradient-card rounded-2xl p-6 sm:p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3 text-emerald-100/80">
            <CreditCard className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Available Balance</span>
          </div>
          <div className="text-4xl sm:text-5xl font-bold mb-1 tracking-tight">
            {parseFloat(user.wallet_balance as any).toFixed(2)} DH
          </div>
          <div className="text-emerald-200/80 text-sm">Available for rentals and withdrawals</div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-4 text-sm flex items-center gap-2.5 ${
          message.includes('Error') || message === 'Failed' || message === 'Error'
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${message.includes('Error') || message === 'Failed' || message === 'Error' ? 'bg-red-500' : 'bg-emerald-500'} mt-0.5 shrink-0`} />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <form onSubmit={handleAddFunds} className="bg-white rounded-xl border border-gray-200 p-5 card-shadow">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" /> Add Funds
          </h3>
          <div className="flex gap-2">
            <input type="number" min="10" step="10" value={addAmount} onChange={e => setAddAmount(e.target.value)}
              placeholder="Amount (DH)" className="input-field flex-1" required />
            <button type="submit" disabled={loading || !addAmount}
              className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 font-medium text-sm">
              Add
            </button>
          </div>
        </form>
        <form onSubmit={handleWithdraw} className="bg-white rounded-xl border border-gray-200 p-5 card-shadow">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-600" /> Withdraw
          </h3>
          <div className="flex gap-2">
            <input type="number" min="10" step="10" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="Amount (DH)" className="input-field flex-1" required />
            <button type="submit" disabled={loading || !withdrawAmount}
              className="bg-amber-500 text-white px-4 py-2.5 rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50 font-medium text-sm">
              Send
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 card-shadow">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-gray-900">Transaction History</h3>
          <button onClick={fetchPayments} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {payments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-1">
            {payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    p.type === 'deposit' || p.type === 'rental' ? 'bg-emerald-50' :
                    p.type === 'withdrawal' ? 'bg-red-50' : 'bg-blue-50'
                  }`}>
                    {p.type === 'withdrawal' ? (
                      <ArrowUpRight className="w-5 h-5 text-red-500" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 capitalize">{p.type}</div>
                    <div className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
                <div className={`font-semibold ${p.type === 'withdrawal' ? 'text-red-500' : 'text-emerald-600'}`}>
                  {p.type === 'withdrawal' ? '-' : '+'}{parseFloat(p.amount).toFixed(2)} DH
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
