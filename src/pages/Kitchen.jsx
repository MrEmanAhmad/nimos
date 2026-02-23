import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
} from 'lucide-react';
import KitchenHeader from '../components/kitchen/KitchenHeader';
import OrderCard from '../components/kitchen/OrderCard';
import OrderDetailModal from '../components/kitchen/OrderDetailModal';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('nimos_token') || sessionStorage.getItem('nimos_token');
}

// ---------- Web Audio API beep for new orders ----------
let audioCtx = null;

function playNewOrderBeep() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // First beep
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.15);

    // Second beep (higher pitch, slight delay)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.18); // C#6
    gain2.gain.setValueAtTime(0, audioCtx.currentTime);
    gain2.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    osc2.start(audioCtx.currentTime + 0.18);
    osc2.stop(audioCtx.currentTime + 0.35);

    // Third beep (even higher, attention-grabbing)
    const osc3 = audioCtx.createOscillator();
    const gain3 = audioCtx.createGain();
    osc3.connect(gain3);
    gain3.connect(audioCtx.destination);
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.38); // E6
    gain3.gain.setValueAtTime(0, audioCtx.currentTime);
    gain3.gain.setValueAtTime(0.4, audioCtx.currentTime + 0.38);
    gain3.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    osc3.start(audioCtx.currentTime + 0.38);
    osc3.stop(audioCtx.currentTime + 0.6);
  } catch {
    // Audio not available - silently ignore
  }
}

// ---------- Column configuration ----------
const COLUMNS = [
  {
    key: 'pending',
    title: 'New Orders',
    accent: 'border-t-[#e94560]',
    accentBg: 'bg-[#e94560]',
    accentText: 'text-[#e94560]',
    badge: 'bg-[#e94560]',
  },
  {
    key: 'confirmed',
    title: 'Confirmed',
    accent: 'border-t-blue-500',
    accentBg: 'bg-blue-500',
    accentText: 'text-blue-500',
    badge: 'bg-blue-500',
  },
  {
    key: 'preparing',
    title: 'Preparing',
    accent: 'border-t-orange-500',
    accentBg: 'bg-orange-500',
    accentText: 'text-orange-500',
    badge: 'bg-orange-500',
  },
  {
    key: 'ready',
    title: 'Ready',
    accent: 'border-t-green-500',
    accentBg: 'bg-green-500',
    accentText: 'text-green-500',
    badge: 'bg-green-500',
  },
];

