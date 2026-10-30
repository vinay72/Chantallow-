require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { pool, testConnection, isConnectError } = require('./db');
const { upload } = require('./upload');
const { seedHomeContent } = require('./seed');
const {
  ROLES,
  publicUser,
  tokenResponse,
  hashPassword,
  checkPassword,
  requireAuth,
  optionalAuth,
  requireRole,
  seedAccounts,
} = require('./auth');

const app = express();

// ---------- config ----------

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// ---------- middleware ----------

// The React dev server runs on a different port, so it needs CORS.
app.use(cors({ origin: CLIENT_ORIGIN.split(',').map((o) => o.trim()) }));

// Multer parses multipart bodies on the upload routes; these must not touch them.
const skipMultipart = (parser) => (req, res, next) =>
  (req.headers['content-type'] || '').startsWith('multipart/form-data')
    ? next()
    : parser(req, res, next);

app.use(skipMultipart(express.urlencoded({ extended: true })));
app.use(skipMultipart(express.json()));

// Uploaded product media is served straight off disk.
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ---------- product helpers ----------

const CATEGORIES = ['Tallow', 'Skin Care', 'Body Care', 'Serum', 'Cream', 'Daily Care'];
const SIZES = ['2 oz', '4 oz', '8 oz', '16 oz'];
const STOCK_STATUSES = ['in_stock', 'out_of_stock'];

async function ensureSchema() {
  await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
}

function normalizeMedia(files) {
  return (files || []).map((f) => ({
    url: '/uploads/products/' + f.filename,
    type: f.mimetype.startsWith('video/') ? 'video' : 'image',
  }));
}

// Deletes uploaded media files from disk (only ones we stored ourselves).
function removeMediaFiles(media) {
  for (const m of Array.isArray(media) ? media : []) {
    if (typeof m.url === 'string' && m.url.startsWith('/uploads/products/')) {
      fs.unlink(path.join(__dirname, 'public', m.url), () => {});
    }
  }
}

// Gallery files arrive under `media`, the cover image under `main_image`.
const productUploads = upload.fields([
  { name: 'media', maxCount: 15 },
  { name: 'main_image', maxCount: 1 },
]);

const galleryFiles = (req) => req.files?.media || [];
const coverFile = (req) => req.files?.main_image?.[0] || null;
const coverUrl = (file) => (file ? '/uploads/products/' + file.filename : null);

// Removes everything this request uploaded (used when the request fails).
function removeRequestUploads(req) {
  removeMediaFiles(normalizeMedia(galleryFiles(req)));
  if (coverFile(req)) removeMediaFiles([{ url: coverUrl(coverFile(req)) }]);
}

// Parses the JSON `images` alternative to file uploads. Returns null if invalid.
function parseImagesField(raw) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : null;
  } catch (_) {
    return null;
  }
}

function validateProductBody(body, media, cover, { isCreate }) {
  const errors = [];
  const name = (body.name || '').trim();
  const subname = (body.subname || '').trim();
  const description = (body.description || '').trim();
  const ingredients = (body.ingredients || '').trim();
  const directions = (body.directions || '').trim();
  const category = (body.category || '').trim();
  const size = (body.size || '').trim();
  const stock_status = (body.stock_status || 'in_stock').trim();

  if (!name) errors.push('Product name is required.');

  const price = parseFloat(body.price);
  if (Number.isNaN(price) || price < 0) errors.push('Price must be a number of 0 or more.');

  let compare_at_price = null;
  const rawCompare = body.compare_at_price;
  // Absent, null, or blank all mean "no compare-at price" — only validate a real value.
  if (rawCompare !== undefined && rawCompare !== null && String(rawCompare).trim() !== '') {
    compare_at_price = parseFloat(rawCompare);
    if (Number.isNaN(compare_at_price) || compare_at_price < 0) {
      errors.push('Compare-at price must be a number of 0 or more.');
    }
  }

  if (category && !CATEGORIES.includes(category)) errors.push('Unknown category.');
  if (size && !SIZES.includes(size)) errors.push('Unknown size.');
  if (!STOCK_STATUSES.includes(stock_status)) {
    errors.push('Stock status must be in_stock or out_of_stock.');
  }

  const images = media.filter((m) => m.type === 'image');
  const videos = media.filter((m) => m.type === 'video');
  if (isCreate && images.length < 4) errors.push('Add at least 4 product images.');
  if (images.length > 10) errors.push('You can add at most 10 images.');
  if (videos.length > 3) errors.push('You can add at most 3 videos.');
  if (isCreate && !cover) errors.push('Add a cover image.');
  if (cover && !cover.mimetype.startsWith('image/')) errors.push('Cover image must be an image file.');

  return {
    errors,
    values: {
      name, subname, description, ingredients, directions,
      price, compare_at_price, category, size, stock_status,
    },
  };
}

// Shared filter query: search, category, size, min_price, max_price
async function findProducts(query = {}) {
  const search = (query.search || '').trim();
  const category = (query.category || '').trim();
  const size = (query.size || '').trim();
  const minPrice = query.min_price;
  const maxPrice = query.max_price;

  const where = [];
  const params = [];
  let i = 1;

  if (search) {
    where.push(`(name ILIKE $${i} OR subname ILIKE $${i} OR description ILIKE $${i})`);
    params.push('%' + search + '%');
    i++;
  }
  if (category) {
    where.push(`category = $${i++}`);
    params.push(category);
  }
  if (size) {
    where.push(`size = $${i++}`);
    params.push(size);
  }
  if (minPrice !== undefined && String(minPrice).trim() !== '' && !Number.isNaN(parseFloat(minPrice))) {
    where.push(`price >= $${i++}`);
    params.push(parseFloat(minPrice));
  }
  if (maxPrice !== undefined && String(maxPrice).trim() !== '' && !Number.isNaN(parseFloat(maxPrice))) {
    where.push(`price <= $${i++}`);
    params.push(parseFloat(maxPrice));
  }

  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const { rows } = await pool.query(
    `SELECT * FROM products ${whereSql} ORDER BY created_at DESC, id DESC`,
    params
  );

  return {
    rows,
    filters: { search, category, size, min_price: minPrice || '', max_price: maxPrice || '' },
  };
}

