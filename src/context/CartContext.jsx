import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const STORAGE_KEY = 'nimos_cart';
const DELIVERY_MINIMUM = 15;

function loadCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Corrupt data — start fresh
  }
  return null;
}

function saveCart(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable
  }
}

export function CartProvider({ children }) {
  const stored = loadCart();

  const [items, setItems] = useState(stored?.items || []);
  const [orderType, setOrderType] = useState(stored?.orderType || 'pickup');
  const [deliveryAddress, setDeliveryAddress] = useState(stored?.deliveryAddress || '');
  const [phone, setPhone] = useState(stored?.phone || '');
  const [notes, setNotes] = useState(stored?.notes || '');
  const [promoCode, setPromoCode] = useState(stored?.promoCode || '');
  const [promoDiscount, setPromoDiscount] = useState(stored?.promoDiscount || 0);
  const [promoType, setPromoType] = useState(stored?.promoType || '');
  const [promoValue, setPromoValue] = useState(stored?.promoValue || 0);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist to localStorage on every state change
  useEffect(() => {
    saveCart({ items, orderType, deliveryAddress, phone, notes, promoCode, promoDiscount, promoType, promoValue });
  }, [items, orderType, deliveryAddress, phone, notes, promoCode, promoDiscount, promoType, promoValue]);

  const addItem = useCallback((menuItem, quantity = 1, selectedOptions = [], specialNotes = '') => {
    if (!menuItem || quantity < 1) return;
    const safeQuantity = Math.max(1, Math.floor(quantity));
    setItems(prev => [
      ...prev,
      {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        menuItem,
        quantity: safeQuantity,
        selectedOptions,
        specialNotes,
      },
    ]);
  }, []);

  const removeItem = useCallback((index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuantity = useCallback((index, quantity) => {
    if (quantity < 1 || quantity > 20) return;
    setItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode('');
    setPromoDiscount(0);
    setPromoType('');
    setPromoValue(0);
    setPromoError('');
    setNotes('');
  }, []);

  const applyPromo = useCallback(async (code, currentSubtotal) => {
    if (!code.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const token = localStorage.getItem('nimos_token') || sessionStorage.getItem('nimos_token');
      if (!token) {
        throw new Error('Please log in to use promo codes');
      }
      let res;
      try {
        res = await fetch(`${API_BASE}/orders/validate-promo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ code: code.trim(), subtotal: currentSubtotal || 0 }),
        });
      } catch {
        throw new Error('Network error. Please check your connection.');
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Invalid promo code');
      }
      setPromoCode(code.trim());
      setPromoType(data.type || '');
      setPromoValue(data.value || 0);
      setPromoDiscount(data.value || 0);
      setPromoError('');
    } catch (err) {
      setPromoError(err.message);
      setPromoCode('');
      setPromoType('');
      setPromoValue(0);
      setPromoDiscount(0);
    } finally {
      setPromoLoading(false);
    }
  }, []);

  const removePromo = useCallback(() => {
    setPromoCode('');
    setPromoType('');
    setPromoValue(0);
    setPromoDiscount(0);
    setPromoError('');
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

  // Computed values
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const basePrice = item.menuItem.price || 0;
      const optionsPrice = (item.selectedOptions || []).reduce(
        (optSum, opt) => optSum + (opt.price || 0),
        0
      );
      return sum + (basePrice + optionsPrice) * item.quantity;
    }, 0);
  }, [items]);

  const discount = useMemo(() => {
    if (!promoCode || !promoValue) return 0;
    let disc = 0;
    if (promoType === 'percentage') {
      disc = subtotal * (promoValue / 100);
    } else {
      disc = promoValue;
    }
    return Math.min(Math.round(disc * 100) / 100, subtotal);
  }, [subtotal, promoCode, promoType, promoValue]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const meetsMinimum = useMemo(() => {
    return orderType !== 'delivery' || subtotal >= DELIVERY_MINIMUM;
  }, [orderType, subtotal]);

  const canCheckout = useMemo(() => {
    return items.length > 0 && meetsMinimum;
  }, [items.length, meetsMinimum]);

  const value = {
    // State
    items,
    orderType,
    deliveryAddress,
    phone,
    notes,
    promoCode,
    promoDiscount,
    promoError,
    promoLoading,
    isCartOpen,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setOrderType,
    setDeliveryAddress,
    setPhone,
    setNotes,
    applyPromo,
    removePromo,
    openCart,
    closeCart,
    toggleCart,

    // Computed
    subtotal,
    discount,
    total,
    itemCount,
    meetsMinimum,
    canCheckout,

    // Constants
    DELIVERY_MINIMUM,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
