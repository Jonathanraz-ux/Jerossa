-- ==================================================
-- JEROSSA — Migration 2026-09-28 (complément du correctif 42P17)
-- Restaure public.fetch_my_orders(), absent de la base liée.
-- ==================================================
--
-- POURQUOI
--   La base liée a dérivé : la migration 20260826000002_seller_space.sql est
--   enregistrée dans supabase_migrations.schema_migrations, mais la fonction
--   public.fetch_my_orders() n'existait plus en base. L'espace vendeur
--   appelait pourtant ce RPC (src/services/seller.js), et la space a été
--   rebranchée « à la main » via deux policies de lecture sur orders /
--   order_items — ce qui a provoqué le 42P17 du correctif précédent.
--
--   On rétablit donc l'architecture documentée : le vendeur lit ses commandes
--   via ce RPC SECURITY DEFINER, qui filtre côté serveur sur
--   public.my_producer_id() et n'expose QUE ses propres lignes de commande
--   (les lignes des autres vendeurs de la même commande ne sont pas
--   agrégées). Aucune policy SELECT vendeur n'est nécessaire.
--
--   Définition reprise à l'identique de 20260826000002_seller_space.sql
--   (section 4) : même contrat de sortie que ce qu'attend seller.js
--   (id, order_number, status, payment_status, currency, shipping_address,
--   created_at, items, items_total).
--
--   Durcissement appliqué (même pattern que list_my_conversations en
--   20260928000001) : EXECUTE réservé à authenticated, pas à anon.
-- ==================================================

create or replace function public.fetch_my_orders()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_producer public.producers;
begin
  select * into v_producer from public.producers where id = public.my_producer_id();
  if v_producer.id is null then
    return '[]'::jsonb;
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'status', o.status,
      'payment_status', o.payment_status,
      'currency', o.currency,
      'shipping_address', o.shipping_address,
      'created_at', o.created_at,
      'items', (
        select jsonb_agg(jsonb_build_object(
          'title', oi.title,
          'unit', oi.unit,
          'price_eur', oi.price_eur,
          'currency', oi.currency,
          'quantity', oi.quantity
        ))
        from public.order_items oi
        where oi.order_id = o.id and oi.seller = v_producer.name
      ),
      'items_total', (
        select coalesce(sum(oi.price_eur * oi.quantity), 0)
        from public.order_items oi
        where oi.order_id = o.id and oi.seller = v_producer.name
      )
    ) order by o.created_at desc)
    from public.orders o
    where exists (
      select 1 from public.order_items oi
      where oi.order_id = o.id and oi.seller = v_producer.name
    )
  ), '[]'::jsonb);
end;
$$;

-- L'RPC expose des données de commande (dont l'adresse de livraison) :
-- jamais appelé par un visitor non connecté.
revoke all on function public.fetch_my_orders() from anon;
revoke all on function public.fetch_my_orders() from public;
grant execute on function public.fetch_my_orders() to authenticated;
