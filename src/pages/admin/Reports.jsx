import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  ShoppingCart,
  Euro,
  TrendingUp,
  Percent,
  Truck,
  ShoppingBag,
  CreditCard,
  Banknote,
  BarChart3,
  Users,
  UserPlus,
  UserCheck,
  Clock,
} from 'lucide-react';
import { admin as adminApi } from '../../utils/api';
import StatCard from '../../components/admin/StatCard';

function formatDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

/**
 * Normalise byType data to an array of {type, count, revenue}.
 * API may return an array [{type, count, revenue}] or an object {type: count}.
 */
function normaliseByType(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return Object.entries(raw).map(([type, val]) => ({
    type,
    count: typeof val === 'number' ? val : val?.count ?? 0,
    revenue: typeof val === 'object' ? val?.revenue ?? 0 : 0,
  }));
}

/**
 * Normalise byPayment data to an array of {payment_method, count}.
 * API may return an array [{payment_method, count}] or an object {method: count}.
 */
function normaliseByPayment(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return Object.entries(raw).map(([method, val]) => ({
    payment_method: method,
    count: typeof val === 'number' ? val : val?.count ?? 0,
  }));
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, '0')
);

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState(formatDate(30));
  const [toDate, setToDate] = useState(formatDate(0));
  const [activePreset, setActivePreset] = useState('30d');

  const fetchReports = useCallback(async () => {
    try {
      const result = await adminApi.getReports(fromDate, toDate);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    setLoading(true);
    fetchReports();
  }, [fetchReports]);

  const setPreset = (label, days) => {
    setActivePreset(label);
    if (label === 'today') {
      setFromDate(formatDate(0));
      setToDate(formatDate(0));
    } else {
      setFromDate(formatDate(days));
      setToDate(formatDate(0));
    }
  };

  const handleCustomDate = (field, value) => {
    setActivePreset('custom');
    if (field === 'from') setFromDate(value);
    else setToDate(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#e94560] animate-spin" />
          <p className="text-[#a0a0a0] text-sm">Loading reports...</p>
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
              fetchReports();
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

  const summary = data?.summary || {};
  const daily = data?.daily || [];
  const topItems = data?.topItems || [];
  const byType = normaliseByType(data?.byType);
  const byPayment = normaliseByPayment(data?.byPayment);
  const hourly = data?.hourly || [];
  const customerStats = data?.customerStats || {};

  const totalOrders = summary.total_orders ?? summary.totalOrders ?? 0;
  const totalRevenue = summary.total_revenue ?? summary.totalRevenue ?? 0;
  const avgOrder = summary.avg_order ?? (totalOrders > 0 ? totalRevenue / totalOrders : 0);
  const totalDiscounts = summary.total_discounts ?? summary.totalDiscounts ?? 0;

  const typeTotal = byType.reduce((sum, t) => sum + (t.count ?? 0), 0);
  const paymentTotal = byPayment.reduce((sum, p) => sum + (p.count ?? 0), 0);

  // Revenue chart: find max for scaling
  const maxDailyRevenue = Math.max(...daily.map((d) => d.revenue ?? d.total_revenue ?? 0), 1);
  const maxDailyOrders = Math.max(...daily.map((d) => d.orders ?? d.order_count ?? 0), 1);

  // Hourly heatmap: build a full 24-hour map
  const hourlyMap = {};
  hourly.forEach((h) => {
    hourlyMap[h.hour] = h.count || 0;
  });
  const maxHourlyCount = Math.max(...Object.values(hourlyMap), ...hourly.map((h) => h.count || 0), 1);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Reports</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">
            {fromDate === toDate ? fromDate : `${fromDate} to ${toDate}`}
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchReports();
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-[#a0a0a0] hover:text-white rounded-xl text-sm font-medium transition-all border border-white/5"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Date range picker */}
      <div className="bg-[#1a1a2e] rounded-2xl p-5 border border-white/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#a0a0a0]" />
            <span className="text-sm text-[#a0a0a0]">Date Range:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleCustomDate('from', e.target.value)}
              className="px-3 py-2 bg-[#080808] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#e94560]/50 cursor-pointer"
            />
            <span className="text-[#a0a0a0] text-sm">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => handleCustomDate('to', e.target.value)}
              className="px-3 py-2 bg-[#080808] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#e94560]/50 cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            {[
              { label: 'Today', key: 'today', days: 0 },
              { label: '7d', key: '7d', days: 7 },
              { label: '30d', key: '30d', days: 30 },
              { label: '90d', key: '90d', days: 90 },
            ].map((preset) => (
              <button
                key={preset.key}
                onClick={() => setPreset(preset.key, preset.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activePreset === preset.key
                    ? 'bg-[#e94560]/20 border-[#e94560]/40 text-[#e94560]'
                    : 'bg-white/5 hover:bg-white/10 text-[#a0a0a0] hover:text-white border-white/5'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingCart}
          title="Total Orders"
          value={totalOrders}
        />
        <StatCard
          icon={Euro}
          title="Total Revenue"
          value={`\u20AC${totalRevenue.toFixed(2)}`}
        />
        <StatCard
          icon={TrendingUp}
          title="Avg Order Value"
          value={`\u20AC${avgOrder.toFixed(2)}`}
        />
        <StatCard
          icon={Percent}
          title="Total Discounts"
          value={`\u20AC${totalDiscounts.toFixed(2)}`}
        />
      </div>

      {/* Revenue Chart (CSS bars) */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-5 pb-0">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#e94560]" />
            Revenue Over Time
          </h2>
          <p className="text-[#a0a0a0] text-xs mt-1">Daily revenue for the selected period</p>
        </div>
        <div className="p-5">
          {daily.length > 0 ? (
            <div className="space-y-2">
              {daily.map((day, idx) => {
                const rev = day.revenue ?? day.total_revenue ?? 0;
                const orders = day.orders ?? day.order_count ?? 0;
                const barWidth = maxDailyRevenue > 0 ? (rev / maxDailyRevenue) * 100 : 0;
                const dateLabel = new Date(day.date).toLocaleDateString('en-IE', {
                  day: 'numeric',
                  month: 'short',
                  weekday: 'short',
                });
                return (
                  <div key={idx} className="group">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#a0a0a0] w-24 shrink-0 text-right">
                        {dateLabel}
                      </span>
                      <div className="flex-1 h-6 bg-[#080808] rounded overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-[#e94560] to-[#f5a623] rounded transition-all duration-500 flex items-center"
                          style={{ width: `${Math.max(barWidth, 1)}%` }}
                        >
                          {barWidth > 30 && (
                            <span className="text-[10px] text-white font-medium ml-2 whitespace-nowrap">
                              {'\u20AC'}{rev.toFixed(0)}
                            </span>
                          )}
                        </div>
                        {barWidth <= 30 && (
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#a0a0a0] font-medium" style={{ left: `calc(${Math.max(barWidth, 1)}% + 8px)` }}>
                            {'\u20AC'}{rev.toFixed(0)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#a0a0a0] w-16 shrink-0">
                        {orders} orders
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[#a0a0a0] text-sm text-center py-8">
              No revenue data for this period
            </p>
          )}
        </div>
      </div>

      {/* Orders by Hour Heatmap + Customer Retention */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Orders by Hour Heatmap */}
        <div className="bg-[#1a1a2e] rounded-2xl p-5 border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#e94560]" />
            Orders by Hour
          </h2>
          <p className="text-[#a0a0a0] text-xs mb-4">Busiest hours during selected period</p>
          <div className="grid grid-cols-6 gap-1.5">
            {HOUR_LABELS.map((hour) => {
              const count = hourlyMap[parseInt(hour, 10)] || hourlyMap[hour] || 0;
              const intensity = maxHourlyCount > 0 ? count / maxHourlyCount : 0;
              // Color scale from dark to accent
              let bgColor;
              if (count === 0) {
                bgColor = 'bg-[#080808]';
              } else if (intensity < 0.25) {
                bgColor = 'bg-[#e94560]/15';
              } else if (intensity < 0.5) {
                bgColor = 'bg-[#e94560]/30';
              } else if (intensity < 0.75) {
                bgColor = 'bg-[#e94560]/50';
              } else {
                bgColor = 'bg-[#e94560]/80';
              }

              return (
                <div
                  key={hour}
                  className={`${bgColor} rounded-lg p-2 text-center transition-all duration-300 hover:ring-1 hover:ring-[#e94560]/40 group relative`}
                  title={`${hour}:00 - ${count} orders`}
                >
                  <p className="text-[10px] text-[#a0a0a0] font-mono">{hour}:00</p>
                  <p className={`text-sm font-bold mt-0.5 ${count > 0 ? 'text-white' : 'text-[#333]'}`}>
                    {count}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="text-[10px] text-[#a0a0a0]">Less</span>
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded bg-[#080808]" />
              <div className="w-3 h-3 rounded bg-[#e94560]/15" />
              <div className="w-3 h-3 rounded bg-[#e94560]/30" />
              <div className="w-3 h-3 rounded bg-[#e94560]/50" />
              <div className="w-3 h-3 rounded bg-[#e94560]/80" />
            </div>
            <span className="text-[10px] text-[#a0a0a0]">More</span>
          </div>
        </div>

        {/* Customer Retention */}
        <div className="bg-[#1a1a2e] rounded-2xl p-5 border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#f5a623]" />
            Customer Retention
          </h2>
          <p className="text-[#a0a0a0] text-xs mb-4">New vs returning customers in period</p>

          {(customerStats.total || 0) > 0 ? (
            <>
              {/* Donut-style display using stacked bars */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex-1">
                  <div className="w-full h-4 bg-[#080808] rounded-full overflow-hidden flex">
                    {customerStats.returning > 0 && (
                      <div
                        className="h-full bg-emerald-500 transition-all duration-700"
                        style={{ width: `${(customerStats.returning / customerStats.total) * 100}%` }}
                      />
                    )}
                    {customerStats.new > 0 && (
                      <div
                        className="h-full bg-[#f5a623] transition-all duration-700"
                        style={{ width: `${(customerStats.new / customerStats.total) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-[#080808] rounded-xl">
                  <Users className="w-5 h-5 text-[#a0a0a0] mx-auto mb-1.5" />
                  <p className="text-2xl font-bold text-white">{customerStats.total}</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">Total</p>
                </div>
                <div className="text-center p-3 bg-[#080808] rounded-xl">
                  <UserCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                  <p className="text-2xl font-bold text-emerald-400">{customerStats.returning}</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">Returning</p>
                </div>
                <div className="text-center p-3 bg-[#080808] rounded-xl">
                  <UserPlus className="w-5 h-5 text-[#f5a623] mx-auto mb-1.5" />
                  <p className="text-2xl font-bold text-[#f5a623]">{customerStats.new}</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">New</p>
                </div>
              </div>

              {customerStats.total > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0a0a0]">Retention Rate</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {((customerStats.returning / customerStats.total) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs text-[#a0a0a0]">Returning</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#f5a623]" />
                      <span className="text-xs text-[#a0a0a0]">New</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-[#a0a0a0] text-sm text-center py-8">
              No customer data for this period
            </p>
          )}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Daily breakdown */}
        <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-5 pb-0">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#e94560]" />
              Daily Breakdown
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[#a0a0a0] font-medium px-5 py-3">
                    Date
                  </th>
                  <th className="text-right text-[#a0a0a0] font-medium px-3 py-3">
                    Orders
                  </th>
                  <th className="text-right text-[#a0a0a0] font-medium px-3 py-3">
                    Revenue
                  </th>
                  <th className="text-right text-[#a0a0a0] font-medium px-5 py-3 hidden sm:table-cell">
                    Discounts
                  </th>
                </tr>
              </thead>
              <tbody>
                {daily.map((day, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3 text-white">
                      {new Date(day.date).toLocaleDateString('en-IE', {
                        day: 'numeric',
                        month: 'short',
                        weekday: 'short',
                      })}
                    </td>
                    <td className="px-3 py-3 text-right text-white font-medium">
                      {day.orders ?? day.order_count ?? 0}
                    </td>
                    <td className="px-3 py-3 text-right text-[#e94560] font-medium">
                      {'\u20AC'}
                      {(day.revenue ?? day.total_revenue ?? 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right text-[#f5a623] font-medium hidden sm:table-cell">
                      {'\u20AC'}
                      {(day.discounts ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {daily.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-[#a0a0a0]">
                      No data for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top items */}
        <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-5 pb-0">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#f5a623]" />
              Top Items
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[#a0a0a0] font-medium px-5 py-3">
                    #
                  </th>
                  <th className="text-left text-[#a0a0a0] font-medium px-3 py-3">
                    Item
                  </th>
                  <th className="text-right text-[#a0a0a0] font-medium px-3 py-3">
                    Qty
                  </th>
                  <th className="text-right text-[#a0a0a0] font-medium px-5 py-3">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3 text-[#a0a0a0] font-mono">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-3 text-white">{item.name}</td>
                    <td className="px-3 py-3 text-right text-[#f5a623] font-medium">
                      {item.qty ?? item.quantity ?? item.count ?? 0}
                    </td>
                    <td className="px-5 py-3 text-right text-white font-medium">
                      {item.revenue !== undefined && item.revenue !== null
                        ? `\u20AC${(item.revenue ?? 0).toFixed(2)}`
                        : '-'}
                    </td>
                  </tr>
                ))}
                {topItems.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-[#a0a0a0]">
                      No item data for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Type */}
        <div className="bg-[#1a1a2e] rounded-2xl p-5 border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-4">Orders by Type</h2>
          <div className="space-y-4">
            {byType.length > 0 ? (
              byType.map((entry) => {
                const label = entry.type || 'Unknown';
                const count = entry.count ?? 0;
                const pct = typeTotal > 0 ? (count / typeTotal) * 100 : 0;
                const isDelivery = label.toLowerCase() === 'delivery';

                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        {isDelivery ? (
                          <Truck className="w-4 h-4 text-blue-400" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-[#f5a623]" />
                        )}
                        <span className="text-white capitalize">{label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        {entry.revenue !== undefined && entry.revenue !== null && (
                          <span className="text-[#a0a0a0]">
                            {'\u20AC'}{(entry.revenue ?? 0).toFixed(2)}
                          </span>
                        )}
                        <span className="text-[#a0a0a0]">
                          {count} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-[#080808] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDelivery ? 'bg-blue-500' : 'bg-[#f5a623]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[#a0a0a0] text-sm text-center py-4">
                No type data available
              </p>
            )}
          </div>
        </div>

        {/* By Payment */}
        <div className="bg-[#1a1a2e] rounded-2xl p-5 border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-4">
            By Payment Method
          </h2>
          <div className="space-y-4">
            {byPayment.length > 0 ? (
              byPayment.map((entry) => {
                const method = entry.payment_method || entry.method || 'Unknown';
                const count = entry.count ?? 0;
                const pct = paymentTotal > 0 ? (count / paymentTotal) * 100 : 0;
                const isCard =
                  method.toLowerCase().includes('card') ||
                  method.toLowerCase().includes('stripe');

                return (
                  <div key={method}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        {isCard ? (
                          <CreditCard className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Banknote className="w-4 h-4 text-emerald-400" />
                        )}
                        <span className="text-white capitalize">{method}</span>
                      </div>
                      <span className="text-[#a0a0a0] text-sm">
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#080808] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCard ? 'bg-purple-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[#a0a0a0] text-sm text-center py-4">
                No payment data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
