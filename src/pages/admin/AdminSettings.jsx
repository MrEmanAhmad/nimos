import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  Store,
  AlertCircle,
  Pause,
  Clock,
  Truck,
  Euro,
  Award,
  Save,
  Check,
} from 'lucide-react';
import { admin as adminApi } from '../../utils/api';

// ---------------------------------------------------------------------------
// Toggle Switch component
// ---------------------------------------------------------------------------

function ToggleSwitch({ enabled, onChange, loading, activeColor = 'bg-emerald-500' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={loading}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#e94560]/40 disabled:opacity-50 disabled:cursor-not-allowed ${
        enabled ? activeColor : 'bg-white/10'
      }`}
    >
      {loading ? (
        <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white animate-spin" />
      ) : (
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Number field component
// ---------------------------------------------------------------------------

function NumberField({ label, value, onChange, suffix, min = 0, step = 1 }) {
  return (
    <div>
      <label className="block text-sm text-[#a0a0a0] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          min={min}
          step={step}
          className="w-full px-3 py-2.5 bg-[#080808] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#e94560]/50 focus:ring-1 focus:ring-[#e94560]/30 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] text-xs pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section save button
// ---------------------------------------------------------------------------

function SaveButton({ onClick, saving, saved, label = 'Save Changes' }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
        saved
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
          : 'bg-[#e94560] hover:bg-[#d13350] text-white shadow-lg shadow-[#e94560]/25'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {saving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </>
      ) : saved ? (
        <>
          <Check className="w-4 h-4" />
          Saved
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          {label}
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// AdminSettings page
// ---------------------------------------------------------------------------

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toggle loading states
  const [toggling, setToggling] = useState({});

  // Delivery section local state
  const [delivery, setDelivery] = useState({
    delivery_time_min: 30,
    pickup_time_min: 15,
    delivery_min_order: 0,
  });
  const [deliverySaving, setDeliverySaving] = useState(false);
  const [deliverySaved, setDeliverySaved] = useState(false);

  // Loyalty section local state
  const [loyalty, setLoyalty] = useState({
    loyalty_rate: 1,
    loyalty_redeem_threshold: 100,
    loyalty_redeem_value: 5,
  });
  const [loyaltySaving, setLoyaltySaving] = useState(false);
  const [loyaltySaved, setLoyaltySaved] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await adminApi.getSettings();
      setSettings(data);

      setDelivery({
        delivery_time_min: data.delivery_time_min ?? 30,
        pickup_time_min: data.pickup_time_min ?? 15,
        delivery_min_order: data.delivery_min_order ?? 0,
      });

      setLoyalty({
        loyalty_rate: data.loyalty_rate ?? data.loyalty_points_per_euro ?? 1,
        loyalty_redeem_threshold: data.loyalty_redeem_threshold ?? 100,
        loyalty_redeem_value: data.loyalty_redeem_value ?? 5,
      });

      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // -----------------------------------------------------------------------
  // Toggle handlers
  // -----------------------------------------------------------------------

  const handleToggle = async (apiMethod, settingsKey, responseKey) => {
    setToggling((prev) => ({ ...prev, [settingsKey]: true }));
    try {
      const result = await apiMethod();
      setSettings((prev) => ({
        ...prev,
        [settingsKey]: result[responseKey],
      }));
    } catch (err) {
      console.error(`Failed to toggle ${settingsKey}:`, err);
    } finally {
      setToggling((prev) => ({ ...prev, [settingsKey]: false }));
    }
  };

  // -----------------------------------------------------------------------
  // Section save handlers
  // -----------------------------------------------------------------------

  const handleSaveDelivery = async () => {
    setDeliverySaving(true);
    setDeliverySaved(false);
    try {
      const payload = {
        delivery_time_min: Number(delivery.delivery_time_min) || 0,
        pickup_time_min: Number(delivery.pickup_time_min) || 0,
        delivery_min_order: Number(delivery.delivery_min_order) || 0,
      };
      const updated = await adminApi.updateSettings(payload);
      if (updated) setSettings((prev) => ({ ...prev, ...updated }));
      else setSettings((prev) => ({ ...prev, ...payload }));
      setDeliverySaved(true);
      setTimeout(() => setDeliverySaved(false), 2500);
    } catch (err) {
      console.error('Failed to save delivery settings:', err);
      setError(err.message || 'Failed to save delivery settings');
    } finally {
      setDeliverySaving(false);
    }
  };

  const handleSaveLoyalty = async () => {
    setLoyaltySaving(true);
    setLoyaltySaved(false);
    try {
      const payload = {
        loyalty_rate: Number(loyalty.loyalty_rate) || 0,
        loyalty_redeem_threshold: Number(loyalty.loyalty_redeem_threshold) || 0,
        loyalty_redeem_value: Number(loyalty.loyalty_redeem_value) || 0,
      };
      const updated = await adminApi.updateSettings(payload);
      if (updated) setSettings((prev) => ({ ...prev, ...updated }));
      else setSettings((prev) => ({ ...prev, ...payload }));
      setLoyaltySaved(true);
      setTimeout(() => setLoyaltySaved(false), 2500);
    } catch (err) {
      console.error('Failed to save loyalty settings:', err);
      setError(err.message || 'Failed to save loyalty settings');
    } finally {
      setLoyaltySaving(false);
    }
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#e94560] animate-spin" />
          <p className="text-[#a0a0a0] text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-red-500/20 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load</h2>
          <p className="text-[#a0a0a0] mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchSettings();
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">
            Manage restaurant configuration
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchSettings();
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-[#a0a0a0] hover:text-white rounded-xl text-sm font-medium transition-all border border-white/5"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Inline error banner */}
      {error && settings && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-400 text-sm flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 text-sm font-medium shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Section 1: Restaurant Status */}
      <div className="bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Store className="w-5 h-5 text-[#e94560]" />
          Restaurant Status
        </h2>

        <div className="space-y-4">
          {/* Open / Closed */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#080808] border border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                settings?.restaurant_open ? 'bg-emerald-500/15' : 'bg-red-500/15'
              }`}>
                <Store className={`w-5 h-5 ${
                  settings?.restaurant_open ? 'text-emerald-400' : 'text-red-400'
                }`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {settings?.restaurant_open ? 'Restaurant Open' : 'Restaurant Closed'}
                </p>
                <p className="text-xs text-[#a0a0a0]">
                  Controls whether customers can place orders
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={!!settings?.restaurant_open}
              loading={!!toggling.restaurant_open}
              activeColor="bg-emerald-500"
              onChange={() => handleToggle(adminApi.toggleOpen, 'restaurant_open', 'open')}
            />
          </div>

          {/* Busy Mode */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#080808] border border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                settings?.busy_mode ? 'bg-[#f5a623]/15' : 'bg-white/5'
              }`}>
                <AlertCircle className={`w-5 h-5 ${
                  settings?.busy_mode ? 'text-[#f5a623]' : 'text-[#a0a0a0]'
                }`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {settings?.busy_mode ? 'Busy Mode Active' : 'Busy Mode Off'}
                </p>
                <p className="text-xs text-[#a0a0a0]">
                  Shows extended wait time warnings to customers
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={!!settings?.busy_mode}
              loading={!!toggling.busy_mode}
              activeColor="bg-[#f5a623]"
              onChange={() => handleToggle(adminApi.toggleBusy, 'busy_mode', 'busy')}
            />
          </div>

          {/* Pause Orders */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#080808] border border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                settings?.orders_paused ? 'bg-red-500/15' : 'bg-white/5'
              }`}>
                <Pause className={`w-5 h-5 ${
                  settings?.orders_paused ? 'text-red-400' : 'text-[#a0a0a0]'
                }`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {settings?.orders_paused ? 'Orders Paused' : 'Orders Active'}
                </p>
                <p className="text-xs text-[#a0a0a0]">
                  Temporarily stop accepting new orders
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={!!settings?.orders_paused}
              loading={!!toggling.orders_paused}
              activeColor="bg-red-500"
              onChange={() => handleToggle(adminApi.togglePause, 'orders_paused', 'paused')}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Delivery & Pickup */}
      <div className="bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-white/5">
        <div className="flex items-center gap-2 mb-5">
          <Truck className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Delivery & Pickup</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <NumberField
            label="Delivery Time"
            value={delivery.delivery_time_min}
            onChange={(v) => setDelivery((prev) => ({ ...prev, delivery_time_min: v }))}
            suffix="min"
            min={0}
            step={5}
          />
          <NumberField
            label="Pickup Time"
            value={delivery.pickup_time_min}
            onChange={(v) => setDelivery((prev) => ({ ...prev, pickup_time_min: v }))}
            suffix="min"
            min={0}
            step={5}
          />
          <NumberField
            label="Min Delivery Order"
            value={delivery.delivery_min_order}
            onChange={(v) => setDelivery((prev) => ({ ...prev, delivery_min_order: v }))}
            suffix={'\u20AC'}
            min={0}
            step={0.5}
          />
        </div>

        <div className="flex justify-end">
          <SaveButton
            onClick={handleSaveDelivery}
            saving={deliverySaving}
            saved={deliverySaved}
            label="Save Delivery Settings"
          />
        </div>
      </div>

      {/* Section 3: Loyalty Programme */}
      <div className="bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-white/5">
        <div className="flex items-center gap-2 mb-5">
          <Award className="w-5 h-5 text-[#f5a623]" />
          <h2 className="text-lg font-semibold text-white">Loyalty Programme</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <NumberField
            label="Points per Euro"
            value={loyalty.loyalty_rate}
            onChange={(v) => setLoyalty((prev) => ({ ...prev, loyalty_rate: v }))}
            suffix="pts"
            min={0}
            step={0.5}
          />
          <NumberField
            label="Redeem Threshold"
            value={loyalty.loyalty_redeem_threshold}
            onChange={(v) => setLoyalty((prev) => ({ ...prev, loyalty_redeem_threshold: v }))}
            suffix="pts"
            min={0}
            step={10}
          />
          <NumberField
            label="Redeem Value"
            value={loyalty.loyalty_redeem_value}
            onChange={(v) => setLoyalty((prev) => ({ ...prev, loyalty_redeem_value: v }))}
            suffix={'\u20AC'}
            min={0}
            step={0.5}
          />
        </div>

        <p className="text-xs text-[#a0a0a0] mb-5">
          Customers earn {loyalty.loyalty_rate || 0} point{loyalty.loyalty_rate !== 1 ? 's' : ''} per
          {' \u20AC'}1 spent. At {loyalty.loyalty_redeem_threshold || 0} points they can
          redeem {'\u20AC'}{loyalty.loyalty_redeem_value || 0} off their order.
        </p>

        <div className="flex justify-end">
          <SaveButton
            onClick={handleSaveLoyalty}
            saving={loyaltySaving}
            saved={loyaltySaved}
            label="Save Loyalty Settings"
          />
        </div>
      </div>
    </div>
  );
}