const isValidId = (id) => /^\d+$/.test(String(id));

// ---------- home page settings ----------

const MAX_NEW_LAUNCHES = 4;

// The products picked as "new launches", in the admin's order. Products that
// were deleted since are skipped.
async function getNewLaunches() {
  const { rows: setting } = await pool.query(`SELECT value FROM site_settings WHERE key = 'home_new_launches'`);
  const ids = (setting[0]?.value || []).filter(isValidId).map(Number);
  if (!ids.length) return [];
  const { rows } = await pool.query(
    'SELECT * FROM products WHERE id = ANY($1::int[]) ORDER BY array_position($1::int[], id)',
    [ids]
  );
  return rows;
}

// ---------- combos & FAQs ----------

const COMBO_SIZES = ['2 oz', '4 oz', '8 oz', '16 oz'];
const isHexColor = (c) => /^#[0-9a-f]{6}$/i.test(String(c));
const asBool = (v, fallback) =>
  v === undefined || v === '' ? fallback : v === true || v === 'true' || v === '1' || v === 'on';

const publicCombo = (row) => ({
  ...row,
  price: Number(row.price),
  compare_at_price: row.compare_at_price == null ? null : Number(row.compare_at_price),
});

// Combo form fields (multipart or JSON). `items` may arrive as a JSON string.
async function validateComboBody(body, { hasImage }) {
  const errors = [];
  const name = clip(body.name, 200);
  if (!name) errors.push('Combo name is required.');

  const price = Number(body.price);
  if (body.price === undefined || String(body.price).trim() === '' || !isMoney(price)) {
    errors.push('Price must be a number of 0 or more.');
  }
  let compare = null;
  if (body.compare_at_price != null && String(body.compare_at_price).trim() !== '') {
    compare = Number(body.compare_at_price);
    if (!isMoney(compare)) errors.push('Compare-at price must be a number of 0 or more.');
  }

  const accent = clip(body.accent, 7) || null;
  if (accent && !isHexColor(accent)) errors.push('Card colour must look like #3B1941.');

  const position = body.position === undefined || String(body.position).trim() === '' ? 0 : Number(body.position);
  if (!Number.isInteger(position) || position < 0) errors.push('Position must be a whole number of 0 or more.');

  let raw = body.items;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch (_) {
      raw = null;
    }
  }
  if (!Array.isArray(raw) || raw.length === 0) errors.push('Add at least one product to the combo.');
  const items = (Array.isArray(raw) ? raw : []).map((it) => ({
    product_id: isValidId(it?.product_id) ? Number(it.product_id) : null,
    name: clip(it?.name, 200),
    size: clip(it?.size, 20),
    qty: Number(it?.qty ?? 1),
  }));
  if (items.length > 10) errors.push('A combo can have at most 10 products.');
  if (items.some((it) => !it.name)) errors.push('Every product in the combo needs a name.');
  if (items.some((it) => it.size && !COMBO_SIZES.includes(it.size))) errors.push('Unknown size in the combo.');
  if (items.some((it) => !Number.isInteger(it.qty) || it.qty < 1 || it.qty > 99)) {
    errors.push('Each product quantity must be between 1 and 99.');
  }

  // Linked products must exist; their current name is kept on the combo.
  const ids = [...new Set(items.map((it) => it.product_id).filter(Boolean))];
  if (ids.length) {
    const { rows } = await pool.query('SELECT id, name FROM products WHERE id = ANY($1::int[])', [ids]);
    const names = new Map(rows.map((r) => [r.id, r.name]));
    if (names.size !== ids.length) errors.push('One of the linked products no longer exists.');
    for (const it of items) if (it.product_id && names.has(it.product_id)) it.name = names.get(it.product_id);
  }

  if (!hasImage) errors.push('Add a combo image.');

  return {
    errors,
    values: {
      name, price, compare, accent, position, items,
      description: clip(body.description, 4000) || null,
      tag: clip(body.tag, 40) || null,
      is_active: asBool(body.is_active, true),
    },
  };
}

function validateFaqBody(body) {
  const errors = [];
  const question = clip(body?.question, 500);
  const answer = clip(body?.answer, 5000);
  if (!question) errors.push('Question is required.');
  if (!answer) errors.push('Answer is required.');
  return {
    errors,
    values: {
      question, answer,
      category: clip(body?.category, 80) || null,
      is_published: asBool(body?.is_published, true),
    },
  };
}

// ---------- order helpers ----------

const ORDER_STATUSES = ['in-progress', 'delayed', 'delivered', 'canceled'];
const CANCELLABLE_STATUSES = ['in-progress', 'delayed'];
const RETURN_STATUSES = ['Pending', 'Approved', 'Rejected', 'Refunded'];
// Where an admin may move a return request from each status. Refunded and
// Rejected are final.
const RETURN_NEXT = { Pending: ['Approved', 'Rejected'], Approved: ['Refunded', 'Rejected'], Rejected: [], Refunded: [] };

