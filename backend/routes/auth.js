const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db/init');
const { generateToken, authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password required' });

  // Sanitize inputs - strip HTML tags to prevent stored XSS
  const sanitize = (str) => str.replace(/<[^>]*>/g, '').trim();
  const cleanName = sanitize(name).slice(0, 100);
  const cleanEmail = email.trim().toLowerCase().slice(0, 200);
  const cleanPhone = sanitize(phone || '').slice(0, 30);

  if (!cleanName) return res.status(400).json({ error: 'Invalid name' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return res.status(400).json({ error: 'Invalid email format' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (password.length > 72) return res.status(400).json({ error: 'Password must be 72 characters or fewer' });

  const db = getDb();
  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) { return res.status(409).json({ error: 'Email already registered' }); }
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(cleanName, cleanEmail, cleanPhone, hash, 'customer');
    const newUser = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.json({ token: generateToken(newUser), user: newUser });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const cleanEmail = (email || '').trim().toLowerCase().slice(0, 200);
  if (!cleanEmail) return res.status(400).json({ error: 'Invalid email' });
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
  const { password_hash, ...safe } = user;
  res.json({ token: generateToken(user), user: safe });
});

router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current password and new password required' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
  if (newPassword.length > 72) return res.status(400).json({ error: 'New password must be 72 characters or fewer' });
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) return res.status(401).json({ error: 'Current password is incorrect' });
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
