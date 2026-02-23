const express = require('express');
const { getDb } = require('../db/init');
const { authMiddleware } = require('../middleware/auth');
const { broadcast } = require('../sse');
const { notify } = require('../services/notifications');
const { orderConfirmationEmail } = require('../services/emailTemplates');
const router = express.Router();

// Sanitize user input - strip HTML tags to prevent stored XSS
const sanitize = (str) => (str || '').replace(/<[^>]*>/g, '').trim();

// Customer: place order
router.post('/', authMiddleware, (req, res) => {
  const { items, type, order_type, delivery_address, phone, notes, promo_code, payment_method, scheduled_for, redeem_loyalty, customer_name } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Items required' });
  if (type === 'delivery' && !delivery_address) return res.status(400).json({ error: 'Delivery address required' });

  // Sanitize text inputs
  const cleanAddress = sanitize(delivery_address).slice(0, 500);
  const cleanPhone = sanitize(phone).slice(0, 30);
  const cleanNotes = sanitize(notes).slice(0, 1000);
  // Whitelist order type
  const resolvedType = type || order_type;
  const cleanType = ['delivery', 'pickup'].includes(resolvedType) ? resolvedType : 'pickup';
  const cleanName = sanitize(customer_name || '').slice(0, 200);
  // Whitelist payment method
  const cleanPaymentMethod = ['cash', 'card'].includes(payment_method) ? payment_method : 'cash';

  const db = getDb();

  // Check restaurant status
  const isOpen = db.prepare("SELECT value FROM settings WHERE key = 'restaurant_open'").get()?.value === '1';
  const paused = db.prepare("SELECT value FROM settings WHERE key = 'pause_orders'").get()?.value === '1';
  if (!isOpen || paused) { return res.status(400).json({ error: 'Restaurant is currently closed or not accepting orders' }); }

  // Check delivery minimum
  if (type === 'delivery') {
    const minOrder = parseFloat(db.prepare("SELECT value FROM settings WHERE key = 'delivery_min_order'").get()?.value || '0');
    let checkTotal = 0;
    for (const item of items) {
      const mi = db.prepare('SELECT price FROM menu_items WHERE id = ?').get(item.menu_item_id);
      if (mi) checkTotal += mi.price * (item.quantity || 1);
    }
    if (checkTotal < minOrder) { return res.status(400).json({ error: `Minimum order for delivery is €${minOrder.toFixed(2)}` }); }
  }

  let subtotal = 0;
  const resolvedItems = [];
  for (const item of items) {
    const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ? AND active = 1').get(item.menu_item_id);
    if (!menuItem) { return res.status(400).json({ error: `Item ${item.menu_item_id} not found or unavailable` }); }
    console.log(`[ORDER] Item: ${menuItem.name} (id=${menuItem.id}), qty=${item.quantity}`);
    const qty = item.quantity || 1;
    let itemPrice = menuItem.price;
    // Add option prices
    const options = item.options || [];
    for (const opt of options) {
      const choice = db.prepare('SELECT * FROM option_choices WHERE id = ?').get(opt.choice_id);
      if (choice) itemPrice += choice.price;
    }
    subtotal += itemPrice * qty;
    resolvedItems.push({ ...item, price: itemPrice, quantity: qty, options_json: JSON.stringify(options) });
  }

  // Apply promo code
  let discount = 0;
  let appliedPromo = '';
  if (promo_code) {
    const promo = db.prepare('SELECT * FROM promo_codes WHERE code = ? AND active = 1').get(promo_code.toUpperCase());
    if (promo) {
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Promo code expired' });
      }
      if (promo.max_uses > 0 && promo.used_count >= promo.max_uses) {
        return res.status(400).json({ error: 'Promo code max uses reached' });
      }
      if (subtotal < promo.min_order) {
        return res.status(400).json({ error: `Minimum order €${promo.min_order.toFixed(2)} for this promo` });
      }
      if (promo.type === 'percentage') discount = subtotal * (promo.value / 100);
      else discount = promo.value;
      discount = Math.min(discount, subtotal);
      appliedPromo = promo.code;
      db.prepare('UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ?').run(promo.id);
    } else {
      return res.status(400).json({ error: 'Invalid promo code' });
    }
  }

  // Apply loyalty redemption
  let loyaltyRedeemed = 0;
  if (redeem_loyalty) {
    const user = db.prepare('SELECT loyalty_points FROM users WHERE id = ?').get(req.user.id);
    const threshold = parseInt(db.prepare("SELECT value FROM settings WHERE key = 'loyalty_redeem_threshold'").get()?.value || '50');
    const redeemValue = parseFloat(db.prepare("SELECT value FROM settings WHERE key = 'loyalty_redeem_value'").get()?.value || '5');
    if (user && user.loyalty_points >= threshold) {
      loyaltyRedeemed = threshold;
      discount += redeemValue;
      discount = Math.min(discount, subtotal);
      db.prepare('UPDATE users SET loyalty_points = loyalty_points - ? WHERE id = ?').run(threshold, req.user.id);
      db.prepare('INSERT INTO loyalty_log (user_id, points, type, description) VALUES (?,?,?,?)').run(req.user.id, -threshold, 'redeem', `Redeemed ${threshold} points for €${redeemValue} off`);
    }
  }

  const total = Math.round((subtotal - discount) * 100) / 100;

  // Estimated time
  const busyMode = db.prepare("SELECT value FROM settings WHERE key = 'busy_mode'").get()?.value === '1';
  const busyExtra = parseInt(db.prepare("SELECT value FROM settings WHERE key = 'busy_extra_minutes'").get()?.value || '15');
  const timeKey = cleanType === 'delivery' ? 'delivery_time_min' : 'pickup_time_min';
  const baseMin = parseInt(db.prepare("SELECT value FROM settings WHERE key = ?").get(timeKey)?.value || '30');
  const estMinutes = baseMin + (busyMode ? busyExtra : 0);

  let estimatedReady;
  if (scheduled_for) {
    estimatedReady = new Date(scheduled_for).toISOString();
  } else {
    estimatedReady = new Date(Date.now() + estMinutes * 60000).toISOString();
  }

  const orderResult = db.prepare('INSERT INTO orders (user_id, status, type, total, subtotal, discount, delivery_address, phone, notes, promo_code, payment_method, payment_status, scheduled_for, estimated_ready, loyalty_redeemed, customer_name) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(
    req.user.id, 'pending', cleanType, total, Math.round(subtotal * 100) / 100, Math.round(discount * 100) / 100,
    cleanAddress, cleanPhone, cleanNotes, appliedPromo,
    cleanPaymentMethod, 'pending',
    scheduled_for || null, estimatedReady, loyaltyRedeemed, cleanName
  );
  const orderId = Number(orderResult.lastInsertRowid);

  const insertItem = db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price, options_json, notes) VALUES (?,?,?,?,?,?)');
  for (const item of resolvedItems) {
    insertItem.run(orderId, item.menu_item_id, item.quantity, item.price, item.options_json, sanitize(item.notes).slice(0, 500));
  }

  // Earn loyalty points
  const loyaltyRate = parseInt(db.prepare("SELECT value FROM settings WHERE key = 'loyalty_rate'").get()?.value || '1');
  const pointsEarned = Math.floor(total * loyaltyRate);
  if (pointsEarned > 0) {
    db.prepare('UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?').run(pointsEarned, req.user.id);
    db.prepare('UPDATE orders SET loyalty_earned = ? WHERE id = ?').run(pointsEarned, orderId);
    db.prepare('INSERT INTO loyalty_log (user_id, order_id, points, type, description) VALUES (?,?,?,?,?)').run(req.user.id, orderId, pointsEarned, 'earn', `Earned ${pointsEarned} points from order #${orderId}`);
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const orderItems = db.prepare('SELECT oi.*, mi.name as item_name FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = ?').all(orderId);

  const fullOrder = { ...order, items: orderItems };
  broadcast({ type: 'new_order', order: fullOrder });
  notify(req.user.id, orderId, 'order_placed', fullOrder);
  res.json(fullOrder);
});