const isOrderId = (id) => /^[A-Z0-9]{6,20}$/.test(String(id));
const isReturnId = (id) => /^RR-[A-Z0-9]{4,20}$/.test(String(id));
const money = (n) => Math.round(Number(n) * 100) / 100;
const isMoney = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0;
const clip = (v, max = 500) => String(v ?? '').trim().slice(0, max);

const ADDRESS_FIELDS = ['firstName', 'lastName', 'company', 'country', 'street1', 'street2', 'city', 'cityOther', 'state', 'zip'];
function cleanAddress(a) {
  if (!a || typeof a !== 'object') return null;
  const out = {};
  for (const k of ADDRESS_FIELDS) if (clip(a[k], 200)) out[k] = clip(a[k], 200);
  return Object.keys(out).length ? out : null;
}

// One timeline entry, ready to append with `history || $n::jsonb`.
const historyEntry = (type, by) => JSON.stringify([{ type, at: new Date().toISOString(), by }]);

// pg returns NUMERIC columns as strings; the API sends numbers.
const publicOrder = (row) => ({
  ...row,
  subtotal: Number(row.subtotal),
  discount: Number(row.discount),
  shipping_cost: Number(row.shipping_cost),
  total: Number(row.total),
});
const publicReturn = (row) => ({ ...row, amount: Number(row.amount) });

// Checks the order sent by checkout and works out its totals.
function validateOrderBody(body) {
  const errors = [];
  const id = String(body?.id || '');
  if (!isOrderId(id)) errors.push('Invalid order number.');

  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (!rawItems.length) errors.push('An order needs at least one item.');
  if (rawItems.length > 100) errors.push('Too many items in one order.');
  const items = rawItems.map((l) => ({
    productId: String(l?.productId ?? ''),
    name: clip(l?.name, 200) || undefined,
    img: clip(l?.img, 500) || undefined,
    size: String(l?.size ?? ''),
    qty: Number(l?.qty),
    price: Number(l?.price),
  }));
  if (items.some((l) => !l.productId || !Number.isInteger(l.qty) || l.qty < 1 || !isMoney(l.price))) {
    errors.push('Every item needs a product, a whole quantity of 1 or more, and a price.');
  }

  const discount = Number(body?.discount ?? 0);
  const shippingCost = Number(body?.shippingCost ?? 0);
  if (!isMoney(discount) || !isMoney(shippingCost)) errors.push('Discount and shipping must be 0 or more.');

  const address = cleanAddress(body?.address);
  const subtotal = money(items.reduce((sum, l) => sum + l.qty * l.price, 0));
  const total = money(Math.max(0, subtotal - discount + shippingCost));
  return {
    errors,
    values: {
      id, items, subtotal, discount: money(discount), shippingCost: money(shippingCost), total, address,
      customerName: [address?.firstName, address?.lastName].filter(Boolean).join(' ') || null,
      email: clip(body?.email, 200).toLowerCase() || null,
      phone: clip(body?.phone, 40) || null,
      payment: clip(body?.payment, 40) || null,
      notes: clip(body?.notes, 2000) || null,
    },
  };
}

// ======================================================================
//  API  —  every route returns JSON
// ======================================================================

const api = express.Router();

// Reject non-numeric :id up front so Postgres never sees "abc" as an integer.
api.param('id', (req, res, next, id) =>
  isValidId(id) ? next() : res.status(404).json({ success: false, error: 'Not found' })
);

// ---------------------------- auth (public) ----------------------------

// --- POST /api/auth/register --- (always creates a regular 'user')
api.post('/auth/register', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    const errors = [];
    if (!name) errors.push('Name is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Enter a valid email address.');
    if (password.length < 8) errors.push('Password must be at least 8 characters.');
    if (errors.length) return res.status(400).json({ success: false, errors });

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'user') RETURNING *`,
      [name, email, await hashPassword(password)]
    );
    res.status(201).json(tokenResponse(rows[0]));
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: 'An account with that email already exists.' });
    }
    next(err);
  }
});

// --- POST /api/auth/login --- (same endpoint for users and admins; role is in the response)
api.post('/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    const { rows } = await pool.query('SELECT * FROM users WHERE lower(email) = $1', [email]);
    if (!rows.length || !(await checkPassword(password, rows[0].password_hash))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    res.json(tokenResponse(rows[0]));
  } catch (err) {
    next(err);
  }
});

// --------------------------- catalogue (public) --------------------------

// --- GET /api/meta --- (dropdown options for the form)
api.get('/meta', (req, res) => {
  res.json({ success: true, categories: CATEGORIES, sizes: SIZES, stock_statuses: STOCK_STATUSES });
});

// --- GET /api/home --- (what the home page shows: new launch products)
api.get('/home', async (req, res, next) => {
  try {
    res.json({ success: true, new_launches: await getNewLaunches() });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/combos --- (active combos, in display order)
api.get('/combos', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM combos WHERE is_active ORDER BY position, id');
    res.json({ success: true, count: rows.length, combos: rows.map(publicCombo) });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/combos/:id --- (an active combo; hidden ones 404 on the storefront)
api.get('/combos/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM combos WHERE id = $1 AND is_active', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Combo not found' });
    res.json({ success: true, combo: publicCombo(rows[0]) });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/faqs --- (published FAQs, in display order)
api.get('/faqs', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id, question, answer, category FROM faqs WHERE is_published ORDER BY position, id');
    res.json({ success: true, count: rows.length, faqs: rows });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/products ---
api.get('/products', async (req, res, next) => {
  try {
    const { rows, filters } = await findProducts(req.query);
    res.json({ success: true, count: rows.length, filters, products: rows });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/products/:id ---
api.get('/products/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, product: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ------------------------- signed in (any role) -------------------------

// --- GET /api/auth/me ---
api.get('/auth/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// --- POST /api/orders --- (checkout; guests allowed, signed-in orders are linked to the account)
api.post('/orders', optionalAuth, async (req, res, next) => {
  try {
    const { errors, values: v } = validateOrderBody(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const { rows } = await pool.query(
      `INSERT INTO orders (id, user_id, email, customer_name, phone, address, notes, items,
                           subtotal, discount, shipping_cost, total, payment, history)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        v.id, req.user?.id || null, v.email, v.customerName, v.phone, v.address && JSON.stringify(v.address),
        v.notes, JSON.stringify(v.items), v.subtotal, v.discount, v.shippingCost, v.total, v.payment,
        historyEntry('placed', 'customer'),
      ]
    );
    res.status(201).json({ success: true, order: publicOrder(rows[0]) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: 'An order with that number already exists.' });
    }
    next(err);
  }
});