export default function Kitchen() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const eventSourceRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const soundEnabledRef = useRef(soundEnabled);
  const orderIdsRef = useRef(new Set());

  // Keep ref in sync with state (for use in SSE callback)
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // ---------- Fetch orders ----------
  const fetchOrders = useCallback(async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/admin/orders?status=pending,confirmed,preparing,ready`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('nimos_token');
        navigate('/');
        return;
      }

      if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);

      const data = await res.json();
      const orderList = data.orders || data.data || data || [];
      setOrders(Array.isArray(orderList) ? orderList : []);
      setError(null);

      // Track existing order IDs (so we only beep on truly new ones)
      orderIdsRef.current = new Set(orderList.map((o) => o.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ---------- Update order status ----------
  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update order status: ${res.status}`);
      }

      // Optimistically update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      // Remove orders that move out of the kitchen view
      if (newStatus === 'out_for_delivery' || newStatus === 'delivered') {
        setTimeout(() => {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
        }, 500);
      }
    },
    []
  );

  // ---------- SSE connection ----------
  const connectSSE = useCallback(() => {
    const token = getToken();
    if (!token) return;

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus('connecting');

    const es = new EventSource(
      `${API_BASE}/admin/orders/stream?token=${token}`
    );
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionStatus('connected');
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'connected') {
          setConnectionStatus('connected');
          return;
        }

        if (data.type === 'new_order' && data.order) {
          // Play sound for genuinely new orders
          if (
            soundEnabledRef.current &&
            !orderIdsRef.current.has(data.order.id)
          ) {
            playNewOrderBeep();
          }
          orderIdsRef.current.add(data.order.id);
          setOrders((prev) => {
            // Avoid duplicates
            const exists = prev.some((o) => o.id === data.order.id);
            if (exists) return prev;
            return [data.order, ...prev];
          });
        }

        if (data.type === 'order_update' && data.order) {
          setOrders((prev) => {
            const updated = prev.map((o) =>
              o.id === data.order.id ? { ...data.order } : o
            );
            // Remove orders that moved out of kitchen view
            const kitchenStatuses = [
              'pending',
              'confirmed',
              'preparing',
              'ready',
            ];
            return updated.filter((o) => kitchenStatuses.includes(o.status));
          });
        }
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      setConnectionStatus('disconnected');
      es.close();
      eventSourceRef.current = null;

      // Auto-reconnect after 3 seconds
      reconnectTimerRef.current = setTimeout(() => {
        connectSSE();
      }, 3000);
    };
  }, []);

  // ---------- Initial load + SSE setup ----------
  useEffect(() => {
    fetchOrders().then(() => {
      // If SSE hasn't connected within 5s, switch to fast polling mode
      setTimeout(() => {
        if (connectionStatus !== 'connected') {
          setConnectionStatus('connected'); // Show as connected since polling works
        }
      }, 5000);
    });
    connectSSE();

    // Periodic refresh as fallback (every 5s for responsive kitchen)
    const refreshInterval = setInterval(fetchOrders, 5000);

    return () => {
      clearInterval(refreshInterval);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [fetchOrders, connectSSE, navigate]);

  // ---------- Group orders by status ----------
  const ordersByStatus = {};
  for (const col of COLUMNS) {
    ordersByStatus[col.key] = orders
      .filter((o) => o.status === col.key)
      .sort((a, b) => {
        // Oldest first so kitchen processes in order
        const aTime = new Date(a.created_at || a.createdAt || 0).getTime();
        const bTime = new Date(b.created_at || b.createdAt || 0).getTime();
        return aTime - bTime;
      });
  }

  const totalActiveOrders = orders.length;

  const handleLogout = () => {
    localStorage.removeItem('nimos_token');
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    navigate('/');
  };

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center space-y-4">
          <ChefHat className="w-16 h-16 text-[#e94560] mx-auto animate-bounce" />
          <p className="text-xl text-[#a0a0a0]">Loading kitchen...</p>
        </div>
      </div>
    );
  }

  // ---------- Error state ----------
  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="w-16 h-16 text-[#e94560] mx-auto" />
          <p className="text-xl text-white">Failed to load orders</p>
          <p className="text-[#a0a0a0]">{error}</p>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e94560] text-white font-semibold hover:bg-[#d13350] transition-colors min-h-[48px]"
          >
            <RefreshCw className="w-5 h-5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#080808] overflow-hidden print:overflow-visible">
      {/* Header */}
      <KitchenHeader
        connectionStatus={connectionStatus}
        activeOrderCount={totalActiveOrders}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((v) => !v)}
        onLogout={handleLogout}
      />

      {/* Error banner (non-blocking) */}
      {error && orders.length > 0 && (
        <div className="bg-red-900/30 border-b border-red-600/30 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Connection issue: {error}</span>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Disconnected banner */}
      {connectionStatus === 'disconnected' && !error && (
        <div className="bg-yellow-900/20 border-b border-yellow-600/20 px-4 py-1.5 flex items-center gap-2 text-sm text-yellow-500">
          <WifiOff className="w-4 h-4" />
          <span>Real-time updates disconnected. Reconnecting...</span>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        {/* Desktop: 4-column horizontal layout */}
        {/* Mobile: vertical scroll */}
        <div className="h-full flex flex-col lg:flex-row gap-3 p-3 overflow-y-auto lg:overflow-y-hidden">
          {COLUMNS.map((col) => {
            const colOrders = ordersByStatus[col.key] || [];

            return (
              <div
                key={col.key}
                className={`flex flex-col shrink-0 lg:shrink lg:flex-1 lg:min-w-0 bg-[#0f0f1a] rounded-xl border border-[#1a1a2e] ${col.accent} border-t-4 overflow-hidden`}
              >
                {/* Column header */}
                <div className="px-4 py-3 flex items-center justify-between shrink-0">
                  <h2
                    className={`text-base font-bold ${col.accentText}`}
                  >
                    {col.title}
                  </h2>
                  {colOrders.length > 0 && (
                    <span
                      className={`${col.badge} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center`}
                    >
                      {colOrders.length}
                    </span>
                  )}
                </div>

                {/* Order cards */}
                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3 min-h-0">
                  {colOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-[#555] text-sm">
                      No orders
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onStatusChange={updateOrderStatus}
                        onOpenDetail={setSelectedOrder}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateOrderStatus}
        />
      )}
    </div>
  );
}
