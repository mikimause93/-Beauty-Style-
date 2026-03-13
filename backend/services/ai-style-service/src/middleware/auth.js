/**
 * Authentication middleware.
 * In production, verify the JWT issued by the main auth service.
 * In development (no JWT_SECRET set), fall back to x-user-id header or 'demo-user'.
 */
const crypto = require('crypto');

function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;

  if (secret) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'unauthorized', message: 'Bearer token required' });
    }
    const token = authHeader.slice(7);
    const payload = verifyJWT(token, secret);
    if (!payload) {
      return res.status(401).json({ error: 'invalid_token' });
    }
    req.user = payload;
  } else {
    // Development fallback
    const userId = req.headers['x-user-id'] || 'demo-user';
    req.user = { userId };
  }

  next();
}

/**
 * Minimal JWT verification (HS256).
 * For production, use a library such as jsonwebtoken.
 */
function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expected) return null;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;

    // Normalise userId field
    data.userId = data.userId || data.sub || data.id;
    return data;
  } catch {
    return null;
  }
}

module.exports = { requireAuth };
