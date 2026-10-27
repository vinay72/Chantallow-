require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { pool, testConnection } = require('./db');
const { upload } = require('./upload');
const {
  ROLES,
  publicUser,
  tokenResponse,
  hashPassword,
  checkPassword,
  requireAuth,
  requireRole,
  seedAdmin,
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
      'GET    /api/meta',
      'GET    /api/products',
      'GET    /api/products/:id',
      'POST   /api/products             (admin)',
      'PUT    /api/products/:id         (admin)',
      'DELETE /api/products/:id         (admin)',
      'GET    /api/admin/users          (admin)',
      'PATCH  /api/admin/users/:id      (admin)',
    ],
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Unknown endpoint: ' + req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error(err);
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
      await seedAdmin();
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