// --- GET /api/orders/mine --- (the signed-in customer's orders, newest first)
api.get('/orders/mine', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC', [
      req.user.id,
    ]);
    res.json({ success: true, count: rows.length, orders: rows.map(publicOrder) });
  } catch (err) {
    next(err);
  }
});

// --- POST /api/orders/:orderId/cancel --- (the customer's own order, while not yet delivered)
api.post('/orders/:orderId/cancel', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE orders SET status = 'canceled', history = history || $4::jsonb, updated_at = now()
       WHERE id = $1 AND user_id = $2 AND status = ANY($3)
       RETURNING *`,
      [req.params.orderId, req.user.id, CANCELLABLE_STATUSES, historyEntry('canceled', 'customer')]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, error: 'No order of yours that can still be canceled.' });
    }
    res.json({ success: true, order: publicOrder(rows[0]) });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/returns/mine --- (the signed-in customer's return requests, newest first)
api.get('/returns/mine', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM order_returns WHERE user_id = $1 ORDER BY created_at DESC', [
      req.user.id,
    ]);
    res.json({ success: true, count: rows.length, returns: rows.map(publicReturn) });
  } catch (err) {
    next(err);
  }
});

// --- POST /api/returns --- body: { id, orderId, productId, size, qty, reason, comment }
// The refund amount comes from the price stored on the order, not from the client.
api.post('/returns', requireAuth, async (req, res, next) => {
  try {
    const id = String(req.body?.id || '');
    const orderId = String(req.body?.orderId || '');
    const productId = String(req.body?.productId ?? '');
    const size = String(req.body?.size ?? '');
    const qty = Number(req.body?.qty);
    if (!isReturnId(id) || !isOrderId(orderId)) {
      return res.status(400).json({ success: false, error: 'Invalid return or order number.' });
    }

    const { rows: orders } = await pool.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [
      orderId,
      req.user.id,
    ]);
    if (!orders.length) return res.status(404).json({ success: false, error: 'Order not found.' });
    if (orders[0].status !== 'delivered') {
      return res.status(400).json({ success: false, error: 'Only delivered orders can be returned.' });
    }

    const line = orders[0].items.find((l) => String(l.productId) === productId && String(l.size) === size);
    if (!line) return res.status(400).json({ success: false, error: 'That item is not on this order.' });

    // Earlier requests for the same item (other than rejected ones) use up the quantity.
    const { rows: prior } = await pool.query(
      `SELECT coalesce(sum(qty), 0)::int AS n FROM order_returns
       WHERE order_id = $1 AND product_id = $2 AND size = $3 AND status <> 'Rejected'`,
      [orderId, productId, size]
    );
    const left = line.qty - prior[0].n;
    if (!Number.isInteger(qty) || qty < 1 || qty > left) {
      return res.status(400).json({
        success: false,
        error: left > 0 ? `Quantity must be between 1 and ${left}.` : 'A return has already been requested for all of this item.',
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO order_returns (id, order_id, user_id, product_id, size, qty, amount, reason, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, orderId, req.user.id, productId, size, qty, money(qty * line.price),
       clip(req.body?.reason, 200) || null, clip(req.body?.comment, 2000) || null]
    );
    res.status(201).json({ success: true, return: publicReturn(rows[0]) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: 'That return request already exists.' });
    }
    next(err);
  }
});

// --- DELETE /api/returns/:returnId --- (withdraw your own pending request)
api.delete('/returns/:returnId', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `DELETE FROM order_returns WHERE id = $1 AND user_id = $2 AND status = 'Pending' RETURNING id`,
      [req.params.returnId, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'No pending return request with that number.' });
    res.json({ success: true, deleted: rows[0].id });
  } catch (err) {
    next(err);
  }
});

// ----------------------------- admin only -----------------------------

const adminOnly = [requireAuth, requireRole('admin')];

// --- POST /api/products ---
api.post('/products', adminOnly, productUploads, async (req, res, next) => {
  try {
    let media = normalizeMedia(galleryFiles(req));
    if (media.length === 0 && req.body.images) {
      const parsed = parseImagesField(req.body.images);
      if (!parsed) return res.status(400).json({ success: false, errors: ['`images` must be a valid JSON array.'] });
      media = parsed;
    }

    const { errors, values } = validateProductBody(req.body, media, coverFile(req), { isCreate: true });
    if (errors.length) {
      removeRequestUploads(req);
      return res.status(400).json({ success: false, errors });
    }

    const { rows } = await pool.query(
      `INSERT INTO products (name, subname, description, ingredients, directions, price, compare_at_price,
                             category, size, stock_status, images, main_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        values.name, values.subname || null, values.description || null,
        values.ingredients || null, values.directions || null,
        values.price, values.compare_at_price, values.category || null,
        values.size || null, values.stock_status, JSON.stringify(media),
        coverUrl(coverFile(req)),
      ]
    );
    res.status(201).json({ success: true, product: rows[0] });
  } catch (err) {
    removeRequestUploads(req);
    next(err);
  }
});

