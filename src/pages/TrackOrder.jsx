import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package, Clock, ChefHat, CheckCircle, Truck, Store, MapPin,
  Phone, ArrowLeft, RefreshCw, AlertCircle, PartyPopper
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package, color: '#f5a623' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: '#3b82f6' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, color: '#f97316' },
  { key: 'ready', label: 'Ready', icon: CheckCircle, color: '#22c55e' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: '#8b5cf6' },
  { key: 'delivered', label: 'Delivered', icon: PartyPopper, color: '#22c55e' },
];

const PICKUP_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package, color: '#f5a623' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: '#3b82f6' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, color: '#f97316' },
  { key: 'ready', label: 'Ready for Pickup', icon: Store, color: '#22c55e' },
  { key: 'delivered', label: 'Picked Up', icon: PartyPopper, color: '#22c55e' },
];

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ${min % 60}m ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getTimeRemaining(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Any moment now';
  const min = Math.floor(diff / 60000);
  if (min < 60) return `~${min} min`;
  const hrs = Math.floor(min / 60);
  return `~${hrs}h ${min % 60}m`;
}

export default function TrackOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);

  const fetchOrder = async () => {
    // Validate order ID format before making request
    if (!id || id.length > 100 || /[^a-zA-Z0-9_-]/.test(id)) {
      setError('Invalid order ID. Please check the link and try again.');
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('nimos_token');
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.status === 404) throw new Error('Order not found. Please check the order number.');
      if (!res.ok) throw new Error('Failed to load order. Please try again.');
      const data = await res.json();
      setOrder(data);
      setError('');
    } catch (e) {
      if (e.name === 'TypeError') {
        setError('Network error. Please check your connection.');
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // SSE for real-time updates (pass auth token via query param since EventSource can't set headers)
    const token = localStorage.getItem('nimos_token');
    const sseUrl = token
      ? `${API_BASE}/orders/${id}/stream?token=${encodeURIComponent(token)}`
      : `${API_BASE}/orders/${id}/stream`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'order_update' && data.order) {
          setOrder(prev => prev && prev.id === data.order.id ? { ...prev, ...data.order } : prev);
        }
      } catch (e) { /* ignore parse errors */ }
    };
    es.onerror = () => {
      setConnected(false);
      setTimeout(() => fetchOrder(), 5000);
    };

    return () => es.close();
  }, [id]);

  // Auto-refresh every 30s as fallback
  useEffect(() => {
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#e0e0e0]/70">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center pt-20 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-[#e94560] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Order Not Found</h1>
          <p className="text-[#e0e0e0]/60 mb-6">{error || 'We couldn\'t find this order. Please check the order number and try again.'}</p>
          <Link to="/account" className="inline-flex items-center gap-2 bg-[#e94560] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#d13350] transition-colors">
            <ArrowLeft className="w-4 h-4" /> View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const steps = order.type === 'delivery' ? STATUS_STEPS : PICKUP_STEPS;
  const currentIndex = steps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';
  const isComplete = order.status === 'delivered';

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/account" className="flex items-center gap-2 text-[#e0e0e0]/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">My Orders</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-xs text-[#e0e0e0]/40">{connected ? 'Live' : 'Reconnecting...'}</span>
            <button onClick={fetchOrder} className="p-1 text-[#e0e0e0]/40 hover:text-white transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Order Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Order #{order.id}</h1>
          <p className="text-[#e0e0e0]/60">
            Placed {getTimeAgo(order.created_at)}
            {order.type === 'delivery' ? ' for delivery' : ' for pickup'}
          </p>
        </div>

        {/* Status Timeline */}
        {isCancelled ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center mb-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-red-400 mb-2">Order Cancelled</h2>
            <p className="text-[#e0e0e0]/60">This order has been cancelled.</p>
          </div>
        ) : (
          <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 mb-8">
            {/* Current status highlight */}
            <div className="text-center mb-8">
              {(() => {
                const CurrentIcon = steps[currentIndex]?.icon || Package;
                return (
                  <>
                    <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${isComplete ? 'bg-green-500/20' : 'bg-[#e94560]/20'}`}>
                      <CurrentIcon className={`w-10 h-10 ${isComplete ? 'text-green-500' : 'text-[#e94560]'}`} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {steps[currentIndex]?.label || order.status}
                    </h2>
                    {!isComplete && order.estimated_ready && (
                      <p className="text-[#f5a623] font-medium">
                        Estimated: {getTimeRemaining(order.estimated_ready)}
                      </p>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Progress steps */}
            <div className="relative">
              {steps.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i <= currentIndex;
                const isCurrent = i === currentIndex;
                return (
                  <div key={step.key} className="flex items-start gap-4 mb-6 last:mb-0">
                    {/* Line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                        isCurrent ? 'bg-[#e94560] shadow-lg shadow-[#e94560]/30 scale-110' :
                        isActive ? 'bg-green-500/20' : 'bg-white/5'
                      }`}>
                        <StepIcon className={`w-5 h-5 ${
                          isCurrent ? 'text-white' :
                          isActive ? 'text-green-500' : 'text-[#e0e0e0]/30'
                        }`} />
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${isActive && i < currentIndex ? 'bg-green-500/50' : 'bg-white/10'}`} />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pt-2">
                      <p className={`font-semibold ${isCurrent ? 'text-white' : isActive ? 'text-green-400' : 'text-[#e0e0e0]/40'}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Order Details</h3>
          <div className="space-y-3">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex justify-between items-start py-2 border-b border-white/5 last:border-0">
                <div>
                  <span className="text-white font-medium">{item.quantity}x {item.item_name || item.name}</span>
                  {item.options_json && item.options_json !== '[]' && (
                    <p className="text-[#e0e0e0]/40 text-sm mt-0.5">
                      {(() => {
                        try {
                          const opts = JSON.parse(item.options_json);
                          return opts.map(o => o.name).join(', ');
                        } catch { return ''; }
                      })()}
                    </p>
                  )}
                  {item.notes && <p className="text-[#f5a623] text-sm mt-0.5">{item.notes}</p>}
                </div>
                <span className="text-[#e0e0e0]/70 font-medium">&euro;{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-[#e0e0e0]/60 text-sm">
              <span>Subtotal</span>
              <span>&euro;{(order.subtotal || 0).toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-400 text-sm">
                <span>Discount {order.promo_code && `(${order.promo_code})`}</span>
                <span>-&euro;{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/5">
              <span>Total</span>
              <span>&euro;{(order.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery/Pickup Info */}
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {order.type === 'delivery' ? (
              <>
                <Truck className="w-5 h-5 text-[#e94560]" />
                <h3 className="text-lg font-bold text-white">Delivery Details</h3>
              </>
            ) : (
              <>
                <Store className="w-5 h-5 text-[#f5a623]" />
                <h3 className="text-lg font-bold text-white">Pickup Details</h3>
              </>
            )}
          </div>

          {order.type === 'delivery' && order.delivery_address && (
            <div className="flex items-start gap-3 mb-3">
              <MapPin className="w-4 h-4 text-[#e0e0e0]/40 mt-1 shrink-0" />
              <p className="text-[#e0e0e0]/70">{order.delivery_address}</p>
            </div>
          )}

          {order.type === 'pickup' && (
            <div className="flex items-start gap-3 mb-3">
              <MapPin className="w-4 h-4 text-[#e0e0e0]/40 mt-1 shrink-0" />
              <p className="text-[#e0e0e0]/70">The Cross, Knocklong East, Co. Limerick, V94 TY05</p>
            </div>
          )}

          {order.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#e0e0e0]/40 shrink-0" />
              <a href={`tel:${order.phone}`} className="text-[#e94560] hover:underline">{order.phone}</a>
            </div>
          )}

          {order.notes && (
            <div className="mt-3 p-3 bg-[#f5a623]/10 rounded-lg border border-[#f5a623]/20">
              <p className="text-[#f5a623] text-sm"><strong>Notes:</strong> {order.notes}</p>
            </div>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-3">Payment</h3>
          <div className="flex justify-between text-[#e0e0e0]/70">
            <span>Method</span>
            <span className="capitalize">{(order.payment_method || 'cash').replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between text-[#e0e0e0]/70 mt-1">
            <span>Status</span>
            <span className={`capitalize font-medium ${order.payment_status === 'paid' ? 'text-green-400' : 'text-[#f5a623]'}`}>
              {order.payment_status || 'pending'}
            </span>
          </div>
          {order.loyalty_earned > 0 && (
            <div className="flex justify-between text-[#f5a623] mt-2 pt-2 border-t border-white/5">
              <span>Loyalty Points Earned</span>
              <span>+{order.loyalty_earned}</span>
            </div>
          )}
        </div>

        {/* Help link */}
        <div className="text-center mt-8">
          <p className="text-[#e0e0e0]/40 text-sm">
            Need help? Call us at{' '}
            <a href="tel:+3536243300" className="text-[#e94560] hover:underline">+353 6243300</a>
          </p>
        </div>
      </div>
    </div>
  );
}
