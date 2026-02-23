import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, ArrowRight, Clock } from 'lucide-react';

export default function TrackOrderLookup() {
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed) {
      setError('Please enter an order number');
      return;
    }
    if (/[^a-zA-Z0-9_-]/.test(trimmed) || trimmed.length > 100) {
      setError('Invalid order number format');
      return;
    }
    navigate(`/track/${trimmed}`);
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-[#e94560]/20 mx-auto mb-6 flex items-center justify-center">
            <Package className="w-10 h-10 text-[#e94560]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Track Your Order</h1>
          <p className="text-[#e0e0e0]/60">
            Enter your order number to see real-time updates on your food.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#e0e0e0]/40" />
            <input
              type="text"
              value={orderId}
              onChange={(e) => { setOrderId(e.target.value); setError(''); }}
              placeholder="Enter order number (e.g. 42)"
              className="w-full pl-12 pr-4 py-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-[#e0e0e0]/30 focus:outline-none focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30 text-lg"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2 ml-1">{error}</p>
          )}
          <button
            type="submit"
            className="w-full mt-4 bg-[#e94560] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#d13350] transition-colors flex items-center justify-center gap-2"
          >
            Track Order <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-[#1a1a2e] rounded-xl p-5 border border-white/5">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#f5a623] mt-0.5 shrink-0" />
              <div>
                <h3 className="text-white font-semibold mb-1">Real-Time Updates</h3>
                <p className="text-[#e0e0e0]/50 text-sm">
                  Watch your order move from kitchen to your door with live status updates.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl p-5 border border-white/5">
            <div className="flex items-start gap-3">
              <Search className="w-5 h-5 text-[#3b82f6] mt-0.5 shrink-0" />
              <div>
                <h3 className="text-white font-semibold mb-1">Where's My Order Number?</h3>
                <p className="text-[#e0e0e0]/50 text-sm">
                  Check your order confirmation email or your account's order history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
