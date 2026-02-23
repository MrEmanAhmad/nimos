import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  StickyNote,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Package,
  Truck,
  ShoppingBag,
  X,
  Users,
} from 'lucide-react';
import { admin as adminApi } from '../../utils/api';
import { playNotificationSound } from '../../utils/sounds';

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'collected', label: 'Collected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  preparing: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  ready: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  delivered: 'bg-emerald-600/15 text-emerald-500 border-emerald-600/20',
  collected: 'bg-emerald-600/15 text-emerald-500 border-emerald-600/20',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
};

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

function getNextStatuses(current) {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1) return ['confirmed'];
  const next = STATUS_FLOW.slice(idx + 1, idx + 3);
  if (!next.includes('cancelled')) next.push('cancelled');
  return next;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [page, setPage] = useState(1);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const sseRef = useRef(null);
  const PER_PAGE = 20;

  const fetchOrders = useCallback(async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.date = filterDate;
      const data = await adminApi.getOrders(params);
      const orderList = Array.isArray(data) ? data : data.orders || [];
      setOrders(orderList);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterDate]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchOrders();
  }, [fetchOrders]);

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // SSE for real-time updates
  useEffect(() => {
    try {
      const es = adminApi.streamOrders();
      sseRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_order' && data.order) {
            setOrders((prev) => [data.order, ...prev]);
            setNewOrderIds((prev) => new Set([...prev, data.order.id]));
            setTimeout(() => {
              setNewOrderIds((prev) => {
                const next = new Set(prev);
                next.delete(data.order.id);
                return next;
              });
            }, 5000);

            // Play notification sound
            playNotificationSound();

            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              const order = data.order;
              const name = order.customer_name || order.customer?.name || 'Guest';
              const total = (order.total ?? 0).toFixed(2);
              const orderNum = order.order_number || `#${order.id}`;
              new Notification(`New Order ${orderNum} - ${name} - EUR ${total}`, {
                icon: '/favicon.ico',
                tag: `order-${order.id}`,
              });
            }
          } else if (data.type === 'status_update' && data.order) {
            setOrders((prev) =>
              prev.map((o) => (o.id === data.order.id ? { ...o, ...data.order } : o))
            );
          }
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        // SSE will auto-reconnect
      };
    } catch {
      // SSE not available
    }

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
    };
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Filter by search
  const filtered = orders.filter((order) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = (order.customer_name || order.customer?.name || '').toLowerCase();
    const phone = (order.customer_phone || order.customer?.phone || '').toLowerCase();
    const num = String(order.order_number || order.id).toLowerCase();
    return name.includes(q) || phone.includes(q) || num.includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#e94560] animate-spin" />
          <p className="text-[#a0a0a0] text-sm">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-red-500/20 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load Orders</h2>
          <p className="text-[#a0a0a0] mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchOrders();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e94560] hover:bg-[#d13350] text-white font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Orders</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">
            {filtered.length} order{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchOrders();
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-[#a0a0a0] hover:text-white rounded-xl text-sm font-medium transition-all border border-white/5"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
          <input
            type="text"
            placeholder="Search by name, phone, order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-[#a0a0a0]/50 text-sm focus:outline-none focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#e94560]/50 appearance-none cursor-pointer min-w-[160px]"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0] pointer-events-none" />
        </div>

        {/* Date filter */}
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#e94560]/50 appearance-none cursor-pointer"
        />
      </div>

      {/* Orders table */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[#a0a0a0] font-medium px-5 py-3">
                  Order #
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3">
                  Customer
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3 hidden lg:table-cell">
                  Phone
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3 hidden md:table-cell">
                  Items
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3">
                  Type
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3">
                  Total
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3">
                  Status
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3 hidden sm:table-cell">
                  Time
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {paginated.map((order) => {
                const isExpanded = expandedId === order.id;
                const isNew = newOrderIds.has(order.id);

                return (
                  <OrderRow
                    key={order.id}
                    order={order}
                    isExpanded={isExpanded}
                    isNew={isNew}
                    onToggle={() =>
                      setExpandedId(isExpanded ? null : order.id)
                    }
                    onStatusChange={handleStatusChange}
                    updatingStatus={!!updatingStatus[order.id]}
                  />
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center">
                    <Package className="w-12 h-12 text-[#a0a0a0]/30 mx-auto mb-3" />
                    <p className="text-[#a0a0a0]">No orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
            <p className="text-sm text-[#a0a0a0]">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderRow({ order, isExpanded, isNew, onToggle, onStatusChange, updatingStatus }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsSummary = items.map((i) => i.name || i.item_name).join(', ');
  const isDelivery = (order.type || order.order_type || '').toLowerCase() === 'delivery';

  return (
    <>
      <tr
        onClick={onToggle}
        className={`border-b border-white/5 cursor-pointer transition-all duration-300 ${
          isNew
            ? 'bg-[#e94560]/5 animate-pulse'
            : isExpanded
              ? 'bg-white/[0.03]'
              : 'hover:bg-white/[0.02]'
        }`}
      >
        <td className="px-5 py-3.5 font-mono text-[#e94560] font-medium">
          {order.order_number || `#${order.id}`}
        </td>
        <td className="px-3 py-3.5 text-white font-medium">
          {order.customer_name || order.customer?.name || 'Guest'}
        </td>
        <td className="px-3 py-3.5 text-[#a0a0a0] hidden lg:table-cell">
          {order.customer_phone || order.customer?.phone || '-'}
        </td>
        <td className="px-3 py-3.5 text-[#a0a0a0] hidden md:table-cell max-w-[200px] truncate">
          {itemsSummary || '-'}
        </td>
        <td className="px-3 py-3.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
              isDelivery
                ? 'bg-blue-500/15 text-blue-400'
                : 'bg-[#f5a623]/15 text-[#f5a623]'
            }`}
          >
            {isDelivery ? (
              <Truck className="w-3 h-3" />
            ) : (
              <ShoppingBag className="w-3 h-3" />
            )}
            {isDelivery ? 'Delivery' : 'Pickup'}
          </span>
        </td>
        <td className="px-3 py-3.5 text-white font-medium">
          {'\u20AC'}
          {(order.total ?? 0).toFixed(2)}
        </td>
        <td className="px-3 py-3.5">
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
              STATUS_COLORS[order.status] || 'bg-white/10 text-[#a0a0a0]'
            }`}
          >
            {order.status}
          </span>
        </td>
        <td className="px-3 py-3.5 text-[#a0a0a0] text-xs hidden sm:table-cell whitespace-nowrap">
          {order.created_at
            ? new Date(order.created_at).toLocaleString('en-IE', {
                hour: '2-digit',
                minute: '2-digit',
                day: 'numeric',
                month: 'short',
              })
            : '-'}
        </td>
        <td className="px-3 py-3.5">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#a0a0a0]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#a0a0a0]" />
          )}
        </td>
      </tr>

      {/* Expanded detail */}
      {isExpanded && (
        <tr>
          <td colSpan="9" className="bg-[#0f0f0f]/50">
            <div className="p-5 sm:p-6 space-y-5">
              {/* Status actions */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-[#a0a0a0] mr-2">Update status:</span>
                {getNextStatuses(order.status).map((status) => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(order.id, status);
                    }}
                    disabled={updatingStatus}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${
                      status === 'cancelled'
                        ? 'border-red-500/30 text-red-400 hover:bg-red-500/15'
                        : `${STATUS_COLORS[status] || 'border-white/10 text-white'} hover:opacity-80`
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {updatingStatus ? (
                      <Loader2 className="w-3 h-3 animate-spin inline" />
                    ) : (
                      status
                    )}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Items detail */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 py-2 border-b border-white/5 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">
                            {item.quantity || 1}x {item.name || item.item_name}
                          </p>
                          {item.options &&
                            (Array.isArray(item.options) ? item.options : []).map(
                              (opt, oi) => (
                                <p
                                  key={oi}
                                  className="text-xs text-[#a0a0a0] mt-0.5"
                                >
                                  + {opt.name || opt}: {'\u20AC'}
                                  {(opt.price ?? 0).toFixed(2)}
                                </p>
                              )
                            )}
                          {item.special_instructions && (
                            <p className="text-xs text-[#f5a623] mt-0.5 italic">
                              Note: {item.special_instructions}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-white font-medium shrink-0">
                          {'\u20AC'}
                          {(item.line_total ?? item.price ?? 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <p className="text-sm text-[#a0a0a0]">No item details</p>
                    )}
                  </div>

                  {/* Order totals */}
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                    {order.subtotal && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#a0a0a0]">Subtotal</span>
                        <span className="text-white">
                          {'\u20AC'}
                          {order.subtotal.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {order.delivery_fee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#a0a0a0]">Delivery Fee</span>
                        <span className="text-white">
                          {'\u20AC'}
                          {order.delivery_fee.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#a0a0a0]">Discount</span>
                        <span className="text-emerald-400">
                          -{'\u20AC'}
                          {order.discount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold pt-1">
                      <span className="text-white">Total</span>
                      <span className="text-[#e94560]">
                        {'\u20AC'}
                        {(order.total ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer & delivery info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">
                      Customer Info
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-[#a0a0a0]" />
                        <span className="text-white">
                          {order.customer_name || order.customer?.name || 'Guest'}
                        </span>
                      </div>
                      {(order.customer_phone || order.customer?.phone) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-[#a0a0a0]" />
                          <a
                            href={`tel:${order.customer_phone || order.customer?.phone}`}
                            className="text-[#e94560] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {order.customer_phone || order.customer?.phone}
                          </a>
                        </div>
                      )}
                      {(order.delivery_address || order.address) && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-[#a0a0a0] mt-0.5" />
                          <span className="text-[#a0a0a0]">
                            {order.delivery_address || order.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {order.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <StickyNote className="w-4 h-4 text-[#f5a623]" />
                        Notes
                      </h4>
                      <p className="text-sm text-[#a0a0a0] bg-[#1a1a2e] rounded-lg p-3 border border-white/5">
                        {order.notes}
                      </p>
                    </div>
                  )}

                  {order.payment_method && (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-[#a0a0a0]" />
                      <span className="text-[#a0a0a0]">Payment:</span>
                      <span className="text-white capitalize">
                        {order.payment_method}
                      </span>
                    </div>
                  )}

                  {order.created_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-[#a0a0a0]" />
                      <span className="text-[#a0a0a0]">Placed:</span>
                      <span className="text-white">
                        {new Date(order.created_at).toLocaleString('en-IE', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

