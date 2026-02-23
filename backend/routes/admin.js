const express = require('express');
const { getDb } = require('../db/init');
const { adminMiddleware, adminOnlyMiddleware } = require('../middleware/auth');
const { broadcast, addClient, removeClient } = require('../sse');
const { notify } = require('../services/notifications');
const router = express.Router();

// SSE stream
router.get('/orders/stream', adminMiddleware, (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.write('data: {"type":"connected"}\n\n');
  const clientId = addClient(res);
  // Keepalive ping every 15s to prevent proxy/browser timeout
  const pingInterval = setInterval(() => {
    try { res.write(': ping\n\n'); } catch(e) { clearInterval(pingInterval); }
  }, 15000);
  req.on('close', () => { clearInterval(pingInterval); removeClient(clientId); });
});

// All orders
router.get('/orders', adminMiddleware, (req, res) => {
  const db = getDb();
  const { status, date, scheduled } = req.query;
  let sql = 'SELECT o.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email FROM orders o LEFT JOIN users u ON o.user_id = u.id';
  const conditions = [];
  const params = [];
  if (status) {
    const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
    conditions.push(`o.status IN (${statuses.map(() => '?').join(',')})`);
    params.push(...statuses);
  }
  if (date) { conditions.push('DATE(o.created_at) = ?'); params.push(date); }
  if (scheduled === '1') { conditions.push('o.scheduled_for IS NOT NULL AND o.scheduled_for > datetime("now")'); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY o.created_at DESC LIMIT 200';
  const orders = db.prepare(sql).all(...params);
  const itemStmt = db.prepare('SELECT oi.*, mi.name as item_name FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = ?');
  const platStmt = db.prepare('SELECT platform, external_id FROM platform_orders WHERE order_id = ?');
  const result = orders.map(o => ({ ...o, items: itemStmt.all(o.id), platform: platStmt.get(o.id) || null }));
  res.json(result);
});

// Update order status with timestamps and notifications
router.put('/orders/:id/status', adminMiddleware, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const db = getDb();
  const tsCol = { confirmed: 'confirmed_at', preparing: 'preparing_at', ready: 'ready_at', delivered: 'delivered_at', cancelled: 'cancelled_at' }[status];
  if (tsCol) {
    db.prepare(`UPDATE orders SET status = ?, ${tsCol} = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(status, req.params.id);
  } else {
    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
  }

  const order = db.prepare('SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?').get(req.params.id);
  const items = db.prepare('SELECT oi.*, mi.name as item_name FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = ?').all(req.params.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });
  const fullOrder = { ...order, items };
  broadcast({ type: 'order_update', order: fullOrder });

  // Broadcast to per-order SSE clients (track page)
  try {
    const ordersRouter = require('./orders');
    if (ordersRouter.broadcastOrderUpdate) ordersRouter.broadcastOrderUpdate(parseInt(req.params.id), fullOrder);
  } catch (e) { /* ignore */ }

  // Send notification
  if (order.user_id) {
    const notifMap = { confirmed: 'order_confirmed', preparing: 'order_preparing', ready: 'order_ready', delivered: 'order_delivered' };
    if (notifMap[status]) notify(order.user_id, order.id, notifMap[status], fullOrder);
  }

  res.json(fullOrder);
});

// Update category
router.put('/categories/:id', adminOnlyMiddleware, (req, res) => {
  const { name, icon, sort_order, active } = req.body;
  const stripHtml = (str) => str ? str.replace(/<[^>]*>/g, '').trim() : null;
  const cleanName = name != null ? (stripHtml(name).slice(0, 100) || null) : null;
  const cleanIcon = icon != null ? (stripHtml(icon).slice(0, 10) || null) : null;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM menu_categories WHERE id = ?').get(req.params.id);
  if (!existing) { return res.status(404).json({ error: 'Category not found' }); }
  db.prepare('UPDATE menu_categories SET name=?, icon=?, sort_order=?, active=? WHERE id=?').run(
    cleanName ?? existing.name, cleanIcon ?? existing.icon, sort_order ?? existing.sort_order,
    active != null ? (active ? 1 : 0) : existing.active, req.params.id
  );
  const cat = db.prepare('SELECT * FROM menu_categories WHERE id = ?').get(req.params.id);
  res.json(cat);
});

// Dashboard
router.get('/dashboard', adminMiddleware, (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(total),0) as revenue FROM orders WHERE DATE(created_at) = ? AND status != 'cancelled'").get(today);
  const pendingCount = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('pending','confirmed','preparing')").get().count;
  const scheduledCount = db.prepare("SELECT COUNT(*) as count FROM orders WHERE scheduled_for IS NOT NULL AND scheduled_for > datetime('now') AND status = 'pending'").get().count;
  const popular = db.prepare(`SELECT mi.name, SUM(oi.quantity) as total_qty FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id JOIN orders o ON oi.order_id = o.id WHERE DATE(o.created_at) = ? AND o.status != 'cancelled' GROUP BY mi.name ORDER BY total_qty DESC LIMIT 5`).all(today);
  const hourly = db.prepare(`SELECT strftime('%H', created_at) as hour, COUNT(*) as count, SUM(total) as revenue FROM orders WHERE DATE(created_at) = ? AND status != 'cancelled' GROUP BY hour ORDER BY hour`).all(today);
  const recentOrders = db.prepare(`SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10`).all();
  const totalCustomers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'customer'").get().c;

  // Revenue breakdown by order type (delivery vs pickup)
  const byType = db.prepare(`SELECT type, COUNT(*) as count, COALESCE(SUM(total),0) as revenue FROM orders WHERE DATE(created_at) = ? AND status != 'cancelled' GROUP BY type`).all(today);

  // Average order value today
  const avgOrderValue = todayOrders.count > 0 ? Math.round((todayOrders.revenue / todayOrders.count) * 100) / 100 : 0;

  // Order status distribution (all active orders)
  const statusDistribution = db.prepare(`SELECT status, COUNT(*) as count FROM orders WHERE DATE(created_at) = ? GROUP BY status`).all(today);

  res.json({
    today: { orders: todayOrders.count, revenue: Math.round(todayOrders.revenue * 100) / 100, avgOrderValue },
    pending: pendingCount,
    scheduled: scheduledCount,
    totalCustomers,
    popular, hourly, recentOrders,
    byType,
    statusDistribution
  });
});

// Reports
router.get('/reports', adminMiddleware, (req, res) => {
  const { from, to, range } = req.query;
  const db = getDb();

  // Support range presets: today, week, month, or custom from/to
  let startDate, endDate;
  const now = new Date();
  endDate = to || now.toISOString().split('T')[0];
  if (range === 'today') {
    startDate = now.toISOString().split('T')[0];
    endDate = startDate;
  } else if (range === 'week') {
    startDate = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  } else if (range === 'month') {
    startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  } else {
    startDate = from || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  }

  const daily = db.prepare(`SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue, SUM(discount) as discounts FROM orders WHERE DATE(created_at) BETWEEN ? AND ? AND status != 'cancelled' GROUP BY date ORDER BY date`).all(startDate, endDate);
  const topItems = db.prepare(`SELECT mi.name, SUM(oi.quantity) as qty, SUM(oi.quantity * oi.price) as revenue FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id JOIN orders o ON oi.order_id = o.id WHERE DATE(o.created_at) BETWEEN ? AND ? AND o.status != 'cancelled' GROUP BY mi.name ORDER BY qty DESC LIMIT 20`).all(startDate, endDate);
  const summary = db.prepare(`SELECT COUNT(*) as total_orders, COALESCE(SUM(total),0) as total_revenue, COALESCE(AVG(total),0) as avg_order, COALESCE(SUM(discount),0) as total_discounts FROM orders WHERE DATE(created_at) BETWEEN ? AND ? AND status != 'cancelled'`).get(startDate, endDate);
  const byType = db.prepare(`SELECT type, COUNT(*) as count, SUM(total) as revenue FROM orders WHERE DATE(created_at) BETWEEN ? AND ? AND status != 'cancelled' GROUP BY type`).all(startDate, endDate);
  const byPayment = db.prepare(`SELECT payment_method, COUNT(*) as count FROM orders WHERE DATE(created_at) BETWEEN ? AND ? AND status != 'cancelled' GROUP BY payment_method`).all(startDate, endDate);

  // Orders by hour of day (aggregated across all days in range)
  const hourly = db.prepare(`SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as count, COALESCE(SUM(total),0) as revenue FROM orders WHERE DATE(created_at) BETWEEN ? AND ? AND status != 'cancelled' GROUP BY hour ORDER BY hour`).all(startDate, endDate);

  // Customer stats: returning vs new
  const totalCustomersInRange = db.prepare(`SELECT COUNT(DISTINCT user_id) as count FROM orders WHERE DATE(created_at) BETWEEN ? AND ? AND status != 'cancelled' AND user_id IS NOT NULL`).get(startDate, endDate);
  const newCustomers = db.prepare(`SELECT COUNT(DISTINCT o.user_id) as count FROM orders o WHERE DATE(o.created_at) BETWEEN ? AND ? AND o.status != 'cancelled' AND o.user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE o2.user_id = o.user_id AND DATE(o2.created_at) < ? AND o2.status != 'cancelled')`).get(startDate, endDate, startDate);
  const returningCustomers = (totalCustomersInRange?.count || 0) - (newCustomers?.count || 0);

  const customerStats = {
    total: totalCustomersInRange?.count || 0,
    new: newCustomers?.count || 0,
    returning: returningCustomers >= 0 ? returningCustomers : 0,
  };

  res.json({ from: startDate, to: endDate, daily, topItems, summary, byType, byPayment, hourly, customerStats });
});

// Weekly revenue trend (last 7 days, for dashboard chart)
router.get('/dashboard/weekly', adminMiddleware, (req, res) => {
  const db = getDb();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-IE', { weekday: 'short' });
    const row = db.prepare("SELECT COUNT(*) as orders, COALESCE(SUM(total),0) as revenue FROM orders WHERE DATE(created_at) = ? AND status != 'cancelled'").get(dateStr);
    days.push({ date: dateStr, day: dayName, orders: row.orders, revenue: Math.round(row.revenue * 100) / 100 });
  }
  const maxRevenue = Math.max(...days.map(d => d.revenue), 1);
  res.json({ days, maxRevenue });
});

// ========== RESTAURANT SETTINGS ==========
router.get('/settings', adminOnlyMiddleware, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = {};
  for (const r of rows) settings[r.key] = r.value;
  res.json(settings);
});

// Whitelist of allowed settings keys to prevent arbitrary data injection
const ALLOWED_SETTINGS = [
  'restaurant_open', 'pause_orders', 'busy_mode', 'busy_extra_minutes',
  'delivery_min_order', 'delivery_time_min', 'pickup_time_min',
  'loyalty_rate', 'loyalty_redeem_threshold', 'loyalty_redeem_value',
  'stripe_secret_key', 'stripe_public_key', 'stripe_webhook_secret',
  'platform_justeat', 'platform_deliveroo', 'platform_orderyoyo',
  'opening_hours', 'delivery_zones', 'delivery_fee',
  'sms_api_key', 'sms_sender', 'email_from', 'email_api_key'
];
router.put('/settings', adminOnlyMiddleware, (req, res) => {
  const db = getDb();
  const s = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const rejected = [];
  for (const [key, value] of Object.entries(req.body)) {
    if (!ALLOWED_SETTINGS.includes(key)) { rejected.push(key); continue; }
    s.run(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  }
  broadcast({ type: 'settings_update', settings: req.body });
  if (rejected.length) return res.json({ success: true, warning: `Unknown settings keys ignored: ${rejected.join(', ')}` });
  res.json({ success: true });
});

// Toggle open/closed
router.post('/toggle-open', adminOnlyMiddleware, (req, res) => {
  const db = getDb();
  const current = db.prepare("SELECT value FROM settings WHERE key = 'restaurant_open'").get()?.value === '1';
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('restaurant_open', ?)").run(current ? '0' : '1');
  broadcast({ type: 'settings_update', settings: { restaurant_open: current ? '0' : '1' } });
  res.json({ open: !current });
});

// Toggle busy mode
router.post('/toggle-busy', adminOnlyMiddleware, (req, res) => {
  const db = getDb();
  const current = db.prepare("SELECT value FROM settings WHERE key = 'busy_mode'").get()?.value === '1';
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('busy_mode', ?)").run(current ? '0' : '1');
  broadcast({ type: 'settings_update', settings: { busy_mode: current ? '0' : '1' } });
  res.json({ busy: !current });
});

// Pause orders
router.post('/toggle-pause', adminOnlyMiddleware, (req, res) => {
  const db = getDb();
  const current = db.prepare("SELECT value FROM settings WHERE key = 'pause_orders'").get()?.value === '1';
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('pause_orders', ?)").run(current ? '0' : '1');
  broadcast({ type: 'settings_update', settings: { pause_orders: current ? '0' : '1' } });
  res.json({ paused: !current });
});

// ========== PROMO CODES ==========
router.get('/promos', adminOnlyMiddleware, (req, res) => {
  const db = getDb();
  const promos = db.prepare('SELECT * FROM promo_codes ORDER BY created_at DESC').all();
  res.json(promos);
});

router.post('/promos', adminOnlyMiddleware, (req, res) => {
  const { code, type, value, min_order, max_uses, expires_at } = req.body;
  if (!code || !type || !value) return res.status(400).json({ error: 'code, type, value required' });
  if (!['percentage', 'fixed'].includes(type)) return res.status(400).json({ error: 'Type must be percentage or fixed' });
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue <= 0) return res.status(400).json({ error: 'Value must be a positive number' });
  if (type === 'percentage' && numValue > 100) return res.status(400).json({ error: 'Percentage cannot exceed 100' });
  const cleanCode = (code || '').replace(/<[^>]*>/g, '').trim().toUpperCase().slice(0, 30);
  if (!cleanCode) return res.status(400).json({ error: 'Invalid code' });
  const db = getDb();
  try {
    const r = db.prepare('INSERT INTO promo_codes (code, type, value, min_order, max_uses, expires_at) VALUES (?,?,?,?,?,?)').run(cleanCode, type, numValue, Math.max(0, parseFloat(min_order) || 0), Math.max(0, parseInt(max_uses) || 0), expires_at || null);
    const promo = db.prepare('SELECT * FROM promo_codes WHERE id = ?').get(r.lastInsertRowid);
    res.json(promo);
  } catch (e) {
    res.status(409).json({ error: 'Code already exists' });
  }
});

router.put('/promos/:id', adminOnlyMiddleware, (req, res) => {
  const { active, code, type, value, min_order, max_uses, expires_at } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM promo_codes WHERE id = ?').get(req.params.id);
  if (!existing) { return res.status(404).json({ error: 'Not found' }); }
  db.prepare('UPDATE promo_codes SET code=?, type=?, value=?, min_order=?, max_uses=?, expires_at=?, active=? WHERE id=?').run(
    code ?? existing.code, type ?? existing.type, value ?? existing.value,
    min_order ?? existing.min_order, max_uses ?? existing.max_uses,
    expires_at ?? existing.expires_at, active != null ? (active ? 1 : 0) : existing.active, req.params.id
  );
  const promo = db.prepare('SELECT * FROM promo_codes WHERE id = ?').get(req.params.id);
  res.json(promo);
});

router.delete('/promos/:id', adminOnlyMiddleware, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM promo_codes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ========== CUSTOMERS ==========
router.get('/customers', adminOnlyMiddleware, (req, res) => {
  const db = getDb();
  const customers = db.prepare(`
    SELECT u.id, u.name, u.email, u.phone, u.loyalty_points, u.created_at,
      COUNT(DISTINCT o.id) as order_count,
      COALESCE(SUM(o.total), 0) as total_spent,
      MAX(o.created_at) as last_order
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
    WHERE u.role = 'customer'
    GROUP BY u.id
    ORDER BY total_spent DESC
  `).all();
  res.json(customers);
});

// Contact messages
router.get('/messages', adminOnlyMiddleware, (req, res) => {
  const db = getDb();
  const messages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100').all();
  res.json(messages);
});

router.put('/messages/:id/read', adminOnlyMiddleware, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run('read', req.params.id);
  res.json({ success: true });
});

module.exports = router;