// --- PUT /api/products/:id ---
api.put('/products/:id', adminOnly, productUploads, async (req, res, next) => {
  try {
    const { rows: existing } = await pool.query('SELECT * FROM products WHERE id = $1', [
      req.params.id,
    ]);
    if (!existing.length) {
      removeRequestUploads(req);
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Keep whatever media wasn't removed, then append new uploads.
    const previous = existing[0].images || [];
    let keep = previous;
    if (req.body.keep_media !== undefined) {
      const keepUrls = new Set(
        Array.isArray(req.body.keep_media) ? req.body.keep_media : [req.body.keep_media]
      );
      keep = previous.filter((m) => keepUrls.has(m.url));
    }

    let media = [...keep, ...normalizeMedia(galleryFiles(req))];
    if (!galleryFiles(req).length && req.body.images) {
      const parsed = parseImagesField(req.body.images);
      if (!parsed) return res.status(400).json({ success: false, errors: ['`images` must be a valid JSON array.'] });
      media = parsed;
    }

    const { errors, values } = validateProductBody(req.body, media, coverFile(req), { isCreate: false });
    if (errors.length) {
      removeRequestUploads(req);
      return res.status(400).json({ success: false, errors });
    }

    // A new upload replaces the cover; remove_main_image=1 clears it; otherwise keep it.
    const previousCover = existing[0].main_image;
    let cover = previousCover;
    if (coverFile(req)) cover = coverUrl(coverFile(req));
    else if (req.body.remove_main_image === '1') cover = null;
    if (!cover) {
      removeRequestUploads(req);
      return res.status(400).json({ success: false, errors: ['Add a cover image.'] });
    }

    const { rows } = await pool.query(
      `UPDATE products
       SET name = $1, subname = $2, description = $3, ingredients = $4, directions = $5,
           price = $6, compare_at_price = $7, category = $8, size = $9, stock_status = $10,
           images = $11, main_image = $12, updated_at = now()
       WHERE id = $13
       RETURNING *`,
      [
        values.name, values.subname || null, values.description || null,
        values.ingredients || null, values.directions || null,
        values.price, values.compare_at_price, values.category || null,
        values.size || null, values.stock_status, JSON.stringify(media), cover, req.params.id,
      ]
    );

    // Media the admin removed is no longer referenced — clean it off disk.
    const stillUsed = new Set(media.map((m) => m.url));
    removeMediaFiles(previous.filter((m) => !stillUsed.has(m.url)));
    if (previousCover && previousCover !== cover) removeMediaFiles([{ url: previousCover }]);

    res.json({ success: true, product: rows[0] });
  } catch (err) {
    removeRequestUploads(req);
    next(err);
  }
});

// --- DELETE /api/products/:id ---
api.delete('/products/:id', adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING images, main_image', [
      req.params.id,
    ]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Product not found' });

    // Clean the files off disk so uploads don't pile up.
    removeMediaFiles(rows[0].images);
    if (rows[0].main_image) removeMediaFiles([{ url: rows[0].main_image }]);
    res.json({ success: true, deleted: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/admin/users ---
api.get('/admin/users', adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at DESC, id DESC');
    res.json({ success: true, count: rows.length, users: rows.map(publicUser) });
  } catch (err) {
    next(err);
  }
});

// --- PATCH /api/admin/users/:id --- body: { role: "user" | "admin" }
api.patch('/admin/users/:id', adminOnly, async (req, res, next) => {
  try {
    const role = String(req.body?.role || '');
    if (!ROLES.includes(role)) {
      return res.status(400).json({ success: false, error: 'Role must be "user" or "admin".' });
    }
    // Stops an admin from locking themselves out of the panel.
    if (Number(req.params.id) === req.user.id && role !== 'admin') {
      return res.status(400).json({ success: false, error: "You can't remove your own admin role." });
    }

    const { rows } = await pool.query(
      'UPDATE users SET role = $1, updated_at = now() WHERE id = $2 RETURNING *',
      [role, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user: publicUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

// --- PUT /api/admin/home --- body: { new_launches: [productId, ...] } (in display order)
api.put('/admin/home', adminOnly, async (req, res, next) => {
  try {
    const raw = req.body?.new_launches;
    if (!Array.isArray(raw) || !raw.every(isValidId)) {
      return res.status(400).json({ success: false, error: '`new_launches` must be a list of product ids.' });
    }
    const ids = [...new Set(raw.map(Number))];
    if (ids.length > MAX_NEW_LAUNCHES) {
      return res.status(400).json({ success: false, error: `Pick at most ${MAX_NEW_LAUNCHES} new launch products.` });
    }
    const { rows } = await pool.query('SELECT id FROM products WHERE id = ANY($1::int[])', [ids]);
    if (rows.length !== ids.length) {
      return res.status(400).json({ success: false, error: 'One of those products no longer exists.' });
    }

    await pool.query(
      `INSERT INTO site_settings (key, value) VALUES ('home_new_launches', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [JSON.stringify(ids)]
    );
    res.json({ success: true, new_launches: await getNewLaunches() });
  } catch (err) {
    next(err);
  }
});

// ---------------------------- admin: combos ----------------------------

const comboImage = upload.single('image');
const removeComboUpload = (req) => req.file && removeMediaFiles([{ url: '/uploads/products/' + req.file.filename }]);

// --- GET /api/admin/combos --- (all combos, hidden ones included)
api.get('/admin/combos', adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM combos ORDER BY position, id');
    res.json({ success: true, count: rows.length, combos: rows.map(publicCombo) });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/admin/combos/:id ---
api.get('/admin/combos/:id', adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM combos WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Combo not found' });
    res.json({ success: true, combo: publicCombo(rows[0]) });
  } catch (err) {
    next(err);
  }
});

// --- POST /api/admin/combos --- (multipart: fields + `image`)
api.post('/admin/combos', adminOnly, comboImage, async (req, res, next) => {
  try {
    const { errors, values: v } = await validateComboBody(req.body, { hasImage: Boolean(req.file) });
    if (req.file && !req.file.mimetype.startsWith('image/')) errors.push('The combo image must be an image file.');
    if (errors.length) {
      removeComboUpload(req);
      return res.status(400).json({ success: false, errors });
    }
    const { rows } = await pool.query(
      `INSERT INTO combos (name, description, price, compare_at_price, tag, accent, image, items, position, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [v.name, v.description, v.price, v.compare, v.tag, v.accent, '/uploads/products/' + req.file.filename,
       JSON.stringify(v.items), v.position, v.is_active]
    );
    res.status(201).json({ success: true, combo: publicCombo(rows[0]) });
  } catch (err) {
    removeComboUpload(req);
    next(err);
  }
});

// --- PUT /api/admin/combos/:id --- (multipart; a new `image` replaces the old one)
api.put('/admin/combos/:id', adminOnly, comboImage, async (req, res, next) => {
  try {
    const { rows: existing } = await pool.query('SELECT * FROM combos WHERE id = $1', [req.params.id]);
    if (!existing.length) {
      removeComboUpload(req);
      return res.status(404).json({ success: false, error: 'Combo not found' });
    }
    const { errors, values: v } = await validateComboBody(req.body, {
      hasImage: Boolean(req.file || existing[0].image),
    });
    if (req.file && !req.file.mimetype.startsWith('image/')) errors.push('The combo image must be an image file.');
    if (errors.length) {
      removeComboUpload(req);
      return res.status(400).json({ success: false, errors });
    }

    const image = req.file ? '/uploads/products/' + req.file.filename : existing[0].image;
    const { rows } = await pool.query(
      `UPDATE combos
       SET name = $1, description = $2, price = $3, compare_at_price = $4, tag = $5, accent = $6,
           image = $7, items = $8, position = $9, is_active = $10, updated_at = now()
       WHERE id = $11
       RETURNING *`,
      [v.name, v.description, v.price, v.compare, v.tag, v.accent, image, JSON.stringify(v.items),
       v.position, v.is_active, req.params.id]
    );
    if (req.file && existing[0].image) removeMediaFiles([{ url: existing[0].image }]);
    res.json({ success: true, combo: publicCombo(rows[0]) });
  } catch (err) {
    removeComboUpload(req);
    next(err);
  }
});

// --- DELETE /api/admin/combos/:id ---
api.delete('/admin/combos/:id', adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM combos WHERE id = $1 RETURNING image', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Combo not found' });
    if (rows[0].image) removeMediaFiles([{ url: rows[0].image }]);
    res.json({ success: true, deleted: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
});

// ----------------------------- admin: FAQs -----------------------------

// --- GET /api/admin/faqs --- (all FAQs, drafts included)
api.get('/admin/faqs', adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM faqs ORDER BY position, id');
    res.json({ success: true, count: rows.length, faqs: rows });
  } catch (err) {
    next(err);
  }
});

// --- PUT /api/admin/faqs/reorder --- body: { ids: [id, ...] } in the new order
// (declared before /:id so "reorder" isn't read as an id)
api.put('/admin/faqs/reorder', adminOnly, async (req, res, next) => {
  try {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || !ids.every(isValidId)) {
      return res.status(400).json({ success: false, error: '`ids` must be a list of FAQ ids.' });
    }
    await pool.query(
      `UPDATE faqs SET position = o.pos, updated_at = now()
       FROM unnest($1::int[]) WITH ORDINALITY AS o(id, pos)
       WHERE faqs.id = o.id`,
      [ids.map(Number)]
    );
    const { rows } = await pool.query('SELECT * FROM faqs ORDER BY position, id');
    res.json({ success: true, faqs: rows });
  } catch (err) {
    next(err);
  }
});

// --- POST /api/admin/faqs --- (added at the end of the list)
api.post('/admin/faqs', adminOnly, async (req, res, next) => {
  try {
    const { errors, values: v } = validateFaqBody(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });
    const { rows } = await pool.query(
      `INSERT INTO faqs (question, answer, category, is_published, position)
       VALUES ($1, $2, $3, $4, (SELECT coalesce(max(position), 0) + 1 FROM faqs))
       RETURNING *`,
      [v.question, v.answer, v.category, v.is_published]
    );
    res.status(201).json({ success: true, faq: rows[0] });
  } catch (err) {
    next(err);
  }
});

// --- PUT /api/admin/faqs/:id ---
api.put('/admin/faqs/:id', adminOnly, async (req, res, next) => {
  try {
    const { errors, values: v } = validateFaqBody(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });
    const { rows } = await pool.query(
      `UPDATE faqs SET question = $1, answer = $2, category = $3, is_published = $4, updated_at = now()
       WHERE id = $5 RETURNING *`,
      [v.question, v.answer, v.category, v.is_published, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'FAQ not found' });
    res.json({ success: true, faq: rows[0] });
  } catch (err) {
    next(err);
  }
});

// --- DELETE /api/admin/faqs/:id ---
api.delete('/admin/faqs/:id', adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM faqs WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'FAQ not found' });
    res.json({ success: true, deleted: rows[0].id });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/admin/stats?year=2026 --- (dashboard numbers + chart data)
