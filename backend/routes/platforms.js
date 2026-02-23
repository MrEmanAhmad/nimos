const express = require('express');
const { getDb } = require('../db/init');
const { adminOnlyMiddleware } = require('../middleware/auth');
const { broadcast } = require('../sse');
const router = express.Router();

// Get all platform connections
router.get('/', adminOnlyMiddleware, (req, res) => {
  const db = getDb();
  const platforms = {
    justeat: JSON.parse(db.prepare("SELECT value FROM settings WHERE key = 'platform_justeat'").get()?.value || '{}'),
    deliveroo: JSON.parse(db.prepare("SELECT value FROM settings WHERE key = 'platform_deliveroo'").get()?.value || '{}'),
    orderyoyo: JSON.parse(db.prepare("SELECT value FROM settings WHERE key = 'platform_orderyoyo'").get()?.value || '{}')
  };
  // Mask secrets
  for (const p of Object.values(platforms)) {
    if (p.api_key) p.api_key = p.api_key.replace(/.(?=.{4})/g, '*');
    if (p.client_secret) p.client_secret = p.client_secret.replace(/.(?=.{4})/g, '*');
    if (p.secret) p.secret = p.secret.replace(/.(?=.{4})/g, '*');
  }
  res.json(platforms);
});

// Connect Just Eat
// JET uses OAuth2 + REST API. Orders arrive via webhook.
// Docs: https://developers.just-eat.com
router.post('/justeat/connect', adminOnlyMiddleware, (req, res) => {
  const { api_key, restaurant_id, secret } = req.body;
  if (!api_key || !restaurant_id) return res.status(400).json({ error: 'API key and restaurant ID required' });
  const db = getDb();
  const config = { connected: true, api_key, restaurant_id, secret: secret || '', webhook_url: '/api/webhooks/justeat' };
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('platform_justeat', ?)").run(JSON.stringify(config));
  res.json({ success: true, message: 'Just Eat connected. Configure webhook URL in JET Partner Portal to point to your server /api/webhooks/justeat', config: { connected: true, restaurant_id, webhook_url: config.webhook_url } });
});

// Connect Deliveroo
// Deliveroo uses OAuth2 Partner Platform Suite
// Docs: https://developers.deliveroo.com
router.post('/deliveroo/connect', adminOnlyMiddleware, (req, res) => {
  const { client_id, client_secret, restaurant_id } = req.body;
  if (!client_id || !client_secret || !restaurant_id) return res.status(400).json({ error: 'Client ID, secret, and restaurant ID required' });
  const db = getDb();
  const config = { connected: true, client_id, client_secret, restaurant_id, webhook_url: '/api/webhooks/deliveroo' };
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('platform_deliveroo', ?)").run(JSON.stringify(config));
  res.json({ success: true, message: 'Deliveroo connected. Set webhook URL in Deliveroo Partner Portal to /api/webhooks/deliveroo', config: { connected: true, restaurant_id, webhook_url: config.webhook_url } });
});

// Connect OrderYOYO
router.post('/orderyoyo/connect', adminOnlyMiddleware, (req, res) => {
  const { api_key, restaurant_id } = req.body;
  if (!api_key || !restaurant_id) return res.status(400).json({ error: 'API key and restaurant ID required' });
  const db = getDb();
  const config = { connected: true, api_key, restaurant_id };
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('platform_orderyoyo', ?)").run(JSON.stringify(config));
  res.json({ success: true, message: 'OrderYOYO connected', config: { connected: true, restaurant_id } });
});

module.exports = router;
