import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Truck,
  Store,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Tag,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Minus,
  Plus,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { siteInfo } from '../data/siteInfo';
import StripePayment from '../components/StripePayment';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Checkout() {
  const navigate = useNavigate();
  const {
    items,
    orderType,
    setOrderType,
    deliveryAddress,
    setDeliveryAddress,
    phone,
    setPhone,
    notes,
    setNotes,
    subtotal,
    discount,
    total,
    itemCount,
    promoCode,
    promoDiscount,
    promoType,
    promoValue,
    promoError,
    promoLoading,
    applyPromo,
    removePromo,
    clearCart,
    meetsMinimum,
    canCheckout,
    DELIVERY_MINIMUM,
    removeItem,
    updateQuantity,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [scheduleOrder, setScheduleOrder] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(true);
  const [promoInput, setPromoInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      const timer = setTimeout(() => navigate('/menu'), 100);
      return () => clearTimeout(timer);
    }
  }, [items.length, navigate]);

  const getItemPrice = (item) => {
    const basePrice = item.menuItem.price || 0;
    const optionsPrice = (item.selectedOptions || []).reduce(
      (sum, opt) => sum + (opt.price || 0),
      0
    );
    return (basePrice + optionsPrice) * item.quantity;
  };

  const validate = () => {
    const errors = {};
    if (!customerName.trim()) errors.name = 'Name is required';
    if (!phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\d\s+\-()]{7,20}$/.test(phone.trim())) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (orderType === 'delivery') {
      if (!deliveryAddress.trim()) {
        errors.address = 'Delivery address is required';
      } else if (deliveryAddress.trim().length < 10) {
        errors.address = 'Please enter a full delivery address';
      }
    }
    if (orderType === 'delivery' && !meetsMinimum) {
      errors.minimum = `Minimum order for delivery is ${DELIVERY_MINIMUM.toFixed(2)}`;
    }
    if (scheduleOrder && (!scheduledDate || !scheduledTime)) {
      errors.schedule = 'Please select date and time for scheduled order';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');

    const orderData = {
      items: items.map(item => ({
        menu_item_id: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        options: (item.selectedOptions || []).map(opt => ({
          choice_id: opt.choice_id || opt.id,
          name: opt.name,
          price: opt.price || 0,
        })),
        notes: item.specialNotes || '',
      })),
      type: orderType,
      customer_name: customerName.trim(),
      phone: phone.trim(),
      delivery_address: orderType === 'delivery' ? deliveryAddress.trim() : null,
      notes: notes.trim() || null,
      payment_method: paymentMethod,
      promo_code: promoCode || null,
      scheduled_for: scheduleOrder ? `${scheduledDate}T${scheduledTime}` : null,
      subtotal,
      discount,
      total,
    };

    try {
      const token = localStorage.getItem('nimos_token');
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to place order');
      }

      clearCart();
      navigate(`/order-confirmed/${data.order_id || data.id}`);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-8 h-8 text-[#a0a0a0]/40" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Your cart is empty</h2>
          <p className="text-[#a0a0a0] text-sm mb-6">Add some items from our menu to checkout.</p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-[#e94560] hover:bg-[#d13350] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Hero */}
      <section className="pt-28 pb-8 px-4 bg-[#0f0f0f]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
            <span className="text-[#e94560]">Checkout</span>
          </h1>
          <p className="text-[#a0a0a0] text-sm">
            {itemCount} item{itemCount !== 1 ? 's' : ''} in your order
          </p>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left column — Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Order Type */}
              <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
                <h2 className="text-white font-bold text-lg mb-4">Order Type</h2>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Order type: delivery or pickup">
                  <button
                    onClick={() => setOrderType('delivery')}
                    role="radio"
                    aria-checked={orderType === 'delivery'}
                    aria-label="Delivery, approximately 60 minutes, Thursday to Sunday 3pm to 10:30pm"
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-300 ${
                      orderType === 'delivery'
                        ? 'border-[#e94560] bg-[#e94560]/5'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                    }`}
                  >
                    <Truck className={`w-6 h-6 ${orderType === 'delivery' ? 'text-[#e94560]' : 'text-[#a0a0a0]'}`} aria-hidden="true" />
                    <div className="text-center">
                      <p className={`font-semibold text-sm ${orderType === 'delivery' ? 'text-white' : 'text-[#e0e0e0]'}`}>
                        Delivery
                      </p>
                      <p className="text-[#a0a0a0] text-xs mt-1">~60 min</p>
                      <p className="text-[#a0a0a0] text-[10px] mt-0.5">Thu-Sun, 3pm-10:30pm</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setOrderType('pickup')}
                    role="radio"
                    aria-checked={orderType === 'pickup'}
                    aria-label="Pickup, approximately 15 minutes, Monday to Sunday 3pm to 10:30pm"
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-300 ${
                      orderType === 'pickup'
                        ? 'border-[#e94560] bg-[#e94560]/5'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                    }`}
                  >
                    <Store className={`w-6 h-6 ${orderType === 'pickup' ? 'text-[#e94560]' : 'text-[#a0a0a0]'}`} aria-hidden="true" />
                    <div className="text-center">
                      <p className={`font-semibold text-sm ${orderType === 'pickup' ? 'text-white' : 'text-[#e0e0e0]'}`}>
                        Pickup
                      </p>
                      <p className="text-[#a0a0a0] text-xs mt-1">~15 min</p>
                      <p className="text-[#a0a0a0] text-[10px] mt-0.5">Mon-Sun, 3pm-10:30pm</p>
                    </div>
                  </button>
                </div>

                {/* Delivery minimum warning */}
                {orderType === 'delivery' && !meetsMinimum && (
                  <div className="mt-4 flex items-start gap-2 text-[#f5a623] bg-[#f5a623]/5 border border-[#f5a623]/15 rounded-lg px-4 py-3">
                    <ShoppingCart className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-sm">
                      Minimum order for delivery is <strong>&euro;{DELIVERY_MINIMUM.toFixed(2)}</strong>.
                      Add <strong>&euro;{(DELIVERY_MINIMUM - subtotal).toFixed(2)}</strong> more to your cart.
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Address or Pickup Info */}
              {orderType === 'delivery' ? (
                <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
                  <label htmlFor="delivery-address" className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#e94560]" aria-hidden="true" />
                    Delivery Address
                  </label>
                  <textarea
                    id="delivery-address"
                    required
                    aria-required="true"
                    aria-invalid={!!formErrors.address}
                    aria-describedby={formErrors.address ? 'delivery-address-error' : undefined}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your full delivery address..."
                    rows={3}
                    className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3 text-[#e0e0e0] placeholder-[#e0e0e0]/20 text-sm focus:outline-none transition-colors resize-none ${
                      formErrors.address ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#e94560]/50'
                    }`}
                  />
                  {formErrors.address && (
                    <p id="delivery-address-error" className="text-red-400 text-xs mt-2" role="alert">{formErrors.address}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-[#a0a0a0]">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Estimated delivery time: ~60 minutes</span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
                  <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#e94560]" />
                    Pickup Location
                  </h2>
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#f5a623] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-white font-semibold text-sm">Nimo's Limerick</p>
                        <p className="text-[#a0a0a0] text-sm mt-1">
                          {siteInfo.address.street}, {siteInfo.address.area}
                        </p>
                        <p className="text-[#a0a0a0] text-sm">{siteInfo.address.eircode}</p>
                      </div>
                    </div>
                    {/* Map placeholder */}
                    <div className="mt-4 rounded-lg overflow-hidden border border-white/5">
                      <iframe
                        title="Nimo's Location"
                        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}&q=${encodeURIComponent(`${siteInfo.address.street}, ${siteInfo.address.area}, ${siteInfo.address.eircode}`)}&zoom=15`}
                        width="100%"
                        height="160"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="opacity-80"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[#a0a0a0]">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Ready for pickup in ~15 minutes</span>
                  </div>
                </div>
              )}

              {/* Contact Details */}
              <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
                <h2 className="text-white font-bold text-lg mb-4">Contact Details</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="checkout-name" className="block text-[#a0a0a0] text-xs font-semibold uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      required
                      aria-required="true"
                      aria-invalid={!!formErrors.name}
                      aria-describedby={formErrors.name ? 'checkout-name-error' : undefined}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your name"
                      className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3 text-[#e0e0e0] placeholder-[#e0e0e0]/20 text-sm focus:outline-none transition-colors ${
                        formErrors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#e94560]/50'
                      }`}
                    />
                    {formErrors.name && (
                      <p id="checkout-name-error" className="text-red-400 text-xs mt-2" role="alert">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="checkout-phone" className="block text-[#a0a0a0] text-xs font-semibold uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      aria-required="true"
                      aria-invalid={!!formErrors.phone}
                      aria-describedby={formErrors.phone ? 'checkout-phone-error' : undefined}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+353 ..."
                      className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3 text-[#e0e0e0] placeholder-[#e0e0e0]/20 text-sm focus:outline-none transition-colors ${
                        formErrors.phone ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#e94560]/50'
                      }`}
                    />
                    {formErrors.phone && (
                      <p id="checkout-phone-error" className="text-red-400 text-xs mt-2" role="alert">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
                <label htmlFor="checkout-notes" className="block text-white font-bold text-lg mb-4">Special Instructions</label>
                <textarea
                  id="checkout-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests for your order? (e.g., ring doorbell, leave at gate)"
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[#e0e0e0] placeholder-[#e0e0e0]/20 text-sm focus:outline-none focus:border-[#e94560]/50 transition-colors resize-none"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
                <h2 className="text-white font-bold text-lg mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {/* Cash */}
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                      paymentMethod === 'cash'
                        ? 'border-[#e94560] bg-[#e94560]/5'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'cash' ? 'bg-[#e94560]/15' : 'bg-white/5'
                    }`}>
                      <Banknote className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-[#e94560]' : 'text-[#a0a0a0]'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold text-sm ${paymentMethod === 'cash' ? 'text-white' : 'text-[#e0e0e0]'}`}>
                        Cash on {orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                      </p>
                      <p className="text-[#a0a0a0] text-xs mt-0.5">Pay when you receive your order</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      paymentMethod === 'cash' ? 'border-[#e94560] bg-[#e94560]' : 'border-white/20'
                    }`}>
                      {paymentMethod === 'cash' && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>

                  {/* Card Payment */}
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                      paymentMethod === 'card'
                        ? 'border-[#e94560] bg-[#e94560]/5'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'card' ? 'bg-[#e94560]/15' : 'bg-white/5'
                    }`}>
                      <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-[#e94560]' : 'text-[#a0a0a0]'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold text-sm ${paymentMethod === 'card' ? 'text-white' : 'text-[#e0e0e0]'}`}>
                        Card Payment
                      </p>
                      <p className="text-[#a0a0a0] text-xs mt-0.5">Visa, Mastercard, Apple Pay, Google Pay</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      paymentMethod === 'card' ? 'border-[#e94560] bg-[#e94560]' : 'border-white/20'
                    }`}>
                      {paymentMethod === 'card' && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Schedule Order */}
              <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-bold text-lg">Schedule for Later</h2>
                  <button
                    onClick={() => setScheduleOrder(!scheduleOrder)}
                    role="switch"
                    aria-checked={scheduleOrder}
                    aria-label="Schedule order for later"
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 min-w-[48px] min-h-[44px] flex items-center ${
                      scheduleOrder ? 'bg-[#e94560]' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                      scheduleOrder ? 'left-[26px]' : 'left-0.5'
                    }`} />
                  </button>
                </div>
                <p className="text-[#a0a0a0] text-xs mt-1">
                  Want your order at a specific time? Schedule it!
                </p>

                {scheduleOrder && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="schedule-date" className="block text-[#a0a0a0] text-xs font-semibold uppercase tracking-wider mb-2">
                        Date
                      </label>
                      <input
                        id="schedule-date"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        aria-required="true"
                        aria-invalid={!!formErrors.schedule}
                        aria-describedby={formErrors.schedule ? 'schedule-error' : undefined}
                        className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3 text-[#e0e0e0] text-sm focus:outline-none transition-colors ${
                          formErrors.schedule ? 'border-red-500/50' : 'border-white/10 focus:border-[#e94560]/50'
                        }`}
                      />
                    </div>
                    <div>
                      <label htmlFor="schedule-time" className="block text-[#a0a0a0] text-xs font-semibold uppercase tracking-wider mb-2">
                        Time
                      </label>
                      <input
                        id="schedule-time"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        aria-required="true"
                        aria-invalid={!!formErrors.schedule}
                        aria-describedby={formErrors.schedule ? 'schedule-error' : undefined}
                        className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3 text-[#e0e0e0] text-sm focus:outline-none transition-colors ${
                          formErrors.schedule ? 'border-red-500/50' : 'border-white/10 focus:border-[#e94560]/50'
                        }`}
                      />
                    </div>
                    {formErrors.schedule && (
                      <p id="schedule-error" className="col-span-2 text-red-400 text-xs" role="alert">{formErrors.schedule}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right column — Order Summary (sticky on desktop) */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Order Summary */}
                <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
                  {/* Toggle header (mobile collapsible) */}
                  <button
                    onClick={() => setOrderSummaryOpen(!orderSummaryOpen)}
                    className="w-full flex items-center justify-between p-5 lg:cursor-default"
                  >
                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-[#e94560]" />
                      Order Summary
                    </h2>
                    <div className="lg:hidden">
                      {orderSummaryOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#a0a0a0]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#a0a0a0]" />
                      )}
                    </div>
                  </button>

                  {/* Items list */}
                  <div className={`transition-all duration-300 overflow-hidden ${
                    orderSummaryOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-[2000px] lg:opacity-100'
                  }`}>
                    <div className="px-5 pb-4 space-y-3">
                      {items.map((item, index) => (
                        <div
                          key={item.id || index}
                          className="flex items-start justify-between gap-3 bg-white/[0.02] rounded-xl p-3 border border-white/5"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="text-white text-sm font-semibold truncate pr-2">
                                {item.menuItem.name}
                              </h4>
                              <button
                                onClick={() => removeItem(index)}
                                className="text-[#a0a0a0] hover:text-red-400 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label={`Remove ${item.menuItem.name}`}
                              >
                                <X className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                            </div>
                            {item.selectedOptions?.length > 0 && (
                              <p className="text-[#a0a0a0] text-xs mt-0.5">
                                {item.selectedOptions.map(opt => opt.name).join(', ')}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => updateQuantity(index, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                  aria-label={`Decrease quantity of ${item.menuItem.name}`}
                                >
                                  <Minus className="w-3 h-3" aria-hidden="true" />
                                </button>
                                <span className="text-white text-xs font-bold w-5 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(index, item.quantity + 1)}
                                  className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                                  aria-label={`Increase quantity of ${item.menuItem.name}`}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="text-[#e94560] text-sm font-bold">
                                &euro;{getItemPrice(item).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="bg-[#1a1a2e] rounded-2xl p-5 border border-white/5">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#f5a623]" />
                    Promo Code
                  </h3>
                  {promoCode ? (
                    <div className="flex items-center justify-between bg-green-500/5 border border-green-500/15 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-semibold">{promoCode}</span>
                        <span className="text-green-400/60 text-xs">{promoType === 'percentage' ? `-${promoValue}%` : `-\u20AC${promoValue}`}</span>
                      </div>
                      <button
                        onClick={removePromo}
                        className="text-[#a0a0a0] hover:text-red-400 transition-colors"
                        aria-label="Remove promo code"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <label htmlFor="checkout-promo" className="sr-only">Promo code</label>
                      <input
                        id="checkout-promo"
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#e0e0e0] placeholder-[#e0e0e0]/20 focus:outline-none focus:border-[#e94560]/50 transition-colors"
                      />
                      <button
                        onClick={() => {
                          if (promoInput.trim()) applyPromo(promoInput, subtotal);
                        }}
                        disabled={promoLoading || !promoInput.trim()}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40 transition-all duration-300"
                      >
                        {promoLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-red-400 text-xs mt-2" role="alert">{promoError}</p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="bg-[#1a1a2e] rounded-2xl p-5 border border-white/5 space-y-3" role="status" aria-live="polite" aria-label="Order total">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a0a0a0]">Subtotal ({itemCount} items)</span>
                    <span className="text-white font-medium">&euro;{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Promo Discount</span>
                      <span className="text-green-400 font-medium">-&euro;{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a0a0a0]">
                      {orderType === 'delivery' ? 'Delivery Fee' : 'Pickup'}
                    </span>
                    <span className="text-green-400 font-medium">Free</span>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-[#e94560] font-bold text-xl">&euro;{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order / Payment */}
                <div>
                  {submitError && (
                    <div className="mb-4 bg-red-500/5 border border-red-500/15 rounded-xl p-4" role="alert">
                      <p className="text-red-400 text-sm">{submitError}</p>
                    </div>
                  )}

                  {paymentMethod === 'card' ? (
                    <div className="bg-[#1a1a2e] rounded-2xl p-5 border border-white/5">
                      <StripePayment
                        total={total}
                        orderData={{
                          items: items.map(item => ({
                            menu_item_id: item.menuItem.id,
                            name: item.menuItem.name,
                            price: item.menuItem.price,
                            quantity: item.quantity,
                            options: (item.selectedOptions || []).map(opt => ({
                              choice_id: opt.choice_id || opt.id,
                              name: opt.name,
                              price: opt.price || 0,
                            })),
                            notes: item.specialNotes || '',
                          })),
                          type: orderType,
                          customer_name: customerName.trim(),
                          phone: phone.trim(),
                          delivery_address: orderType === 'delivery' ? deliveryAddress.trim() : null,
                          notes: notes.trim() || null,
                          promo_code: promoCode || null,
                          scheduled_for: scheduleOrder ? `${scheduledDate}T${scheduledTime}` : null,
                          subtotal,
                          discount,
                          total,
                        }}
                        onPaymentSuccess={({ orderId, simulated }) => {
                          clearCart();
                          navigate(`/order-confirmed/${orderId}`);
                        }}
                        onError={(msg) => setSubmitError(msg)}
                      />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={!canCheckout || submitting}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                          canCheckout && !submitting
                            ? 'bg-[#e94560] hover:bg-[#d13350] text-white shadow-xl shadow-[#e94560]/30 hover:shadow-[#e94560]/50 active:scale-[0.98]'
                            : 'bg-white/5 text-[#a0a0a0] cursor-not-allowed'
                        }`}
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Placing Order...
                          </span>
                        ) : (
                          `Place Order - \u20AC${total.toFixed(2)}`
                        )}
                      </button>
                      {!canCheckout && orderType === 'delivery' && !meetsMinimum && (
                        <p className="text-center text-[#e94560] text-sm mt-2 font-medium">
                          Add €{(DELIVERY_MINIMUM - subtotal).toFixed(2)} more for delivery minimum (€{DELIVERY_MINIMUM.toFixed(2)}) or switch to Pickup
                        </p>
                      )}
                    </>
                  )}

                  <p className="text-center text-[#a0a0a0] text-xs mt-3">
                    By placing your order, you agree to our terms and conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
