import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, Phone, Truck, Store, CreditCard, Banknote, ArrowRight, Package } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('nimos_token');
        const res = await fetch(`${API_BASE}/orders/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data.order || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e94560] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#a0a0a0] mb-4">Could not load order details.</p>
          <button onClick={() => navigate('/menu')} className="text-[#e94560] hover:underline">
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];
  const isDelivery = order.type === 'delivery';
  const estimatedMinutes = isDelivery ? '30–45' : '15–20';

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5 animate-[bounce_1s_ease-in-out]">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h1>
          <p className="text-[#a0a0a0]">
            Thank you, <span className="text-white">{order.customer_name}</span>!
          </p>
        </div>

        {/* Order Number Card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#a0a0a0] text-sm">Order Number</span>
            <span className="text-white font-mono font-bold text-lg">#{String(order.id).padStart(4, '0')}</span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            {isDelivery ? (
              <Truck className="w-4 h-4 text-[#e94560]" />
            ) : (
              <Store className="w-4 h-4 text-[#e94560]" />
            )}
            <span className="text-white text-sm capitalize">{order.type}</span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-4 h-4 text-[#e94560]" />
            <span className="text-white text-sm">Estimated: {estimatedMinutes} minutes</span>
          </div>

          {isDelivery && order.delivery_address && (
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-4 h-4 text-[#e94560]" />
              <span className="text-white text-sm">{order.delivery_address}</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            <Phone className="w-4 h-4 text-[#e94560]" />
            <span className="text-white text-sm">{order.phone}</span>
          </div>

          <div className="flex items-center gap-3">
            {order.payment_method === 'card' ? (
              <CreditCard className="w-4 h-4 text-[#e94560]" />
            ) : (
              <Banknote className="w-4 h-4 text-[#e94560]" />
            )}
            <span className="text-white text-sm capitalize">{order.payment_method || 'Cash'} on {isDelivery ? 'delivery' : 'collection'}</span>
          </div>
        </div>

        {/* Items Summary */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-4">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#e94560]" /> Items
          </h3>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-[#a0a0a0]">
                  {item.quantity}× {item.name}
                  {item.options?.length > 0 && (
                    <span className="text-[#666] ml-1">
                      ({item.options.map(o => o.name).join(', ')})
                    </span>
                  )}
                </span>
                <span className="text-white">
                  €{((item.price + (item.options || []).reduce((s, o) => s + (o.price || 0), 0)) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] mt-3 pt-3">
            {order.discount > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-400">Discount</span>
                <span className="text-green-400">-€{Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span className="text-white">Total</span>
              <span className="text-[#e94560] text-lg">€{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-4">
            <p className="text-[#a0a0a0] text-sm"><span className="text-white">Note:</span> {order.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 mt-6">
          <Link
            to={`/track/${order.id}`}
            className="flex items-center justify-center gap-2 w-full bg-[#e94560] hover:bg-[#d13350] text-white font-semibold py-3.5 rounded-xl transition-all duration-300"
          >
            Track Your Order <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/menu"
            className="flex items-center justify-center w-full bg-white/[0.05] hover:bg-white/[0.08] text-white font-semibold py-3.5 rounded-xl transition-all duration-300"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
