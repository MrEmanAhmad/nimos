import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShoppingCart,
  Euro,
  Clock,
  Users,
  Store,
  AlertTriangle,
  Pause,
  RefreshCw,
  Loader2,
  ChevronRight,
  Flame,
  Truck,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  CheckCircle,
  ChefHat,
  Timer,
  Package,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { admin as adminApi } from '../../utils/api';
import StatCard from '../../components/admin/StatCard';

const STATUS_COLORS = {
  pending: 'bg-yellow-500/15 text-yellow-400',
  confirmed: 'bg-blue-500/15 text-blue-400',
  preparing: 'bg-purple-500/15 text-purple-400',
  ready: 'bg-emerald-500/15 text-emerald-400',
  delivered: 'bg-emerald-600/15 text-emerald-500',
  collected: 'bg-emerald-600/15 text-emerald-500',
  out_for_delivery: 'bg-cyan-500/15 text-cyan-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

const STATUS_BAR_COLORS = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  preparing: 'bg-purple-500',
  ready: 'bg-emerald-500',
  delivered: 'bg-emerald-600',
  out_for_delivery: 'bg-cyan-500',
  cancelled: 'bg-red-500',
};

// ---------------------------------------------------------------------------
// CSS Bar Chart for 7-day revenue
// ---------------------------------------------------------------------------
function RevenueChart({ dailyData }) {
  if (!dailyData || dailyData.length === 0) {
    return (
      <p className="text-[#a0a0a0] text-sm text-center py-8">
        No revenue data available
      </p>
    );
  }

  const maxRevenue = Math.max(...dailyData.map((d) => d.revenue || 0), 1);

  return (
    <div className="space-y-2.5">
      {dailyData.map((day) => {
        const revenue = day.revenue || 0;
        const orders = day.orders || 0;
        const pct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
        const dateObj = new Date(day.date + 'T12:00:00');
        const dayLabel = dateObj.toLocaleDateString('en-IE', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });
        const isToday =
          day.date === new Date().toISOString().split('T')[0];

        return (
          <div key={day.date} className="group">
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium w-20 shrink-0 text-right ${
                  isToday ? 'text-[#e94560]' : 'text-[#a0a0a0]'
                }`}
              >
                {isToday ? 'Today' : dayLabel}
              </span>
              <div className="flex-1 h-7 bg-[#080808] rounded-lg overflow-hidden relative">
                <div
                  className={`h-full rounded-lg transition-all duration-700 ease-out ${
                    isToday
                      ? 'bg-gradient-to-r from-[#e94560] to-[#f5a623]'
                      : 'bg-[#e94560]/60 group-hover:bg-[#e94560]/80'
                  }`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
                {/* Overlay text on bar */}
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-[11px] font-semibold text-white/90 drop-shadow">
                    {revenue > 0 ? `\u20AC${revenue.toFixed(2)}` : ''}
                  </span>
                </div>
              </div>
              <span className="text-xs text-[#a0a0a0] w-16 shrink-0 text-right tabular-nums">
                {orders} order{orders !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live Feed: Recent Orders with status badges and live dot
// ---------------------------------------------------------------------------
function RecentOrdersFeed({ orders: recentOrders }) {
  if (!recentOrders || recentOrders.length === 0) {
    return (
      <p className="text-[#a0a0a0] text-sm text-center py-8">
        No recent orders
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {recentOrders.slice(0, 5).map((order, idx) => {
        const isActive = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);
        const timeAgo = getTimeAgo(order.created_at);

        return (
          <div
            key={order.id}
            className={`flex items-center gap-3 py-3 ${
              idx < recentOrders.slice(0, 5).length - 1
                ? 'border-b border-white/5'
                : ''
            } hover:bg-white/[0.02] -mx-1 px-1 rounded-lg transition-colors`}
          >
            {/* Live dot for active orders */}
            <div className="relative shrink-0">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isActive ? 'bg-emerald-400' : 'bg-[#a0a0a0]/40'
                }`}
              />
              {isActive && (
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
              )}
            </div>

            {/* Order info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-[#e94560] font-semibold">
                  {order.order_number || `#${order.id}`}
                </span>
                <span className="text-xs text-white truncate">
                  {order.customer_name || order.customer?.name || 'Guest'}
                </span>
              </div>
              <p className="text-xs text-[#a0a0a0] truncate mt-0.5">
                {order.items
                  ? Array.isArray(order.items)
                    ? order.items
                        .slice(0, 3)
                        .map((i) => i.name || i.item_name)
                        .join(', ')
                    : order.items
                  : '-'}
                {Array.isArray(order.items) && order.items.length > 3
                  ? ` +${order.items.length - 3} more`
                  : ''}
              </p>
            </div>

            {/* Right side: price + status */}
            <div className="shrink-0 flex flex-col items-end gap-1">
              <span className="text-sm font-semibold text-white tabular-nums">
                {'\u20AC'}
                {(order.total ?? 0).toFixed(2)}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                    STATUS_COLORS[order.status] || 'bg-white/10 text-[#a0a0a0]'
                  }`}
                >
                  {order.status?.replace(/_/g, ' ') || 'unknown'}
                </span>
                <span className="text-[10px] text-[#a0a0a0]">{timeAgo}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Popular Items Today - enhanced with revenue
// ---------------------------------------------------------------------------
function PopularItemsToday({ items, allOrders }) {
  // Compute popular items from today's orders if extra data available
  const popularItems = useMemo(() => {
    if (items && items.length > 0) return items;
    if (!allOrders || allOrders.length === 0) return [];

    const today = new Date().toISOString().split('T')[0];
    const todayOrders = allOrders.filter(
      (o) =>
        o.created_at?.startsWith(today) && o.status !== 'cancelled'
    );
    const countMap = {};
    todayOrders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const name = item.name || item.item_name;
          if (!name) return;
          if (!countMap[name]) countMap[name] = { name, total_qty: 0, revenue: 0 };
          countMap[name].total_qty += item.quantity || 1;
          countMap[name].revenue += (item.quantity || 1) * (item.price || 0);
        });
      }
    });
    return Object.values(countMap)
      .sort((a, b) => b.total_qty - a.total_qty)
      .slice(0, 5);
  }, [items, allOrders]);

  if (popularItems.length === 0) {
    return (
      <p className="text-[#a0a0a0] text-sm text-center py-4">
        No data yet today
      </p>
    );
  }

  const maxQty = Math.max(...popularItems.map((p) => p.total_qty || p.quantity || p.count || 0), 1);

  return (
    <div className="space-y-3">
      {popularItems.slice(0, 5).map((item, idx) => {
        const qty = item.total_qty || item.quantity || item.count || 0;
        const barWidth = maxQty > 0 ? (qty / maxQty) * 100 : 0;
        const medals = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];
        const medal = idx < 3 ? medals[idx] : null;
        return (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono w-5 text-right shrink-0">
                  {medal || `${idx + 1}.`}
                </span>
                <p className="text-sm text-white truncate">{item.name}</p>
              </div>
              <span className="text-[#f5a623] text-sm font-semibold shrink-0 ml-2">
                {qty}x
              </span>
            </div>
            <div className="ml-7 h-1.5 bg-[#080808] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#e94560] to-[#f5a623] rounded-full transition-all duration-700"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Time-ago helper
// ---------------------------------------------------------------------------
function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [fullOrders, setFullOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState({});

  const fetchDashboard = useCallback(async () => {
    try {
      // Build date range for the last 7 days
      const today = new Date();
      const sevenDaysAgo = new Date(Date.now() - 6 * 86400000);
      const toDate = today.toISOString().split('T')[0];
      const fromDate = sevenDaysAgo.toISOString().split('T')[0];

      const [dashboard, settingsData, reports, ordersData] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getSettings(),
        adminApi.getReports(fromDate, toDate).catch(() => null),
        adminApi.getOrders().catch(() => null),
      ]);

      setData(dashboard);
      setSettings(settingsData);
      setWeeklyData(reports);
      setFullOrders(ordersData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const handleToggle = async (action, key) => {
    setToggling((prev) => ({ ...prev, [key]: true }));
    try {
      const result = await action();
      setSettings((prev) => ({
        ...prev,
        ...(key === 'open' && { restaurant_open: result.open }),
        ...(key === 'busy' && { busy_mode: result.busy }),
        ...(key === 'pause' && { orders_paused: result.paused }),
      }));
    } catch (err) {
      console.error(`Failed to toggle ${key}:`, err);
    } finally {
      setToggling((prev) => ({ ...prev, [key]: false }));
    }
  };

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------
  const statusSummary = useMemo(() => {
    const statusDist = data?.statusDistribution || [];
    const todayDate = new Date().toISOString().split('T')[0];

    // Aggregate from status distribution
    let pending = 0;
    let preparing = 0;
    let ready = 0;
    let totalRevenue = data?.today?.revenue || 0;

    statusDist.forEach((s) => {
      if (s.status === 'pending' || s.status === 'confirmed') pending += s.count || 0;
      if (s.status === 'preparing') preparing += s.count || 0;
      if (s.status === 'ready') ready += s.count || 0;
    });

    // Also try to count from full orders for more accuracy
    if (fullOrders && Array.isArray(fullOrders)) {
      const todayOrders = fullOrders.filter(
        (o) => o.created_at?.startsWith(todayDate)
      );
      pending = todayOrders.filter(
        (o) => o.status === 'pending' || o.status === 'confirmed'
      ).length;
      preparing = todayOrders.filter(
        (o) => o.status === 'preparing'
      ).length;
      ready = todayOrders.filter((o) => o.status === 'ready').length;
    }

    return { pending, preparing, ready, totalRevenue };
  }, [data, fullOrders]);

  // Build 7-day chart data with zero-fill for missing days
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      days.push(d.toISOString().split('T')[0]);
    }

    const dailyMap = {};
    if (weeklyData?.daily) {
      weeklyData.daily.forEach((d) => {
        dailyMap[d.date] = d;
      });
    }

    return days.map((date) => ({
      date,
      revenue: dailyMap[date]?.revenue || 0,
      orders: dailyMap[date]?.orders || 0,
    }));
  }, [weeklyData]);

  // Popular items from orders data (enhanced with revenue)
  const popularItemsFromOrders = useMemo(() => {
    if (!fullOrders || !Array.isArray(fullOrders)) return [];
    const todayDate = new Date().toISOString().split('T')[0];
    const todayOrders = fullOrders.filter(
      (o) =>
        o.created_at?.startsWith(todayDate) && o.status !== 'cancelled'
    );
    const countMap = {};
    todayOrders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const name = item.name || item.item_name;
          if (!name) return;
          if (!countMap[name]) countMap[name] = { name, total_qty: 0, revenue: 0 };
          countMap[name].total_qty += item.quantity || 1;
          countMap[name].revenue += (item.quantity || 1) * (item.price || 0);
        });
      }
    });
    return Object.values(countMap)
      .sort((a, b) => b.total_qty - a.total_qty)
      .slice(0, 5);
  }, [fullOrders]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#e94560] animate-spin" />
          <p className="text-[#a0a0a0] text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-red-500/20 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load</h2>
          <p className="text-[#a0a0a0] mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboard();
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

  const today = data?.today || {};
  const maxHourly = Math.max(...(data?.hourly || []).map((h) => h.count || h.orders || 0), 1);
  const byType = data?.byType || [];
  const statusDist = data?.statusDistribution || [];
  const totalStatusOrders = statusDist.reduce((sum, s) => sum + (s.count || 0), 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">
            Overview of today's activity at Nimo's
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchDashboard();
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-[#a0a0a0] hover:text-white rounded-xl text-sm font-medium transition-all duration-200 border border-white/5"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            {statusSummary.pending > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400" />
              </span>
            )}
          </div>
          <p className="text-[#a0a0a0] text-sm font-medium mb-1">Pending Orders</p>
          <p className="text-white text-2xl sm:text-3xl font-bold tracking-tight">{statusSummary.pending}</p>
          <p className="text-yellow-400/70 text-xs mt-1.5">Awaiting confirmation</p>
        </div>

        <div className="bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-purple-500/10 hover:border-purple-500/20 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <ChefHat className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-[#a0a0a0] text-sm font-medium mb-1">In Preparation</p>
          <p className="text-white text-2xl sm:text-3xl font-bold tracking-tight">{statusSummary.preparing}</p>
          <p className="text-purple-400/70 text-xs mt-1.5">Currently being made</p>
        </div>

        <div className="bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-[#a0a0a0] text-sm font-medium mb-1">Ready</p>
          <p className="text-white text-2xl sm:text-3xl font-bold tracking-tight">{statusSummary.ready}</p>
          <p className="text-emerald-400/70 text-xs mt-1.5">Ready for pickup/delivery</p>
        </div>

        <div className="bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-[#e94560]/10 hover:border-[#e94560]/20 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#e94560]/10 flex items-center justify-center group-hover:bg-[#e94560]/20 transition-colors">
              <Euro className="w-5 h-5 text-[#e94560]" />
            </div>
          </div>
          <p className="text-[#a0a0a0] text-sm font-medium mb-1">Revenue Today</p>
          <p className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
            {'\u20AC'}{(statusSummary.totalRevenue ?? 0).toFixed(2)}
          </p>
          <p className="text-[#e94560]/70 text-xs mt-1.5">
            {today.orders ?? 0} orders &middot; avg {'\u20AC'}{(today.avgOrderValue ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Original overview stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingCart}
          title="Today's Orders"
          value={today.orders ?? 0}
        />
        <StatCard
          icon={Euro}
          title="Today's Revenue"
          value={`\u20AC${(today.revenue ?? 0).toFixed(2)}`}
        />
        <StatCard
          icon={TrendingUp}
          title="Avg Order Value"
          value={`\u20AC${(today.avgOrderValue ?? 0).toFixed(2)}`}
        />
        <StatCard
          icon={Users}
          title="Total Customers"
          value={data?.totalCustomers ?? 0}
        />
      </div>

      {/* Quick actions */}
      <div className="bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Toggle Open/Closed */}
          <button
            onClick={() => handleToggle(adminApi.toggleOpen, 'open')}
            disabled={toggling.open}
            className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
              settings?.restaurant_open
                ? 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40'
                : 'bg-red-500/10 border-red-500/20 hover:border-red-500/40'
            }`}
          >
            {toggling.open ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#a0a0a0]" />
            ) : (
              <Store
                className={`w-6 h-6 ${
                  settings?.restaurant_open ? 'text-emerald-400' : 'text-red-400'
                }`}
              />
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-white">
                {settings?.restaurant_open ? 'Restaurant Open' : 'Restaurant Closed'}
              </p>
              <p className="text-xs text-[#a0a0a0]">Click to toggle</p>
            </div>
            <div
              className={`ml-auto w-10 h-6 rounded-full relative transition-colors duration-300 ${
                settings?.restaurant_open ? 'bg-emerald-500' : 'bg-red-500/50'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
                  settings?.restaurant_open ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
          </button>

          {/* Toggle Busy */}
          <button
            onClick={() => handleToggle(adminApi.toggleBusy, 'busy')}
            disabled={toggling.busy}
            className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
              settings?.busy_mode
                ? 'bg-[#f5a623]/10 border-[#f5a623]/20 hover:border-[#f5a623]/40'
                : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}
          >
            {toggling.busy ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#a0a0a0]" />
            ) : (
              <AlertTriangle
                className={`w-6 h-6 ${
                  settings?.busy_mode ? 'text-[#f5a623]' : 'text-[#a0a0a0]'
                }`}
              />
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-white">
                {settings?.busy_mode ? 'Busy Mode On' : 'Busy Mode Off'}
              </p>
              <p className="text-xs text-[#a0a0a0]">Extended wait times</p>
            </div>
            <div
              className={`ml-auto w-10 h-6 rounded-full relative transition-colors duration-300 ${
                settings?.busy_mode ? 'bg-[#f5a623]' : 'bg-white/10'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
                  settings?.busy_mode ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
          </button>

          {/* Toggle Pause */}
          <button
            onClick={() => handleToggle(adminApi.togglePause, 'pause')}
            disabled={toggling.pause}
            className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
              settings?.orders_paused
                ? 'bg-red-500/10 border-red-500/20 hover:border-red-500/40'
                : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}
          >
            {toggling.pause ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#a0a0a0]" />
            ) : (
              <Pause
                className={`w-6 h-6 ${
                  settings?.orders_paused ? 'text-red-400' : 'text-[#a0a0a0]'
                }`}
              />
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-white">
                {settings?.orders_paused ? 'Orders Paused' : 'Orders Active'}
              </p>
              <p className="text-xs text-[#a0a0a0]">Stop accepting orders</p>
            </div>
            <div
              className={`ml-auto w-10 h-6 rounded-full relative transition-colors duration-300 ${
                settings?.orders_paused ? 'bg-red-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
                  settings?.orders_paused ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* 7-Day Revenue Chart */}
      <div className="bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-white/5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#e94560]" />
            Revenue - Last 7 Days
          </h2>
          {weeklyData?.summary && (
            <div className="text-right">
              <p className="text-white text-lg font-bold tabular-nums">
                {'\u20AC'}{(weeklyData.summary.total_revenue || 0).toFixed(2)}
              </p>
              <p className="text-[#a0a0a0] text-xs">
                {weeklyData.summary.total_orders || 0} total orders
              </p>
            </div>
          )}
        </div>
        <RevenueChart dailyData={chartData} />
      </div>

      {/* Revenue by Type + Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Order Type */}
        <div className="bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#e94560]" />
            Revenue by Type
          </h2>
          {byType.length > 0 ? (
            <div className="space-y-4">
              {byType.map((entry) => {
                const label = entry.type || 'Unknown';
                const count = entry.count ?? 0;
                const revenue = entry.revenue ?? 0;
                const totalTypeOrders = byType.reduce((s, t) => s + (t.count ?? 0), 0);
                const pct = totalTypeOrders > 0 ? (count / totalTypeOrders) * 100 : 0;
                const isDelivery = label.toLowerCase() === 'delivery';

                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        {isDelivery ? (
                          <Truck className="w-4 h-4 text-blue-400" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-[#f5a623]" />
                        )}
                        <span className="text-white capitalize font-medium">{label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[#a0a0a0]">
                          {count} orders
                        </span>
                        <span className="text-white font-semibold">
                          {'\u20AC'}{revenue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-[#080808] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isDelivery ? 'bg-blue-500' : 'bg-[#f5a623]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#a0a0a0] mt-1">{pct.toFixed(0)}% of orders</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[#a0a0a0] text-sm text-center py-6">
              No orders yet today
            </p>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#e94560]" />
            Order Status
          </h2>
          {statusDist.length > 0 ? (
            <div className="space-y-3">
              {statusDist.map((s) => {
                const pct = totalStatusOrders > 0 ? (s.count / totalStatusOrders) * 100 : 0;
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            STATUS_COLORS[s.status] || 'bg-white/10 text-[#a0a0a0]'
                          }`}
                        >
                          {s.status?.replace(/_/g, ' ') || 'unknown'}
                        </span>
                      </div>
                      <span className="text-white text-sm font-medium">
                        {s.count}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#080808] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          STATUS_BAR_COLORS[s.status] || 'bg-white/20'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[#a0a0a0] text-sm">Total Today</span>
                <span className="text-white font-semibold">{totalStatusOrders}</span>
              </div>
            </div>
          ) : (
            <p className="text-[#a0a0a0] text-sm text-center py-6">
              No orders yet today
            </p>
          )}
        </div>
      </div>

      {/* Three column layout: Recent Orders Feed + Popular Items + Hourly */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders Live Feed (2 cols) */}
        <div className="xl:col-span-2 bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#e94560]" />
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-sm text-[#e94560] hover:text-[#f5a623] font-medium flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Live feed view */}
          <div className="p-5 sm:p-6 pt-4">
            <RecentOrdersFeed
              orders={
                fullOrders && Array.isArray(fullOrders) && fullOrders.length > 0
                  ? fullOrders.slice(0, 5)
                  : (data?.recentOrders || []).slice(0, 5)
              }
            />
          </div>

          {/* Full table below the feed */}
          <div className="border-t border-white/5">
            <div className="px-5 sm:px-6 py-3">
              <p className="text-xs text-[#a0a0a0] font-medium uppercase tracking-wider">All Recent</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-[#a0a0a0] font-medium px-5 sm:px-6 py-3">
                      #
                    </th>
                    <th className="text-left text-[#a0a0a0] font-medium px-3 py-3">
                      Customer
                    </th>
                    <th className="text-left text-[#a0a0a0] font-medium px-3 py-3 hidden sm:table-cell">
                      Items
                    </th>
                    <th className="text-left text-[#a0a0a0] font-medium px-3 py-3">
                      Total
                    </th>
                    <th className="text-left text-[#a0a0a0] font-medium px-3 py-3">
                      Status
                    </th>
                    <th className="text-left text-[#a0a0a0] font-medium px-3 py-3 hidden md:table-cell">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentOrders || []).slice(0, 10).map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 sm:px-6 py-3 font-mono text-[#e94560] font-medium">
                        {order.order_number || `#${order.id}`}
                      </td>
                      <td className="px-3 py-3 text-white">
                        {order.customer_name || order.customer?.name || 'Guest'}
                      </td>
                      <td className="px-3 py-3 text-[#a0a0a0] hidden sm:table-cell max-w-[200px] truncate">
                        {order.items
                          ? Array.isArray(order.items)
                            ? order.items.map((i) => i.name || i.item_name).join(', ')
                            : order.items
                          : '-'}
                      </td>
                      <td className="px-3 py-3 text-white font-medium">
                        {'\u20AC'}
                        {(order.total ?? 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            STATUS_COLORS[order.status] || 'bg-white/10 text-[#a0a0a0]'
                          }`}
                        >
                          {order.status?.replace(/_/g, ' ') || 'unknown'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#a0a0a0] text-xs hidden md:table-cell">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleTimeString('en-IE', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentOrders || data.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-[#a0a0a0]">
                        No recent orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Popular items + Hourly chart (1 col) */}
        <div className="space-y-6">
          {/* Popular items */}
          <div className="bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-white/5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#f5a623]" />
              Popular Today
            </h2>
            <PopularItemsToday
              items={
                popularItemsFromOrders.length > 0
                  ? popularItemsFromOrders
                  : data?.popular || []
              }
              allOrders={fullOrders}
            />
          </div>

          {/* Hourly chart */}
          <div className="bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">Hourly Orders</h2>
            <div className="flex items-end gap-1.5 h-32">
              {(data?.hourly || []).map((h, idx) => {
                const orders = h.count || h.orders || 0;
                const height = maxHourly > 0 ? (orders / maxHourly) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1 group"
                  >
                    <span className="text-[10px] text-[#a0a0a0] opacity-0 group-hover:opacity-100 transition-opacity">
                      {orders}
                    </span>
                    <div
                      className="w-full bg-[#e94560]/60 hover:bg-[#e94560] rounded-t transition-all duration-300 min-h-[2px]"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    <span className="text-[10px] text-[#a0a0a0]">
                      {h.hour !== undefined ? `${h.hour}` : ''}
                    </span>
                  </div>
                );
              })}
              {(!data?.hourly || data.hourly.length === 0) && (
                <p className="text-[#a0a0a0] text-sm text-center w-full py-8">
                  No hourly data
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
