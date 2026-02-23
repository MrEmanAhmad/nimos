import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Minus,
  Plus,
  Trash2,
  Truck,
  Store,
  Tag,
  ShoppingCart,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const {
    items,
    orderType,
    setOrderType,
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
    removeItem,
    updateQuantity,
    clearCart,
    isCartOpen,
    closeCart,
    meetsMinimum,
    canCheckout,
    DELIVERY_MINIMUM,
  } = useCart();

  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const promoInputRef = useRef(null);

  // Close on Escape & trap focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
        return;
      }
      // Focus trap
      if (e.key === 'Tab' && isCartOpen && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Move focus to drawer when opened
  useEffect(() => {
    if (isCartOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) firstFocusable.focus();
    }
  }, [isCartOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const handlePromoSubmit = (e) => {
    e.preventDefault();
    const code = promoInputRef.current?.value?.trim();
    if (code) applyPromo(code, subtotal);
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const getItemPrice = (item) => {
    const basePrice = item.menuItem.price || 0;
    const optionsPrice = (item.selectedOptions || []).reduce(
      (sum, opt) => sum + (opt.price || 0),
      0
    );
    return (basePrice + optionsPrice) * item.quantity;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 z-[95] h-full w-full sm:w-[420px] bg-[#0f0f0f] border-l border-white/5 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-[#e94560]" />
            <h2 className="text-lg font-bold text-white">Your Cart</h2>
            {itemCount > 0 && (
              <span className="bg-[#e94560] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-white/5 text-[#a0a0a0] hover:text-white transition-all duration-300"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-24 h-24 rounded-full bg-white/[0.03] flex items-center justify-center mb-6">
              <ShoppingCart className="w-10 h-10 text-[#a0a0a0]/40" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Your cart is empty</h3>
            <p className="text-[#a0a0a0] text-sm mb-6 max-w-[250px]">
              Add some delicious items from our menu to get started.
            </p>
            <button
              onClick={() => {
                closeCart();
                navigate('/menu');
              }}
              className="bg-[#e94560] hover:bg-[#d13350] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-[#e94560]/20"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* Order Type Toggle */}
            <div className="px-6 py-4 border-b border-white/5">
              <div className="flex bg-white/[0.03] rounded-xl p-1 border border-white/5" role="radiogroup" aria-label="Order type">
                <button
                  onClick={() => setOrderType('delivery')}
                  role="radio"
                  aria-checked={orderType === 'delivery'}
                  aria-label="Delivery"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    orderType === 'delivery'
                      ? 'bg-[#e94560] text-white shadow-md shadow-[#e94560]/20'
                      : 'text-[#a0a0a0] hover:text-white'
                  }`}
                >
                  <Truck className="w-4 h-4" aria-hidden="true" />
                  Delivery
                </button>
                <button
                  onClick={() => setOrderType('pickup')}
                  role="radio"
                  aria-checked={orderType === 'pickup'}
                  aria-label="Pickup"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    orderType === 'pickup'
                      ? 'bg-[#e94560] text-white shadow-md shadow-[#e94560]/20'
                      : 'text-[#a0a0a0] hover:text-white'
                  }`}
                >
                  <Store className="w-4 h-4" aria-hidden="true" />
                  Pickup
                </button>
              </div>

              {/* Delivery minimum warning */}
              {orderType === 'delivery' && !meetsMinimum && (
                <div className="mt-3 flex items-start gap-2 text-[#f5a623] bg-[#f5a623]/5 border border-[#f5a623]/15 rounded-lg px-3 py-2.5">
                  <ChevronDown className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-xs">
                    Minimum order for delivery is <strong>&euro;{DELIVERY_MINIMUM.toFixed(2)}</strong>.
                    Add <strong>&euro;{(DELIVERY_MINIMUM - subtotal).toFixed(2)}</strong> more.
                  </p>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="bg-[#1a1a2e] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm truncate">
                        {item.menuItem.name}
                      </h4>
                      {/* Selected options */}
                      {item.selectedOptions?.length > 0 && (
                        <p className="text-[#a0a0a0] text-xs mt-1 line-clamp-2">
                          {item.selectedOptions.map(opt => opt.name).join(', ')}
                        </p>
                      )}
                      {/* Special notes */}
                      {item.specialNotes && (
                        <p className="text-[#f5a623]/70 text-xs mt-1 italic truncate">
                          {item.specialNotes}
                        </p>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(index)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#a0a0a0] hover:text-red-400 transition-all duration-300 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label={`Remove ${item.menuItem.name} from cart`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                        aria-label={`Decrease quantity of ${item.menuItem.name}`}
                      >
                        <Minus className="w-3 h-3" aria-hidden="true" />
                      </button>
                      <span className="text-white font-bold text-sm w-6 text-center" aria-label={`Quantity: ${item.quantity}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        disabled={item.quantity >= 20}
                        className={`w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 ${item.quantity >= 20 ? 'text-white/30 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}
                        aria-label={`Increase quantity of ${item.menuItem.name}`}
                      >
                        <Plus className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Price */}
                    <span className="text-[#e94560] font-bold text-sm">
                      &euro;{getItemPrice(item).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom section — Promo, Totals, Checkout */}
            <div className="border-t border-white/5 bg-[#0a0a0a]">
              {/* Promo Code */}
              <div className="px-6 pt-4 pb-2">
                {promoCode ? (
                  <div className="flex items-center justify-between bg-green-500/5 border border-green-500/15 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-400" />
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
                  <form onSubmit={handlePromoSubmit} className="flex gap-2" aria-label="Apply promo code">
                    <div className="flex-1 relative">
                      <label htmlFor="cart-promo-code" className="sr-only">Promo code</label>
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]/40" aria-hidden="true" />
                      <input
                        ref={promoInputRef}
                        id="cart-promo-code"
                        type="text"
                        placeholder="Promo code"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#e0e0e0] placeholder-[#e0e0e0]/20 focus:outline-none focus:border-[#e94560]/50 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={promoLoading}
                      className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40 transition-all duration-300"
                    >
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {promoError && (
                  <p className="text-red-400 text-xs mt-2" role="alert">{promoError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="px-6 py-3 space-y-2" role="status" aria-live="polite" aria-label="Cart total">
                <div className="flex justify-between text-sm">
                  <span className="text-[#a0a0a0]">Subtotal</span>
                  <span className="text-white font-medium">&euro;{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Discount</span>
                    <span className="text-green-400 font-medium">-&euro;{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base pt-2 border-t border-white/5">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-[#e94560] font-bold text-lg">&euro;{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={handleCheckout}
                  disabled={!canCheckout}
                  className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 ${
                    canCheckout
                      ? 'bg-[#e94560] hover:bg-[#d13350] text-white shadow-lg shadow-[#e94560]/25 hover:shadow-[#e94560]/40 active:scale-[0.98]'
                      : 'bg-white/5 text-[#a0a0a0] cursor-not-allowed'
                  }`}
                >
                  Proceed to Checkout
                </button>
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="w-full mt-2 py-2 text-[#a0a0a0] hover:text-red-400 text-sm font-medium transition-colors text-center"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