// Order value leaves out canceled orders. An order counts as returned once a
// return on it is approved or refunded; refund value is what has been refunded.
api.get('/admin/stats', adminOnly, async (req, res, next) => {
  try {
    const thisYear = new Date().getFullYear();
    const year = /^\d{4}$/.test(String(req.query.year || '')) ? Number(req.query.year) : thisYear;

    const [users, totals, returns, monthly, statuses, years, recent] = await Promise.all([
      pool.query(`SELECT count(*)::int AS n FROM users WHERE role = 'user'`),
      pool.query(`
        SELECT count(*)::int AS orders,
               coalesce(sum(total) FILTER (WHERE status <> 'canceled'), 0)::float AS value,
               count(*) FILTER (WHERE status = 'delivered')::int AS delivered,
               count(*) FILTER (WHERE status = 'canceled')::int AS canceled
        FROM orders`),
      pool.query(`
        SELECT count(DISTINCT order_id) FILTER (WHERE status IN ('Approved', 'Refunded'))::int AS orders,
               coalesce(sum(amount) FILTER (WHERE status = 'Refunded'), 0)::float AS value,
               count(*) FILTER (WHERE status = 'Pending')::int AS pending
        FROM order_returns`),
      pool.query(`
        SELECT extract(month FROM placed_at)::int AS month,
               count(*)::int AS orders,
               coalesce(sum(total) FILTER (WHERE status <> 'canceled'), 0)::float AS value,
               count(*) FILTER (WHERE status = 'canceled')::int AS canceled
        FROM orders WHERE extract(year FROM placed_at) = $1
        GROUP BY 1`, [year]),
      pool.query(`SELECT status, count(*)::int AS n FROM orders GROUP BY status`),
      pool.query(`SELECT DISTINCT extract(year FROM placed_at)::int AS y FROM orders`),
      pool.query(`
        SELECT o.id, o.email, o.status, o.total::float AS total, o.placed_at,
               coalesce(o.customer_name, u.name) AS customer
        FROM orders o LEFT JOIN users u ON u.id = o.user_id
        ORDER BY o.placed_at DESC LIMIT 8`),
    ]);

    // One entry per month, zeros included, so the chart always shows Jan-Dec.
    const byMonth = new Map(monthly.rows.map((r) => [r.month, r]));
    const months = Array.from({ length: 12 }, (_, i) => {
      const r = byMonth.get(i + 1);
      return { month: i + 1, orders: r?.orders || 0, value: money(r?.value || 0), canceled: r?.canceled || 0 };
    });
    const t = totals.rows[0];
    const r = returns.rows[0];

    res.json({
      success: true,
      year,
      years: [...new Set([thisYear, ...years.rows.map((x) => x.y)])].sort((a, b) => b - a),
      totals: {
        users: users.rows[0].n,
        orders: t.orders,
        order_value: money(t.value),
        delivered: t.delivered,
        canceled: t.canceled,
        returned: r.orders,
        refund_value: money(r.value),
        pending_returns: r.pending,
      },
      months,
      statuses: ORDER_STATUSES.map((st) => ({ status: st, count: statuses.rows.find((x) => x.status === st)?.n || 0 })),
      recent_orders: recent.rows,
    });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/admin/orders?status=&search= --- (newest first, up to 500)
api.get('/admin/orders', adminOnly, async (req, res, next) => {
  try {
    const status = ORDER_STATUSES.includes(req.query.status) ? req.query.status : '';
    const search = clip(req.query.search, 100);

    const [list, counts] = await Promise.all([
      pool.query(
        `SELECT o.*, u.name AS account_name,
                (SELECT count(*)::int FROM order_returns r WHERE r.order_id = o.id) AS return_count
         FROM orders o LEFT JOIN users u ON u.id = o.user_id
         WHERE ($1 = '' OR o.status = $1)
           AND ($2 = '' OR o.id ILIKE $2 OR o.email ILIKE $2 OR o.customer_name ILIKE $2 OR u.name ILIKE $2)
         ORDER BY o.placed_at DESC
         LIMIT 500`,
        [status, search ? `%${search}%` : '']
      ),
      pool.query(`SELECT status, count(*)::int AS n FROM orders GROUP BY status`),
    ]);

    const byStatus = Object.fromEntries(ORDER_STATUSES.map((st) => [st, 0]));
    for (const row of counts.rows) byStatus[row.status] = row.n;
    res.json({
      success: true,
      count: list.rows.length,
      counts: { all: counts.rows.reduce((n, row) => n + row.n, 0), ...byStatus },
      orders: list.rows.map(publicOrder),
    });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/admin/orders/:orderId --- (order + account + its return requests)
api.get('/admin/orders/:orderId', adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, u.name AS account_name, u.email AS account_email
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       WHERE o.id = $1`,
      [req.params.orderId]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Order not found' });
    const { rows: returns } = await pool.query(
      'SELECT * FROM order_returns WHERE order_id = $1 ORDER BY created_at DESC',
      [req.params.orderId]
    );
    res.json({ success: true, order: publicOrder(rows[0]), returns: returns.map(publicReturn) });
  } catch (err) {
    next(err);
  }
});

// --- PATCH /api/admin/orders/:orderId --- body: { status }
api.patch('/admin/orders/:orderId', adminOnly, async (req, res, next) => {
  try {
    const status = String(req.body?.status || '');
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${ORDER_STATUSES.join(', ')}.` });
    }
    // Only a real change adds a timeline entry.
    const { rows } = await pool.query(
      `UPDATE orders SET status = $1, history = history || $3::jsonb, updated_at = now()
       WHERE id = $2 AND status <> $1
       RETURNING *`,
      [status, req.params.orderId, historyEntry(status, 'admin')]
    );
    if (rows.length) return res.json({ success: true, order: publicOrder(rows[0]) });

    const { rows: same } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.orderId]);
    if (!same.length) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order: publicOrder(same[0]) });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/admin/returns?status= --- (newest first)
