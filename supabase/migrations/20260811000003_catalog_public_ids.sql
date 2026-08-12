-- ==================================================
-- JEROSSA — PHASE 4 : Identifiants publics (codes + slugs)
-- Produits / Catégories / Vendeurs
-- UUID restent les PK internes ; codes/slugs pour URLs et compatibilité.
-- ==================================================

-- PRODUCTS : code public (la colonne slug existe déjà)
alter table public.products
  add column if not exists product_code text;

create unique index if not exists products_product_code_key
  on public.products (product_code);

-- CATEGORIES : code public (slug existe déjà)
alter table public.categories
  add column if not exists category_code text;

create unique index if not exists categories_category_code_key
  on public.categories (category_code);

-- PRODUCERS : code + slug publics
alter table public.producers
  add column if not exists seller_code text,
  add column if not exists slug text;

create unique index if not exists producers_seller_code_key
  on public.producers (seller_code);

create unique index if not exists producers_slug_key
  on public.producers (slug);
