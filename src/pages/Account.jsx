import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Heart,
  Award,
  Package,
  LogOut,
  ChevronRight,
  ChevronDown,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  Star,
  Gift,
  History,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// --- Tab definitions ---
const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'loyalty', label: 'Loyalty', icon: Award },
  { id: 'favourites', label: 'Favourites', icon: Heart },
];

// --- Status badge colors ---
const STATUS_STYLES = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  preparing: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  ready: 'bg-green-500/15 text-green-400 border-green-500/30',
  delivered: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  completed: 'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${style}`}>
      {status}
    </span>
  );
}

// ============================================================
// PROFILE TAB
// ============================================================
function ChangePasswordSection({ authFetch }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSubmit = async () => {
    setMsg({ type: '', text: '' });
    if (!form.currentPassword || !form.newPassword) {
      setMsg({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    if (form.newPassword.length < 8) {
      setMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setSaving(true);
    try {
      const res = await authFetch(`${API_BASE}/auth/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setMsg({ type: 'success', text: 'Password changed successfully!' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => { setOpen(false); setMsg({ type: '', text: '' }); }, 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const PasswordInput = ({ label, field, showKey }) => (
    <div>
      <p className="text-xs text-[#a0a0a0] mb-1">{label}</p>
      <div className="relative">
        <input
          type={show[showKey] ? 'text' : 'password'}
          value={form[field]}
          onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
          className="w-full px-3 py-2 pr-10 bg-[#1a1a2e] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#e94560]/50 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-white"
        >
          {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#080808] rounded-xl border border-white/5 p-6">
      <button
        onClick={() => { setOpen(!open); setMsg({ type: '', text: '' }); }}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-[#a0a0a0]" />
          <h3 className="text-lg font-semibold text-white">Change Password</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-[#a0a0a0] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {msg.text && (
            <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${msg.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
              {msg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {msg.text}
            </div>
          )}
          <PasswordInput label="Current Password" field="currentPassword" showKey="current" />
          <PasswordInput label="New Password" field="newPassword" showKey="new" />
          <PasswordInput label="Confirm New Password" field="confirmPassword" showKey="confirm" />
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-2.5 bg-[#e94560] hover:bg-[#d13350] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileTab({ user, updateProfile, authFetch }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleSave = async () => {
    setError('');
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: form.name.trim(), phone: form.phone.trim() });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '', phone: user?.phone || '' });
    setEditing(false);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Avatar + welcome */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 bg-gradient-to-br from-[#e94560] to-[#d13350] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#e94560]/20">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{user?.name || 'User'}</h2>
          <p className="text-[#a0a0a0] text-sm">{user?.email}</p>
          {saved && (
            <div className="flex items-center gap-1.5 mt-1 text-green-400 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Profile updated successfully
            </div>
          )}
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-[#080808] rounded-xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Personal Information</h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-sm text-[#e94560] hover:text-[#f5a623] transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 text-sm text-[#a0a0a0] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm text-[#e94560] hover:text-[#f5a623] transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          {/* Name */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[#a0a0a0]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#a0a0a0] mb-1">Full Name</p>
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#e94560]/50 transition-colors"
                />
              ) : (
                <p className="text-white font-medium">{user?.name || '-'}</p>
              )}
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-[#a0a0a0]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#a0a0a0] mb-1">Email Address</p>
              <p className="text-white font-medium">{user?.email || '-'}</p>
              {editing && (
                <p className="text-[#a0a0a0] text-xs mt-1">Email cannot be changed.</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-[#a0a0a0]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#a0a0a0] mb-1">Phone Number</p>
              {editing ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#e94560]/50 transition-colors"
                />
              ) : (
                <p className="text-white font-medium">{user?.phone || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="bg-[#080808] rounded-xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-[#a0a0a0] text-sm">Member since</span>
            <span className="text-white text-sm font-medium">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-IE', { year: 'numeric', month: 'long' })
                : '-'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[#a0a0a0] text-sm">Account type</span>
            <span className="text-white text-sm font-medium capitalize">{user?.role || 'Customer'}</span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <ChangePasswordSection authFetch={authFetch} />
    </div>
  );
}

// ============================================================
// ORDERS TAB
// ============================================================
function OrdersTab({ authFetch }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await authFetch('/orders');
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [authFetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#e94560] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-[#080808] rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-[#a0a0a0]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
        <p className="text-[#a0a0a0] mb-6">Your order history will appear here.</p>
        <a
          href="/menu"
          className="inline-flex items-center gap-2 bg-[#e94560] hover:bg-[#d13350] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Place Your First Order
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-2">
        Order History
        <span className="text-[#a0a0a0] text-sm font-normal ml-2">({orders.length} orders)</span>
      </h3>

      {orders.map((order) => {
        const isExpanded = expandedOrder === order.id;
        return (
          <div
            key={order.id}
            className="bg-[#080808] rounded-xl border border-white/5 overflow-hidden transition-all duration-200 hover:border-white/10"
          >
            {/* Order header */}
            <button
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center shrink-0">
                  {order.type === 'delivery' ? (
                    <Truck className="w-5 h-5 text-[#e94560]" />
                  ) : (
                    <Store className="w-5 h-5 text-[#f5a623]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-white font-semibold text-sm">
                      Order #{order.id?.toString().slice(-6) || order.id}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[#a0a0a0] text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString('en-IE', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })
                        : '-'}
                    </span>
                    <span className="capitalize">{order.type || 'pickup'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <p className="text-[#e94560] font-bold text-lg">
                  &euro;{typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                </p>
                <ChevronDown
                  className={`w-5 h-5 text-[#a0a0a0] transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Order details (expanded) */}
            {isExpanded && (
              <div className="border-t border-white/5 px-5 pb-5">
                <div className="pt-4 space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-[#1a1a2e] rounded-md flex items-center justify-center text-xs text-[#a0a0a0] font-medium">
                          {item.quantity || 1}x
                        </span>
                        <span className="text-[#e0e0e0] text-sm">{item.item_name}</span>
                      </div>
                      <span className="text-white text-sm font-medium">
                        &euro;{typeof item.price === 'number' ? (item.price * (item.quantity || 1)).toFixed(2) : item.price}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/5">
                  <span className="text-[#a0a0a0] text-sm font-medium">Total</span>
                  <span className="text-white font-bold">
                    &euro;{typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                  </span>
                </div>
                {order.delivery_address && (
                  <div className="flex items-start gap-2 mt-3 text-[#a0a0a0] text-xs">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{order.delivery_address}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// ADDRESSES TAB
// ============================================================
function AddressesTab({ authFetch }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ label: '', line1: '', line2: '', city: '', eircode: '' });
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const data = await authFetch('/customer/addresses');
      setAddresses(Array.isArray(data) ? data : data.addresses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const resetForm = () => {
    setForm({ label: '', line1: '', line2: '', city: '', eircode: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (addr) => {
    setForm({
      label: addr.label || '',
      line1: addr.line1 || addr.address || '',
      line2: addr.line2 || '',
      city: addr.city || '',
      eircode: addr.eircode || addr.postcode || '',
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.line1.trim()) return;
    setSaving(true);
    const address = [form.line1, form.line2, form.city, form.eircode].filter(Boolean).join(', ');
    const payload = { label: form.label || 'Home', address };
    try {
      if (editingId) {
        await authFetch(`/customer/addresses/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await authFetch('/customer/addresses', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await fetchAddresses();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this address?')) return;
    try {
      await authFetch(`/customer/addresses/${id}`, { method: 'DELETE' });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#e94560] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Saved Addresses</h3>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 text-sm text-[#e94560] hover:text-[#f5a623] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Address form */}
      {showForm && (
        <div className="bg-[#080808] rounded-xl border border-[#e94560]/20 p-5 space-y-4">
          <h4 className="text-white font-medium">{editingId ? 'Edit Address' : 'New Address'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Label (e.g. Home, Work)"
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              className="px-3 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-lg text-white text-sm placeholder-[#a0a0a0]/50 focus:outline-none focus:border-[#e94560]/50 transition-colors"
            />
            <input
              type="text"
              placeholder="Eircode"
              value={form.eircode}
              onChange={(e) => setForm((p) => ({ ...p, eircode: e.target.value }))}
              className="px-3 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-lg text-white text-sm placeholder-[#a0a0a0]/50 focus:outline-none focus:border-[#e94560]/50 transition-colors"
            />
          </div>
          <input
            type="text"
            placeholder="Address line 1 *"
            value={form.line1}
            onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
            className="w-full px-3 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-lg text-white text-sm placeholder-[#a0a0a0]/50 focus:outline-none focus:border-[#e94560]/50 transition-colors"
          />
          <input
            type="text"
            placeholder="Address line 2"
            value={form.line2}
            onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))}
            className="w-full px-3 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-lg text-white text-sm placeholder-[#a0a0a0]/50 focus:outline-none focus:border-[#e94560]/50 transition-colors"
          />
          <input
            type="text"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            className="w-full px-3 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-lg text-white text-sm placeholder-[#a0a0a0]/50 focus:outline-none focus:border-[#e94560]/50 transition-colors"
          />
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.line1.trim()}
              className="flex items-center gap-2 bg-[#e94560] hover:bg-[#d13350] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Update' : 'Save'} Address
            </button>
            <button
              onClick={resetForm}
              className="text-[#a0a0a0] hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-[#080808] rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-[#a0a0a0]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Saved Addresses</h3>
          <p className="text-[#a0a0a0] text-sm">Add a delivery address for faster checkout.</p>
        </div>
      ) : (
        addresses.map((addr) => (
          <div
            key={addr.id}
            className="bg-[#080808] rounded-xl border border-white/5 p-5 flex items-start justify-between gap-4 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#e94560]" />
              </div>
              <div>
                {addr.label && (
                  <p className="text-[#f5a623] text-xs font-semibold uppercase tracking-wider mb-1">{addr.label}</p>
                )}
                <p className="text-white text-sm font-medium">{addr.line1 || addr.address}</p>
                {addr.line2 && <p className="text-[#a0a0a0] text-sm">{addr.line2}</p>}
                <p className="text-[#a0a0a0] text-sm">
                  {[addr.city, addr.eircode || addr.postcode].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleEdit(addr)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#a0a0a0] hover:text-white transition-colors"
                aria-label="Edit address"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(addr.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-[#a0a0a0] hover:text-red-400 transition-colors"
                aria-label="Delete address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ============================================================
// LOYALTY TAB
// ============================================================
function LoyaltyTab({ authFetch }) {
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        const data = await authFetch('/customer/loyalty');
        setLoyalty(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLoyalty();
  }, [authFetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#e94560] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const points = loyalty?.points || 0;
  const redeemValue = Math.floor(points / 50) * 5;

  return (
    <div className="space-y-6">
      {/* Points card */}
      <div className="bg-gradient-to-br from-[#e94560]/20 to-[#f5a623]/10 rounded-2xl border border-[#e94560]/20 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#f5a623]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#e94560]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="w-16 h-16 bg-[#f5a623]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-[#f5a623]" />
          </div>
          <p className="text-[#a0a0a0] text-sm uppercase tracking-wider mb-1">Your Points Balance</p>
          <p className="text-5xl font-bold text-white mb-2">{points}</p>
          <p className="text-[#f5a623] font-medium">points</p>
        </div>
      </div>

      {/* Redeem info */}
      <div className="bg-[#080808] rounded-xl border border-white/5 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-5 h-5 text-[#f5a623]" />
          <h3 className="text-lg font-semibold text-white">Redeem Rewards</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#1a1a2e] rounded-lg p-4 border border-white/5">
            <p className="text-[#a0a0a0] text-xs mb-1">Exchange Rate</p>
            <p className="text-white font-bold">50 points = &euro;5 off</p>
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-4 border border-white/5">
            <p className="text-[#a0a0a0] text-xs mb-1">Available to Redeem</p>
            <p className="text-[#f5a623] font-bold">
              {redeemValue > 0 ? `\u20AC${redeemValue} off your next order` : 'Keep earning!'}
            </p>
          </div>
        </div>
        {points < 50 && (
          <p className="text-[#a0a0a0] text-sm mt-4 text-center">
            You need <span className="text-[#e94560] font-semibold">{50 - points}</span> more points to unlock your first reward.
          </p>
        )}
      </div>

      {/* Points history */}
      {loyalty?.history && loyalty.history.length > 0 && (
        <div className="bg-[#080808] rounded-xl border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <History className="w-5 h-5 text-[#a0a0a0]" />
            <h3 className="text-lg font-semibold text-white">Points History</h3>
          </div>
          <div className="space-y-3">
            {loyalty.history.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-[#e0e0e0] text-sm">{entry.description || entry.reason || 'Order'}</p>
                  <p className="text-[#a0a0a0] text-xs">
                    {entry.date ? new Date(entry.date).toLocaleDateString('en-IE', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    }) : '-'}
                  </p>
                </div>
                <span className={`font-bold text-sm ${entry.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {entry.points > 0 ? '+' : ''}{entry.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// FAVOURITES TAB
// ============================================================
function FavouritesTab({ authFetch }) {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const data = await authFetch('/customer/favourites');
        setFavourites(Array.isArray(data) ? data : data.favourites || data.favorites || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFavourites();
  }, [authFetch]);

  const handleRemove = async (id) => {
    try {
      await authFetch(`/customer/favourites/${id}`, { method: 'DELETE' });
      setFavourites((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#e94560] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (favourites.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-[#080808] rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10 text-[#a0a0a0]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Favourites Yet</h3>
        <p className="text-[#a0a0a0] mb-6">Heart items from the menu to save them here.</p>
        <a
          href="/menu"
          className="inline-flex items-center gap-2 bg-[#e94560] hover:bg-[#d13350] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Browse Menu
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-2">
        Your Favourites
        <span className="text-[#a0a0a0] text-sm font-normal ml-2">({favourites.length} items)</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {favourites.map((item) => (
          <div
            key={item.id}
            className="bg-[#080808] rounded-xl border border-white/5 p-5 hover:border-[#e94560]/30 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold group-hover:text-[#e94560] transition-colors truncate">
                  {item.item_name}
                </h4>
                {item.description && (
                  <p className="text-[#a0a0a0] text-sm mt-1 line-clamp-2">{item.description}</p>
                )}
                {item.category && (
                  <span className="inline-block mt-2 text-xs text-[#f5a623] bg-[#f5a623]/10 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="bg-[#e94560] text-white text-sm font-bold px-3 py-1 rounded-lg">
                  &euro;{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                </span>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-[#a0a0a0] hover:text-red-400 transition-colors"
                  aria-label="Remove from favourites"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN ACCOUNT PAGE
// ============================================================
export default function Account() {
  const { user, logout, updateProfile, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab user={user} updateProfile={updateProfile} authFetch={authFetch} />;
      case 'orders':
        return <OrdersTab authFetch={authFetch} />;
      case 'addresses':
        return <AddressesTab authFetch={authFetch} />;
      case 'loyalty':
        return <LoyaltyTab authFetch={authFetch} />;
      case 'favourites':
        return <FavouritesTab authFetch={authFetch} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              My <span className="text-[#e94560]">Account</span>
            </h1>
            <p className="text-[#a0a0a0] mt-1">Manage your profile, orders, and more</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-[#a0a0a0] hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar navigation */}
          <aside className="lg:w-64 shrink-0">
            <nav className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
              {/* Mobile: horizontal scroll tabs */}
              <div className="lg:hidden flex overflow-x-auto scrollbar-hide">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3.5 whitespace-nowrap text-sm font-medium transition-colors border-b-2 ${
                        isActive
                          ? 'text-[#e94560] border-[#e94560] bg-[#e94560]/5'
                          : 'text-[#a0a0a0] border-transparent hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Desktop: vertical nav */}
              <div className="hidden lg:block p-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[#e94560]/10 text-[#e94560]'
                          : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#e94560]' : ''}`} />
                      {tab.label}
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-6 md:p-8">
              {renderTab()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
