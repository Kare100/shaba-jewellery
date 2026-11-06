-- Shaba Jewellery schema. Safe to re-run: drops and recreates the products table.
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id           SERIAL PRIMARY KEY,
  slug         TEXT        NOT NULL UNIQUE,         -- used in clean URLs: /products/<slug>
  sku          TEXT        NOT NULL UNIQUE,
  name         TEXT        NOT NULL,
  category     TEXT        NOT NULL CHECK (category IN ('rings', 'necklaces', 'earrings', 'bracelets')),
  short_description TEXT   NOT NULL,                -- doubles as the meta description (keep under ~155 chars)
  description  TEXT        NOT NULL,
  material     TEXT        NOT NULL,
  price_kes    INTEGER     NOT NULL CHECK (price_kes > 0),  -- whole shillings; no floats for money
  stock        INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image        TEXT        NOT NULL,                -- path under /public
  image_alt    TEXT        NOT NULL,
  featured     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()  -- feeds <lastmod> in the sitemap
);

CREATE INDEX products_category_idx ON products (category);
