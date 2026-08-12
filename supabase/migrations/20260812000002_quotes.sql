-- ==================================================
-- JEROSSA — PHASE 6 : Devis
-- Tables : quote_requests, quote_responses
-- Fonctions RPC : create_quote_request, respond_to_quote,
--                 accept_quote (crée la commande), decline_quote
-- ==================================================

-- --------------------------------------------------
-- 1. QUOTE_REQUESTS (demande de devis client)
-- --------------------------------------------------
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  product_code text not null,
  product_title text not null,
  seller_id uuid references public.producers (id) on delete set null,
  seller_name text not null default '',
  quantity numeric(12, 3) not null default 1 check (quantity > 0),
  unit text not null default 'kg',
  message text default '',
  delay_requested text default '',
  currency text not null default 'EUR',
  status text not null default 'pending'
    check (status in ('pending', 'responded', 'accepted', 'declined')),
  order_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quote_requests_number_idx on public.quote_requests (quote_number);
create index if not exists quote_requests_user_idx on public.quote_requests (user_id);
create index if not exists quote_requests_created_idx on public.quote_requests (created_at desc);

-- --------------------------------------------------
-- 2. QUOTE_RESPONSES (réponse vendeur, 1 pour 1 demande)
-- --------------------------------------------------
create table if not exists public.quote_responses (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null unique references public.quote_requests (id) on delete cascade,
  seller_id uuid references public.producers (id) on delete set null,
  price_eur numeric(12, 2) not null check (price_eur > 0),
  unit text not null default 'kg',
  delay text default '',
  message text default '',
  created_at timestamptz not null default now()
);

create index if not exists quote_responses_request_idx on public.quote_responses (quote_request_id);

