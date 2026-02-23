import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Phone,
  MapPin,
  Truck,
  Store,
  Check,
  ChevronRight,
  AlertTriangle,
  Timer,
  Package,
  Calendar,
} from 'lucide-react';

function formatElapsedTime(createdAt) {
  if (!createdAt) return '';
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const diffMs = now - created;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ${diffMin % 60}m ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function formatScheduledTime(scheduledFor) {
  if (!scheduledFor) return null;
  const date = new Date(scheduledFor);
  return date.toLocaleTimeString('en-IE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const STATUS_CONFIG = {
  pending: {
    action: 'Confirm Order',
    nextStatus: 'confirmed',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
    icon: Check,
  },
  confirmed: {
    action: 'Start Preparing',
    nextStatus: 'preparing',
    buttonClass: 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800',
    icon: ChevronRight,
  },
  preparing: {
    action: 'Mark Ready',
    nextStatus: 'ready',
    buttonClass: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
    icon: Check,
  },
  ready: null, // handled dynamically based on order type
};

export default function OrderCard({ order, onStatusChange, onOpenDetail }) {
  const [updating, setUpdating] = useState(false);
  const [, setTick] = useState(0);

  // Re-render every 30 seconds to update elapsed time
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (updating) return;
      setUpdating(true);
      try {
        await onStatusChange(order.id, newStatus);
      } finally {
        setUpdating(false);
      }
    },
    [order.id, onStatusChange, updating]
  );

  const createdAt = order.created_at || order.createdAt;
  const elapsed = formatElapsedTime(createdAt);
  const scheduledFor = order.scheduled_for || order.scheduledFor;
  const scheduledTime = formatScheduledTime(scheduledFor);

  // Check if order is older than 30 minutes
  const isOverdue =
    createdAt && Date.now() - new Date(createdAt).getTime() > 30 * 60 * 1000;

  const isDelivery =
    order.order_type === 'delivery' || order.orderType === 'delivery';
  const isPending = order.status === 'pending';

  // Get the action config for this status
  let actionConfig = STATUS_CONFIG[order.status];
  if (order.status === 'ready') {
    actionConfig = isDelivery
      ? {
          action: 'Out for Delivery',
          nextStatus: 'out_for_delivery',
          buttonClass: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800',
          icon: Truck,
        }
      : {
          action: 'Picked Up',
          nextStatus: 'delivered',
          buttonClass: 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800',
          icon: Package,
        };
  }

  const customerName =
    order.customer_name || order.customerName || 'Unknown Customer';
  const customerPhone =
    order.customer_phone || order.customerPhone || order.phone;
  const deliveryAddress =
    order.delivery_address || order.deliveryAddress || order.address;
  const orderNotes = order.notes || order.order_notes || order.orderNotes;
  const items = order.items || [];
  const total = order.total || order.total_amount || order.totalAmount || 0;
  const orderNumber =
    order.order_number || order.orderNumber || order.id;
  const estimatedReady =
    order.estimated_ready || order.estimatedReady || order.estimated_ready_time;

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(order)}
      className={`
        rounded-xl border transition-all duration-200 cursor-pointer
        ${isOverdue ? 'border-red-500/60 bg-red-950/20' : 'border-[#2a2a4a] bg-[#1a1a2e]'}
        ${isPending ? 'animate-pulse-subtle ring-1 ring-[#e94560]/30' : ''}
        hover:bg-[#222240] hover:border-[#3a3a5a]
      `}
    >
      {/* Card Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          {/* Order number */}
          <span className="text-xl font-bold text-white">
            #{orderNumber}
          </span>

          {/* Order type badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
              isDelivery
                ? 'bg-[#e94560]/20 text-[#e94560] border border-[#e94560]/30'
                : 'bg-[#f5a623]/20 text-[#f5a623] border border-[#f5a623]/30'
            }`}
          >
            {isDelivery ? (
              <Truck className="w-3.5 h-3.5" />
            ) : (
              <Store className="w-3.5 h-3.5" />
            )}
            {isDelivery ? 'Delivery' : 'Pickup'}
          </span>
        </div>

        {/* Customer name + time */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[#e0e0e0] font-medium text-sm truncate">
            {customerName}
          </span>
          <div className="flex items-center gap-1 text-xs shrink-0">
            {isOverdue && (
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            )}
            <Timer
              className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-400' : 'text-[#a0a0a0]'}`}
            />
            <span
              className={`font-mono ${isOverdue ? 'text-red-400 font-semibold' : 'text-[#a0a0a0]'}`}
            >
              {elapsed}
            </span>
          </div>
        </div>

        {/* Scheduled order indicator */}
        {scheduledTime && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#f5a623]">
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-medium">Scheduled for {scheduledTime}</span>
          </div>
        )}

        {/* Estimated ready time */}
        {estimatedReady && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-[#a0a0a0]">
            <Clock className="w-3.5 h-3.5" />
            <span>Est. ready: {estimatedReady}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-[#2a2a4a]" />

      {/* Items list */}
      <div className="px-4 py-2 space-y-1.5 max-h-48 overflow-y-auto">
        {items.map((item, idx) => (
          <div key={idx} className="text-sm">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[#e0e0e0]">
                <span className="font-semibold text-white">
                  {item.quantity || 1}x
                </span>{' '}
                {item.name || item.item_name || item.itemName}
              </span>
            </div>
            {/* Selected options */}
            {item.options &&
              item.options.length > 0 && (
                <div className="ml-6 text-xs text-[#a0a0a0]">
                  {item.options.map((opt, oi) => (
                    <span key={oi}>
                      {typeof opt === 'string' ? opt : opt.name || opt.value}
                      {oi < item.options.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            {/* Item-level special notes */}
            {item.notes && (
              <div className="ml-6 mt-0.5 text-xs bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded inline-block">
                {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Order notes */}
      {orderNotes && (
        <div className="mx-4 mb-2 px-2.5 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400">
          <span className="font-semibold">Note:</span> {orderNotes}
        </div>
      )}

      {/* Footer: Total + Contact */}
      <div className="px-4 py-2 border-t border-[#2a2a4a]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-white">
            &euro;{typeof total === 'number' ? total.toFixed(2) : total}
          </span>
          <div className="flex items-center gap-2">
            {customerPhone && (
              <a
                href={`tel:${customerPhone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#2a2a4a] text-[#a0a0a0] hover:text-white hover:bg-[#3a3a5a] transition-colors text-xs min-h-[36px]"
                title={`Call ${customerPhone}`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{customerPhone}</span>
              </a>
            )}
            {isDelivery && deliveryAddress && (
              <div className="flex items-center gap-1 text-xs text-[#a0a0a0] max-w-[140px] truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{deliveryAddress}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      {actionConfig && (
        <div className="px-4 pb-3 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(actionConfig.nextStatus);
            }}
            disabled={updating}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-bold text-sm transition-all min-h-[48px] ${
              actionConfig.buttonClass
            } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {updating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <actionConfig.icon className="w-5 h-5" />
                {actionConfig.action}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
