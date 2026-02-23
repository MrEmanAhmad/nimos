const express = require('express');
const { getDb } = require('../db/init');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Create Stripe checkout session
router.post('/create-session', authMiddleware, (req, res) => {
  const { order_id } = req.body;
  const db = getDb();
  const stripeKey = db.prepare("SELECT value FROM settings WHERE key = 'stripe_secret_key'").get()?.value;
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(order_id, req.user.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (!stripeKey) {
    // Stripe not configured — simulate successful payment for development
    const db2 = getDb();
    db2.prepare("UPDATE orders SET payment_status = 'paid', stripe_payment_id = ? WHERE id = ?").run(`sim_${Date.now()}`, order_id);
    return res.json({ success: true, simulated: true, message: 'Payment simulated (Stripe not configured)' });
  }

  // Real Stripe integration
  try {
    const stripe = require('stripe')(stripeKey);
    stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `Nimo's Order #${order.id}` },
          unit_amount: Math.round(order.total * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.SITE_URL || 'https://nimoslimerick.ie'}/track/${order.id}?payment=success`,
      cancel_url: `${process.env.SITE_URL || 'https://nimoslimerick.ie'}/menu?payment=cancelled`,
      metadata: { order_id: String(order.id) },
      payment_intent_data: {
        metadata: { order_id: String(order.id) }
      }
    }).then(session => {
      const db3 = getDb();
      db3.prepare("UPDATE orders SET stripe_payment_id = ? WHERE id = ?").run(session.id, order.id);
      res.json({ url: session.url, session_id: session.id });
    });
  } catch (e) {
    console.error('[PAYMENT ERROR]', e.message);
    res.status(500).json({ error: 'Payment setup failed. Please try again.' });
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const db = getDb();
  const stripeKey = db.prepare("SELECT value FROM settings WHERE key = 'stripe_secret_key'").get()?.value;

  if (!stripeKey) return res.json({ received: true });

  const event = req.body;
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      const db2 = getDb();
      db2.prepare("UPDATE orders SET payment_status = 'paid', stripe_payment_id = ? WHERE id = ?").run(session.payment_intent, orderId);
    }
  }
  res.json({ received: true });
});

// Get Stripe public key
router.get('/config', (req, res) => {
  const db = getDb();
  const key = db.prepare("SELECT value FROM settings WHERE key = 'stripe_public_key'").get()?.value || '';
  res.json({ public_key: key, configured: !!key });
});

module.exports = router;
