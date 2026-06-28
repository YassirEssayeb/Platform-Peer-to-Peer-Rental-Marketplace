'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, ArrowRight, ChevronRight } from 'lucide-react';

export default function ChatListPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/messages/conversations')
      .then(r => r.json())
      .then(d => { setConversations(d.conversations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="page-container py-16 text-center"><p className="text-gray-500">Please login to view messages.</p></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      {loading ? (
        <div className="space-y-2">
          {Array.from({length:3}).map((_,i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No conversations yet</p>
          <p className="text-gray-400 text-sm mt-1">Start by contacting a product owner or renter</p>
          <Link href="/products" className="mt-6 btn-secondary inline-flex">
            Browse Items <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c: any) => (
            <Link key={c.other_user_id} href={`/chat/${c.other_user_id}`}
              className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 card-shadow-hover group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm shrink-0">
                  {c.other_user_name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    {c.other_user_name}
                    {c.unread_count > 0 && (
                      <span className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-semibold">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-[250px]">{c.last_message || 'No messages yet'}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
