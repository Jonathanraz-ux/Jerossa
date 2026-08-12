-- ==================================================
-- JEROSSA — PHASE 7 : Paiement
-- platform_settings (commission, livraison, provider)
-- create_order : commande créée en PENDING (paiement à venir)
-- RPC : confirm_payment (succès → paid + commission ; échec → cancelled/failed)
-- ==================================================

-- --------------------------------------------------
-- 1. PLATFORM_SETTINGS (clé/valeur, lues par l'admin en Phase 9)
-- --------------------------------------------------
create table if not exists public.platform_settings (
  key text primary key,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.platform_settings (key, value) values
  ('commission_rate', '10'),
  ('shipping_fee', '15'),
  ('free_shipping_threshold', '200'),
  ('default_currency', 'EUR'),
  ('payment_provider', 'simulate')
on conflict (key) do nothing;

alter table public.platform_settings enable row level security;

drop policy if exists "platform_settings_select_public" on public.platform_settings;
create policy "platform_settings_select_public"
  on public.platform_settings for select
  using (true);

-- --------------------------------------------------
-- 2. CREATE_ORDER v2 : commande créée en PENDING,
--    paiement attendu (confirm_payment validera).
--    Le panier client n'est vidé qu'après succès.
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
    v_order_number, v_user_id, 'pending', p_currency, p_subtotal, p_shipping_fee, p_total,
    p_payment_method, 'pending', coalesce(p_address, '{}'::jsonb)
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

  insert into public.payments (order_id, amount, currency, status, provider)
  values (v_order_id, p_total, p_currency, 'pending', 'simulate');

  return jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
end;
$$;

-- --------------------------------------------------
-- 3. RPC : CONFIRM_PAYMENT (simulation du retour provider)
--    succès → order paid + payment succeeded + commission calculée
--    échec  → order cancelled + payment failed (panier client conservé)
-- --------------------------------------------------
create or replace function public.confirm_payment(
  p_order_number text,
  p_success boolean,
  p_provider text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_commission_rate numeric(5, 2) := 10;
  v_commission_amount numeric(12, 2) := 0;
  v_seller_amount numeric(12, 2) := 0;
  v_platform_amount numeric(12, 2) := 0;
  v_user_id uuid := auth.uid();
begin
  if p_order_number is null or p_order_number = '' then
    raise exception 'Commande invalide';
  end if;

  select * into v_order
  from public.orders
  where order_number = p_order_number
  for update;

  if v_order.id is null then
    raise exception 'Commande introuvable';
  end if;

  if v_order.user_id is not null and v_user_id is distinct from v_order.user_id then
    raise exception 'Accès refusé';
  end if;

  -- Idempotence : déjà payée ou déjà clôturée.
  if v_order.payment_status = 'paid' then
    return jsonb_build_object(
      'id', v_order.id, 'order_number', v_order.order_number,
      'status', v_order.status, 'payment_status', v_order.payment_status
    );
  end if;
  if v_order.payment_status in ('failed', 'refunded') then
    raise exception 'Paiement déjà clôturé';
  end if;

  if coalesce(p_success, false) then
    select coalesce(value::numeric, 10) into v_commission_rate
    from public.platform_settings
    where key = 'commission_rate';

    v_commission_amount := round(v_order.subtotal * v_commission_rate / 100, 2);
    v_seller_amount := round(v_order.subtotal - v_commission_amount, 2);
    v_platform_amount := v_commission_amount;

    update public.orders
    set status = 'paid',
        payment_status = 'paid',
        commission_rate = v_commission_rate,
        commission_amount = v_commission_amount,
        seller_amount = v_seller_amount,
        platform_amount = v_platform_amount
    where id = v_order.id;

    update public.payments
    set status = 'succeeded',
        provider = coalesce(p_provider, 'simulate'),
        provider_ref = 'SIM-' || upper(substr(md5(random()::text), 1, 12))
    where order_id = v_order.id;

    return jsonb_build_object(
      'id', v_order.id, 'order_number', v_order.order_number,
      'status', 'paid', 'payment_status', 'paid'
    );
  else
    update public.orders
    set status = 'cancelled',
        payment_status = 'failed'
    where id = v_order.id;

    update public.payments
    set status = 'failed'
    where order_id = v_order.id;

    return jsonb_build_object(
      'id', v_order.id, 'order_number', v_order.order_number,
      'status', 'cancelled', 'payment_status', 'failed'
    );
  end if;
end;
$$;
