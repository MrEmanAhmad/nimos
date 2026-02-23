const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate and persist a strong JWT secret
function getOrCreateSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const secretFile = path.join(__dirname, '..', '.jwt-secret');
  try {
    const existing = fs.readFileSync(secretFile, 'utf8').trim();
    if (existing.length >= 32) return existing;
  } catch {}
  const secret = crypto.randomBytes(64).toString('hex');
  fs.writeFileSync(secretFile, secret, { mode: 0o600 });
  console.log('[AUTH] Generated new JWT secret');
  return secret;
}
const SECRET = getOrCreateSecret();

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token = (header && header.startsWith('Bearer ')) ? header.split(' ')[1] : req.query.token;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin' && req.user.role !== 'kitchen') return res.status(403).json({ error: 'Admin access required' });
    next();
  });
}

function adminOnlyMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    next();
  });
}

module.exports = { generateToken, authMiddleware, adminMiddleware, adminOnlyMiddleware, SECRET };
