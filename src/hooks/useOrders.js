/**
 * useOrders -- hook for customer order operations.
 *
 * Provides:
 *   orders        - list of the customer's past orders
 *   currentOrder  - single order being tracked (set via trackOrder)
 *   loading       - true while any fetch is in progress
 *   error         - error message string, or null
 *   placeOrder    - submit a new order
 *   fetchOrders   - reload the order list
 *   fetchOrder    - fetch a single order by ID
 *   trackOrder    - start SSE tracking for a specific order
 *   stopTracking  - close the SSE connection
 *   validatePromo - validate a promo code against a subtotal
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { orders as ordersApi, admin as adminApi } from '../utils/api';
import { toast } from '../utils/toast';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  const eventSourceRef = useRef(null);
  const trackedOrderIdRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Clean up SSE on unmount
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch all orders for the logged-in customer
  // ---------------------------------------------------------------------------

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.getOrders();
      if (mountedRef.current) {
        setOrders(Array.isArray(data) ? data : data?.orders ?? []);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch a single order
  // ---------------------------------------------------------------------------

  const fetchOrder = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.getOrder(id);
      if (mountedRef.current) {
        setCurrentOrder(data);
      }
      return data;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Place a new order
  // ---------------------------------------------------------------------------

  const placeOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ordersApi.placeOrder(orderData);
      if (mountedRef.current) {
        setCurrentOrder(result);
        // Prepend to local list
        setOrders((prev) => [result, ...prev]);
        toast.success('Order placed successfully!');
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        toast.error(err.message || 'Failed to place order');
      }
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Validate promo code
  // ---------------------------------------------------------------------------

  const validatePromo = useCallback(async (code, subtotal) => {
    try {
      return await ordersApi.validatePromo(code, subtotal);
    } catch (err) {
      toast.error(err.message || 'Invalid promo code');
      return null;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // SSE order tracking
  // ---------------------------------------------------------------------------

  const stopTracking = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    trackedOrderIdRef.current = null;
  }, []);

  const trackOrder = useCallback(
    (orderId) => {
      // Close any existing connection
      stopTracking();

      if (!orderId) return;
      trackedOrderIdRef.current = orderId;

      // Fetch initial state
      fetchOrder(orderId);

      // Open SSE stream (admin stream carries all order updates)
      const es = adminApi.streamOrders();
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const update = JSON.parse(event.data);

          // Only process events for the tracked order
          const updateId = update.order_id || update.id;
          if (String(updateId) !== String(trackedOrderIdRef.current)) return;

          setCurrentOrder((prev) => {
            if (!prev) return update;
            return { ...prev, ...update };
          });

          // Also update in list
          setOrders((prev) =>
            prev.map((o) =>
              String(o.id) === String(updateId) ? { ...o, ...update } : o
            )
          );

          // Notify on meaningful status changes
          if (update.status) {
            const labels = {
              confirmed: 'Your order has been confirmed!',
              preparing: 'Your order is being prepared',
              ready: 'Your order is ready for pickup!',
              out_for_delivery: 'Your order is on its way!',
              delivered: 'Your order has been delivered',
              completed: 'Order complete. Enjoy your meal!',
              cancelled: 'Your order has been cancelled',
            };
            const msg = labels[update.status];
            if (msg) {
              toast.info(msg);
            }
          }
        } catch {
          // Non-JSON heartbeat or unknown format -- ignore
        }
      };

      es.onerror = () => {
        // EventSource will auto-reconnect for most errors.
        // If it transitions to CLOSED state the browser gave up.
        if (es.readyState === EventSource.CLOSED && mountedRef.current) {
          console.warn('Order tracking SSE connection closed');
        }
      };
    },
    [fetchOrder, stopTracking]
  );

  return {
    orders,
    currentOrder,
    loading,
    error,
    placeOrder,
    fetchOrders,
    fetchOrder,
    trackOrder,
    stopTracking,
    validatePromo,
  };
}
