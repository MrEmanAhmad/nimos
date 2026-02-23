const express = require('express');
const { getDb } = require('../db/init');
const { adminOnlyMiddleware, authMiddleware } = require('../middleware/auth');
const router = express.Router();

// In-memory menu cache (invalidated on admin writes)
let menuCache = null;
let menuCacheTime = 0;
const MENU_CACHE_TTL = 30000; // 30 seconds

function invalidateMenuCache() { menuCache = null; menuCacheTime = 0; }

// Public: get full menu with options
router.get('/', (req, res) => {
  // Serve from cache if fresh
  if (menuCache && (Date.now() - menuCacheTime) < MENU_CACHE_TTL) {
    res.set('X-Cache', 'HIT');
    return res.json(menuCache);
  }
  const db = getDb();
  const categories = db.prepare('SELECT * FROM menu_categories WHERE active = 1 ORDER BY sort_order').all();
  const items = db.prepare('SELECT * FROM menu_items WHERE active = 1 ORDER BY name').all();
  const groups = db.prepare('SELECT * FROM option_groups ORDER BY sort_order').all();
  const choices = db.prepare('SELECT * FROM option_choices ORDER BY sort_order').all();

  // Get restaurant status
  const isOpen = db.prepare("SELECT value FROM settings WHERE key = 'restaurant_open'").get()?.value === '1';
  const pauseOrders = db.prepare("SELECT value FROM settings WHERE key = 'pause_orders'").get()?.value === '1';
  const busyMode = db.prepare("SELECT value FROM settings WHERE key = 'busy_mode'").get()?.value === '1';
  const deliveryMin = db.prepare("SELECT value FROM settings WHERE key = 'delivery_min_order'").get()?.value || '15';

  // Assemble options onto items
  const groupsMap = {};
  for (const g of groups) {
    if (!groupsMap[g.menu_item_id]) groupsMap[g.menu_item_id] = [];
    groupsMap[g.menu_item_id].push({ ...g, choices: choices.filter(c => c.group_id === g.id) });
  }

  const menu = categories.map(cat => ({
    ...cat,
    items: items.filter(i => i.category_id === cat.id).map(i => ({
      ...i,
      upsell_ids: JSON.parse(i.upsell_ids || '[]'),
      option_groups: groupsMap[i.id] || []
    }))
  }));

  const response = { menu, status: { open: isOpen, paused: pauseOrders, busy: busyMode, delivery_min_order: parseFloat(deliveryMin) } };
  menuCache = response;
  menuCacheTime = Date.now();
  res.set('X-Cache', 'MISS');
  res.json(response);
});

// Search
router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);
  const cleanQ = q.slice(0, 100);
  const db = getDb();
  const items = db.prepare("SELECT mi.*, mc.name as category_name, mc.icon as category_icon FROM menu_items mi JOIN menu_categories mc ON mi.category_id = mc.id WHERE mi.active = 1 AND (mi.name LIKE ? OR mi.description LIKE ? OR mc.name LIKE ?)").all(`%${cleanQ}%`, `%${cleanQ}%`, `%${cleanQ}%`);
  res.json(items);
});

// Admin: add item (invalidates cache)
router.post('/', adminOnlyMiddleware, (req, res) => {
  invalidateMenuCache();
  const { category_id, name, description, price, popular, image_url, upsell_ids } = req.body;
  if (!category_id || !name || price == null) return res.status(400).json({ error: 'category_id, name, price required' });
  const stripHtml = (str) => (str || '').replace(/<[^>]*>/g, '').trim();
  const cleanName = stripHtml(name).slice(0, 200);
  const cleanDesc = stripHtml(description).slice(0, 1000);
  if (!cleanName) return res.status(400).json({ error: 'Invalid name' });
  const db = getDb();
  const r = db.prepare('INSERT INTO menu_items (category_id, name, description, price, popular, image_url, upsell_ids) VALUES (?,?,?,?,?,?,?)').run(category_id, cleanName, cleanDesc, price, popular ? 1 : 0, image_url || '', JSON.stringify(upsell_ids || []));
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(r.lastInsertRowid);
  res.json(item);
});

// Admin: update item (invalidates cache)
router.put('/:id', adminOnlyMiddleware, (req, res) => {
  invalidateMenuCache();
  const { name, description, price, popular, active, category_id, image_url, upsell_ids } = req.body;
  const stripTags = (str) => str ? str.replace(/<[^>]*>/g, '').trim() : null;
  const cleanName = name != null ? (stripTags(name).slice(0, 200) || null) : null;
  const cleanDesc = description != null ? (stripTags(description).slice(0, 1000) || null) : null;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!existing) { return res.status(404).json({ error: 'Item not found' }); }
  db.prepare('UPDATE menu_items SET name=?, description=?, price=?, popular=?, active=?, category_id=?, image_url=?, upsell_ids=? WHERE id=?').run(
    cleanName ?? existing.name, cleanDesc ?? existing.description, price ?? existing.price,
    popular != null ? (popular ? 1 : 0) : existing.popular, active != null ? (active ? 1 : 0) : existing.active,
    category_id ?? existing.category_id, image_url ?? existing.image_url,
    upsell_ids ? JSON.stringify(upsell_ids) : existing.upsell_ids, req.params.id
  );
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  res.json(item);
});

// Admin: deactivate (invalidates cache)
router.delete('/:id', adminOnlyMiddleware, (req, res) => {
  invalidateMenuCache();
  const db = getDb();
  db.prepare('UPDATE menu_items SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Public: get recent reviews with user first name and menu items
router.get('/reviews', (req, res) => {
  const db = getDb();
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const reviews = db.prepare(`
    SELECT r.id, r.rating, r.comment, r.created_at,
           substr(u.name, 1, instr(u.name || ' ', ' ') - 1) as reviewer_name,
           GROUP_CONCAT(mi.name, ', ') as items_ordered
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN order_items oi ON r.order_id = oi.order_id
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    GROUP BY r.id
    ORDER BY r.created_at DESC
    LIMIT ?
  `).all(limit);
  res.json(reviews);
});

module.exports = router;
