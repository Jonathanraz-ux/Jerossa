-- ==================================================
-- JEROSSA — PHASE 11 : Espace vendeur
-- 1. respond_to_quote : verrouillée sur l'identité vendeur (my_producer_id)
-- 2. update_my_shop : édition du profil boutique par un vendeur approuvé
-- 3. RLS lecture vendeur : quote_requests, quote_responses, orders, order_items
--
-- NB : order_items.seller est un NOM (pas une FK) — le rattachement des
-- commandes se fait donc par correspondance producers.name = order_items.seller.
-- Limitation assumée au MVP ; une colonne order_items.seller_id remplacera
-- ce matching lors du passage aux paiements réels.
-- ==================================================

-- --------------------------------------------------
-- 1. RESPOND_TO_QUOTE — nouvelle signature gatée par auth.uid()
--    L'ancienne signature (6 args) est supprimée : aucun appelant en prod.
-- --------------------------------------------------
drop function if exists public.respond_to_quote(
  p_quote_request_id uuid,
  p_seller_id uuid,
  p_price_eur numeric,
  p_unit text,
  p_delay text,
  p_message text
);

create or replace function public.respond_to_quote(
  p_quote_request_id uuid,
  p_price_eur numeric,
  p_unit text,
  p_delay text,
  p_message text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_producer_id uuid := public.my_producer_id();
  v_request public.quote_requests;
begin
  if v_producer_id is null then
    raise exception 'Seul un vendeur approuvé peut répondre à un devis';
  end if;

  if p_quote_request_id is null then
    raise exception 'Demande de devis invalide';
  end if;

  if p_price_eur is null or p_price_eur <= 0 then
    raise exception 'Prix invalide';
  end if;

  select * into v_request
  from public.quote_requests
  where id = p_quote_request_id
  for update;

  if v_request.id is null then
    raise exception 'Demande de devis introuvable';
  end if;

  if v_request.seller_id is distinct from v_producer_id then
    raise exception 'Cette demande ne s''adresse pas à votre boutique';
  end if;

  if v_request.status not in ('pending', 'responded') then
    raise exception 'Cette demande de devis n''attend plus de réponse';
  end if;

  insert into public.quote_responses (
    quote_request_id, seller_id, price_eur, unit, delay, message
  )
  values (
    p_quote_request_id, v_producer_id, p_price_eur,
    coalesce(p_unit, 'kg'), coalesce(p_delay, ''), coalesce(p_message, '')
  )
  on conflict (quote_request_id) do update set
    seller_id = excluded.seller_id,
    price_eur = excluded.price_eur,
    unit = excluded.unit,
    delay = excluded.delay,
    message = excluded.message;

  update public.quote_requests
  set status = 'responded', updated_at = now()
  where id = p_quote_request_id;

  return jsonb_build_object('id', p_quote_request_id, 'quote_number', v_request.quote_number);
end;
$$;

-- --------------------------------------------------
-- 2. UPDATE_MY_SHOP — champs sûrs uniquement ; statut et notes d'examen
--    restent réservés à l'admin.
-- --------------------------------------------------
create or replace function public.update_my_shop(
  p_name text,
  p_location text,
  p_description text,
  p_established integer,
  p_contact_email text,
  p_phone text,
  p_payment_info jsonb,
  p_image_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Le nom de la boutique est obligatoire';
  end if;

  update public.producers set
    name          = trim(p_name),
    location      = nullif(trim(coalesce(p_location, '')), ''),
    description   = nullif(trim(coalesce(p_description, '')), ''),
    established   = p_established,
    contact_email = coalesce(trim(p_contact_email), ''),
    phone         = nullif(trim(coalesce(p_phone, '')), ''),
    payment_info  = coalesce(p_payment_info, '{}'::jsonb),
    image_url     = nullif(trim(coalesce(p_image_url, '')), '')
  where user_id = auth.uid()
    and status = 'approved';

  if not found then
    raise exception 'Aucune boutique approuvée associée à votre compte';
  end if;
end;
$$;

-- --------------------------------------------------
-- 3. RLS LECTURE VENDEUR
-- --------------------------------------------------

-- Demandes de devis adressées à ma boutique
drop policy if exists "quote_requests_select_seller" on public.quote_requests;
create policy "quote_requests_select_seller"
  on public.quote_requests for select
  using (seller_id = public.my_producer_id());

-- Réponses de devis de ma boutique
drop policy if exists "quote_responses_select_seller" on public.quote_responses;
create policy "quote_responses_select_seller"
  on public.quote_responses for select
  using (seller_id = public.my_producer_id());

-- Commandes du vendeur : passent par le RPC fetch_my_orders()
-- NB : PAS de policy SELECT vendeur sur orders/order_items — la policy
-- préexistante "order_items_select_via_order" lit déjà orders ; toute policy
-- orders lisant order_items créerait une récursion infinie de policies
-- (42P17). Le RPC security definer contourne la RLS proprement.

-- --------------------------------------------------
-- 4. FETCH_MY_ORDERS — commandes contenant les articles de MA boutique
-- --------------------------------------------------
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
