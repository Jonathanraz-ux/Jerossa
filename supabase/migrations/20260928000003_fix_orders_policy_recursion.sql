-- ==================================================
-- JEROSSA — Migration 2026-09-28 (correctif d'urgence)
-- 42P17 : "infinite recursion detected in policy for relation order_items"
--         => HTTP 500 sur GET /rest/v1/orders?select=*,order_items(*)
--         => « Mon compte » ne charge plus aucune commande.
-- ==================================================
--
-- DIAGNOSTIC
--   Deux policies de lecture vendeur avaient été appliquées À LA MAIN (SQL
--   Editor) sur la base liée, sans contrepartie dans l'historique des
--   migrations :
--
--     orders_select_seller       ON orders      USING (EXISTS (SELECT 1
--                                       FROM order_items oi
--                                       WHERE oi.order_id = oi.id  <- BUG
--                                         AND oi.seller = my_producer_id()))
--
--     order_items_select_seller  ON order_items USING (seller = nom de ma boutique)
--
--   Deux défauts distincts :
--
--   1. Corrélation cassée : « oi.order_id = oi.id » compare la ligne à
--      elle-même au lieu de « oi.order_id = orders.id ». La condition ne peut
--      donc pas désigner la commande courante : même recadrée, la policy
--      resterait inerte.
--
--   2. Récursion de policies (42P17) : « orders_select_seller » lit
--      « order_items », alors que « order_items_select_owner » lit « orders ».
--      Les deux expressions se référencent mutuellement, donc Postgres refuse
--      d'exécuter la requête. Le symptôme est un 500 sur TOUTE lecture de
--      « orders » par un utilisateur authentifié, et pas seulement sur
--      l'embed « order_items(*) ».
--
--   Le risque était déjà documenté dans 20260826000002_seller_space.sql :
--   « PAS de policy SELECT vendeur sur orders/order_items — la policy
--   préexistante lit déjà orders ; toute policy orders lisant order_items
--   créerait une récursion infinie de policies (42P17). Le RPC security
--   definer contourne la RLS proprement. »
--
-- CORRECTIF
--   On applique l'architecture documentée : le vendeur lit ses commandes via
--   le RPC SECURITY DEFINER « fetch_my_orders() » (src/services/seller.js),
--   qui agrège ses lignes côté serveur. Aucune policy vendeur n'est
--   nécessaire sur « orders » / « order_items », et il n'y a plus de lecture
--   croisée.
--
--   Chemins de lecture conservés après ce correctif :
--     - acheteur : orders_select_owner + order_items_select_owner
--                  (MyAccount, OrderDetails, fetchMyOrders, avis)
--     - admin    : orders_select_admin + order_items_select_admin
--     - vendeur  : fetch_my_orders() uniquement (espace vendeur)
--
--   Garde-fou structurel ajouté en T12 de
--   supabase/tests/non_regression_security.sql : aucune policy de
--   « orders » / « order_items » ne doit plus référencer l'autre table.
-- ==================================================

-- --------------------------------------------------
-- 1. Supprimer les policies vendeur (source de la récursion)
-- --------------------------------------------------
drop policy if exists "orders_select_seller" on public.orders;
drop policy if exists "order_items_select_seller" on public.order_items;

-- --------------------------------------------------
-- 2. Réaffirmer les policies légitimes (idempotent)
--    Garantit qu'un environnement partiel ne reste pas sans lecture acheteur.
-- --------------------------------------------------
drop policy if exists "orders_select_owner" on public.orders;
create policy "orders_select_owner"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "order_items_select_owner" on public.order_items;
create policy "order_items_select_owner"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

-- L'admin passe par orders_select_admin / order_items_select_admin
-- (20260820000001_admin_rls.sql) : ces policies ne sont pas touchées.
