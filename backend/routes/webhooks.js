const express = require('express');
const { getDb } = require('../db/init');
const { broadcast } = require('../sse');
const router = express.Router();

// Helper: create order from platform webhook data
function createPlatformOrder(platform, externalId, items, customerInfo, rawData) {
  const db = getDb();
  let total = 0;
  const resolvedItems = [];

  for (const item of items) {
    // Try to match by name
    const menuItem = db.prepare('SELECT * FROM menu_items WHERE name LIKE ? AND active = 1').get(`%${item.name}%`);
    const price = menuItem ? menuItem.price : item.price || 0;
    const qty = item.quantity || 1;
    total += price * qty;
    resolvedItems.push({ menu_item_id: menuItem?.id || 1, quantity: qty, price, notes: item.notes || '' });
  }

  const orderResult = db.prepare('INSERT INTO orders (user_id, status, type, total, delivery_address, phone, notes, estimated_ready) VALUES (?,?,?,?,?,?,?,?)').run(
    null, 'pending', customerInfo.type || 'delivery', Math.round(total * 100) / 100,
    customerInfo.address || '', customerInfo.phone || '', `[${platform.toUpperCase()}] ${customerInfo.notes || ''}`,
    new Date(Date.now() + 60 * 60000).toISOString()
  );
  const orderId = orderResult.lastInsertRowid;

  const insertItem = db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price, notes) VALUES (?,?,?,?,?)');
  for (const item of resolvedItems) {
    insertItem.run(orderId, item.menu_item_id, item.quantity, item.price, item.notes);
  }

  db.prepare('INSERT INTO platform_orders (order_id, platform, external_id, raw_data) VALUES (?,?,?,?)').run(orderId, platform, externalId, JSON.stringify(rawData));

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const orderItems = db.prepare('SELECT oi.*, mi.name as item_name FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = ?').all(orderId);

  const fullOrder = { ...order, items: orderItems };
  broadcast({ type: 'new_order', order: fullOrder, platform });
  return fullOrder;
}

// Just Eat webhook - receives orders via JET Partner API
// JET sends POST with order data including items, customer, delivery info
router.post('/justeat', (req, res) => {
  const data = req.body;
  // JET order structure: { Id, Customer: { Name, Phone, Address }, Items: [{ Name, Quantity, UnitPrice }] }
  const externalId = data.Id || data.id || `jet-${Date.now()}`;
  const items = (data.Items || data.items || []).map(i => ({
    name: i.Name || i.name,
    quantity: i.Quantity || i.quantity || 1,
    price: i.UnitPrice || i.unitPrice || i.price || 0,
    notes: i.Note || i.note || ''
  }));
  const customer = data.Customer || data.customer || {};
  const customerInfo = {
    type: 'delivery',
    address: customer.Address || customer.address || '',
    phone: customer.Phone || customer.phone || '',
    notes: customer.Note || customer.note || ''
  };

  const order = createPlatformOrder('justeat', externalId, items, customerInfo, data);
  res.json({ success: true, orderId: order.id });
});

// Deliveroo webhook
// Deliveroo sends order events with items and fulfillment details
router.post('/deliveroo', (req, res) => {
  const data = req.body;
  const externalId = data.order_id || data.id || `del-${Date.now()}`;
  const items = (data.items || []).map(i => ({
    name: i.name || i.product_name,
    quantity: i.quantity || 1,
    price: i.total_price?.fractional ? i.total_price.fractional / 100 : i.price || 0,
    notes: i.modifiers?.map(m => m.name).join(', ') || ''
  }));
  const fulfillment = data.fulfillment || {};
  const customerInfo = {
    type: fulfillment.type === 'collection' ? 'pickup' : 'delivery',
    address: fulfillment.delivery_address?.formatted_address || '',
    phone: data.customer?.phone || '',
    notes: data.customer?.note || ''
  };

  const order = createPlatformOrder('deliveroo', externalId, items, customerInfo, data);
  res.json({ success: true, orderId: order.id });
});

module.exports = router;
