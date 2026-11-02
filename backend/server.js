require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { pool, testConnection, isConnectError } = require('./db');
const { upload } = require('./upload');
const { seedHomeContent } = require('./seed');
const { sendPasswordResetEmail } = require('./mailer');
const sanitizeHtml = require('sanitize-html');
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

// ---------- storefront reads ----------

// The last good answer for each public storefront read. Reads always go to the
// database; only when it can't be reached is this copy served instead, so a
// slow database doesn't make the home page fall back to old content.
const lastGood = new Map();
async function withLastGood(key, load) {
  try {
    const value = await load();
    lastGood.set(key, value);
    return value;
  } catch (err) {
    if (isConnectError(err) && lastGood.has(key)) {
      console.warn(`Database unreachable; serving the last copy of ${key}.`);
      return lastGood.get(key);
    }
    throw err;
  }
}

// ---------- home page settings ----------

// Home page sections the admin fills by picking products. The API field name
// is also the section's key; each is stored as a list of product ids.
const HOME_PICKS = {
  new_launches: { setting: 'home_new_launches', max: 4, label: 'new launch products' },
  best_sellers: { setting: 'home_best_sellers', max: 8, label: 'best sellers' },
  featured: { setting: 'home_featured', max: 2, label: 'featured products' }, // "Nourish Your Skin, Naturally"
  tattoo: { setting: 'home_tattoo', max: 2, label: 'tattoo care products' }, // "Pure Care for Every Tattoo"
  bridge: { setting: 'home_bridge', max: 8, label: 'bridge the gap products' }, // "We Bridge The Gap..."
  shortlist: { setting: 'home_shortlist', max: 1, label: 'soothe sore muscles product' }, // "Soothe Sore Muscles, Naturally"
};

// A stored pick is a product id, or an object with extras:
//   { id, style: 'photo' }  the photo already has the home page backdrop baked in
//                           (best sellers: shown as-is, no arched scene drawn)
//   { id, label: '...' }    a short line shown with the card (e.g. "Up To 10% Off")
//   { id, image: '/uploads/products/...' }  a photo used for this card instead of
//                           the product's own (uploaded via POST /api/admin/home/image)
//   { id, color: '#3B1941' }  the product name's text colour (bridge the gap circles)
const pickId = (v) => (v && typeof v === 'object' ? v.id : v);
const pickStyle = (v) => (v && typeof v === 'object' && v.style === 'photo' ? 'photo' : 'scene');
const pickLabel = (v) => (v && typeof v === 'object' ? clip(v.label, 60) : '');
const pickImage = (v) =>
  v && typeof v === 'object' && /^\/uploads\/products\/[\w.-]+$/.test(String(v.image || '')) ? v.image : '';
const pickColor = (v) => (v && typeof v === 'object' && isHexColor(v.color) ? v.color : '');

// The products picked for one section, in the admin's order, each with its
// `home_style` ('scene' | 'photo'), `home_label`, `home_image` and `home_color`.
// Products that were deleted since are skipped.
async function getPickedProducts(section) {
  const { rows: setting } = await pool.query('SELECT value FROM site_settings WHERE key = $1', [
    HOME_PICKS[section].setting,
  ]);
  const picks = (setting[0]?.value || []).filter((v) => isValidId(pickId(v)));
  if (!picks.length) return [];
  const ids = picks.map((v) => Number(pickId(v)));
  const byId = new Map(picks.map((v) => [Number(pickId(v)), v]));
  const { rows } = await pool.query(
    'SELECT * FROM products WHERE id = ANY($1::int[]) ORDER BY array_position($1::int[], id)',
    [ids]
  );
  return rows.map((row) => {
    const pick = byId.get(row.id);
    return {
      ...row,
      home_style: pickStyle(pick),
      home_label: pickLabel(pick),
      home_image: pickImage(pick) || null,
      home_color: pickColor(pick) || null,
    };
  });
}

// { new_launches: [...products], best_sellers: [...products] }
async function getHomePicks() {
  const sections = Object.keys(HOME_PICKS);
  const lists = await Promise.all(sections.map(getPickedProducts));
  return Object.fromEntries(sections.map((key, i) => [key, lists[i]]));
}

// "Furkind Pet Tallow" home section — admin-editable heading + paragraph.
// Falls back to the page's built-in copy until the admin saves their own.
const FURKIND_TEXT_SETTING = 'home_furkind_text';
const FURKIND_TEXT_DEFAULT = {
  heading: 'Furkind Pet Tallow',
  text:
    "Our nutrient-rich Pet Balm combines the nourishing power of grass-fed, grass-finished beef tallow with organic raw unrefined coconut oil to help soothe, protect, and restore dry, rough, or irritated skin and paws. Beef tallow is a natural source of Vitamin A, which supports skin renewal and healthy tissue maintenance; Vitamin D, which helps support skin barrier function; Vitamin E, a powerful antioxidant that helps protect against environmental stressors and supports moisture retention; and Vitamin K, which contributes to overall skin health. The naturally occurring fatty acids in tallow closely resemble the oils found in healthy skin, making it highly absorbable and deeply moisturizing. Organic raw unrefined coconut oil provides additional hydration and contains lauric acid, caprylic acid, and capric acid, which help condition the skin and support a clean, healthy environment on your pet’s skin surface. Together, these ingredients help soften rough paws, reduce dryness and cracking, calm irritation, and create a protective moisture barrier to keep your pet's skin and paws healthy, smooth, and comfortable.",
};

async function getFurkindText() {
  const { rows } = await pool.query('SELECT value FROM site_settings WHERE key = $1', [FURKIND_TEXT_SETTING]);
  const saved = rows[0]?.value;
  return saved && typeof saved.heading === 'string' && typeof saved.text === 'string' ? saved : FURKIND_TEXT_DEFAULT;
}

// "Featured Offer For You" home carousel — admin-added banner images with
// text, shown instead of the home page's own built-in banners once the admin
// saves at least one. Empty means the home page keeps its defaults.
const OFFERS_SETTING = 'home_offers';
const MAX_OFFERS = 10;
const isOfferImage = (v) => /^\/uploads\/products\/[\w.-]+$/.test(String(v || ''));

async function getOffers() {
  const { rows } = await pool.query('SELECT value FROM site_settings WHERE key = $1', [OFFERS_SETTING]);
  return Array.isArray(rows[0]?.value) ? rows[0].value : [];
}

// "Soothe Sore Muscles, Naturally" home banner — an admin-uploaded left-side
// photo plus heading/subtitle, alongside the `shortlist` product pick above.
const SHORTLIST_BANNER_SETTING = 'home_shortlist_banner';
const SHORTLIST_TEXT_SETTING = 'home_shortlist_text';
const SHORTLIST_TEXT_DEFAULT = {
  heading: 'Soothe Sore Muscles,\nNaturally',
  subtitle: 'Magnesium & arnica-infused tallow crème for targeted pain relief, muscle comfort, and skin nourishment.',
};

async function getShortlistBanner() {
  const { rows } = await pool.query('SELECT value FROM site_settings WHERE key = $1', [SHORTLIST_BANNER_SETTING]);
  const v = rows[0]?.value;
  return typeof v === 'string' && isOfferImage(v) ? v : null;
}

async function getShortlistText() {
  const { rows } = await pool.query('SELECT value FROM site_settings WHERE key = $1', [SHORTLIST_TEXT_SETTING]);
  const saved = rows[0]?.value;
  return saved && typeof saved.heading === 'string' && typeof saved.subtitle === 'string' ? saved : SHORTLIST_TEXT_DEFAULT;
}