// Customer: my orders
router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  const itemStmt = db.prepare('SELECT oi.*, mi.name as item_name FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = ?');
  const reviewStmt = db.prepare('SELECT * FROM reviews WHERE order_id = ?');
  const result = orders.map(o => ({ ...o, items: itemStmt.all(o.id), review: reviewStmt.get(o.id) || null }));
  res.json(result);
});

// Customer: order detail
router.get('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) { return res.status(404).json({ error: 'Order not found' }); }
  const items = db.prepare('SELECT oi.*, mi.name as item_name FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = ?').all(order.id);
  const review = db.prepare('SELECT * FROM reviews WHERE order_id = ?').get(order.id);
  res.json({ ...order, items, review: review || null });
});

// Customer: order receipt (HTML email template for print-friendly receipt)
router.get('/:id/receipt', authMiddleware, (req, res) => {
  const db = getDb();
  // Allow order owner, admin, or kitchen to view receipt
  const order = db.prepare('SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?').get(req.params.id);
  if (!order) { return res.status(404).json({ error: 'Order not found' }); }
  if (order.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'kitchen') {
    return res.status(403).json({ error: 'Not authorized to view this receipt' });
  }
  const items = db.prepare('SELECT oi.*, mi.name as item_name FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = ?').all(order.id);
  const fullOrder = { ...order, items };
  const html = orderConfirmationEmail(fullOrder);
  res.json({ html });
});

