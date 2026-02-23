import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Star,
  GripVertical,
  Eye,
  EyeOff,
  Euro,
  UtensilsCrossed,
  Check,
} from 'lucide-react';
import { admin as adminApi, menu as menuApi } from '../../utils/api';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category_id: '',
  popular: false,
  active: true,
};

export default function MenuManager() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingActive, setTogglingActive] = useState({});

  const fetchMenu = useCallback(async () => {
    try {
      const data = await menuApi.getMenu();
      // API returns { menu: [{ ...category, items: [...] }], status: {...} }
      const cats = (data.menu || []).map(({ items: _items, ...cat }) => cat);
      const allItems = (data.menu || []).flatMap((cat) =>
        (cat.items || []).map((item) => ({ ...item, category_id: item.category_id || cat.id }))
      );
      setCategories(cats);
      setItems(allItems);
      if (!selectedCategory && cats.length > 0) {
        setSelectedCategory(cats[0].id);
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      !selectedCategory || item.category_id === selectedCategory;
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      ...EMPTY_FORM,
      category_id: selectedCategory || categories[0]?.id || '',
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price?.toString() || '',
      category_id: item.category_id || '',
      popular: !!item.popular,
      active: item.active !== false,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category_id) return;

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category_id: form.category_id,
        popular: form.popular,
        active: form.active,
      };

      if (editingItem) {
        await adminApi.updateMenuItem(editingItem.id, payload);
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id ? { ...i, ...payload } : i
          )
        );
      } else {
        const created = await adminApi.addMenuItem(payload);
        setItems((prev) => [...prev, created.item || created]);
      }

      closeModal();
    } catch (err) {
      console.error('Failed to save item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId) => {
    setDeleting(true);
    try {
      await adminApi.deleteMenuItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (item) => {
    setTogglingActive((prev) => ({ ...prev, [item.id]: true }));
    try {
      const newActive = !item.active;
      await adminApi.updateMenuItem(item.id, { active: newActive });
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, active: newActive } : i
        )
      );
    } catch (err) {
      console.error('Failed to toggle active:', err);
    } finally {
      setTogglingActive((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#e94560] animate-spin" />
          <p className="text-[#a0a0a0] text-sm">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-red-500/20 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load Menu</h2>
          <p className="text-[#a0a0a0] mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchMenu();
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Menu Manager</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">
            {items.length} items across {categories.length} categories
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-[#e94560] hover:bg-[#d13350] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#e94560]/25"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Search + category tabs */}
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
          <input
            type="text"
            placeholder="Search menu items..."
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

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              !selectedCategory
                ? 'bg-[#e94560] text-white shadow-lg shadow-[#e94560]/25'
                : 'bg-[#1a1a2e] text-[#a0a0a0] hover:text-white border border-white/5 hover:border-white/10'
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#e94560] text-white shadow-lg shadow-[#e94560]/25'
                    : 'bg-[#1a1a2e] text-[#a0a0a0] hover:text-white border border-white/5 hover:border-white/10'
                }`}
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-[#1a1a2e] rounded-2xl p-5 border transition-all duration-300 hover:shadow-lg group relative ${
              item.active !== false
                ? 'border-white/5 hover:border-[#e94560]/20 hover:shadow-[#e94560]/5'
                : 'border-white/5 opacity-60'
            }`}
          >
            {/* Drag handle (visual only) */}
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-[#a0a0a0] cursor-grab" />
            </div>

            {/* Popular badge */}
            {item.popular && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f5a623]/15 text-[#f5a623] text-[10px] font-bold uppercase tracking-wider">
                  <Star className="w-3 h-3" />
                  Popular
                </span>
              </div>
            )}

            <div className="pt-2">
              <h3 className="text-white font-semibold text-base mb-1 pr-16">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-[#a0a0a0] text-sm line-clamp-2 mb-3">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[#e94560] font-bold text-lg">
                  {'\u20AC'}
                  {(item.price ?? 0).toFixed(2)}
                </span>

                <div className="flex items-center gap-1">
                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggleActive(item)}
                    disabled={!!togglingActive[item.id]}
                    className={`p-2 rounded-lg transition-all ${
                      item.active !== false
                        ? 'text-emerald-400 hover:bg-emerald-400/10'
                        : 'text-[#a0a0a0] hover:bg-white/5'
                    }`}
                    title={item.active !== false ? 'Active - click to deactivate' : 'Inactive - click to activate'}
                  >
                    {togglingActive[item.id] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : item.active !== false ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-lg text-[#a0a0a0] hover:text-[#e94560] hover:bg-[#e94560]/10 transition-all"
                    title="Edit item"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteConfirm(item)}
                    className="p-2 rounded-lg text-[#a0a0a0] hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <UtensilsCrossed className="w-12 h-12 text-[#a0a0a0]/30 mb-3" />
            <p className="text-[#a0a0a0]">
              {search ? 'No items match your search' : 'No items in this category'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={closeModal}
                className="text-[#a0a0a0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#e0e0e0] mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Chicken Tikka Masala"
                  required
                  className="w-full px-4 py-2.5 bg-[#080808] border border-white/10 rounded-lg text-white placeholder-[#a0a0a0]/50 text-sm focus:outline-none focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#e0e0e0] mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief description of the dish"
                  rows="3"
                  className="w-full px-4 py-2.5 bg-[#080808] border border-white/10 rounded-lg text-white placeholder-[#a0a0a0]/50 text-sm focus:outline-none focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30 transition-all resize-none"
                />
              </div>

              {/* Price + Category row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#e0e0e0] mb-1.5">
                    Price *
                  </label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                      placeholder="0.00"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#080808] border border-white/10 rounded-lg text-white placeholder-[#a0a0a0]/50 text-sm focus:outline-none focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#e0e0e0] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        category_id: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-2.5 bg-[#080808] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#e94560]/50 appearance-none cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, popular: !prev.popular }))
                    }
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      form.popular
                        ? 'bg-[#f5a623] border-[#f5a623]'
                        : 'bg-transparent border-white/20 hover:border-white/40'
                    }`}
                  >
                    {form.popular && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className="text-sm text-[#e0e0e0]">Popular</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, active: !prev.active }))
                    }
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      form.active
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-transparent border-white/20 hover:border-white/40'
                    }`}
                  >
                    {form.active && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className="text-sm text-[#e0e0e0]">Active</span>
                </label>
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
                  ) : editingItem ? (
                    'Update Item'
                  ) : (
                    'Add Item'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-sm p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Delete Item</h3>
              <p className="text-[#a0a0a0] text-sm mb-6">
                Are you sure you want to delete{' '}
                <span className="text-white font-medium">{deleteConfirm.name}</span>?
                This cannot be undone.
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