// Generic helpers for a `{ heading, subtitle }` setting and an uploaded-image
// setting, used by the "Nourish Your Skin" and "Pure Care for Every Tattoo"
// sections below (same shape as the furkind/shortlist text & banner above).
async function getTextSetting(key, fallback) {
  const { rows } = await pool.query('SELECT value FROM site_settings WHERE key = $1', [key]);
  const saved = rows[0]?.value;
  return saved && typeof saved.heading === 'string' && typeof saved.subtitle === 'string' ? saved : fallback;
}
async function getImageSetting(key) {
  const { rows } = await pool.query('SELECT value FROM site_settings WHERE key = $1', [key]);
  const v = rows[0]?.value;
  return typeof v === 'string' && isOfferImage(v) ? v : null;
}
async function saveSetting(key, value) {
  await pool.query(
    `INSERT INTO site_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)]
  );
}
const isTextSettingValid = (v) =>
  v && typeof v.heading === 'string' && typeof v.subtitle === 'string' && v.heading.trim() && v.subtitle.trim();

// "Nourish Your Skin, Naturally" — the `featured` product picks above, plus
// an admin-editable heading/subtitle and the right-side portrait photo.
const FEATURED_TEXT_SETTING = 'home_featured_text';
const FEATURED_BANNER_SETTING = 'home_featured_banner';
const FEATURED_TEXT_DEFAULT = {
  heading: 'Nourish Your Skin, Naturally',
  subtitle: 'Discover your favorite tallow essentials and botanical blends, thoughtfully crafted to nourish, hydrate, and restore.',
};

// "Pure Care for Every Tattoo" — the `tattoo` product picks above, plus an
// admin-editable heading/subtitle, the right-side photo, and the caption
// (its own small heading/subtitle) shown over that photo.
const TATTOO_TEXT_SETTING = 'home_tattoo_text';
const TATTOO_BANNER_SETTING = 'home_tattoo_banner';
const TATTOO_CAPTION_SETTING = 'home_tattoo_caption';
const TATTOO_TEXT_DEFAULT = {
  heading: 'Pure Care for Every Tattoo',
  subtitle: 'Discover Chantallow’s tallow-based tattoo care crèmes, crafted to deeply moisturize, soothe, and keep your tattooed skin looking vibrant.',
};
const TATTOO_CAPTION_DEFAULT = {
  heading: 'Moringa + Butterfly Pea Flowers',
  subtitle: 'Protect against environmental stress while promoting soft, healthy-looking, and revitalized skin.',
};

// The hero banner at the very top of the home page — heading/subtitle and
// the right-side portrait photo, above the `new_launches` mini product picks.
const HERO_TEXT_SETTING = 'home_hero_text';
const HERO_BANNER_SETTING = 'home_hero_banner';
const HERO_TEXT_DEFAULT = {
  heading: 'A New Generation Of\nNatural Tallow Skincare',
  subtitle: 'Handcrafted wellness using Moringa, Butterfly Pea, and Zechstein Magnesium.',
};

// ---------- about page ----------

// The whole About Us page content lives under this one setting (it's edited
// on its own dedicated admin page, not alongside other sections), as
// { founder: {...}, cta: {...}, illuminate: {...} }. Any image left null
// falls back to the page's own built-in photo.
const ABOUT_SETTING = 'about_page';

const ABOUT_DEFAULT = {
  founder: {
    photo: null,
    heading: 'Founder’s Vision: Illuminating Beauty at Chantallow',
    paragraph1:
      'At Chantallow, the vision is simple: true beauty begins with transparency. Our brand was born from a passion for cruelty-free, sustainable, and tallow-rich formulas that outperform synthetic alternatives. A deep dedication to sourcing the highest quality, grass-finished tallow resonates in every jar, providing the essential vitamins and fatty acids your skin craves.',
    paragraph2:
      'Chantallow is more than just skincare; it is a commitment to creating a line that is as ethical as it is effective. By focusing on simple, powerful, animal-based fats, we are helping a new generation rediscover the glow of ancestral skincare—inspiring confidence through visible, natural results.',
    badge: null,
    name: 'Chantelle Dieuvil',
    role: 'Ceo and founder',
  },
  cta: {
    heading: 'Questions ?',
    text: 'Our experts will help find the gear that’s right for you',
    buttonLabel: 'Get In Touch',
  },
  // `items` (the product highlights) live in their own `about_highlights`
  // table — see getAboutHighlights() / the /admin/about/highlights routes —
  // not in this settings blob, so they get real ids and their own CRUD.
  illuminate: {
    heading: 'Illuminate Beauty. Timeless Confidence.',
    paragraph:
      'At Chantallow, we believe in empowering your beauty journey through ancestral wisdom. Our curated collection of nutrient-dense, tallow-based products is designed to enhance your natural allure, fostering timeless confidence by nourishing your skin at a cellular level. Discover the glow within, effortlessly.',
    mainImage: null,
    tagImage: null,
    tagEyebrow: 'Chantallow',
    tagHeading: 'Non-Stop Skincare',
    smallImage: null,
  },
};

const cloneAboutDefault = () => JSON.parse(JSON.stringify(ABOUT_DEFAULT));

// The highlights, in display order — { id, name, description, position }.
async function getAboutHighlights() {
  const { rows } = await pool.query('SELECT * FROM about_highlights ORDER BY position, id');
  return rows;
}

async function getAbout() {
  const { rows } = await pool.query('SELECT value FROM site_settings WHERE key = $1', [ABOUT_SETTING]);
  const saved = rows[0]?.value;
  const base = cloneAboutDefault();
  const text = !saved || typeof saved !== 'object' ? base : {
    founder: { ...base.founder, ...(saved.founder || {}) },
    cta: { ...base.cta, ...(saved.cta || {}) },
    illuminate: { ...base.illuminate, ...(saved.illuminate || {}) },
  };
  const highlights = await getAboutHighlights();
  return {
    ...text,
    illuminate: { ...text.illuminate, items: highlights.map((h) => ({ name: h.name, desc: h.description })) },
  };
}

// Validates the whole About page body and returns the cleaned value, or a
// list of problems. Every image is optional (null clears it back to the
// built-in default); every other field is required.
function sanitizeAbout(body) {
  const errors = [];
  const str = (v, max) => (typeof v === 'string' ? clip(v, max) : '');
  const nonEmpty = (v, max, label) => {
    const s = str(v, max);
    if (!s.trim()) errors.push(`${label} is required.`);
    return s;
  };
  const img = (v, label) => {
    if (v == null) return null;
    if (typeof v !== 'string' || !isOfferImage(v)) {
      errors.push(`${label} must be an uploaded image, or left empty.`);
      return null;
    }
    return v;
  };

  const f = body?.founder || {};
  const founder = {
    photo: img(f.photo, 'Founder photo'),
    heading: nonEmpty(f.heading, 160, 'Founder heading'),
    paragraph1: nonEmpty(f.paragraph1, 1200, 'Founder paragraph 1'),
    paragraph2: nonEmpty(f.paragraph2, 1200, 'Founder paragraph 2'),
    badge: img(f.badge, 'Founder badge'),
    name: nonEmpty(f.name, 80, 'Founder name'),
    role: nonEmpty(f.role, 80, 'Founder role'),
  };

  const c = body?.cta || {};
  const cta = {
    heading: nonEmpty(c.heading, 60, 'CTA heading'),
    text: nonEmpty(c.text, 200, 'CTA text'),
    buttonLabel: nonEmpty(c.buttonLabel, 40, 'CTA button label'),
  };

  const i = body?.illuminate || {};
  const illuminate = {
    heading: nonEmpty(i.heading, 100, 'Illuminate heading'),
    paragraph: nonEmpty(i.paragraph, 600, 'Illuminate paragraph'),
    mainImage: img(i.mainImage, 'Main collage image'),
    tagImage: img(i.tagImage, 'Tag collage image'),
    tagEyebrow: nonEmpty(i.tagEyebrow, 40, 'Tag eyebrow'),
    tagHeading: nonEmpty(i.tagHeading, 60, 'Tag heading'),
    smallImage: img(i.smallImage, 'Small collage image'),
  };

  return { errors, value: { founder, cta, illuminate } };
}

// ---------- terms & conditions page ----------

// The whole Terms & Conditions page — an intro paragraph plus a fixed list of
// named sections (General, Product Information, ...). Sections are edited by
// id, not added/removed/reordered, since they're legal copy with a fixed shape.
const TERMS_SETTING = 'terms_page';

const TERMS_DEFAULT = {
  intro:
    'Welcome to Chantallow. By accessing or purchasing from our website, you agree to the following Terms & Conditions. Please read them carefully before using our services.',
  sections: [
    {
      id: 'general',
      title: 'General',
      text:
        'These Terms & Conditions govern the use of our website and products. By placing an order, you confirm that you are at least 18 years of age or are using the website under parental/guardian supervision. We reserve the right to update or modify these terms at any time without prior notice.',
    },
    {
      id: 'product-information',
      title: 'Product Information',
      text:
        'Our skincare and wellness products are handcrafted using natural ingredients. Variations in texture, color, or fragrance may occur naturally and do not indicate defects. Product descriptions and images are provided for informational purposes only. Actual products may slightly differ due to packaging or ingredient sourcing updates.',
    },
    {
      id: 'usage-disclaimer',
      title: 'Usage Disclaimer',
      text:
        'Our products are intended for external use only unless specifically stated otherwise. Please perform a patch test before use. Discontinue use if irritation occurs and consult a healthcare professional if necessary. Our products are not intended to diagnose, treat, cure, or prevent any medical condition.',
    },
    {
      id: 'orders-payments',
      title: 'Orders & Payments',
      text:
        'All orders are subject to availability and acceptance. Prices are listed in USD and may change without prior notice. Payments must be completed through approved payment methods available on the website.',
    },
    {
      id: 'shipping',
      title: 'Shipping',
      text:
        'Delivery timelines are estimates and may vary depending on location, courier delays, or unforeseen circumstances. Once an order is shipped, tracking details will be shared via email/SMS.',
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      text:
        'All content on this website, including logos, product names, images, text, and designs, is the property of Chantallow and may not be copied or used without written permission.',
    },
    {
      id: 'limitation-of-liability',
      title: 'Limitation of Liability',
      text:
        'Chantallow shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our products or website.',
    },
  ],
};

async function getTerms() {
  const { rows } = await pool.query('SELECT value FROM site_settings WHERE key = $1', [TERMS_SETTING]);
  const saved = rows[0]?.value;
  if (!saved || typeof saved !== 'object' || !Array.isArray(saved.sections)) return TERMS_DEFAULT;
  const savedById = new Map(saved.sections.map((s) => [s.id, s]));
  return {
    intro: typeof saved.intro === 'string' ? saved.intro : TERMS_DEFAULT.intro,
    sections: TERMS_DEFAULT.sections.map((def) => {
      const s = savedById.get(def.id);
      return {
        id: def.id,
        title: typeof s?.title === 'string' && s.title.trim() ? s.title : def.title,
        text: typeof s?.text === 'string' && s.text.trim() ? s.text : def.text,
      };
    }),
  };
}

// Validates the Terms page body and returns the cleaned value, or a list of
// problems. The section ids/order are fixed (TERMS_DEFAULT's), only title/text
// are editable.
function sanitizeTerms(body) {
  const errors = [];
  const intro = typeof body?.intro === 'string' ? clip(body.intro, 600) : '';
  if (!intro.trim()) errors.push('Intro paragraph is required.');

  const byId = new Map((Array.isArray(body?.sections) ? body.sections : []).map((s) => [s?.id, s]));
  const sections = TERMS_DEFAULT.sections.map((def) => {
    const s = byId.get(def.id) || {};
    const title = typeof s.title === 'string' ? clip(s.title, 100) : '';
    const text = typeof s.text === 'string' ? clip(s.text, 2000) : '';
    if (!title.trim()) errors.push(`"${def.title}" section title is required.`);
    if (!text.trim()) errors.push(`"${def.title}" section text is required.`);
    return { id: def.id, title, text };
  });

  return { errors, value: { intro, sections } };
}

// ---------- privacy policy page ----------

// The whole Privacy Policy page — a banner intro plus the policy text itself,
// shown on the page as one flowing paragraph and edited here as one textarea.
const PRIVACY_SETTING = 'privacy_page';

const PRIVACY_DEFAULT = {
  intro:
    'At Chantallow, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.',
  body:
    'We may collect your name, email address, phone number, shipping and billing address, and payment details (processed securely through third-party payment providers), along with website usage data gathered through cookies and analytics tools. Your information may be used to communicate order updates and provide customer support, to improve website functionality and the overall customer experience, and to send promotional offers or newsletters (only if you have subscribed). We implement reasonable security measures to protect your personal information. Payment information is processed securely and is not stored on our servers. Our website may use cookies to enhance user experience, analyze traffic, and improve website performance. You may disable cookies through your browser settings. We may share necessary information with trusted third-party partners such as payment gateways, courier services, and analytics providers solely for order fulfillment and website operations. You may request access, correction, or deletion of your personal data by contacting us at [your email]. We reserve the right to update this Privacy Policy at any time. Changes will be reflected on this page.',
};

async function getPrivacy() {
  const { rows } = await pool.query('SELECT value FROM site_settings WHERE key = $1', [PRIVACY_SETTING]);
  const saved = rows[0]?.value;
  if (!saved || typeof saved !== 'object') return PRIVACY_DEFAULT;
  return {
    intro: typeof saved.intro === 'string' && saved.intro.trim() ? saved.intro : PRIVACY_DEFAULT.intro,
    body: typeof saved.body === 'string' && saved.body.trim() ? saved.body : PRIVACY_DEFAULT.body,
  };
}

// Validates the Privacy Policy page body and returns the cleaned value, or a
// list of problems.
function sanitizePrivacy(reqBody) {
  const errors = [];
  const intro = typeof reqBody?.intro === 'string' ? clip(reqBody.intro, 600) : '';
  if (!intro.trim()) errors.push('Intro paragraph is required.');

  const body = typeof reqBody?.body === 'string' ? clip(reqBody.body, 6000) : '';
  if (!body.trim()) errors.push('Policy text is required.');

  return { errors, value: { intro, body } };
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

// FAQ answers come from the admin's rich text editor as HTML and are shown on
// the storefront, so only formatting is kept: no scripts, event handlers,
// iframes or javascript: links. Styles are limited to what the editor sets.
const CSS_COLOR = [/^#[0-9a-f]{3,8}$/i, /^rgba?\(\s*[\d.\s,%]+\)$/i];
const RICH_TEXT = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'span', 'a', 'ol', 'ul', 'li',
    'h1', 'h2', 'h3', 'h4', 'blockquote', 'pre', 'code', 'sub', 'sup', 'img', 'hr',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    '*': ['style'],
  },
  allowedStyles: {
    '*': {
      color: CSS_COLOR,
      'background-color': CSS_COLOR,
      'font-family': [/^[\w\s"',-]+$/],
      'font-size': [/^\d+(\.\d+)?(px|em|rem|pt|%)$/],
      'text-align': [/^(left|right|center|justify)$/],
    },
  },
  // links: web, email and phone; images: web or our own /uploads (relative)
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
  // an image whose src was removed (data:, javascript:...) is dropped entirely
  exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src,
  transformTags: {
    a: (tagName, attribs) => {
      // "www.example.com" typed as a link would open as a page on this site
      const href = String(attribs.href || '').trim();
      const fixed = href && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(href) ? `https://${href}` : attribs.href;
      return {
        tagName,
        attribs: {
          ...attribs,
          ...(fixed ? { href: fixed } : {}),
          rel: 'noopener noreferrer',
          ...(attribs.target ? { target: '_blank' } : {}),
        },
      };
    },
  },
};
// Empty lines left at the end of an answer are dropped.
const cleanRichText = (html) =>
  sanitizeHtml(String(html ?? '').slice(0, 200000), RICH_TEXT)
    .trim()
    .replace(/(<p[^>]*>\s*(<br\s*\/?>)?\s*<\/p>\s*)+$/i, '');
