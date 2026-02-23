const express = require('express');
const { getDb } = require('../db/init');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// ========== FAVOURITES ==========
router.get('/favourites', authMiddleware, (req, res) => {
  const db = getDb();
  const favs = db.prepare('SELECT f.*, mi.name, mi.price, mi.description, mi.popular, mi.avg_rating, mc.icon as category_icon FROM favourites f JOIN menu_items mi ON f.menu_item_id = mi.id JOIN menu_categories mc ON mi.category_id = mc.id WHERE f.user_id = ? AND mi.active = 1').all(req.user.id);
  res.json(favs);
});

router.post('/favourites', authMiddleware, (req, res) => {
  const { menu_item_id } = req.body;
  const db = getDb();
  try {
    db.prepare('INSERT INTO favourites (user_id, menu_item_id) VALUES (?,?)').run(req.user.id, menu_item_id);
    res.json({ success: true });
  } catch (e) {
    res.json({ success: true, message: 'Already favourited' });
  }
});

router.delete('/favourites/:itemId', authMiddleware, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM favourites WHERE user_id = ? AND menu_item_id = ?').run(req.user.id, req.params.itemId);
  res.json({ success: true });
});

// ========== ADDRESSES ==========
router.get('/addresses', authMiddleware, (req, res) => {
  const db = getDb();
  const addrs = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.user.id);
  res.json(addrs);
});

router.post('/addresses', authMiddleware, (req, res) => {
  const { label, address } = req.body;
  if (!address) return res.status(400).json({ error: 'Address required' });
  const sanitize = (str) => str ? str.replace(/<[^>]*>/g, '').trim() : '';
  const cleanLabel = sanitize(label || 'Home').slice(0, 50);
  const cleanAddress = sanitize(address).slice(0, 500);
  if (!cleanAddress) return res.status(400).json({ error: 'Invalid address' });
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) as c FROM addresses WHERE user_id = ?').get(req.user.id).c;
  const r = db.prepare('INSERT INTO addresses (user_id, label, address, is_default) VALUES (?,?,?,?)').run(req.user.id, cleanLabel, cleanAddress, count === 0 ? 1 : 0);
  const addr = db.prepare('SELECT * FROM addresses WHERE id = ?').get(r.lastInsertRowid);
  res.json(addr);
});

router.put('/addresses/:id', authMiddleware, (req, res) => {
  const { label, address, is_default } = req.body;
  const stripTags = (str) => str ? str.replace(/<[^>]*>/g, '').trim() : null;
  const cleanLabel = label ? stripTags(label).slice(0, 50) : null;
  const cleanAddress = address ? stripTags(address).slice(0, 500) : null;
  const db = getDb();
  if (is_default) db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  db.prepare('UPDATE addresses SET label = COALESCE(?, label), address = COALESCE(?, address), is_default = COALESCE(?, is_default) WHERE id = ? AND user_id = ?').run(cleanLabel, cleanAddress, is_default ? 1 : null, req.params.id, req.user.id);
  const addr = db.prepare('SELECT * FROM addresses WHERE id = ?').get(req.params.id);
  res.json(addr);
});

router.delete('/addresses/:id', authMiddleware, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// ========== REVIEWS ==========
router.post('/reviews', authMiddleware, (req, res) => {
  const { order_id, rating, comment } = req.body;
  if (!order_id || !rating) return res.status(400).json({ error: 'order_id and rating required' });
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = ?').get(order_id, req.user.id, 'delivered');
  if (!order) { return res.status(400).json({ error: 'Can only review delivered orders' }); }
  try {
    const cleanComment = (comment || '').replace(/<[^>]*>/g, '').trim().slice(0, 1000);
    db.prepare('INSERT INTO reviews (order_id, user_id, rating, comment) VALUES (?,?,?,?)').run(order_id, req.user.id, Math.min(Math.max(parseInt(rating), 1), 5), cleanComment);
    // Update avg ratings for items in this order
    const items = db.prepare('SELECT DISTINCT menu_item_id FROM order_items WHERE order_id = ?').all(order_id);
    for (const item of items) {
      const avg = db.prepare('SELECT AVG(r.rating) as avg, COUNT(*) as cnt FROM reviews r JOIN order_items oi ON r.order_id = oi.order_id WHERE oi.menu_item_id = ?').get(item.menu_item_id);
      db.prepare('UPDATE menu_items SET avg_rating = ?, review_count = ? WHERE id = ?').run(Math.round((avg.avg || 0) * 10) / 10, avg.cnt || 0, item.menu_item_id);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(409).json({ error: 'Already reviewed this order' });
  }
});

// ========== LOYALTY ==========
router.get('/loyalty', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT loyalty_points FROM users WHERE id = ?').get(req.user.id);
  const history = db.prepare('SELECT * FROM loyalty_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.user.id);
  const threshold = parseInt(db.prepare("SELECT value FROM settings WHERE key = 'loyalty_redeem_threshold'").get()?.value || '50');
  const redeemValue = parseFloat(db.prepare("SELECT value FROM settings WHERE key = 'loyalty_redeem_value'").get()?.value || '5');
  res.json({ points: user?.loyalty_points || 0, threshold, redeem_value: redeemValue, history });
});

// ========== NOTIFICATION PREFS ==========
router.get('/notifications', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT notify_sms, notify_email, notify_push FROM users WHERE id = ?').get(req.user.id);
  res.json(user || {});
});

router.put('/notifications', authMiddleware, (req, res) => {
  const { notify_sms, notify_email, notify_push } = req.body;
  const db = getDb();
  db.prepare('UPDATE users SET notify_sms = ?, notify_email = ?, notify_push = ? WHERE id = ?').run(notify_sms ? 1 : 0, notify_email ? 1 : 0, notify_push ? 1 : 0, req.user.id);
  res.json({ success: true });
});

// ========== PROFILE ==========
router.put('/profile', authMiddleware, (req, res) => {
  const { name, phone } = req.body;
  // Sanitize inputs
  const sanitize = (str) => str ? str.replace(/<[^>]*>/g, '').trim() : null;
  const cleanName = name ? sanitize(name).slice(0, 100) : null;
  const cleanPhone = phone ? sanitize(phone).slice(0, 30) : null;
  const db = getDb();
  db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?').run(cleanName, cleanPhone, req.user.id);
  const user = db.prepare('SELECT id, name, email, phone, role, loyalty_points, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

module.exports = router;
