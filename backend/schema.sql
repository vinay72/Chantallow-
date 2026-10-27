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