// True when the HTML shows nothing (only empty paragraphs / spaces, no image).
const isBlankRichText = (html) =>
  !/<img\b/i.test(html) && !sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/&nbsp;|\s/g, '');

// FAQ answers are plain text (blank line = new paragraph). Anything sent as
// HTML is turned into text, keeping its paragraphs and line breaks.
const ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
function toPlainText(value) {
  const text = String(value ?? '');
  if (!/<[a-z][\s\S]*>/i.test(text)) return text.replace(/\r\n/g, '\n').trim();
  const withBreaks = text.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|h[1-6]|li|blockquote|div)>/gi, '\n\n');
  return sanitizeHtml(withBreaks, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (e) => ENTITIES[e])
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function validateFaqBody(body) {
  const errors = [];
  const question = clip(body?.question, 500);
  const answer = toPlainText(body?.answer).slice(0, 5000);
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

// An About Us product highlight — { name, desc } ("Malachite Fusion: Moringa & ...").
function validateHighlightBody(body) {
  const errors = [];
  const name = clip(body?.name, 60);
  const desc = clip(body?.desc, 160);
  if (!name) errors.push('Name is required.');
  if (!desc) errors.push('Description is required.');
  return { errors, values: { name, desc } };
}

// ---------- blog ----------

const BLOG_STATUSES = ['draft', 'published'];
// cover images: our own uploads or the storefront's bundled /assets photos
const isLocalImage = (v) => /^\/(uploads\/products|assets)\/[\w./-]+$/.test(String(v || '')) && !String(v).includes('..');

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'post';

// A slug no other post uses: "my-post", "my-post-2", ...
async function uniqueSlug(base, exceptId = null) {
  const { rows } = await pool.query(
    "SELECT slug FROM blog_posts WHERE (slug = $1 OR slug LIKE $1 || '-%') AND ($2::int IS NULL OR id <> $2)",
    [base, exceptId]
  );
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

// The blog list doesn't need each post's full content.
const blogSummary = (row) => {
  const { content, ...rest } = row;
  const words = String(content || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  return { ...rest, reading_minutes: Math.max(1, Math.round(words / 200)) };
};

function validateBlogBody(body) {
  const errors = [];
  const title = clip(body?.title, 200);
  if (!title) errors.push('Title is required.');
  const status = BLOG_STATUSES.includes(body?.status) ? body.status : 'draft';
  const content = cleanRichText(body?.content);
  if (status === 'published' && isBlankRichText(content)) errors.push('Write the post before publishing it.');
  const cover = clip(body?.cover_image, 300);
  if (cover && !isLocalImage(cover)) errors.push('Upload the cover image again.');
  const rawTags = Array.isArray(body?.tags) ? body.tags : String(body?.tags || '').split(',');
  const tags = [...new Set(rawTags.map((t) => clip(t, 40)).filter(Boolean))].slice(0, 12);
  let publishedAt = null;
  if (body?.published_at) {
    const d = new Date(body.published_at);
    if (Number.isNaN(d.getTime())) errors.push('Publish date is not a valid date.');
    else publishedAt = d.toISOString();
  }
  return {
    errors,
    values: {
      title,
      slug: slugify(clip(body?.slug, 120) || title),
      excerpt: clip(body?.excerpt, 400) || null,
      content,
      cover_image: cover || null,
      category: clip(body?.category, 60) || null,
      tags,
      author_name: clip(body?.author_name, 80) || null,
      status,
      published_at: publishedAt,
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
const historyEntry = (type, by, details) =>
  JSON.stringify([{ type, at: new Date().toISOString(), by, ...(details ? { details } : {}) }]);

// Delivery steps the admin records on an order's timeline. They don't change
// the order's status (that stays in-progress until it's marked delivered).
const FULFILLMENT_STEPS = ['packaging', 'shipped', 'out-for-delivery'];

// Body of POST /api/admin/orders/:orderId/events. A shipment needs a courier
// and tracking number; warehouse, estimated delivery date and link are optional.
function validateOrderEvent(body) {
  const errors = [];
  const type = String(body?.type || '');
  if (!FULFILLMENT_STEPS.includes(type)) {
    errors.push(`Step must be one of: ${FULFILLMENT_STEPS.join(', ')}.`);
    return { errors };
  }
  if (type !== 'shipped') return { errors, type, details: null };

  const courier = clip(body.courier, 80);
  const trackingNumber = clip(body.trackingNumber, 80);
  const warehouse = clip(body.warehouse, 120);
  const eta = clip(body.eta, 10);
  const trackingUrl = clip(body.trackingUrl, 500);
  if (!courier) errors.push('Courier service is required.');
  if (!trackingNumber) errors.push('Tracking number is required.');
  if (eta && (!/^\d{4}-\d{2}-\d{2}$/.test(eta) || Number.isNaN(Date.parse(eta)))) {
    errors.push('Estimated delivery date must be a valid date.');
  }
  if (trackingUrl && !/^https?:\/\/[^\s]+$/i.test(trackingUrl)) {
    errors.push('Tracking link must start with http:// or https://.');
  }
  const details = { courier, trackingNumber };
  if (warehouse) details.warehouse = warehouse;
  if (eta) details.eta = eta;
  if (trackingUrl) details.trackingUrl = trackingUrl;
  return { errors, type, details };
}

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

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// --- POST /api/auth/forgot-password --- body: { email }
// Always answers the same way whether or not the email exists, so a visitor
// can't use this to discover who has an account. Only the token's hash is
// stored, and it expires in 1 hour.
api.post('/auth/forgot-password', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, errors: ['Enter a valid email address.'] });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE lower(email) = $1', [email]);
    if (rows.length) {
      const user = rows[0];
      const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
      await pool.query(
        'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval \'1 hour\')',
        [user.id, hashResetToken(token)]
      );
      try {
        await sendPasswordResetEmail(user, token);
      } catch (mailErr) {
        // Logged for the admin only — the HTTP response below must stay
        // identical whether or not the email exists / the send succeeded,
        // otherwise this endpoint could be used to find out who has an
        // account (e.g. "existing email -> 503, unknown email -> 200").
        console.error(`Couldn't send the password-reset email to ${user.email}:`, mailErr.message);
      }
    }

    // Always the same response — see the comment above the `catch` block.
    res.json({
      success: true,
      message: 'If an account exists for that email, a password reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
});

// --- POST /api/auth/reset-password --- body: { token, password }
api.post('/auth/reset-password', async (req, res, next) => {
  try {
    const token = String(req.body?.token || '');
    const password = String(req.body?.password || '');
    const errors = [];
    if (!token) errors.push('Missing reset token.');
    if (password.length < 8) errors.push('Password must be at least 8 characters.');
    if (errors.length) return res.status(400).json({ success: false, errors });

    const { rows } = await pool.query(
      `SELECT pr.*, u.id AS uid FROM password_resets pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.token_hash = $1 AND pr.used_at IS NULL AND pr.expires_at > now()`,
      [hashResetToken(token)]
    );
    if (!rows.length) {
      return res.status(400).json({
        success: false,
        error: 'This reset link is invalid or has expired. Request a new one.',
      });
    }

    const reset = rows[0];
    await pool.query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [
      await hashPassword(password),
      reset.uid,
    ]);
    // This token, and any other unused ones for this account, can't be reused.
    await pool.query(
      'UPDATE password_resets SET used_at = now() WHERE user_id = $1 AND used_at IS NULL',
      [reset.uid]
    );

    res.json({ success: true, message: 'Your password has been updated. You can now sign in.' });
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
    res.json({
      success: true,
      ...(await withLastGood('home', getHomePicks)),
      furkind_text: await withLastGood('home_furkind_text', getFurkindText),
      offers: await withLastGood('home_offers', getOffers),
      shortlist_banner: await withLastGood('home_shortlist_banner', getShortlistBanner),
      shortlist_text: await withLastGood('home_shortlist_text', getShortlistText),
      featured_text: await withLastGood('home_featured_text', () => getTextSetting(FEATURED_TEXT_SETTING, FEATURED_TEXT_DEFAULT)),
      featured_banner: await withLastGood('home_featured_banner', () => getImageSetting(FEATURED_BANNER_SETTING)),
      tattoo_text: await withLastGood('home_tattoo_text', () => getTextSetting(TATTOO_TEXT_SETTING, TATTOO_TEXT_DEFAULT)),
      tattoo_banner: await withLastGood('home_tattoo_banner', () => getImageSetting(TATTOO_BANNER_SETTING)),
      tattoo_caption: await withLastGood('home_tattoo_caption', () => getTextSetting(TATTOO_CAPTION_SETTING, TATTOO_CAPTION_DEFAULT)),
      hero_text: await withLastGood('home_hero_text', () => getTextSetting(HERO_TEXT_SETTING, HERO_TEXT_DEFAULT)),
      hero_banner: await withLastGood('home_hero_banner', () => getImageSetting(HERO_BANNER_SETTING)),
    });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/about --- (About Us page content)
api.get('/about', async (req, res, next) => {
  try {
    res.json({ success: true, about: await withLastGood('about', getAbout) });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/terms --- (Terms & Conditions page content)
api.get('/terms', async (req, res, next) => {
  try {
    res.json({ success: true, terms: await withLastGood('terms', getTerms) });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/privacy --- (Privacy Policy page content)
api.get('/privacy', async (req, res, next) => {
  try {
    res.json({ success: true, privacy: await withLastGood('privacy', getPrivacy) });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/combos --- (active combos, in display order)
api.get('/combos', async (req, res, next) => {
  try {
    const combos = await withLastGood('combos', async () =>
      (await pool.query('SELECT * FROM combos WHERE is_active ORDER BY position, id')).rows.map(publicCombo)
    );
    res.json({ success: true, count: combos.length, combos });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/combos/:id --- (an active combo; hidden ones 404 on the storefront)
api.get('/combos/:id', async (req, res, next) => {
  try {
    const combo = await withLastGood(`combo:${req.params.id}`, async () => {
      const { rows } = await pool.query('SELECT * FROM combos WHERE id = $1 AND is_active', [req.params.id]);
      return rows.length ? publicCombo(rows[0]) : null;
    });
    if (!combo) return res.status(404).json({ success: false, error: 'Combo not found' });
    res.json({ success: true, combo });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/blog --- published posts (newest first, without content), the
// categories with their post counts, and all tags.
api.get('/blog', async (req, res, next) => {
  try {
    const data = await withLastGood('blog', async () => {
      const { rows } = await pool.query(
        `SELECT * FROM blog_posts WHERE status = 'published' AND published_at <= now()
         ORDER BY published_at DESC, id DESC`
      );
      const counts = new Map();
      const tags = new Set();
      for (const p of rows) {
        if (p.category) counts.set(p.category, (counts.get(p.category) || 0) + 1);
        (p.tags || []).forEach((t) => tags.add(t));
      }
      return {
        posts: rows.map(blogSummary),
        categories: [...counts].map(([name, count]) => ({ name, count })),
        tags: [...tags],
      };
    });
    res.json({ success: true, count: data.posts.length, ...data });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/blog/:slug --- one published post, with the posts before / after it
api.get('/blog/:slug', async (req, res, next) => {
  try {
    const slug = String(req.params.slug);
    const data = await withLastGood(`blog:${slug}`, async () => {
      const { rows } = await pool.query(
        "SELECT * FROM blog_posts WHERE slug = $1 AND status = 'published' AND published_at <= now()",
        [slug]
      );
      if (!rows.length) return null;
      const post = rows[0];
      // Compared against the post's own row in SQL: a JS Date only keeps
      // milliseconds, so passing published_at back would misplace the post.
      const [prev, next, more] = await Promise.all([
        pool.query(
          `SELECT slug, title FROM blog_posts WHERE status = 'published' AND published_at <= now()
             AND (published_at, id) < (SELECT published_at, id FROM blog_posts WHERE id = $1)
           ORDER BY published_at DESC, id DESC LIMIT 1`,
          [post.id]
        ),
        pool.query(
          `SELECT slug, title FROM blog_posts WHERE status = 'published' AND published_at <= now()
             AND (published_at, id) > (SELECT published_at, id FROM blog_posts WHERE id = $1)
           ORDER BY published_at, id LIMIT 1`,
          [post.id]
        ),
        pool.query(
          `SELECT * FROM blog_posts WHERE status = 'published' AND published_at <= now() AND id <> $1
           ORDER BY (category IS NOT DISTINCT FROM $2) DESC, published_at DESC LIMIT 3`,
          [post.id, post.category]
        ),
      ]);
      return {
        post: { ...post, reading_minutes: blogSummary(post).reading_minutes },
        previous: prev.rows[0] || null,
        next: next.rows[0] || null,
        more: more.rows.map(blogSummary),
      };
    });
    if (!data) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/faqs --- (published FAQs, in display order)
api.get('/faqs', async (req, res, next) => {
  try {
    const faqs = await withLastGood('faqs', async () =>
      (await pool.query('SELECT id, question, answer, category FROM faqs WHERE is_published ORDER BY position, id')).rows
    );
    res.json({ success: true, count: faqs.length, faqs });
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
    // with each user's order count, spend (canceled orders excluded) and last order
    const { rows } = await pool.query(`
      SELECT u.*, coalesce(o.orders, 0)::int AS order_count, coalesce(o.spent, 0)::float AS total_spent, o.last_order_at
      FROM users u
      LEFT JOIN (
        SELECT user_id, count(*) AS orders, sum(total) FILTER (WHERE status <> 'canceled') AS spent,
               max(placed_at) AS last_order_at
        FROM orders WHERE user_id IS NOT NULL GROUP BY user_id
      ) o ON o.user_id = u.id
      ORDER BY u.created_at DESC, u.id DESC`);
    res.json({
      success: true,
      count: rows.length,
      users: rows.map((r) => ({
        ...publicUser(r),
        order_count: r.order_count,
        total_spent: money(r.total_spent),
        last_order_at: r.last_order_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/admin/users/:id --- profile, order stats, addresses / phones
// used at checkout, orders and return requests.
api.get('/admin/users/:id', adminOnly, async (req, res, next) => {
  try {
    const { rows: users } = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (!users.length) return res.status(404).json({ success: false, error: 'User not found' });
    const user = users[0];

    const [stats, orders, returns] = await Promise.all([
      pool.query(
        `SELECT count(*)::int AS orders,
                count(*) FILTER (WHERE status = 'delivered')::int AS delivered,
                count(*) FILTER (WHERE status = 'canceled')::int AS canceled,
                count(*) FILTER (WHERE status IN ('in-progress', 'delayed'))::int AS open,
                coalesce(sum(total) FILTER (WHERE status <> 'canceled'), 0)::float AS spent,
                coalesce(sum((SELECT sum((l->>'qty')::int) FROM jsonb_array_elements(items) l))
                         FILTER (WHERE status <> 'canceled'), 0)::int AS items,
                min(placed_at) AS first_order_at,
                max(placed_at) AS last_order_at
         FROM orders WHERE user_id = $1`,
        [user.id]
      ),
      pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC LIMIT 100', [user.id]),
      pool.query('SELECT * FROM order_returns WHERE user_id = $1 ORDER BY created_at DESC', [user.id]),
    ]);

    const st = stats.rows[0];
    const kept = st.orders - st.canceled;
    // Distinct addresses / phones from their orders, most recent first.
    const addresses = [];
    const seenAddress = new Set();
    const phones = [];
    for (const o of orders.rows) {
      const key = o.address ? JSON.stringify(o.address) : '';
      if (key && !seenAddress.has(key)) {
        seenAddress.add(key);
        addresses.push({ ...o.address, last_used_at: o.placed_at });
      }
      if (o.phone && !phones.includes(o.phone)) phones.push(o.phone);
    }
    const refunded = returns.rows.filter((r) => r.status === 'Refunded').reduce((n, r) => n + Number(r.amount), 0);

    res.json({
      success: true,
      user: publicUser(user),
      updated_at: user.updated_at,
      stats: {
        orders: st.orders,
        delivered: st.delivered,
        canceled: st.canceled,
        open: st.open,
        items: st.items,
        total_spent: money(st.spent),
        average_order: kept ? money(st.spent / kept) : 0,
        first_order_at: st.first_order_at,
        last_order_at: st.last_order_at,
        returns: returns.rows.length,
        refunded: money(refunded),
      },
      addresses: addresses.slice(0, 5),
      phones,
      orders: orders.rows.map(publicOrder),
      returns: returns.rows.map(publicReturn),
    });
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

// --- PUT /api/admin/home --- body: { new_launches?: [pick, ...], best_sellers?: [...],
//                                     furkind_text?: { heading, text },
//                                     offers?: [{ image, label, title, year?, bgTitle?, lightText? }, ...],
//                                     shortlist_text?: { heading, subtitle },
//                                     shortlist_banner?: '/uploads/products/...' | null,
//                                     featured_text?: { heading, subtitle },
//                                     featured_banner?: '/uploads/products/...' | null,
//                                     tattoo_text?: { heading, subtitle },
//                                     tattoo_banner?: '/uploads/products/...' | null,
//                                     tattoo_caption?: { heading, subtitle },
//                                     hero_text?: { heading, subtitle },
//                                     hero_banner?: '/uploads/products/...' | null,
//                                     expected?: { <section>: [ids the page loaded] } }
// A pick is a product id or { id, style?: 'photo' | 'scene', label?: '...', image?: '/uploads/...', color?: '#hex' } (see pickId).
// Each list is in display order; sections left out are not changed. With
// `expected`, the save is refused (409) if someone changed that section since
// the page loaded, so an old open tab can't silently overwrite newer picks.
api.put('/admin/home', adminOnly, async (req, res, next) => {
  try {
    const updates = Object.keys(HOME_PICKS).filter((section) => req.body?.[section] !== undefined);
    const furkindText = req.body?.furkind_text;
    const offers = req.body?.offers;
    const shortlistText = req.body?.shortlist_text;
    const shortlistBanner = req.body?.shortlist_banner;
    const featuredText = req.body?.featured_text;
    const featuredBanner = req.body?.featured_banner;
    const tattooText = req.body?.tattoo_text;
    const tattooBanner = req.body?.tattoo_banner;
    const tattooCaption = req.body?.tattoo_caption;
    const heroText = req.body?.hero_text;
    const heroBanner = req.body?.hero_banner;

    if (furkindText !== undefined) {
      if (
        !furkindText ||
        typeof furkindText.heading !== 'string' ||
        typeof furkindText.text !== 'string' ||
        !furkindText.heading.trim() ||
        !furkindText.text.trim()
      ) {
        return res.status(400).json({ success: false, error: '`furkind_text` needs a non-empty heading and text.' });
      }
      await pool.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [FURKIND_TEXT_SETTING, JSON.stringify({ heading: clip(furkindText.heading, 120), text: clip(furkindText.text, 2000) })]
      );
    }

    if (offers !== undefined) {
      if (!Array.isArray(offers) || offers.length > MAX_OFFERS) {
        return res.status(400).json({ success: false, error: `Add at most ${MAX_OFFERS} banners.` });
      }
      const clean = [];
      for (const o of offers) {
        if (!o || !isOfferImage(o.image) || typeof o.label !== 'string' || !o.label.trim() || typeof o.title !== 'string' || !o.title.trim()) {
          return res.status(400).json({ success: false, error: 'Each banner needs an image, a label and a title.' });
        }
        clean.push({
          image: o.image,
          label: clip(o.label, 60),
          title: clip(o.title, 40),
          year: o.year ? clip(String(o.year), 10) : '',
          bgTitle: o.bgTitle ? clip(String(o.bgTitle), 20) : '',
          lightText: o.lightText !== false,
        });
      }
      await pool.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [OFFERS_SETTING, JSON.stringify(clean)]
      );
    }

    if (shortlistText !== undefined) {
      if (
        !shortlistText ||
        typeof shortlistText.heading !== 'string' ||
        typeof shortlistText.subtitle !== 'string' ||
        !shortlistText.heading.trim() ||
        !shortlistText.subtitle.trim()
      ) {
        return res.status(400).json({ success: false, error: '`shortlist_text` needs a non-empty heading and subtitle.' });
      }
      await pool.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [SHORTLIST_TEXT_SETTING, JSON.stringify({ heading: clip(shortlistText.heading, 160), subtitle: clip(shortlistText.subtitle, 300) })]
      );
    }

    if (shortlistBanner !== undefined) {
      if (shortlistBanner !== null && !isOfferImage(shortlistBanner)) {
        return res.status(400).json({ success: false, error: '`shortlist_banner` must be an uploaded image path, or null to clear it.' });
      }
      await pool.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [SHORTLIST_BANNER_SETTING, JSON.stringify(shortlistBanner)]
      );
    }

    const namedTextFields = [
      ['featured_text', featuredText, FEATURED_TEXT_SETTING, 120, 300],
      ['tattoo_text', tattooText, TATTOO_TEXT_SETTING, 120, 300],
      ['tattoo_caption', tattooCaption, TATTOO_CAPTION_SETTING, 80, 200],
      ['hero_text', heroText, HERO_TEXT_SETTING, 120, 200],
    ];
    for (const [name, value, setting, headingMax, subtitleMax] of namedTextFields) {
      if (value === undefined) continue;
      if (!isTextSettingValid(value)) {
        return res.status(400).json({ success: false, error: `\`${name}\` needs a non-empty heading and subtitle.` });
      }
      await saveSetting(setting, { heading: clip(value.heading, headingMax), subtitle: clip(value.subtitle, subtitleMax) });
    }

    const namedImageFields = [
      ['featured_banner', featuredBanner, FEATURED_BANNER_SETTING],
      ['tattoo_banner', tattooBanner, TATTOO_BANNER_SETTING],
      ['hero_banner', heroBanner, HERO_BANNER_SETTING],
    ];
    for (const [name, value, setting] of namedImageFields) {
      if (value === undefined) continue;
      if (value !== null && !isOfferImage(value)) {
        return res.status(400).json({ success: false, error: `\`${name}\` must be an uploaded image path, or null to clear it.` });
      }
      await saveSetting(setting, value);
    }

    const anyExtra =
      furkindText !== undefined ||
      offers !== undefined ||
      shortlistText !== undefined ||
      shortlistBanner !== undefined ||
      namedTextFields.some(([, value]) => value !== undefined) ||
      namedImageFields.some(([, value]) => value !== undefined);

    const extraFields = async () => ({
      furkind_text: await getFurkindText(),
      offers: await getOffers(),
      shortlist_banner: await getShortlistBanner(),
      shortlist_text: await getShortlistText(),
      featured_text: await getTextSetting(FEATURED_TEXT_SETTING, FEATURED_TEXT_DEFAULT),
      featured_banner: await getImageSetting(FEATURED_BANNER_SETTING),
      tattoo_text: await getTextSetting(TATTOO_TEXT_SETTING, TATTOO_TEXT_DEFAULT),
      tattoo_banner: await getImageSetting(TATTOO_BANNER_SETTING),
      tattoo_caption: await getTextSetting(TATTOO_CAPTION_SETTING, TATTOO_CAPTION_DEFAULT),
      hero_text: await getTextSetting(HERO_TEXT_SETTING, HERO_TEXT_DEFAULT),
      hero_banner: await getImageSetting(HERO_BANNER_SETTING),
    });

    if (!updates.length) {
      if (anyExtra) {
        return res.json({ success: true, ...(await getHomePicks()), ...(await extraFields()) });
      }
      return res.status(400).json({
        success: false,
        error: `Send ${Object.keys(HOME_PICKS).join(' or ')}, furkind_text, offers, shortlist_text, shortlist_banner, featured_text, featured_banner, tattoo_text, tattoo_banner, tattoo_caption, hero_text or hero_banner.`,
      });
    }

    const lists = {};
    for (const section of updates) {
      const raw = req.body[section];
      if (!Array.isArray(raw) || !raw.every((v) => isValidId(pickId(v)))) {
        return res.status(400).json({ success: false, error: `\`${section}\` must be a list of product ids.` });
      }
      const ids = [...new Set(raw.map((v) => Number(pickId(v))))];
      const { max, label } = HOME_PICKS[section];
      if (ids.length > max) {
        return res.status(400).json({ success: false, error: `Pick at most ${max} ${label}.` });
      }
      const { rows } = await pool.query('SELECT id FROM products WHERE id = ANY($1::int[])', [ids]);
      if (rows.length !== ids.length) {
        return res.status(400).json({ success: false, error: 'One of those products no longer exists.' });
      }
      // stored compactly: a plain id, or { id, style?, label? } when it has extras
      const extras = new Map(raw.map((v) => [Number(pickId(v)), v]));
      lists[section] = ids.map((id) => {
        const v = extras.get(id);
        const pick = { id };
        if (pickStyle(v) === 'photo') pick.style = 'photo';
        if (pickLabel(v)) pick.label = pickLabel(v);
        if (pickImage(v)) pick.image = pickImage(v);
        if (pickColor(v)) pick.color = pickColor(v);
        return Object.keys(pick).length > 1 ? pick : id;
      });
    }

    const expected = req.body?.expected || {};
    for (const section of updates) {
      if (!Array.isArray(expected[section])) continue;
      const current = (await getPickedProducts(section)).map((p) => p.id);
      if (current.join(',') !== expected[section].map(Number).join(',')) {
        return res.status(409).json({
          success: false,
          error: 'These picks were changed since you opened this page. Reload to see the latest, then make your change again.',
        });
      }
    }

    for (const section of updates) {
      await pool.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [HOME_PICKS[section].setting, JSON.stringify(lists[section])]
      );
    }
    res.json({ success: true, ...(await getHomePicks()), ...(await extraFields()) });
  } catch (err) {
    next(err);
  }
});

// --- POST /api/admin/home/image --- (multipart `image`) a card photo for a home
// page pick; returns { url } to save as the pick's `image`.
api.post('/admin/home/image', adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Choose an image to upload.' });
  if (!req.file.mimetype.startsWith('image/')) {
    removeMediaFiles([{ url: '/uploads/products/' + req.file.filename }]);
    return res.status(400).json({ success: false, error: 'The card photo must be an image file.' });
  }
  res.status(201).json({ success: true, url: '/uploads/products/' + req.file.filename });
});

// --- PUT /api/admin/about --- body: the whole About Us page (see ABOUT_DEFAULT's
// shape: founder, cta, illuminate). Photos are uploaded first via the same
// POST /api/admin/home/image endpoint, then saved here by path.
api.put('/admin/about', adminOnly, async (req, res, next) => {
  try {
    const { errors, value } = sanitizeAbout(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });
    await saveSetting(ABOUT_SETTING, value);
    res.json({ success: true, about: await getAbout() });
  } catch (err) {
    next(err);
  }
});

// --- PUT /api/admin/terms --- body: { intro, sections: [{ id, title, text }] }
// (see TERMS_DEFAULT for the fixed section ids/order)
api.put('/admin/terms', adminOnly, async (req, res, next) => {
  try {
    const { errors, value } = sanitizeTerms(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });
    await saveSetting(TERMS_SETTING, value);
    res.json({ success: true, terms: await getTerms() });
  } catch (err) {
    next(err);
  }
});

// --- PUT /api/admin/privacy --- body: { intro, sections: [{ id, title, text }] }
// (see PRIVACY_DEFAULT for the fixed section ids/order)
api.put('/admin/privacy', adminOnly, async (req, res, next) => {
  try {
    const { errors, value } = sanitizePrivacy(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });
    await saveSetting(PRIVACY_SETTING, value);
    res.json({ success: true, privacy: await getPrivacy() });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/admin/about/highlights --- (the "Illuminate Beauty" product highlights)
api.get('/admin/about/highlights', adminOnly, async (req, res, next) => {
  try {
    const highlights = await getAboutHighlights();
    res.json({ success: true, count: highlights.length, highlights });
  } catch (err) {
    next(err);
  }
});

// --- PUT /api/admin/about/highlights/reorder --- body: { ids: [id, ...] } in the new order
// (declared before /:id so "reorder" isn't read as an id)
api.put('/admin/about/highlights/reorder', adminOnly, async (req, res, next) => {
  try {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || !ids.every(isValidId)) {
      return res.status(400).json({ success: false, error: '`ids` must be a list of highlight ids.' });
    }
    await pool.query(
      `UPDATE about_highlights SET position = o.pos, updated_at = now()
       FROM unnest($1::int[]) WITH ORDINALITY AS o(id, pos)
       WHERE about_highlights.id = o.id`,
      [ids.map(Number)]
    );
    res.json({ success: true, highlights: await getAboutHighlights() });
  } catch (err) {
    next(err);
  }
});

// --- POST /api/admin/about/highlights --- (added at the end of the list)
api.post('/admin/about/highlights', adminOnly, async (req, res, next) => {
  try {
    const { errors, values: v } = validateHighlightBody(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });
    const { rows } = await pool.query(
      `INSERT INTO about_highlights (name, description, position)
       VALUES ($1, $2, (SELECT coalesce(max(position), 0) + 1 FROM about_highlights))
       RETURNING *`,
      [v.name, v.desc]
    );
    res.status(201).json({ success: true, highlight: rows[0] });
  } catch (err) {
    next(err);
  }
});

// --- PUT /api/admin/about/highlights/:id ---
api.put('/admin/about/highlights/:id', adminOnly, async (req, res, next) => {
  try {
    const { errors, values: v } = validateHighlightBody(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });
    const { rows } = await pool.query(
      'UPDATE about_highlights SET name = $1, description = $2, updated_at = now() WHERE id = $3 RETURNING *',
      [v.name, v.desc, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Highlight not found' });
    res.json({ success: true, highlight: rows[0] });
  } catch (err) {
    next(err);
  }
});

// --- DELETE /api/admin/about/highlights/:id ---
api.delete('/admin/about/highlights/:id', adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM about_highlights WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Highlight not found' });
    res.json({ success: true, deleted: rows[0].id });
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

// ------------------------------ admin: blog ------------------------------

// --- GET /api/admin/blog --- every post (drafts too), newest first
api.get('/admin/blog', adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM blog_posts ORDER BY coalesce(published_at, updated_at) DESC, id DESC'
    );
    res.json({ success: true, count: rows.length, posts: rows.map(blogSummary) });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/admin/blog/:id ---
api.get('/admin/blog/:id', adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, post: rows[0] });
  } catch (err) {
    next(err);
  }
});

// --- POST /api/admin/blog --- (JSON; cover via POST /api/admin/home/image)
api.post('/admin/blog', adminOnly, async (req, res, next) => {
  try {
    const { errors, values: v } = validateBlogBody(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });
    const slug = await uniqueSlug(v.slug);
    const publishedAt = v.status === 'published' ? v.published_at || new Date().toISOString() : v.published_at;
    const { rows } = await pool.query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, category, tags, author_name, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [v.title, slug, v.excerpt, v.content, v.cover_image, v.category, JSON.stringify(v.tags),
       v.author_name || req.user.name, v.status, publishedAt]
    );
    res.status(201).json({ success: true, post: rows[0] });
  } catch (err) {
    next(err);
  }
});

// --- PUT /api/admin/blog/:id ---
api.put('/admin/blog/:id', adminOnly, async (req, res, next) => {
  try {
    const { rows: existing } = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, error: 'Post not found' });
    const { errors, values: v } = validateBlogBody(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });
    const slug = await uniqueSlug(v.slug, existing[0].id);
    // first publish gets "now" unless a date was chosen
    const publishedAt =
      v.published_at || (v.status === 'published' ? existing[0].published_at || new Date().toISOString() : existing[0].published_at);
    const { rows } = await pool.query(
      `UPDATE blog_posts
       SET title = $1, slug = $2, excerpt = $3, content = $4, cover_image = $5, category = $6, tags = $7,
           author_name = $8, status = $9, published_at = $10, updated_at = now()
       WHERE id = $11
       RETURNING *`,
      [v.title, slug, v.excerpt, v.content, v.cover_image, v.category, JSON.stringify(v.tags),
       v.author_name || existing[0].author_name, v.status, publishedAt, req.params.id]
    );
    res.json({ success: true, post: rows[0] });
  } catch (err) {
    next(err);
  }
});

// --- DELETE /api/admin/blog/:id ---
api.delete('/admin/blog/:id', adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING cover_image', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Post not found' });
    if (rows[0].cover_image?.startsWith('/uploads/products/')) removeMediaFiles([{ url: rows[0].cover_image }]);
    res.json({ success: true, deleted: Number(req.params.id) });
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

// --- POST /api/admin/orders/:orderId/events --- body: { type, courier?, trackingNumber?, warehouse?, eta?, trackingUrl? }
// Adds a delivery step (packaging / shipped / out-for-delivery) to the order's
// timeline; a shipment also becomes the order's current `shipment`.
api.post('/admin/orders/:orderId/events', adminOnly, async (req, res, next) => {
  try {
    const { errors, type, details } = validateOrderEvent(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const { rows } = await pool.query(
      `UPDATE orders
         SET history = history || $2::jsonb,
             shipment = COALESCE($3::jsonb, shipment),
             updated_at = now()
       WHERE id = $1 AND status NOT IN ('delivered', 'canceled')
       RETURNING *`,
      [req.params.orderId, historyEntry(type, 'admin', details), details && JSON.stringify(details)]
    );
    if (rows.length) return res.json({ success: true, order: publicOrder(rows[0]) });

    const { rows: found } = await pool.query('SELECT status FROM orders WHERE id = $1', [req.params.orderId]);
    if (!found.length) return res.status(404).json({ success: false, error: 'Order not found' });
    res.status(409).json({ success: false, error: `This order is already ${found[0].status}, so it can't be updated.` });
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
      'POST   /api/auth/forgot-password',
      'POST   /api/auth/reset-password',
      'GET    /api/auth/me              (signed in)',
      'POST   /api/orders               (guest or signed in)',
      'GET    /api/orders/mine          (signed in)',
      'POST   /api/orders/:orderId/cancel (signed in, own order)',
      'GET    /api/returns/mine         (signed in)',
      'POST   /api/returns              (signed in, own delivered order)',
      'DELETE /api/returns/:returnId    (signed in, own pending request)',
      'GET    /api/meta',
      'GET    /api/home',
      'GET    /api/about',
      'GET    /api/terms',
      'GET    /api/privacy',
      'GET    /api/combos',
      'GET    /api/combos/:id',
      'GET    /api/faqs',
      'GET    /api/blog',
      'GET    /api/blog/:slug',
      'GET    /api/products',
      'GET    /api/products/:id',
      'POST   /api/products             (admin)',
      'PUT    /api/products/:id         (admin)',
      'DELETE /api/products/:id         (admin)',
      'GET    /api/admin/users          (admin)',
      'PATCH  /api/admin/users/:id      (admin)',
      'PUT    /api/admin/home           (admin)',
      'POST   /api/admin/home/image     (admin, multipart)',
      'PUT    /api/admin/about          (admin)',
      'PUT    /api/admin/terms          (admin)',
      'PUT    /api/admin/privacy        (admin)',
      'GET    /api/admin/about/highlights          (admin)',
      'POST   /api/admin/about/highlights          (admin)',
      'PUT    /api/admin/about/highlights/reorder  (admin)',
      'PUT    /api/admin/about/highlights/:id      (admin)',
      'DELETE /api/admin/about/highlights/:id      (admin)',
      'GET    /api/admin/combos         (admin)',
      'GET    /api/admin/combos/:id     (admin)',
      'POST   /api/admin/combos         (admin, multipart)',
      'PUT    /api/admin/combos/:id     (admin, multipart)',
      'DELETE /api/admin/combos/:id     (admin)',
      'GET    /api/admin/users/:id      (admin)',
      'GET    /api/admin/blog           (admin)',
      'GET    /api/admin/blog/:id       (admin)',
      'POST   /api/admin/blog           (admin)',
      'PUT    /api/admin/blog/:id       (admin)',
      'DELETE /api/admin/blog/:id       (admin)',
      'GET    /api/admin/faqs           (admin)',
      'POST   /api/admin/faqs           (admin)',
      'PUT    /api/admin/faqs/reorder   (admin)',
      'PUT    /api/admin/faqs/:id       (admin)',
      'DELETE /api/admin/faqs/:id       (admin)',
      'GET    /api/admin/stats?year=    (admin)',
      'GET    /api/admin/orders?status=&search= (admin)',
      'GET    /api/admin/orders/:orderId (admin)',
      'PATCH  /api/admin/orders/:orderId (admin)',
      'POST   /api/admin/orders/:orderId/events (admin)',
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
