'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Send, ArrowLeft, Phone, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const { user } = useAuth();
  const params = useParams();
  const otherUserId = params.id as string;
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    if (!user) return;
    fetch(`/api/messages?userId=${otherUserId}`)
      .then(r => r.json())
      .then(d => { setMessages(d.messages || []); });
    fetch(`/api/users/${otherUserId}`)
      .then(r => r.json())
      .then(d => { setOtherUser(d.user); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [user, otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: parseInt(otherUserId), message: message.trim() }),
    });
    setMessage('');
    fetchMessages();
  };

  if (!user) return <div className="page-container py-16 text-center"><p className="text-gray-500">Please login.</p></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 h-[82vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <Link href="/chat" className="p-1.5 -ml-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
          {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900">{otherUser?.name || 'Loading...'}</div>
          <div className="text-xs text-gray-400">{otherUser?.city || ''}{otherUser?.role ? ` • ${otherUser.role}` : ''}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Send className="w-5 h-5 text-gray-300" />
            </div>
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'} items-end gap-2 ${m.sender_id === user.id ? '' : ''}`}>
            {m.sender_id !== user.id && (
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 mb-1 opacity-70">
                {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className={`max-w-[75%] px-4 py-2.5 ${
              m.sender_id === user.id
                ? 'bg-emerald-600 text-white rounded-2xl rounded-br-sm'
                : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm'
            }`}>
              <p className="text-sm leading-relaxed">{m.message}</p>
              <p className={`text-[10px] mt-1 ${m.sender_id === user.id ? 'text-emerald-200' : 'text-gray-400'}`}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 pt-4 border-t border-gray-200">
        <input
          type="text" value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="input-field flex-1"
        />
        <button type="submit" disabled={!message.trim()}
          className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
