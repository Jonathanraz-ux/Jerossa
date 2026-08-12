-- ==================================================
-- JEROSSA — PHASE 2 : Base de données MVP (noyau)
-- Tables : profiles, producers, categories, products
-- ==================================================

-- --------------------------------------------------
-- 1. PROFILES (étend auth.users — lié en Phase 3 Auth)
-- --------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'customer'
    check (role in ('customer', 'seller', 'admin')),
  phone text,
  country text not null default 'MU',
  created_at timestamptz not null default now()
);

-- --------------------------------------------------
-- 2. PRODUCERS (vendeurs)
-- --------------------------------------------------
create table if not exists public.producers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  description text,
  image_url text,
  rating numeric(3, 2) not null default 4.5,
  reviews_count integer not null default 0,
  established integer,
  certifications text[] not null default '{}',
  response_rate text,
  response_time text,
  created_at timestamptz not null default now()
);

create index if not exists producers_name_idx on public.producers (name);

-- --------------------------------------------------
-- 3. CATEGORIES
-- --------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short text,
  description text,
  image_url text,
  product_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists categories_slug_idx on public.categories (slug);

-- --------------------------------------------------
-- 4. PRODUCTS
-- --------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  seller_id uuid references public.producers (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  price_eur numeric(12, 2) not null,
  unit text not null default 'kg',
  origin text,
  market text not null default 'MG',
  availability text,
  verified boolean not null default false,
  reviews integer not null default 0,
  type text,
  tag text,
  description text,
  stock text,
  delivery text,
  variants text[] not null default '{}',
  images text[] not null default '{}',
  rating numeric(3, 2) not null default 4.5,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_seller_idx on public.products (seller_id);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (active);
