-- ==================================================
-- JEROSSA — Addresses CRUD + Product status workflow
-- 1. addresses : CRUD vendeur/client avec RLS
-- 2. products : colonne status (draft/pending/verified/rejected)
-- 3. RPC update_product_status (admin)
-- ==================================================

-- --------------------------------------------------
-- 1. ADDRESSES TABLE
-- --------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  label text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null,
  city text not null default '',
  postal_code text not null default '',
  country text not null default 'MG',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses (user_id);

-- RLS
alter table public.addresses enable row level security;

-- Select : user lit ses propres adresses
drop policy if exists "addresses_select_own" on public.addresses;
create policy "addresses_select_own"
  on public.addresses for select to authenticated
  using (user_id = auth.uid());

-- Insert : user crée sa propre adresse
drop policy if exists "addresses_insert_own" on public.addresses;
create policy "addresses_insert_own"
  on public.addresses for insert to authenticated
  with check (user_id = auth.uid());

-- Update : user modifie sa propre adresse
drop policy if exists "addresses_update_own" on public.addresses;
create policy "addresses_update_own"
  on public.addresses for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Delete : user supprime sa propre adresse
drop policy if exists "addresses_delete_own" on public.addresses;
create policy "addresses_delete_own"
  on public.addresses for delete to authenticated
  using (user_id = auth.uid());

-- --------------------------------------------------
-- 2. PRODUCTS : colonne status
--    'draft' = brouillon (défaut)
--    'pending' = soumis pour vérification
--    'verified' = approuvé par admin
--    'rejected' = refusé par admin
-- --------------------------------------------------
alter table public.products
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'pending', 'verified', 'rejected'));

create index if not exists products_status_idx on public.products (status);

-- Permettre au vendeur d'insérer des produits en draft ou pending
-- (RLS dans seller_onboarding force verified=false, on élargit ici)
drop policy if exists "products_insert_seller" on public.products;
create policy "products_insert_seller"
  on public.products for insert to authenticated
  with check (
    seller_id = public.my_producer_id()
    and status in ('draft', 'pending')
  );

-- Le vendeur peut modifier ses produits non vérifiés
drop policy if exists "products_update_seller" on public.products;
create policy "products_update_seller"
  on public.products for update to authenticated
  using (seller_id = public.my_producer_id() and status in ('draft', 'pending', 'rejected'))
  with check (
    seller_id = public.my_producer_id()
    and status in ('draft', 'pending')
  );

-- RPC admin : update product status (approve/reject)
create or replace function public.update_product_status(
  p_product_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs';
  end if;

  if p_status not in ('verified', 'rejected', 'pending', 'draft') then
    raise exception 'Statut invalide';
  end if;

  update public.products
  set status = p_status,
      verified = (p_status = 'verified')
  where id = p_product_id;

  return jsonb_build_object('ok', true, 'status', p_status);
end;
$$;
