-- ==================================================
-- JEROSSA — PHASE 3 : Auth + rôles + RLS
-- 1. Trigger auto-création du profil à l'inscription
-- 2. RLS sur les tables du noyau
-- ==================================================

-- --------------------------------------------------
-- 1. TRIGGER : création automatique du profil
-- Rôle extrait des metadata : 'seller' ou 'customer' (défaut).
-- 'admin' est INTERDIT ici (jamais auto-assignable).
-- --------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'role' = 'seller' then 'seller'
      else 'customer'
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------------
-- 2. RLS : PROFILES (propriétaire uniquement)
-- --------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

-- --------------------------------------------------
-- 3. RLS : PRODUCERS (lecture publique, écriture service_role)
-- --------------------------------------------------
alter table public.producers enable row level security;

drop policy if exists "producers_select_public" on public.producers;
create policy "producers_select_public"
  on public.producers for select
  using (true);

-- --------------------------------------------------
-- 4. RLS : CATEGORIES (lecture publique, écriture service_role)
-- --------------------------------------------------
alter table public.categories enable row level security;

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
  on public.categories for select
  using (true);

-- --------------------------------------------------
-- 5. RLS : PRODUCTS (lecture publique, écriture service_role)
-- --------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
  on public.products for select
  using (true);