api.get('/admin/returns', adminOnly, async (req, res, next) => {
  try {
    const status = RETURN_STATUSES.includes(req.query.status) ? req.query.status : '';
    const { rows } = await pool.query(
      `SELECT r.*, o.email, coalesce(o.customer_name, u.name) AS customer, o.items AS order_items
       FROM order_returns r
       JOIN orders o ON o.id = r.order_id
       LEFT JOIN users u ON u.id = o.user_id
       WHERE ($1 = '' OR r.status = $1)
       ORDER BY r.created_at DESC
       LIMIT 500`,
      [status]
    );
    res.json({ success: true, count: rows.length, returns: rows.map(publicReturn) });
  } catch (err) {
    next(err);
  }
});

// --- PATCH /api/admin/returns/:returnId --- body: { status }
// Pending -> Approved | Rejected, Approved -> Refunded | Rejected.
api.patch('/admin/returns/:returnId', adminOnly, async (req, res, next) => {
  try {
    const status = String(req.body?.status || '');
    if (!RETURN_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${RETURN_STATUSES.join(', ')}.` });
    }
    const { rows: found } = await pool.query('SELECT status FROM order_returns WHERE id = $1', [req.params.returnId]);
    if (!found.length) return res.status(404).json({ success: false, error: 'Return request not found' });
    const from = found[0].status;
    if (!(RETURN_NEXT[from] || []).includes(status)) {
      return res.status(400).json({ success: false, error: `A ${from.toLowerCase()} return can't be marked ${status.toLowerCase()}.` });
    }

    const { rows } = await pool.query(
      `UPDATE order_returns SET status = $1, updated_at = now() WHERE id = $2 AND status = $3 RETURNING *`,
      [status, req.params.returnId, from]
    );
    if (!rows.length) return res.status(409).json({ success: false, error: 'That return was just changed. Reload and try again.' });
    res.json({ success: true, return: publicReturn(rows[0]) });
  } catch (err) {
    next(err);
  }
});

