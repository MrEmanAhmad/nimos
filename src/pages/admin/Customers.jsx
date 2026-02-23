import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Users,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  ShoppingCart,
  Euro,
  Award,
  Calendar,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { admin as adminApi } from '../../utils/api';

const SORT_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'order_count', label: 'Orders' },
  { key: 'total_spent', label: 'Total Spent' },
  { key: 'last_order', label: 'Last Order' },
];

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('order_count');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await adminApi.getCustomers();
      setCustomers(Array.isArray(data) ? data : data.customers || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  // Filter + sort
  const processed = [...customers]
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];

      if (sortField === 'name') {
        av = (av || '').toLowerCase();
        bv = (bv || '').toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }

      if (sortField === 'last_order') {
        av = av ? new Date(av).getTime() : 0;
        bv = bv ? new Date(bv).getTime() : 0;
      }

      av = av ?? 0;
      bv = bv ?? 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#e94560] animate-spin" />
          <p className="text-[#a0a0a0] text-sm">Loading customers...</p>
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
              fetchCustomers();
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Customers</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">
            {processed.length} customer{processed.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchCustomers();
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-[#a0a0a0] hover:text-white rounded-xl text-sm font-medium transition-all border border-white/5"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
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

        {/* Sort pills */}
        <div className="flex gap-2 overflow-x-auto">
          {SORT_FIELDS.map((sf) => (
            <button
              key={sf.key}
              onClick={() => handleSort(sf.key)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                sortField === sf.key
                  ? 'bg-[#e94560]/15 text-[#e94560] border border-[#e94560]/20'
                  : 'bg-[#1a1a2e] text-[#a0a0a0] border border-white/5 hover:text-white hover:border-white/10'
              }`}
            >
              {sf.label}
              {sortField === sf.key &&
                (sortDir === 'asc' ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                ))}
              {sortField !== sf.key && (
                <ArrowUpDown className="w-3 h-3 opacity-40" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Customer table */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[#a0a0a0] font-medium px-5 py-3">
                  Customer
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3 hidden md:table-cell">
                  Email
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3 hidden lg:table-cell">
                  Phone
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3">
                  Orders
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3">
                  Spent
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3 hidden sm:table-cell">
                  Loyalty
                </th>
                <th className="text-left text-[#a0a0a0] font-medium px-3 py-3 hidden md:table-cell">
                  Last Order
                </th>
                <th className="w-8 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {processed.map((customer) => {
                const isExpanded = expandedId === customer.id;
                return (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    isExpanded={isExpanded}
                    onToggle={() =>
                      setExpandedId(isExpanded ? null : customer.id)
                    }
                  />
                );
              })}
              {processed.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <Users className="w-12 h-12 text-[#a0a0a0]/30 mx-auto mb-3" />
                    <p className="text-[#a0a0a0]">
                      {search ? 'No customers match your search' : 'No customers yet'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomerRow({ customer, isExpanded, onToggle }) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`border-b border-white/5 cursor-pointer transition-all duration-200 ${
          isExpanded ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'
        }`}
      >
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#e94560]/15 flex items-center justify-center text-[#e94560] font-bold text-sm shrink-0">
              {customer.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="text-white font-medium">{customer.name || 'Unknown'}</span>
          </div>
        </td>
        <td className="px-3 py-3.5 text-[#a0a0a0] hidden md:table-cell">
          {customer.email || '-'}
        </td>
        <td className="px-3 py-3.5 text-[#a0a0a0] hidden lg:table-cell">
          {customer.phone || '-'}
        </td>
        <td className="px-3 py-3.5">
          <span className="inline-flex items-center gap-1 text-white font-medium">
            <ShoppingCart className="w-3.5 h-3.5 text-[#a0a0a0]" />
            {customer.order_count ?? 0}
          </span>
        </td>
        <td className="px-3 py-3.5 text-white font-medium">
          {'\u20AC'}
          {(customer.total_spent ?? 0).toFixed(2)}
        </td>
        <td className="px-3 py-3.5 hidden sm:table-cell">
          <span className="inline-flex items-center gap-1 text-[#f5a623] text-sm font-medium">
            <Award className="w-3.5 h-3.5" />
            {customer.loyalty_points ?? 0}
          </span>
        </td>
        <td className="px-3 py-3.5 text-[#a0a0a0] text-xs hidden md:table-cell">
          {customer.last_order
            ? new Date(customer.last_order).toLocaleDateString('en-IE', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Never'}
        </td>
        <td className="px-3 py-3.5">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#a0a0a0]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#a0a0a0]" />
          )}
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan="8" className="bg-[#0f0f0f]/50">
            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Contact Details</h4>
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-[#a0a0a0]" />
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-[#e94560] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {customer.email}
                    </a>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-[#a0a0a0]" />
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-[#e94560] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {customer.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Order Stats</h4>
                <div className="flex items-center gap-2 text-sm">
                  <ShoppingCart className="w-4 h-4 text-[#a0a0a0]" />
                  <span className="text-[#a0a0a0]">Total orders:</span>
                  <span className="text-white font-medium">
                    {customer.order_count ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Euro className="w-4 h-4 text-[#a0a0a0]" />
                  <span className="text-[#a0a0a0]">Total spent:</span>
                  <span className="text-white font-medium">
                    {'\u20AC'}
                    {(customer.total_spent ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Euro className="w-4 h-4 text-[#a0a0a0]" />
                  <span className="text-[#a0a0a0]">Avg order:</span>
                  <span className="text-white font-medium">
                    {'\u20AC'}
                    {customer.order_count > 0
                      ? ((customer.total_spent ?? 0) / customer.order_count).toFixed(2)
                      : '0.00'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Loyalty</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-[#f5a623]" />
                  <span className="text-[#a0a0a0]">Points:</span>
                  <span className="text-[#f5a623] font-medium">
                    {customer.loyalty_points ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-[#a0a0a0]" />
                  <span className="text-[#a0a0a0]">Member since:</span>
                  <span className="text-white">
                    {customer.created_at
                      ? new Date(customer.created_at).toLocaleDateString('en-IE', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
