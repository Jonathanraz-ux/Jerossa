-- ==================================================
-- JEROSSA — PHASE 9 : Admin RLS + admin helper
-- 1. Fonction is_admin() pour vérifier le rôle admin
-- 2. Policies SELECT admin sur toutes les tables
-- 3. Policies WRITE admin (products, categories, producers, platform_settings)
-- ==================================================

-- --------------------------------------------------
-- 1. HELPER : is_admin()
--    Vérifie si l'utilisateur courant a le rôle 'admin' dans profiles.
--    SECURITY DEFINER pour pouvoir lire profiles même si RLS le bloque.
-- --------------------------------------------------
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  select role into v_role
  from public.profiles
  where id = auth.uid();
  return v_role = 'admin';
end;
$$;

-- --------------------------------------------------
-- 2. PROFILES — admin lit tous les profils
-- --------------------------------------------------
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

-- Admin peut modifier le rôle d'un utilisateur
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------
-- 3. ORDERS — admin lit toutes les commandes
-- --------------------------------------------------
drop policy if exists "orders_select_admin" on public.orders;
create policy "orders_select_admin"
  on public.orders for select
  using (public.is_admin());

-- Admin peut modifier le statut d'une commande
drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------
-- 4. ORDER_ITEMS — admin lit tous les items
-- --------------------------------------------------
drop policy if exists "order_items_select_admin" on public.order_items;
create policy "order_items_select_admin"
  on public.order_items for select
  using (public.is_admin());

-- --------------------------------------------------
-- 5. PAYMENTS — admin lit tous les paiements
-- --------------------------------------------------
drop policy if exists "payments_select_admin" on public.payments;
create policy "payments_select_admin"
  on public.payments for select
  using (public.is_admin());

-- --------------------------------------------------
-- 6. REFUNDS — admin lit + traite tous les remboursements
-- --------------------------------------------------
drop policy if exists "refunds_select_admin" on public.refunds;
create policy "refunds_select_admin"
  on public.refunds for select
  using (public.is_admin());

drop policy if exists "refunds_update_admin" on public.refunds;
create policy "refunds_update_admin"
  on public.refunds for update
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------
-- 7. NOTIFICATIONS — admin lit toutes les notifications
-- --------------------------------------------------
drop policy if exists "notifications_select_admin" on public.notifications;
create policy "notifications_select_admin"
  on public.notifications for select
  using (public.is_admin());

drop policy if exists "notifications_update_admin" on public.notifications;
create policy "notifications_update_admin"
  on public.notifications for update
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------
-- 8. EMAIL_LOGS — admin lit tous les logs email
-- --------------------------------------------------
drop policy if exists "email_logs_select_admin" on public.email_logs;
create policy "email_logs_select_admin"
  on public.email_logs for select
  using (public.is_admin());

-- --------------------------------------------------
-- 9. QUOTE_REQUESTS — admin lit toutes les demandes de devis
-- --------------------------------------------------
drop policy if exists "quote_requests_select_admin" on public.quote_requests;
create policy "quote_requests_select_admin"
  on public.quote_requests for select
  using (public.is_admin());

-- --------------------------------------------------
-- 10. QUOTE_RESPONSES — admin lit toutes les réponses
-- --------------------------------------------------
drop policy if exists "quote_responses_select_admin" on public.quote_responses;
create policy "quote_responses_select_admin"
  on public.quote_responses for select
  using (public.is_admin());

-- --------------------------------------------------
-- 11. PRODUCTS — admin peut modifier/supprimer des produits
--     (lecture déjà publique via products_select_public)
-- --------------------------------------------------
drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin"
  on public.products for delete
  using (public.is_admin());

-- --------------------------------------------------
-- 12. CATEGORIES — admin CRUD complet
--     (lecture déjà publique)
-- --------------------------------------------------
drop policy if exists "categories_insert_admin" on public.categories;
create policy "categories_insert_admin"
  on public.categories for insert
  with check (public.is_admin());

drop policy if exists "categories_update_admin" on public.categories;
create policy "categories_update_admin"
  on public.categories for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "categories_delete_admin" on public.categories;
create policy "categories_delete_admin"
  on public.categories for delete
  using (public.is_admin());

-- --------------------------------------------------
-- 13. PRODUCERS — admin peut modifier des vendeurs
--     (lecture déjà publique)
-- --------------------------------------------------
drop policy if exists "producers_update_admin" on public.producers;
create policy "producers_update_admin"
  on public.producers for update
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------
-- 14. PLATFORM_SETTINGS — admin peut modifier les réglages
--     (lecture déjà publique)
-- --------------------------------------------------
drop policy if exists "platform_settings_update_admin" on public.platform_settings;
create policy "platform_settings_update_admin"
  on public.platform_settings for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "platform_settings_insert_admin" on public.platform_settings;
create policy "platform_settings_insert_admin"
  on public.platform_settings for insert
  with check (public.is_admin());
