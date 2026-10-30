CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subname TEXT,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  category TEXT,
  size TEXT,
  stock_status TEXT NOT NULL DEFAULT 'in_stock', -- in_stock | out_of_stock
  images JSONB NOT NULL DEFAULT '[]',  -- array of {url, type: "image"|"video"}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Added after launch; ADD COLUMN IF NOT EXISTS upgrades existing databases.
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS directions TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS main_image TEXT; -- cover image url

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);

-- Website accounts. Everyone who signs up is a 'user'; 'admin' unlocks /admin.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emails are compared case-insensitively.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (lower(email));

-- Orders placed on the website. The id is the order number the shopper sees
-- (e.g. "57R04V93X36"); user_id is null for guest checkouts.
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'in-progress'
    CHECK (status IN ('in-progress', 'delayed', 'delivered', 'canceled')),
  items JSONB NOT NULL DEFAULT '[]', -- array of {productId, size, qty, price}
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment TEXT,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON orders (placed_at);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);

-- Return requests against an order line; amount is what would be refunded.
CREATE TABLE IF NOT EXISTS order_returns (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  product_id TEXT,
  size TEXT,
  qty INTEGER NOT NULL CHECK (qty > 0),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  reason TEXT,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_returns_order ON order_returns (order_id);

-- Added for the full order flow (user panel + admin panel).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address JSONB;            -- delivery address
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS history JSONB NOT NULL DEFAULT '[]'; -- [{type, at, by}]
ALTER TABLE order_returns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Small site-wide settings the admin edits (e.g. which products the home page
-- shows as new launches). key -> JSON value.
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Combo products ("The Chantallow Duos" on the home page): one image, one price,
-- and the products inside the combo.
CREATE TABLE IF NOT EXISTS combos (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  tag TEXT,                              -- badge on the card, e.g. "Get 20% Off"
  accent TEXT,                           -- card tint, #RRGGBB
  image TEXT,                            -- /uploads/products/...
  items JSONB NOT NULL DEFAULT '[]',     -- [{product_id, name, size, qty}]
  position INTEGER NOT NULL DEFAULT 0,   -- lower shows first
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Frequently asked questions, managed from Admin -> Home -> FAQs.
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blog posts written in Admin -> Blog. `content` is sanitised HTML from the
-- rich text editor; only 'published' posts are shown on the website.
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,              -- used in the URL: /blog/<slug>
  excerpt TEXT,                           -- short summary for the blog list
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,                       -- /uploads/products/... or /assets/...
  category TEXT,
  tags JSONB NOT NULL DEFAULT '[]',       -- ["Skincare", "Tallow"]
  author_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts (status, published_at DESC);
