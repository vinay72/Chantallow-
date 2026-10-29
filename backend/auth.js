const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const ROLES = ['user', 'admin'];

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Add a long random string to backend/.env.');
}

// Shape returned to the client — never includes password_hash.
function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role, created_at: row.created_at };
}

function signToken(user) {
  return jwt.sign({ sub: String(user.id), role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function tokenResponse(user) {
  return {
    success: true,
    token: signToken(user),
    token_type: 'Bearer',
    expires_in: JWT_EXPIRES_IN,
    user: publicUser(user),
  };
}

const hashPassword = (password) => bcrypt.hash(password, 10);
const checkPassword = (password, hash) => bcrypt.compare(password, hash);

// Verifies the Bearer token and loads the user fresh from the DB, so a role
// change or deleted account takes effect immediately rather than at token expiry.
async function requireAuth(req, res, next) {
  const [scheme, token] = (req.get('authorization') || '').split(' ');

  if (!token || !/^Bearer$/i.test(scheme)) {
    return res.status(401).json({
      success: false,
      error: 'Missing token. Send "Authorization: Bearer <token>".',
    });
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: err.name === 'TokenExpiredError' ? 'Token expired. Log in again.' : 'Invalid token.',
    });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [payload.sub]);
    if (!rows.length) return res.status(401).json({ success: false, error: 'Account no longer exists.' });
    req.user = publicUser(rows[0]);
    next();
  } catch (err) {
    next(err);
  }
}

// Like requireAuth, but lets anonymous requests through (req.user stays unset).
// A token that is sent must still be valid.
const optionalAuth = (req, res, next) =>
  req.get('authorization') ? requireAuth(req, res, next) : next();

// Use after requireAuth: requireRole('admin')
const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role)
    ? next()
    : res.status(403).json({ success: false, error: 'You do not have permission to do that.' });

// Creates the account from <PREFIX>_EMAIL / <PREFIX>_PASSWORD if it doesn't exist yet.
// For the admin, an existing account with that email is promoted to admin.
async function seedAccount(prefix, role) {
  const email = (process.env[`${prefix}_EMAIL`] || '').trim().toLowerCase();
  const password = process.env[`${prefix}_PASSWORD`] || '';
  if (!email || !password) {
    console.warn(`${prefix}_EMAIL / ${prefix}_PASSWORD not set — no ${role} account seeded.`);
    return;
  }

  const { rows } = await pool.query('SELECT id, role FROM users WHERE lower(email) = $1', [email]);
  if (rows.length) {
    if (role === 'admin' && rows[0].role !== 'admin') {
      await pool.query(`UPDATE users SET role = 'admin', updated_at = now() WHERE id = $1`, [rows[0].id]);
      console.log(`Promoted ${email} to admin.`);
    }
    return;
  }

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
    [process.env[`${prefix}_NAME`] || (role === 'admin' ? 'Admin' : 'Customer'), email, await hashPassword(password), role]
  );
  console.log(`Seeded ${role} account ${email}.`);
}

// Admin from ADMIN_*, plus an optional regular customer login from USER_*.
async function seedAccounts() {
  await seedAccount('ADMIN', 'admin');
  await seedAccount('USER', 'user');
}

module.exports = {
  ROLES,
  publicUser,
  tokenResponse,
  hashPassword,
  checkPassword,
  requireAuth,
  optionalAuth,
  requireRole,
  seedAccounts,
};