app.use('/api', api);

// ---------- fallbacks (JSON, always) ----------

app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Chantallow API',
    endpoints: [
      'POST   /api/auth/register',
      'POST   /api/auth/login',
      'GET    /api/auth/me              (signed in)',
      'POST   /api/orders               (guest or signed in)',
      'GET    /api/orders/mine          (signed in)',
      'POST   /api/orders/:orderId/cancel (signed in, own order)',
      'GET    /api/returns/mine         (signed in)',
      'POST   /api/returns              (signed in, own delivered order)',
      'DELETE /api/returns/:returnId    (signed in, own pending request)',
      'GET    /api/meta',
      'GET    /api/home',
      'GET    /api/combos',
      'GET    /api/combos/:id',
      'GET    /api/faqs',
      'GET    /api/products',
      'GET    /api/products/:id',
      'POST   /api/products             (admin)',
      'PUT    /api/products/:id         (admin)',
      'DELETE /api/products/:id         (admin)',
      'GET    /api/admin/users          (admin)',
      'PATCH  /api/admin/users/:id      (admin)',
      'PUT    /api/admin/home           (admin)',
      'GET    /api/admin/combos         (admin)',
      'GET    /api/admin/combos/:id     (admin)',
      'POST   /api/admin/combos         (admin, multipart)',
      'PUT    /api/admin/combos/:id     (admin, multipart)',
      'DELETE /api/admin/combos/:id     (admin)',
      'GET    /api/admin/faqs           (admin)',
      'POST   /api/admin/faqs           (admin)',
      'PUT    /api/admin/faqs/reorder   (admin)',
      'PUT    /api/admin/faqs/:id       (admin)',
      'DELETE /api/admin/faqs/:id       (admin)',
      'GET    /api/admin/stats?year=    (admin)',
      'GET    /api/admin/orders?status=&search= (admin)',
      'GET    /api/admin/orders/:orderId (admin)',
      'PATCH  /api/admin/orders/:orderId (admin)',
      'GET    /api/admin/returns?status= (admin)',
      'PATCH  /api/admin/returns/:returnId (admin)',
    ],
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Unknown endpoint: ' + req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error(err);
  // Database unreachable even after retrying: say so, rather than "Server error".
  if (isConnectError(err)) {
    return res.status(503).json({
      success: false,
      error: "The database isn't responding right now. Please try again in a moment.",
    });
  }
  const message =
    err.code === 'LIMIT_FILE_SIZE'
      ? 'That file is too large. Each file must be under 50MB.'
      : err.code === 'LIMIT_FILE_COUNT'
      ? 'Too many files. Upload at most 10 images and 3 videos.'
      : err.status && err.status < 500
      ? err.message
      : 'Server error';
  res.status(err.status || (err.name === 'MulterError' ? 400 : 500)).json({
    success: false,
    error: message,
  });
});

// ---------- startup ----------

testConnection()
  .then(async (info) => {
    console.log(`Connected to PostgreSQL database "${info.db}"`);
    try {
      await ensureSchema();
      await seedAccounts();
      await seedHomeContent();
      console.log('Database tables ready.');
    } catch (e) {
      console.error('Failed to set up database tables:', e.message);
    }
    app.listen(PORT, () => {
      console.log(`API running at http://localhost:${PORT}`);
      console.log(`Allowing requests from ${CLIENT_ORIGIN}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database on startup:', err.message);
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT} (DB unavailable)`));
  });
