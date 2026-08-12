-- ==================================================
-- JEROSSA — PHASE 5 : Panier + Commandes
-- Tables : orders, order_items, payments
-- Fonction atomique : create_order (RPC)
-- ==================================================

-- --------------------------------------------------
-- 1. ORDERS
-- --------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'confirmed'
    check (status in ('pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  currency text not null default 'EUR',
  subtotal numeric(12, 2) not null default 0,
  shipping_fee numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  commission_rate numeric(5, 2) not null default 0,
  commission_amount numeric(12, 2) not null default 0,
  seller_amount numeric(12, 2) not null default 0,
  platform_amount numeric(12, 2) not null default 0,
  payment_method text not null default 'card',
  payment_status text not null default 'paid'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  shipping_address jsonb not null default '{}'::jsonb,
  tracking text,
  created_at timestamptz not null default now()
);

create index if not exists orders_order_number_idx on public.orders (order_number);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- --------------------------------------------------
-- 2. ORDER_ITEMS (snapshot produit au moment de l'achat)
-- --------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_code text not null,
  title text not null,
  seller text not null default '',
  unit text not null default 'kg',
  price_eur numeric(12, 2) not null,
  currency text not null default 'EUR',
  quantity integer not null default 1 check (quantity > 0),
  image_url text,
  unique (order_id, product_code)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- --------------------------------------------------
-- 3. PAYMENTS (simulation MVP)
-- --------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  amount numeric(12, 2) not null,
  currency text not null default 'EUR',
  status text not null default 'succeeded'
    check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  provider text not null default 'simulate',
  provider_ref text,
  created_at timestamptz not null default now()
);

create index if not exists payments_order_idx on public.payments (order_id);

-- --------------------------------------------------
-- 4. RPC : CREATE_ORDER (insert atomique, logique métier centralisée)
-- security definer : seule entrée d'écriture côté client.
-- --------------------------------------------------
create or replace function public.create_order(
  p_items jsonb,
  p_subtotal numeric,
  p_shipping_fee numeric,
  p_total numeric,
  p_currency text,
  p_payment_method text,
  p_address jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_user_id uuid := auth.uid();
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Panier vide';
  end if;

  if p_total < 0 then
    raise exception 'Total invalide';
  end if;

  v_order_number := 'JRS-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 100000)::text, 5, '0');

  insert into public.orders (
    order_number, user_id, status, currency, subtotal, shipping_fee, total,
    payment_method, payment_status, shipping_address
  )
  values (
    v_order_number, v_user_id, 'confirmed', p_currency, p_subtotal, p_shipping_fee, p_total,
    p_payment_method, 'paid', coalesce(p_address, '{}'::jsonb)
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.order_items (
      order_id, product_code, title, seller, unit, price_eur, currency, quantity, image_url
    )
    values (
      v_order_id,
      v_item ->> 'product_code',
      v_item ->> 'title',
      coalesce(v_item ->> 'seller', ''),
      coalesce(v_item ->> 'unit', 'kg'),
      coalesce((v_item ->> 'price_eur')::numeric, 0),
      coalesce(v_item ->> 'currency', 'EUR'),
      coalesce((v_item ->> 'quantity')::int, 1),
      v_item ->> 'image_url'
    );
  end loop;

  insert into public.payments (order_id, amount, currency, status, provider, provider_ref)
  values (
    v_order_id, p_total, p_currency, 'succeeded', 'simulate',
    'SIM-' || upper(substr(md5(random()::text), 1, 12))
  );

  return jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
end;
$$;

-- --------------------------------------------------
-- 5. RLS
-- --------------------------------------------------
-- ORDERS : le client lit/écrit ses propres lignes.
-- Les commandes "invité" (user_id null) restent lisibles pour le suivi par
-- numéro (aucune donnée sensible / pas de vraie carte stockée — simulation).
-- L'admin sera ajouté en Phase 9 (read all / update statuts).
alter table public.orders enable row level security;

drop policy if exists "orders_select_own_or_guest" on public.orders;
create policy "orders_select_own_or_guest"
  on public.orders for select
  using (auth.uid() = user_id or user_id is null);

-- ORDER_ITEMS : lisibles si la commande parente est accessible.
alter table public.order_items enable row level security;

drop policy if exists "order_items_select_via_order" on public.order_items;
create policy "order_items_select_via_order"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

-- PAYMENTS : idem.
alter table public.payments enable row level security;

drop policy if exists "payments_select_via_order" on public.payments;
create policy "payments_select_via_order"
  on public.payments for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or o.user_id is null)
    )
  );
