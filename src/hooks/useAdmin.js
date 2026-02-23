/**
 * useAdmin -- hook for the admin dashboard.
 *
 * Provides:
 *   dashboard       - summary stats (revenue, order counts, etc.)
 *   orders          - filtered admin order list
 *   settings        - restaurant settings
 *   loading         - true while any fetch is in progress
 *   error           - error message string, or null
 *
 *   fetchDashboard  - load / refresh dashboard data
 *   fetchOrders     - load orders with optional status/date filter
 *   updateOrderStatus - change an order's status
 *   streamOrders    - start SSE for live order updates (returns cleanup fn)
 *
 *   fetchSettings   - load restaurant settings
 *   saveSettings    - update restaurant settings
 *   toggleOpen      - toggle restaurant open/closed
 *   toggleBusy      - toggle busy mode
 *   togglePause     - toggle pause mode
 *
 *   fetchReports    - load reports for a date range
 *   reports         - report data
 *
 *   promos          - promo code list
 *   fetchPromos     - load promo codes
 *   createPromo     - create a promo code
 *   updatePromo     - update a promo code
 *   deletePromo     - delete a promo code
 *
 *   customers       - customer list
 *   fetchCustomers  - load customer list
 *
 *   addMenuItem     - add a menu item
 *   updateMenuItem  - update a menu item
 *   deleteMenuItem  - deactivate a menu item
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { admin as adminApi } from '../utils/api';
import { toast } from '../utils/toast';

export function useAdmin() {
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [reports, setReports] = useState(null);
  const [promos, setPromos] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Helper to guard state updates after unmount
  function safe(fn) {
    return (...args) => {
      if (mountedRef.current) fn(...args);
    };
  }

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getDashboard();
      safe(setDashboard)(data);
    } catch (err) {
      safe(setError)(err.message);
    } finally {
      safe(setLoading)(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Orders
  // ---------------------------------------------------------------------------

  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getOrders(params);
      safe(setOrders)(Array.isArray(data) ? data : data?.orders ?? []);
    } catch (err) {
      safe(setError)(err.message);
    } finally {
      safe(setLoading)(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (id, status) => {
    try {
      const updated = await adminApi.updateOrderStatus(id, status);
      // Optimistic update in local state
      safe(setOrders)((prev) =>
        prev.map((o) => (String(o.id) === String(id) ? { ...o, status, ...updated } : o))
      );
      toast.success(`Order #${id} updated to ${status}`);
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
      return null;
    }
  }, []);

  /**
   * Subscribe to real-time order updates.
   * Returns a cleanup function to close the connection.
   */
  const streamOrders = useCallback(() => {
    // Close any previous connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = adminApi.streamOrders();
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const update = JSON.parse(event.data);

        if (update.type === 'new_order' || update.new) {
          // New order -- prepend to list
          setOrders((prev) => {
            const exists = prev.some((o) => String(o.id) === String(update.id));
            if (exists) return prev;
            return [update, ...prev];
          });
          toast.info(`New order #${update.id} received!`);
        } else {
          // Status update -- merge into existing
          const updateId = update.order_id || update.id;
          setOrders((prev) =>
            prev.map((o) =>
              String(o.id) === String(updateId) ? { ...o, ...update } : o
            )
          );
        }
      } catch {
        // Heartbeat or non-JSON -- ignore
      }
    };

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED && mountedRef.current) {
        console.warn('Admin order SSE connection closed');
        toast.warning('Live order feed disconnected. Refresh to reconnect.');
      }
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings();
      safe(setSettings)(data);
    } catch (err) {
      safe(setError)(err.message);
    } finally {
      safe(setLoading)(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings) => {
    try {
      const updated = await adminApi.updateSettings(newSettings);
      safe(setSettings)(updated ?? newSettings);
      toast.success('Settings saved');
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
      return null;
    }
  }, []);

  const toggleOpen = useCallback(async () => {
    try {
      const result = await adminApi.toggleOpen();
      toast.success(result?.open ? 'Restaurant is now open' : 'Restaurant is now closed');
      // Refresh settings to stay in sync
      safe(setSettings)((prev) => (prev ? { ...prev, open: result?.open } : prev));
      return result;
    } catch (err) {
      toast.error(err.message || 'Failed to toggle open status');
      return null;
    }
  }, []);

  const toggleBusy = useCallback(async () => {
    try {
      const result = await adminApi.toggleBusy();
      toast.info(result?.busy ? 'Busy mode enabled' : 'Busy mode disabled');
      safe(setSettings)((prev) => (prev ? { ...prev, busy: result?.busy } : prev));
      return result;
    } catch (err) {
      toast.error(err.message || 'Failed to toggle busy mode');
      return null;
    }
  }, []);

  const togglePause = useCallback(async () => {
    try {
      const result = await adminApi.togglePause();
      toast.warning(result?.paused ? 'Orders paused' : 'Orders resumed');
      safe(setSettings)((prev) => (prev ? { ...prev, paused: result?.paused } : prev));
      return result;
    } catch (err) {
      toast.error(err.message || 'Failed to toggle pause');
      return null;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Reports
  // ---------------------------------------------------------------------------

  const fetchReports = useCallback(async (from, to) => {
    setLoading(true);
    try {
      const data = await adminApi.getReports(from, to);
      safe(setReports)(data);
      return data;
    } catch (err) {
      safe(setError)(err.message);
      return null;
    } finally {
      safe(setLoading)(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Promos
  // ---------------------------------------------------------------------------

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPromos();
      safe(setPromos)(Array.isArray(data) ? data : data?.promos ?? []);
    } catch (err) {
      safe(setError)(err.message);
    } finally {
      safe(setLoading)(false);
    }
  }, []);

  const createPromo = useCallback(async (promo) => {
    try {
      const created = await adminApi.createPromo(promo);
      safe(setPromos)((prev) => [...prev, created]);
      toast.success('Promo code created');
      return created;
    } catch (err) {
      toast.error(err.message || 'Failed to create promo');
      return null;
    }
  }, []);

  const updatePromo = useCallback(async (id, promo) => {
    try {
      const updated = await adminApi.updatePromo(id, promo);
      safe(setPromos)((prev) =>
        prev.map((p) => (String(p.id) === String(id) ? { ...p, ...updated } : p))
      );
      toast.success('Promo code updated');
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update promo');
      return null;
    }
  }, []);

  const deletePromo = useCallback(async (id) => {
    try {
      await adminApi.deletePromo(id);
      safe(setPromos)((prev) => prev.filter((p) => String(p.id) !== String(id)));
      toast.success('Promo code deleted');
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to delete promo');
      return false;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Customers
  // ---------------------------------------------------------------------------

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCustomers();
      safe(setCustomers)(Array.isArray(data) ? data : data?.customers ?? []);
    } catch (err) {
      safe(setError)(err.message);
    } finally {
      safe(setLoading)(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Menu management
  // ---------------------------------------------------------------------------

  const addMenuItem = useCallback(async (item) => {
    try {
      const created = await adminApi.addMenuItem(item);
      toast.success(`Menu item "${item.name || 'New item'}" added`);
      return created;
    } catch (err) {
      toast.error(err.message || 'Failed to add menu item');
      return null;
    }
  }, []);

  const updateMenuItem = useCallback(async (id, item) => {
    try {
      const updated = await adminApi.updateMenuItem(id, item);
      toast.success('Menu item updated');
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update menu item');
      return null;
    }
  }, []);

  const deleteMenuItem = useCallback(async (id) => {
    try {
      await adminApi.deleteMenuItem(id);
      toast.success('Menu item deactivated');
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate menu item');
      return false;
    }
  }, []);

  return {
    // State
    dashboard,
    orders,
    settings,
    reports,
    promos,
    customers,
    loading,
    error,

    // Dashboard
    fetchDashboard,

    // Orders
    fetchOrders,
    updateOrderStatus,
    streamOrders,

    // Settings
    fetchSettings,
    saveSettings,
    toggleOpen,
    toggleBusy,
    togglePause,

    // Reports
    fetchReports,

    // Promos
    fetchPromos,
    createPromo,
    updatePromo,
    deletePromo,

    // Customers
    fetchCustomers,

    // Menu management
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
}
