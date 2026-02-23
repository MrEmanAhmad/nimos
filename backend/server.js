const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { initialize } = require('./db/init');

initialize();

const app = express();

// Gzip/deflate compression for all responses
app.use(compression({ threshold: 256 }));

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://www.google.com", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
const allowedOrigins = [
  'http://localhost', 'http://localhost:3001',
  'http://nimoslimerick.ie', 'https://nimoslimerick.ie',
  'http://www.nimoslimerick.ie', 'https://www.nimoslimerick.ie',
  'http://order.nimoslimerick.ie', 'https://order.nimoslimerick.ie',
  'http://nimos.emanahmad.cloud', 'https://nimos.emanahmad.cloud'
];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (same-origin, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Request logging (concise, production-friendly)
const requestStats = { total: 0, errors: 0, byRoute: {} };
app.use((req, res, next) => {
  requestStats.total++;
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) requestStats.errors++;
    // Log slow requests (>2s) and errors
    if (duration > 2000 || res.statusCode >= 500) {
      console.log(`[REQ] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    }
    // Track route stats
    const route = `${req.method} ${req.path.split('/').slice(0, 3).join('/')}`;
    if (!requestStats.byRoute[route]) requestStats.byRoute[route] = { count: 0, errors: 0 };
    requestStats.byRoute[route].count++;
    if (res.statusCode >= 400) requestStats.byRoute[route].errors++;
  });
  next();
});

// Rate limiting - always return JSON responses
const jsonRateLimitHandler = (req, res, next, options) => {
  res.status(options.statusCode).json(options.message);
};
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later' },
  handler: jsonRateLimitHandler,
});
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many webhook requests' },
  handler: jsonRateLimitHandler,
});
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/webhooks', webhookLimiter);

// Trust proxy (behind nginx)
app.set('trust proxy', 1);
// Serve frontend from /opt/nimos-website (production build), fallback to local public/
const frontendDir = require('fs').existsSync('/opt/nimos-website/index.html')
  ? '/opt/nimos-website'
  : path.join(__dirname, 'public');
app.use(express.static(frontendDir, {
  maxAge: '1h',
  setHeaders(res, filePath) {
    // Vite hashed assets can be cached forever
    if (filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Service worker must never be cached
    if (filePath.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Admin SSE with query token support (EventSource can't set headers)
// Must be defined BEFORE admin router to take priority
const jwt = require('jsonwebtoken');
const { SECRET } = require('./middleware/auth');
const { addClient, removeClient } = require('./sse');
app.get('/api/admin/orders/stream', (req, res) => {
  const token = req.query.token || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const user = jwt.verify(token, SECRET);
    if (user.role !== 'admin' && user.role !== 'kitchen') return res.status(403).json({ error: 'Forbidden' });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  const clientId = addClient(res);
  req.on('close', () => removeClient(clientId));
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/customer', require('./routes/customer'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/menu', require('./routes/menu'));
app.use('/api/admin/platforms', require('./routes/platforms'));
app.use('/api/webhooks', require('./routes/webhooks'));

// Public: active deals/promos (no auth needed, limited fields)
app.get('/api/deals', (req, res) => {
  const { getDb } = require('./db/init');
  const db = getDb();
  const deals = db.prepare(`SELECT code, type, value, min_order, expires_at FROM promo_codes WHERE active = 1 AND (expires_at IS NULL OR expires_at > datetime('now')) AND (max_uses = 0 OR used_count < max_uses)`).all();
  res.json(deals.map(d => ({
    code: d.code,
    description: d.type === 'percentage' ? `${d.value}% off` : `€${d.value.toFixed(2)} off`,
    type: d.type,
    value: d.value,
    min_order: d.min_order,
    expires_at: d.expires_at
  })));
});

// Health check (basic - public)
app.get('/api/health', (req, res) => {
  const { getDb } = require('./db/init');
  try {
    const db = getDb();
    const count = db.prepare('SELECT COUNT(*) as c FROM menu_items').get().c;
    res.json({ status: 'ok', menu_items: count, uptime: Math.floor(process.uptime()) });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// Detailed stats (admin only)
app.get('/api/health/stats', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Auth required' });
  try {
    const user = jwt.verify(token, SECRET);
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  } catch { return res.status(401).json({ error: 'Invalid token' }); }

  const { getDb } = require('./db/init');
  const db = getDb();
  const mem = process.memoryUsage();
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const ordersToday = db.prepare('SELECT COUNT(*) as c FROM orders WHERE created_at >= ?').get(todayStart.toISOString()).c;
  const revenueToday = db.prepare('SELECT COALESCE(SUM(total),0) as t FROM orders WHERE created_at >= ? AND status != ?').get(todayStart.toISOString(), 'cancelled').t;
  const activeUsers = db.prepare('SELECT COUNT(*) as c FROM users WHERE last_login >= ?').get(new Date(Date.now() - 7 * 86400000).toISOString()).c;
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    memory: { rss: Math.round(mem.rss / 1048576), heap: Math.round(mem.heapUsed / 1048576) },
    requests: { total: requestStats.total, errors: requestStats.errors },
    today: { orders: ordersToday, revenue: Math.round(revenueToday * 100) / 100 },
    active_users_7d: activeUsers,
    sse_clients: Object.keys(require('./sse').__clients || {}).length
  });
});

// SEO landing pages
const seoDir = path.join(__dirname, 'public/seo');
app.get('/takeaway-limerick', (req, res) => res.sendFile(path.join(seoDir, 'takeaway-limerick.html')));
app.get('/pizza-delivery-limerick', (req, res) => res.sendFile(path.join(seoDir, 'pizza-delivery-limerick.html')));
app.get('/best-takeaway-knocklong', (req, res) => res.sendFile(path.join(seoDir, 'best-takeaway-knocklong.html')));
app.get('/burger-delivery-limerick', (req, res) => res.sendFile(path.join(seoDir, 'takeaway-limerick.html')));
app.get('/kebab-delivery-limerick', (req, res) => res.sendFile(path.join(seoDir, 'takeaway-limerick.html')));
app.get('/why-nimos', (req, res) => res.sendFile(path.join(seoDir, 'why-nimos.html')));
app.get('/chicken-box-limerick', (req, res) => res.sendFile(path.join(seoDir, 'chicken-box-limerick.html')));

// SPA fallback for admin and kitchen routes — serve React index.html
app.get('/admin/*', (req, res) => {
  const indexPath = path.join(frontendDir, 'index.html');
  res.sendFile(indexPath);
});
app.get('/kitchen', (req, res) => {
  const indexPath = path.join(frontendDir, 'index.html');
  res.sendFile(indexPath);
});

// Customer order tracking SSE (authenticated via query token)
app.get('/api/orders/:id/stream', (req, res) => {
  const token = req.query.token || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const user = jwt.verify(token, SECRET);
    // Verify user owns this order
    const { getDb } = require('./db/init');
    const db = getDb();
    const order = db.prepare('SELECT id, user_id FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== user.id && user.role !== 'admin' && user.role !== 'kitchen') {
      return res.status(403).json({ error: 'Not authorized to track this order' });
    }
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  const clientId = addClient(res);
  req.on('close', () => removeClient(clientId));
});

// Contact form endpoint - rate limited separately
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { error: 'Too many messages. Please try again later.' }, handler: jsonRateLimitHandler });
app.post('/api/contact', contactLimiter, (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'Name and message required' });
  if (name.length > 200 || (email && email.length > 200) || (phone && phone.length > 30) || message.length > 5000) {
    return res.status(400).json({ error: 'Input too long' });
  }
  const stripHtml = (str) => str.replace(/<[^>]*>/g, '').trim();
  const { getDb } = require('./db/init');
  const db = getDb();
  try {
    db.prepare('INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)').run(
      stripHtml(name), (email || '').trim().toLowerCase(), stripHtml(phone || ''), stripHtml(message)
    );
    console.log('[CONTACT]', { name, email, timestamp: new Date().toISOString() });
    res.json({ success: true, message: 'Thank you! We will get back to you soon.' });
  } catch (e) {
    console.error('[CONTACT ERROR]', e.message);
    res.status(500).json({ error: 'Failed to save message. Please try again.' });
  }
});

// SPA catch-all: serve index.html for any non-API, non-file routes
app.get('*', (req, res) => {
  const indexPath = path.join(frontendDir, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Global error handler - don't leak stack traces
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => console.log(`Nimo's server running on http://localhost:${PORT}`));

process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received, shutting down gracefully');
  server.close(() => {
    const { closeDb } = require('./db/init');
    closeDb();
    process.exit(0);
  });
});
process.on('SIGINT', () => {
  console.log('[SERVER] SIGINT received, shutting down gracefully');
  server.close(() => {
    const { closeDb } = require('./db/init');
    closeDb();
    process.exit(0);
  });
});
