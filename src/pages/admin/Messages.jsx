import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, User, Clock, Eye, Loader2 } from 'lucide-react';
import { admin as adminApi } from '../../utils/api';

const STATUS_COLORS = {
  unread: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  read: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  replied: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('nimos_token');
      const res = await fetch('/api/admin/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to fetch messages:', e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('nimos_token');
      await fetch(`/api/admin/messages/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'read' } : m))
      );
    } catch (e) {
      console.error('Failed to mark as read:', e);
    }
  };

  const filtered = filter === 'all' ? messages : messages.filter((m) => m.status === filter);
  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#e94560] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-[#e94560]" />
            Contact Messages
          </h1>
          <p className="text-[#e0e0e0]/50 text-sm mt-1">
            {messages.length} total &middot; {unreadCount} unread
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'unread', 'read'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-[#e94560] text-white'
                : 'bg-[#1a1a2e] text-[#e0e0e0]/60 hover:text-white border border-white/5'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'unread' && unreadCount > 0 && (
              <span className="ml-2 bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-[#e0e0e0]/20 mx-auto mb-4" />
          <p className="text-[#e0e0e0]/50">No messages found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className={`bg-[#1a1a2e] rounded-xl border ${
                msg.status === 'unread' ? 'border-yellow-500/20' : 'border-white/5'
              } p-6 transition-all hover:border-[#e94560]/20`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#e94560]/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#e94560]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{msg.name}</h3>
                    <div className="flex items-center gap-3 text-[#e0e0e0]/40 text-xs">
                      {msg.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {msg.email}
                        </span>
                      )}
                      {msg.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {msg.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                      STATUS_COLORS[msg.status] || STATUS_COLORS.unread
                    }`}
                  >
                    {msg.status}
                  </span>
                  {msg.status === 'unread' && (
                    <button
                      onClick={() => markAsRead(msg.id)}
                      className="p-1.5 bg-white/5 hover:bg-[#e94560]/10 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Eye className="w-4 h-4 text-[#e0e0e0]/50 hover:text-[#e94560]" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[#e0e0e0]/70 text-sm leading-relaxed whitespace-pre-wrap">
                {msg.message}
              </p>

              <div className="flex items-center gap-1.5 text-[#e0e0e0]/30 text-xs mt-4">
                <Clock className="w-3 h-3" />
                {new Date(msg.created_at).toLocaleString('en-IE', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
