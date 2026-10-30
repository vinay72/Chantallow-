// One-time starter content for the home page: the 8 combo cards that used to
// be hard-coded in Home.jsx, and some placeholder FAQs. Each seed runs once
// (remembered in site_settings), so anything the admin edits or deletes later
// is never put back.

const fs = require('fs');
const path = require('path');
const { pool } = require('./db');
const { UPLOAD_DIR } = require('./upload');

// The combo photos ship with the storefront; they're copied into uploads so the
// admin can replace or delete them like any other image.
const COMBO_IMAGE_DIR = path.join(__dirname, '..', 'src', 'assets', 'product', 'new');

const COMBOS = [
  // [image file, big jar, small jar, tag, accent, price, compare-at price]
  ['1.jpg', 'Malachite Fusion', 'Amethyst Relief', 'Get 20% Off', '#7A0000', 66, 89],
  ['2.jpg', 'Amber Glow', 'Bare Whipped Tallow', null, '#3B1941', 80, 89],
  ['3.jpg', 'Jasper Revive', 'Obsidian Infusion', 'Featured', '#3B1941', 0, null],
  ['4.jpg', 'Olivine Relief', 'Malachite Fusion', null, '#5B2861', 0, null],
  ['8.jpg', 'Obsidian Infusion', 'Taluma Hair Care', null, '#5d1100', 0, null],
  ['5.jpg', 'Taluma Hair Care', 'Amber Glow', null, '#536807', 0, null],
  ['7.jpg', 'Bare Whipped Tallow', 'Olivine Relief', null, '#5d1100', 0, null],
  ['6.jpg', 'Amethyst Relief', 'Jasper Revive', null, '#5d1100', 0, null],
];

const FAQS = [
  ['Products', 'What is tallow and why is it good for skin?',
    'Tallow is rendered fat from grass-fed, grass-finished cattle. Its fatty acids are very close to the ones in our own skin, so it absorbs well and helps restore a healthy, moisturised skin barrier.'],
  ['Products', 'Is Chantallow suitable for sensitive skin?',
    'Yes. Our balms are made with a short list of natural ingredients and no synthetic fragrance. As with any new skincare, we recommend a patch test on your inner arm before first use.'],
  ['Products', 'How long does one jar last?',
    'A little goes a long way. With daily use on the face, a 2 oz jar usually lasts 6–8 weeks and a 4 oz jar around 3–4 months. Use within 12 months of opening.'],
  ['Products', 'How should I store my tallow balm?',
    'Keep the lid closed and store it in a cool, dry place away from direct sunlight. In very warm weather the balm may soften; it works just as well and firms up again once cool.'],
  ['Orders & Shipping', 'How long does delivery take?',
    'Orders are packed within 1–2 working days. Standard delivery then takes 3–5 working days. You can follow your order from My Account → Orders.'],
  ['Orders & Shipping', 'Can I cancel my order?',
    'Yes, as long as it has not been delivered yet. Open the order in My Account → Orders and choose “Cancel Order”.'],
  ['Returns', 'What is your return policy?',
    'If something is wrong with your order you can request a return within 30 days of delivery from My Account → Return request. See our Return & Refund Policy for details.'],
  ['Returns', 'When will I get my refund?',
    'Once your return is approved and received, we issue the refund to your original payment method. It usually appears within 5–10 working days, depending on your bank.'],
];

// Runs `fn` once per `key`, remembering it in site_settings.
async function once(key, fn) {
  const { rows } = await pool.query('SELECT 1 FROM site_settings WHERE key = $1', [key]);
  if (rows.length) return;
  await fn();
  await pool.query(
    `INSERT INTO site_settings (key, value) VALUES ($1, 'true') ON CONFLICT (key) DO NOTHING`,
    [key]
  );
}

function copyComboImage(file) {
  const from = path.join(COMBO_IMAGE_DIR, file);
  if (!fs.existsSync(from)) return null;
  const name = `seed-combo-${file}`;
  fs.copyFileSync(from, path.join(UPLOAD_DIR, name));
  return '/uploads/products/' + name;
}

async function seedHomeContent() {
  await once('seeded_combos', async () => {
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM combos');
    if (rows[0].n > 0) return; // the admin already has combos
    for (const [i, [file, big, small, tag, accent, price, compare]] of COMBOS.entries()) {
      await pool.query(
        `INSERT INTO combos (name, description, price, compare_at_price, tag, accent, image, items, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          `${big} (4oz) + ${small} (2oz)`,
          `A Chantallow duo: a 4 oz ${big} with a 2 oz ${small}.`,
          price, compare, tag, accent, copyComboImage(file),
          JSON.stringify([
            { product_id: null, name: big, size: '4 oz', qty: 1 },
            { product_id: null, name: small, size: '2 oz', qty: 1 },
          ]),
          i + 1,
        ]
      );
    }
    console.log(`Seeded ${COMBOS.length} home page combos.`);
  });

  await once('seeded_faqs', async () => {
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM faqs');
    if (rows[0].n > 0) return;
    for (const [i, [category, question, answer]] of FAQS.entries()) {
      await pool.query('INSERT INTO faqs (category, question, answer, position) VALUES ($1, $2, $3, $4)', [
        category, question, answer, i + 1,
      ]);
    }
    console.log(`Seeded ${FAQS.length} placeholder FAQs.`);
  });
}

module.exports = { seedHomeContent };
