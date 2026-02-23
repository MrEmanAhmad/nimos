import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Tag,
  Check,
  Percent,
  Euro,
  Calendar,
  ShoppingCart,
  Hash,
} from 'lucide-react';
import { admin as adminApi } from '../../utils/api';

const EMPTY_FORM = {
  code: '',
  type: 'percentage',
  value: '',
  min_order: '',
  max_uses: '',
  expires_at: '',
};

export default function Promos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchPromos = useCallback(async () => {
    try {
      const data = await adminApi.getPromos();
      setPromos(Array.isArray(data) ? data : data.promos || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load promos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const openAddModal = () => {
    setEditingPromo(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setForm({
      code: promo.code || '',
      type: promo.type || 'percentage',
      value: promo.value?.toString() || '',
      min_order: promo.min_order?.toString() || '',
      max_uses: promo.max_uses?.toString() || '',
      expires_at: promo.expires_at
        ? new Date(promo.expires_at).toISOString().split('T')[0]
        : '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPromo(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) return;

    setSubmitting(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        min_order: form.min_order ? parseFloat(form.min_order) : null,
        max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
        expires_at: form.expires_at || null,
      };

      if (editingPromo) {
        const updated = await adminApi.updatePromo(editingPromo.id, payload);
        setPromos((prev) =>
          prev.map((p) =>
            p.id === editingPromo.id
              ? { ...p, ...payload, ...(updated.promo || updated) }
              : p
          )
        );
      } else {
        const created = await adminApi.createPromo(payload);
        setPromos((prev) => [...prev, created.promo || created]);
      }

      closeModal();
    } catch (err) {
      console.error('Failed to save promo:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (promoId) => {
    setDeleting(true);
    try {
      await adminApi.deletePromo(promoId);
      setPromos((prev) => prev.filter((p) => p.id !== promoId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete promo:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = async (code, id) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const isExpired = (promo) => {
    if (!promo.expires_at) return false;
    return new Date(promo.expires_at) < new Date();
  };

  const isMaxedOut = (promo) => {
    if (!promo.max_uses) return false;
    return (promo.used_count || 0) >= promo.max_uses;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#e94560] animate-spin" />
          <p className="text-[#a0a0a0] text-sm">Loading promos...</p>
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
              fetchPromos();
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Promo Codes</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">
            {promos.length} promo code{promos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-[#e94560] hover:bg-[#d13350] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#e94560]/25"
        >
          <Plus className="w-4 h-4" />
          Create Promo
        </button>
      </div>

      {/* Promo cards */}
      {promos.length === 0 ? (
        <div className="bg-[#1a1a2e] rounded-2xl p-12 border border-white/5 text-center">
          <Tag className="w-12 h-12 text-[#a0a0a0]/30 mx-auto mb-3" />
          <p className="text-[#a0a0a0] mb-4">No promo codes yet</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#e94560] hover:bg-[#d13350] text-white font-semibold rounded-xl text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Your First Promo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promos.map((promo) => {
            const expired = isExpired(promo);
            const maxedOut = isMaxedOut(promo);
            const inactive = expired || maxedOut || promo.active === false;

            return (
              <div
                key={promo.id}
                className={`bg-[#1a1a2e] rounded-2xl p-5 border transition-all duration-300 ${
                  inactive
                    ? 'border-white/5 opacity-60'
                    : 'border-white/5 hover:border-[#e94560]/20 hover:shadow-lg hover:shadow-[#e94560]/5'
                }`}
              >
                {/* Code + status */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-white font-bold text-lg tracking-wider">
                        {promo.code}
                      </code>
                      <button
                        onClick={() => handleCopy(promo.code, promo.id)}
                        className="text-[#a0a0a0] hover:text-[#e94560] transition-colors"
                        title="Copy code"
                      >
                        {copiedId === promo.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        inactive
                          ? expired
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-white/10 text-[#a0a0a0]'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {expired ? 'Expired' : maxedOut ? 'Maxed Out' : promo.active === false ? 'Inactive' : 'Active'}
                    </span>
                  </div>

                  {/* Value display */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[#e94560]">
                      {promo.type === 'percentage' ? (
                        <>
                          <span className="text-2xl font-bold">{promo.value}</span>
                          <Percent className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <Euro className="w-4 h-4" />
                          <span className="text-2xl font-bold">
                            {promo.value?.toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-[10px] text-[#a0a0a0] uppercase">
                      {promo.type === 'percentage' ? 'Off' : 'Flat off'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {promo.min_order > 0 && (
                    <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>
                        Min. order: {'\u20AC'}
                        {promo.min_order?.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {promo.max_uses && (
                    <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
                      <Hash className="w-3.5 h-3.5" />
                      <span>
                        Used: {promo.used_count || 0} / {promo.max_uses}
                      </span>
                    </div>
                  )}
                  {promo.expires_at && (
                    <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Expires:{' '}
                        {new Date(promo.expires_at).toLocaleDateString('en-IE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => openEditModal(promo)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-[#a0a0a0] hover:text-white rounded-lg text-xs font-medium transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(promo)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-red-500/15 text-[#a0a0a0] hover:text-red-400 rounded-lg text-xs font-medium transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">
                {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
              </h2>
              <button
                onClick={closeModal}
                className="text-[#a0a0a0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-[#e0e0e0] mb-1.5">
                  Promo Code *
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. WELCOME20"
                  required
                  className="w-full px-4 py-2.5 bg-[#080808] border border-white/10 rounded-lg text-white placeholder-[#a0a0a0]/50 text-sm focus:outline-none focus:border-[#e94560]/50 font-mono tracking-wider uppercase"
                />
              </div>

              {/* Type + Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#e0e0e0] mb-1.5">
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-[#080808] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#e94560]/50 appearance-none cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e0e0e0] mb-1.5">
                    Value *
                  </label>
                  <div className="relative">
                    {form.type === 'percentage' ? (
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
                    ) : (
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
                    )}
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.value}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, value: e.target.value }))
                      }
                      placeholder={form.type === 'percentage' ? '20' : '5.00'}
                      required
                      className={`w-full py-2.5 bg-[#080808] border border-white/10 rounded-lg text-white placeholder-[#a0a0a0]/50 text-sm focus:outline-none focus:border-[#e94560]/50 ${
                        form.type === 'percentage' ? 'px-4 pr-10' : 'pl-10 pr-4'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Min order */}
              <div>
                <label className="block text-sm font-medium text-[#e0e0e0] mb-1.5">
                  Minimum Order Amount
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.min_order}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        min_order: e.target.value,
                      }))
                    }
                    placeholder="No minimum"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#080808] border border-white/10 rounded-lg text-white placeholder-[#a0a0a0]/50 text-sm focus:outline-none focus:border-[#e94560]/50"
                  />
                </div>
              </div>

              {/* Max uses + expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#e0e0e0] mb-1.5">
                    Max Uses
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.max_uses}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        max_uses: e.target.value,
                      }))
                    }
                    placeholder="Unlimited"
                    className="w-full px-4 py-2.5 bg-[#080808] border border-white/10 rounded-lg text-white placeholder-[#a0a0a0]/50 text-sm focus:outline-none focus:border-[#e94560]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e0e0e0] mb-1.5">
                    Expires At
                  </label>
                  <input
                    type="date"
                    value={form.expires_at}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        expires_at: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-[#080808] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#e94560]/50 appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-[#a0a0a0] hover:text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e94560] hover:bg-[#d13350] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#e94560]/25"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingPromo ? (
                    'Update Promo'
                  ) : (
                    'Create Promo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-sm p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Delete Promo Code
              </h3>
              <p className="text-[#a0a0a0] text-sm mb-6">
                Are you sure you want to delete{' '}
                <code className="text-white font-mono font-semibold">
                  {deleteConfirm.code}
                </code>
                ?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2.5 text-[#a0a0a0] hover:text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
