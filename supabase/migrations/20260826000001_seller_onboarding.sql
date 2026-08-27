-- ==================================================
-- JEROSSA — PHASE 10 : Onboarding vendeur
-- 1. producers : lien auth ↔ vendeur, statut de validation, dossier de candidature
-- 2. Helper : my_producer_id() (producteur approuvé de l'utilisateur courant)
-- 3. RLS : candidature / propriété sur producers
-- 4. RLS : écriture produits par un vendeur approuvé
--
-- Statuts : pending → approved | rejected (→ resoumise possible) ; suspended.
-- Le défaut 'approved' préserve les vendeurs du catalogue seed (user_id NULL).
-- ==================================================

-- --------------------------------------------------
-- 1. COLONNES
-- --------------------------------------------------
alter table public.producers
  add column if not exists user_id uuid references auth.users (id) on delete set null,
  add column if not exists status text not null default 'approved'
    check (status in ('pending', 'approved', 'rejected', 'suspended')),
  add column if not exists contact_email text not null default '',
  add column if not exists phone text,
  add column if not exists payment_info jsonb not null default '{}'::jsonb,
  add column if not exists documents jsonb not null default '[]'::jsonb,
  add column if not exists review_note text not null default '',
  add column if not exists submitted_at timestamptz not null default now(),
  add column if not exists reviewed_at timestamptz;

-- Un compte = une seule demande de boutique (les NULL multiples sont autorisés)
create unique index if not exists producers_user_id_key
  on public.producers (user_id);

create index if not exists producers_status_idx
  on public.producers (status);

-- --------------------------------------------------
-- 2. HELPER : producteur approuvé de l'utilisateur courant
--    SECURITY DEFINER pour bypasser la RLS de producers.
--    Retourne NULL si l'utilisateur n'a pas de boutique validée.
-- --------------------------------------------------
create or replace function public.my_producer_id()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id
  from public.producers
  where user_id = auth.uid()
    and status = 'approved'
  limit 1;
  return v_id;
end;
$$;

-- --------------------------------------------------
-- 3. RLS : PRODUCERS
-- --------------------------------------------------

-- Lecture : catalogue seed + boutiques validées + sa propre fiche + admin
drop policy if exists "producers_select_public" on public.producers;
create policy "producers_select_public"
  on public.producers for select
  using (
    user_id is null            -- vendeurs du catalogue de démonstration
    or status = 'approved'     -- boutiques validées (visibles publiquement)
    or user_id = auth.uid()    -- sa propre candidature (pending/rejected/suspended)
    or public.is_admin()
  );

-- Candidature : un utilisateur authentifié crée SA fiche, toujours en 'pending'.
-- L'index unique sur user_id empêche les doublons (23505 côté client).
drop policy if exists "producers_insert_own" on public.producers;
create policy "producers_insert_own"
  on public.producers for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
  );

-- Mise à jour de sa candidature : uniquement tant que non validée.
-- WITH CHECK force status='pending' → un vendeur ne peut JAMAIS s'auto-valider
-- (approved/suspended restent réservés à l'admin via producers_update_admin).
-- 'rejected' → permet la resoumission après correction du dossier.
drop policy if exists "producers_update_own" on public.producers;
create policy "producers_update_own"
  on public.producers for update to authenticated
  using (
    user_id = auth.uid()
    and status in ('pending', 'rejected')
  )
  with check (
    user_id = auth.uid()
    and status = 'pending'
  );

-- --------------------------------------------------
-- 4. RLS : PRODUCTS — écriture par le vendeur propriétaire
--    seller_id doit pointer sur le producteur approuvé de l'utilisateur.
--    verified=false imposé en écriture : seule l'admin vérifie un produit
--    (via products_update_admin).
-- NB LIMITATION : un produit déjà verified=true ne peut plus être modifié
-- par son vendeur (with check échoue) — acceptable au MVP.
-- --------------------------------------------------
drop policy if exists "products_insert_seller" on public.products;
create policy "products_insert_seller"
  on public.products for insert to authenticated
  with check (
    seller_id = public.my_producer_id()
    and verified = false
  );

drop policy if exists "products_update_seller" on public.products;
create policy "products_update_seller"
  on public.products for update to authenticated
  using (seller_id = public.my_producer_id())
  with check (
    seller_id = public.my_producer_id()
    and verified = false
  );

drop policy if exists "products_delete_seller" on public.products;
create policy "products_delete_seller"
  on public.products for delete to authenticated
  using (seller_id = public.my_producer_id());