-- --------------------------------------------------
-- 3. RPC : CREATE_QUOTE_REQUEST
-- security definer : seule entrée d'écriture côté client (Phase 6).
-- --------------------------------------------------
create or replace function public.create_quote_request(
  p_product_code text,
  p_product_title text,
  p_seller_id uuid,
  p_seller_name text,
  p_quantity numeric,
  p_unit text,
  p_message text,
  p_delay_requested text,
  p_currency text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quote_id uuid;
  v_quote_number text;
  v_user_id uuid := auth.uid();
begin
  if p_product_code is null or p_product_title is null or p_product_title = '' then
    raise exception 'Produit invalide';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantité invalide';
  end if;

  v_quote_number := 'DEV-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 100000)::text, 5, '0');

  insert into public.quote_requests (
    quote_number, user_id, product_code, product_title, seller_id, seller_name,
    quantity, unit, message, delay_requested, currency
  )
  values (
    v_quote_number, v_user_id, p_product_code, p_product_title, p_seller_id,
    coalesce(p_seller_name, ''), p_quantity, coalesce(p_unit, 'kg'),
    coalesce(p_message, ''), coalesce(p_delay_requested, ''), coalesce(p_currency, 'EUR')
  )
  returning id into v_quote_id;

  return jsonb_build_object('id', v_quote_id, 'quote_number', v_quote_number);
end;
$$;

-- --------------------------------------------------
-- 4. RPC : RESPOND_TO_QUOTE (côté vendeur)
-- NB : l'identité vendeur (auth ↔ producers) arrive en Phase 9 ; la
-- fonction est donc volontairement non gatée par auth.uid() ici, et sera
-- verrouillée lors de l'espace-vendeur (Phase 9).
-- --------------------------------------------------
create or replace function public.respond_to_quote(
  p_quote_request_id uuid,
  p_seller_id uuid,
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
  v_request public.quote_requests;
begin
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

  if v_request.status not in ('pending', 'responded') then
    raise exception 'Cette demande de devis n''attend plus de réponse';
  end if;

  insert into public.quote_responses (
    quote_request_id, seller_id, price_eur, unit, delay, message
  )
  values (
    p_quote_request_id, p_seller_id, p_price_eur,
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
-- 5. RPC : ACCEPT_QUOTE (client → devient commande)
-- Réutilise les tables de la Phase 5 (orders, order_items, payments).
-- --------------------------------------------------
create or replace function public.accept_quote(
  p_quote_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.quote_requests;
  v_response public.quote_responses;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12, 2);
  v_shipping_fee numeric(12, 2) := 0;
  v_total numeric(12, 2);
  v_user_id uuid := auth.uid();
begin
  if p_quote_request_id is null then
    raise exception 'Demande de devis invalide';
  end if;

  select * into v_request
  from public.quote_requests
  where id = p_quote_request_id
  for update;

  if v_request.id is null then
    raise exception 'Demande de devis introuvable';
  end if;

  if v_request.user_id is not null and v_user_id is distinct from v_request.user_id then
    raise exception 'Accès refusé';
  end if;

  if v_request.status not in ('responded') then
    raise exception 'Cette demande de devis ne peut pas être acceptée';
  end if;

  select * into v_response
  from public.quote_responses
  where quote_request_id = p_quote_request_id;

  if v_response.id is null then
    raise exception 'Aucune réponse vendeur';
  end if;

  v_subtotal := round(v_response.price_eur * v_request.quantity, 2);
  if v_subtotal < 200 then
    v_shipping_fee := 15;
  end if;
  v_total := v_subtotal + v_shipping_fee;

  v_order_number := 'JRS-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 100000)::text, 5, '0');

  insert into public.orders (
    order_number, user_id, status, currency, subtotal, shipping_fee, total,
    payment_method, payment_status, shipping_address
  )
  values (
    v_order_number, v_request.user_id, 'confirmed', v_request.currency,
    v_subtotal, v_shipping_fee, v_total, 'quote', 'paid', '{}'::jsonb
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id, product_code, title, seller, unit, price_eur, currency, quantity
  )
  values (
    v_order_id, v_request.product_code, v_request.product_title,
    v_request.seller_name, v_response.unit, v_response.price_eur,
    v_request.currency, v_request.quantity::int
  );

  insert into public.payments (order_id, amount, currency, status, provider, provider_ref)
  values (
    v_order_id, v_total, v_request.currency, 'succeeded', 'simulate',
    'SIM-' || upper(substr(md5(random()::text), 1, 12))
  );

  update public.quote_requests
  set status = 'accepted', order_number = v_order_number, updated_at = now()
  where id = p_quote_request_id;

  return jsonb_build_object('id', v_order_id, 'order_number', v_order_number, 'quote_number', v_request.quote_number);
end;
$$;

-- --------------------------------------------------
-- 6. RPC : DECLINE_QUOTE (client refuse)
-- --------------------------------------------------
create or replace function public.decline_quote(
  p_quote_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.quote_requests;
  v_user_id uuid := auth.uid();
begin
  if p_quote_request_id is null then
    raise exception 'Demande de devis invalide';
  end if;

  select * into v_request
  from public.quote_requests
  where id = p_quote_request_id
  for update;

  if v_request.id is null then
    raise exception 'Demande de devis introuvable';
  end if;

  if v_request.user_id is not null and v_user_id is distinct from v_request.user_id then
    raise exception 'Accès refusé';
  end if;

  if v_request.status not in ('responded') then
    raise exception 'Cette demande de devis ne peut pas être refusée';
  end if;

  update public.quote_requests
  set status = 'declined', updated_at = now()
  where id = p_quote_request_id;

  return jsonb_build_object('id', p_quote_request_id, 'quote_number', v_request.quote_number);
end;
$$;

-- --------------------------------------------------
-- 7. RLS
-- --------------------------------------------------
-- QUOTE_REQUESTS : le client lit ses propres demandes (ou invité par numéro).
alter table public.quote_requests enable row level security;

drop policy if exists "quote_requests_select_own_or_guest" on public.quote_requests;
create policy "quote_requests_select_own_or_guest"
  on public.quote_requests for select
  using (auth.uid() = user_id or user_id is null);

-- QUOTE_RESPONSES : lisibles si la demande parente est accessible.
alter table public.quote_responses enable row level security;

drop policy if exists "quote_responses_select_via_request" on public.quote_responses;
create policy "quote_responses_select_via_request"
  on public.quote_responses for select
  using (
    exists (
      select 1 from public.quote_requests qr
      where qr.id = quote_request_id and (qr.user_id = auth.uid() or qr.user_id is null)
    )
  );
