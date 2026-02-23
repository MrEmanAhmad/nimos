import {
  X,
  Phone,
  MapPin,
  Truck,
  Store,
  Printer,
  Clock,
  Package,
  Check,
  ChevronRight,
  Calendar,
  ExternalLink,
  Timer,
} from 'lucide-react';

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const STATUS_LABELS = {
  pending: { label: 'Order Placed', color: 'text-red-400', bg: 'bg-red-400' },
  confirmed: { label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-400' },
  preparing: { label: 'Preparing', color: 'text-orange-400', bg: 'bg-orange-400' },
  ready: { label: 'Ready', color: 'text-green-400', bg: 'bg-green-400' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-400', bg: 'bg-purple-400' },
  delivered: { label: 'Delivered', color: 'text-gray-400', bg: 'bg-gray-400' },
};

const STATUS_ORDER = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
];

export default function OrderDetailModal({ order, onClose, onStatusChange }) {
  if (!order) return null;

  const isDelivery =
    order.order_type === 'delivery' || order.orderType === 'delivery';
  const customerName =
    order.customer_name || order.customerName || 'Unknown Customer';
  const customerPhone =
    order.customer_phone || order.customerPhone || order.phone;
  const customerEmail =
    order.customer_email || order.customerEmail || order.email;
  const deliveryAddress =
    order.delivery_address || order.deliveryAddress || order.address;
  const orderNotes = order.notes || order.order_notes || order.orderNotes;
  const items = order.items || [];
  const total = order.total || order.total_amount || order.totalAmount || 0;
  const orderNumber = order.order_number || order.orderNumber || order.id;
  const createdAt = order.created_at || order.createdAt;
  const scheduledFor = order.scheduled_for || order.scheduledFor;
  const estimatedReady =
    order.estimated_ready || order.estimatedReady || order.estimated_ready_time;

  // Build timeline from order status history or just current status
  const statusHistory = order.status_history || order.statusHistory || [];
  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);

  const handlePrint = () => {
    window.print();
  };

  const mapsUrl = deliveryAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddress)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm print:hidden"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#12122a] border border-[#2a2a4a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl print:max-w-none print:max-h-none print:rounded-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header */}
        <div className="sticky top-0 bg-[#12122a] border-b border-[#2a2a4a] px-6 py-4 flex items-center justify-between z-10 print:bg-white print:border-gray-300">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white print:text-black">
              Order #{orderNumber}
            </h2>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                isDelivery
                  ? 'bg-[#e94560]/20 text-[#e94560] border border-[#e94560]/30 print:bg-red-100 print:text-red-700 print:border-red-300'
                  : 'bg-[#f5a623]/20 text-[#f5a623] border border-[#f5a623]/30 print:bg-amber-100 print:text-amber-700 print:border-amber-300'
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
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a1a2e] text-[#a0a0a0] border border-[#2a2a4a] hover:bg-[#222240] hover:text-white transition-all min-h-[44px]"
              title="Print order"
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm">Print</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1a1a2e] text-[#a0a0a0] border border-[#2a2a4a] hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/40 transition-all min-h-[44px]"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Customer Details */}
          <section>
            <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wide mb-2 print:text-gray-600">
              Customer
            </h3>
            <div className="bg-[#1a1a2e] rounded-xl p-4 space-y-2 print:bg-gray-50 print:border print:border-gray-200">
              <p className="text-lg font-semibold text-white print:text-black">
                {customerName}
              </p>
              {customerPhone && (
                <a
                  href={`tel:${customerPhone}`}
                  className="flex items-center gap-2 text-[#e0e0e0] hover:text-[#e94560] transition-colors print:text-black print:no-underline"
                >
                  <Phone className="w-4 h-4 text-[#a0a0a0]" />
                  {customerPhone}
                </a>
              )}
              {customerEmail && (
                <p className="flex items-center gap-2 text-[#a0a0a0] text-sm">
                  {customerEmail}
                </p>
              )}
              {isDelivery && deliveryAddress && (
                <div className="flex items-start gap-2 text-[#e0e0e0] print:text-black">
                  <MapPin className="w-4 h-4 text-[#a0a0a0] mt-0.5 shrink-0" />
                  <div>
                    <p>{deliveryAddress}</p>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-xs text-blue-400 hover:text-blue-300 transition-colors print:hidden"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open in Google Maps
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Scheduled order */}
          {scheduledFor && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f5a623]/10 border border-[#f5a623]/20 rounded-xl text-[#f5a623]">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">
                Scheduled for{' '}
                {new Date(scheduledFor).toLocaleString('en-IE', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </span>
            </div>
          )}

          {/* Items */}
          <section>
            <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wide mb-2 print:text-gray-600">
              Items
            </h3>
            <div className="bg-[#1a1a2e] rounded-xl overflow-hidden print:bg-gray-50 print:border print:border-gray-200">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-3 ${idx > 0 ? 'border-t border-[#2a2a4a] print:border-gray-200' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-white font-medium print:text-black">
                        <span className="text-[#e94560] font-bold print:text-red-600">
                          {item.quantity || 1}x
                        </span>{' '}
                        {item.name || item.item_name || item.itemName}
                      </span>
                      {/* Options */}
                      {item.options && item.options.length > 0 && (
                        <div className="mt-1 text-sm text-[#a0a0a0] print:text-gray-600">
                          {item.options.map((opt, oi) => (
                            <span key={oi}>
                              {typeof opt === 'string'
                                ? opt
                                : opt.name || opt.value}
                              {oi < item.options.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Item notes */}
                      {item.notes && (
                        <div className="mt-1 inline-block text-xs bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded print:bg-yellow-100 print:text-yellow-800">
                          {item.notes}
                        </div>
                      )}
                    </div>
                    {(item.price || item.item_price) && (
                      <span className="text-[#a0a0a0] text-sm shrink-0 print:text-gray-600">
                        &euro;
                        {(
                          (item.price || item.item_price || 0) *
                          (item.quantity || 1)
                        ).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {/* Total */}
              <div className="px-4 py-3 border-t border-[#2a2a4a] bg-[#12122a] flex items-center justify-between print:bg-gray-100 print:border-gray-300">
                <span className="text-[#a0a0a0] font-medium print:text-gray-600">
                  Total
                </span>
                <span className="text-xl font-bold text-white print:text-black">
                  &euro;{typeof total === 'number' ? total.toFixed(2) : total}
                </span>
              </div>
            </div>
          </section>

          {/* Order notes */}
          {orderNotes && (
            <section>
              <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wide mb-2 print:text-gray-600">
                Order Notes
              </h3>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-yellow-400 print:bg-yellow-50 print:text-yellow-800 print:border-yellow-300">
                {orderNotes}
              </div>
            </section>
          )}

          {/* Estimated ready time */}
          {estimatedReady && (
            <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
              <Timer className="w-4 h-4" />
              <span>Estimated ready: {estimatedReady}</span>
            </div>
          )}

          {/* Order Timeline */}
          <section>
            <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wide mb-3 print:text-gray-600">
              Timeline
            </h3>
            <div className="space-y-0">
              {STATUS_ORDER.map((status, idx) => {
                const config = STATUS_LABELS[status];
                const historyEntry = statusHistory.find(
                  (h) => h.status === status
                );
                const isActive = status === order.status;
                const isCompleted = idx <= currentStatusIndex;

                // Skip statuses not relevant to pickup orders
                if (
                  !isDelivery &&
                  (status === 'out_for_delivery')
                ) {
                  return null;
                }

                return (
                  <div key={status} className="flex items-start gap-3">
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          isCompleted ? config.bg : 'bg-[#2a2a4a]'
                        } ${isActive ? 'ring-2 ring-offset-2 ring-offset-[#12122a] ring-current ' + config.color : ''}`}
                      />
                      {idx < STATUS_ORDER.length - 1 && (
                        <div
                          className={`w-0.5 h-6 ${
                            isCompleted && idx < currentStatusIndex
                              ? config.bg
                              : 'bg-[#2a2a4a]'
                          }`}
                        />
                      )}
                    </div>
                    {/* Label + time */}
                    <div className="pb-2">
                      <p
                        className={`text-sm font-medium ${
                          isCompleted
                            ? 'text-white print:text-black'
                            : 'text-[#555] print:text-gray-400'
                        }`}
                      >
                        {config.label}
                      </p>
                      <p className="text-xs text-[#a0a0a0] print:text-gray-500">
                        {historyEntry
                          ? formatDateTime(historyEntry.timestamp || historyEntry.at)
                          : isActive && status === 'pending'
                            ? formatDateTime(createdAt)
                            : '-'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Order metadata */}
          <section className="text-xs text-[#555] space-y-1 print:text-gray-400">
            {createdAt && (
              <p>
                Order placed: {formatDateTime(createdAt)}
              </p>
            )}
            {order.id && <p>Order ID: {order.id}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
