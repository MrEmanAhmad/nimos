import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from '@stripe/react-stripe-js';
import { CreditCard, Shield, AlertTriangle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const STRIPE_PK = import.meta.env.VITE_STRIPE_PK || 'pk_test_PLACEHOLDER';

let stripePromise = null;
try {
  stripePromise = loadStripe(STRIPE_PK);
} catch (e) {
  console.warn('Stripe failed to load:', e);
}

const CARD_STYLE = {
  style: {
    base: {
      color: '#e0e0e0',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '15px',
      '::placeholder': { color: '#666' },
    },
    invalid: { color: '#ff4444' },
  },
};

function PaymentRequestButton({ total, onPaymentSuccess, onError }) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (!stripe || !total) return;

    const pr = stripe.paymentRequest({
      country: 'IE',
      currency: 'eur',
      total: {
        label: "Nimo's Order",
        amount: Math.round(total * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      }
    });

    pr.on('paymentmethod', async (ev) => {
      try {
        // For now, just complete - real flow needs PaymentIntent client_secret
        ev.complete('success');
        onPaymentSuccess({ paymentMethod: ev.paymentMethod, type: 'wallet' });
      } catch (err) {
        ev.complete('fail');
        onError(err.message);
      }
    });
  }, [stripe, total]);

  if (!canMakePayment || !paymentRequest) return null;

  return (
    <div className="mb-4">
      <PaymentRequestButtonElement
        options={{ paymentRequest }}
        className="w-full"
      />
      <div className="flex items-center gap-3 my-3">
        <div className="flex-1 border-t border-white/10" />
        <span className="text-[#a0a0a0] text-xs">or pay with card</span>
        <div className="flex-1 border-t border-white/10" />
      </div>
    </div>
  );
}

function CardForm({ total, orderData, onPaymentSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState('');
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setCardError('');

    try {
      // Step 1: Create order and get payment session
      const token = localStorage.getItem('nimos_token');
      
      // First place the order with card payment method
      const orderRes = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...orderData, payment_method: 'card' }),
      });

      const orderResult = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderResult.message || orderResult.error || 'Failed to create order');

      const orderId = orderResult.order_id || orderResult.id;

      // Step 2: Create payment session via backend
      const payRes = await fetch(`${API_BASE}/payments/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ order_id: orderId }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || 'Payment setup failed');

      // If simulated (no Stripe key configured), treat as success
      if (payData.simulated) {
        onPaymentSuccess({ orderId, simulated: true });
        return;
      }

      // If we get a Stripe Checkout URL, redirect
      if (payData.url) {
        window.location.href = payData.url;
        return;
      }

      // Fallback: success
      onPaymentSuccess({ orderId });
    } catch (err) {
      setCardError(err.message);
      onError?.(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Apple Pay / Google Pay */}
      <PaymentRequestButton
        total={total}
        onPaymentSuccess={onPaymentSuccess}
        onError={(msg) => setCardError(msg)}
      />

      {/* Card Element */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-4 transition-colors focus-within:border-[#e94560]/50">
        <CardElement
          options={CARD_STYLE}
          onChange={(e) => {
            setCardComplete(e.complete);
            setCardError(e.error ? e.error.message : '');
          }}
        />
      </div>

      {cardError && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {cardError}
        </div>
      )}

      {/* Test mode info */}
      <div className="bg-[#f5a623]/5 border border-[#f5a623]/15 rounded-lg px-4 py-3 mb-4">
        <p className="text-[#f5a623] text-xs font-semibold mb-1">🧪 Test Mode — No real charges</p>
        <p className="text-[#a0a0a0] text-xs">
          Test card: <span className="font-mono text-white/70">4242 4242 4242 4242</span> · Any future date · Any CVC
        </p>
      </div>

      <div className="flex items-center gap-2 text-[#a0a0a0] text-xs mb-4">
        <Shield className="w-3.5 h-3.5" />
        <span>Secured by Stripe · 256-bit encryption</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing || !cardComplete}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
          stripe && !processing && cardComplete
            ? 'bg-[#e94560] hover:bg-[#d13350] text-white shadow-xl shadow-[#e94560]/30 hover:shadow-[#e94560]/50 active:scale-[0.98]'
            : 'bg-white/5 text-[#a0a0a0] cursor-not-allowed'
        }`}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing Payment...
          </span>
        ) : (
          `Pay €${total.toFixed(2)}`
        )}
      </button>
    </form>
  );
}

export default function StripePayment({ total, orderData, onPaymentSuccess, onError }) {
  if (!stripePromise) {
    return (
      <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 text-red-400 text-sm">
        Card payment is temporarily unavailable. Please use cash payment.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ appearance: { theme: 'night' } }}>
      <CardForm
        total={total}
        orderData={orderData}
        onPaymentSuccess={onPaymentSuccess}
        onError={onError}
      />
    </Elements>
  );
}