// Validate promo code
router.post('/validate-promo', authMiddleware, (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Code required' });
  const db = getDb();
  const promo = db.prepare('SELECT * FROM promo_codes WHERE code = ? AND active = 1').get(code.toUpperCase());
  if (!promo) return res.status(400).json({ error: 'Invalid promo code' });
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) return res.status(400).json({ error: 'Promo code expired' });
  if (promo.max_uses > 0 && promo.used_count >= promo.max_uses) return res.status(400).json({ error: 'Promo code fully used' });
  if (subtotal && subtotal < promo.min_order) return res.status(400).json({ error: `Minimum order €${promo.min_order.toFixed(2)}` });
  let discount = promo.type === 'percentage' ? (subtotal || 0) * (promo.value / 100) : promo.value;
  res.json({ valid: true, code: promo.code, type: promo.type, value: promo.value, discount: Math.round(discount * 100) / 100, description: promo.type === 'percentage' ? `${promo.value}% off` : `€${promo.value.toFixed(2)} off` });
});

// SSE stream for real-time order tracking
const orderClients = {};

router.get('/:id/stream', (req, res) => {
  const orderId = parseInt(req.params.id);
  if (isNaN(orderId)) return res.status(400).json({ error: 'Invalid order ID' });

  // Auth via query param (EventSource can't set headers)
  const token = req.query.token;
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const secret = process.env.JWT_SECRET || 'nimos-secret-key';
      req.user = jwt.verify(token, secret);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  // Verify order belongs to user (if authenticated)
  if (req.user) {
    const db = getDb();
    const order = db.prepare('SELECT user_id FROM orders WHERE id = ?').get(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your order' });
    }
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write(':ok\n\n');

  // Register this client for this order
  if (!orderClients[orderId]) orderClients[orderId] = [];
  const client = { res };
  orderClients[orderId].push(client);

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    try { res.write(':heartbeat\n\n'); } catch (e) { /* disconnected */ }
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    if (orderClients[orderId]) {
      orderClients[orderId] = orderClients[orderId].filter(c => c !== client);
      if (orderClients[orderId].length === 0) delete orderClients[orderId];
    }
  });
});

// Broadcast order update to connected clients tracking that order
function broadcastOrderUpdate(orderId, order) {
  const clients = orderClients[orderId];
  if (!clients || clients.length === 0) return;
  const msg = `data: ${JSON.stringify({ type: 'order_update', order })}\n\n`;
  for (const client of clients) {
    try { client.res.write(msg); } catch (e) { /* disconnected */ }
  }
}

// Export for use by status-update routes
router.broadcastOrderUpdate = broadcastOrderUpdate;

module.exports = router;
