-- ==================================================
-- JEROSSA — PHASE 12 : Seller Public Page Features
-- 1. producers : logo_url, is_verified
-- 2. conversations + messages (MVP messaging)
-- 3. seller_reviews (verified purchase reviews)
-- 4. RPC functions + RLS policies
-- ==================================================

-- --------------------------------------------------
-- 1. PRODUCERS : new columns
-- --------------------------------------------------
alter table public.producers add column if not exists logo_url text;
alter table public.producers add column if not exists is_verified boolean not null default false;

-- --------------------------------------------------
-- 2. CONVERSATIONS
-- --------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users (id) on delete cascade,
  seller_id uuid not null references public.producers (id) on delete cascade,
  product_code text,
  product_title text,
  subject text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_buyer_idx on public.conversations (buyer_id);
create index if not exists conversations_seller_idx on public.conversations (seller_id);
create index if not exists conversations_updated_idx on public.conversations (updated_at desc);

-- Unique constraint: one conversation per buyer+seller+product combo
create unique index if not exists conversations_unique_per_product
  on public.conversations (buyer_id, seller_id, coalesce(product_code, ''));
create unique index if not exists conversations_unique_no_product
  on public.conversations (buyer_id, seller_id)
  where product_code is null;

-- --------------------------------------------------
-- 3. MESSAGES
-- --------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id);
create index if not exists messages_created_idx on public.messages (created_at desc);

-- --------------------------------------------------
-- 4. SELLER REVIEWS
-- --------------------------------------------------
create table if not exists public.seller_reviews (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.producers (id) on delete cascade,
  buyer_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists seller_reviews_order_unique
  on public.seller_reviews (order_id) where order_id is not null;

create index if not exists seller_reviews_seller_idx on public.seller_reviews (seller_id);
create index if not exists seller_reviews_buyer_idx on public.seller_reviews (buyer_id);

-- --------------------------------------------------
-- 5. RPC: send_message (atomic message + conversation update)
-- --------------------------------------------------
create or replace function public.send_message(
  p_conversation_id uuid,
  p_content text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_convo public.conversations;
  v_msg_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentification requise';
  end if;

  if p_content is null or trim(p_content) = '' then
    raise exception 'Le message ne peut pas être vide';
  end if;

  select * into v_convo from public.conversations
  where id = p_conversation_id for update;

  if v_convo.id is null then
    raise exception 'Conversation introuvable';
  end if;

  -- Only buyer or seller of this conversation can send
  if v_user_id != v_convo.buyer_id then
    -- Check if user is the seller
    if not exists (
      select 1 from public.producers
      where id = v_convo.seller_id and user_id = v_user_id
    ) then
      raise exception 'Accès non autorisé';
    end if;
  end if;

  insert into public.messages (conversation_id, sender_id, content)
  values (p_conversation_id, v_user_id, trim(p_content))
  returning id into v_msg_id;

  update public.conversations
  set updated_at = now()
  where id = p_conversation_id;

  return jsonb_build_object('id', v_msg_id);
end;
$$;

-- --------------------------------------------------
-- 6. RPC: mark_conversation_read
-- --------------------------------------------------
create or replace function public.mark_conversation_read(
  p_conversation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_convo public.conversations;
begin
  if v_user_id is null then return; end if;

  select * into v_convo from public.conversations
  where id = p_conversation_id;

  if v_convo.id is null then return; end if;

  -- Verify access
  if v_user_id != v_convo.buyer_id then
    if not exists (
      select 1 from public.producers
      where id = v_convo.seller_id and user_id = v_user_id
    ) then
      return;
    end if;
  end if;

  -- Mark messages from the OTHER party as read
  update public.messages
  set is_read = true
  where conversation_id = p_conversation_id
    and is_read = false
    and sender_id != v_user_id;
end;
$$;

-- --------------------------------------------------
-- 7. RPC: create_or_get_conversation (dedup)
-- --------------------------------------------------
create or replace function public.create_or_get_conversation(
  p_seller_id uuid,
  p_product_code text default null,
  p_product_title text default null,
  p_subject text default '',
  p_message text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_convo_id uuid;
  v_is_new boolean := false;
begin
  if v_user_id is null then
    raise exception 'Authentification requise';
  end if;

  if p_seller_id is null then
    raise exception 'Vendeur invalide';
  end if;

  -- Prevent messaging yourself
  if exists (
    select 1 from public.producers
    where id = p_seller_id and user_id = v_user_id
  ) then
    raise exception 'Vous ne pouvez pas vous contacter vous-même';
  end if;

  -- Try to find existing conversation
  select id into v_convo_id
  from public.conversations
  where buyer_id = v_user_id
    and seller_id = p_seller_id
    and coalesce(product_code, '') = coalesce(p_product_code, '')
  limit 1;

  if v_convo_id is null then
    -- Create new conversation
    insert into public.conversations (buyer_id, seller_id, product_code, product_title, subject)
    values (
      v_user_id,
      p_seller_id,
      p_product_code,
      coalesce(p_product_title, ''),
      coalesce(p_subject, '')
    )
    returning id into v_convo_id;

    v_is_new := true;

    -- Send initial message if provided
    if p_message is not null and trim(p_message) != '' then
      insert into public.messages (conversation_id, sender_id, content)
      values (v_convo_id, v_user_id, trim(p_message));
    end if;
  elsif p_message is not null and trim(p_message) != '' and v_is_new = false then
    -- Add message to existing conversation
    insert into public.messages (conversation_id, sender_id, content)
    values (v_convo_id, v_user_id, trim(p_message));

    update public.conversations set updated_at = now() where id = v_convo_id;
  end if;

  return jsonb_build_object(
    'conversation_id', v_convo_id,
    'is_new', v_is_new
  );
end;
$$;

-- --------------------------------------------------
-- 8. RPC: submit_seller_review
-- --------------------------------------------------
create or replace function public.submit_seller_review(
  p_seller_id uuid,
  p_order_id uuid,
  p_rating integer,
  p_comment text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order public.orders;
  v_review_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentification requise';
  end if;

  if p_seller_id is null then
    raise exception 'Vendeur invalide';
  end if;

  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'Note invalide (1 à 5)';
  end if;

  -- Verify order exists and belongs to user
  select * into v_order from public.orders
  where id = p_order_id and user_id = v_user_id;

  if v_order.id is null then
    raise exception 'Commande introuvable ou non autorisée';
  end if;

  -- Verify order is completed/delivered
  if v_order.status not in ('delivered', 'confirmed', 'paid') then
    raise exception 'Seules les commandes terminées peuvent être notées';
  end if;

  -- Verify order contains items from this seller
  -- (check via order_items seller name matching)
  if not exists (
    select 1 from public.order_items oi
    join public.producers p on p.name = oi.seller
    where oi.order_id = p_order_id and p.id = p_seller_id
  ) then
    raise exception 'Cette commande ne contient pas de produits de ce vendeur';
  end if;

  -- Prevent self-review
  if exists (
    select 1 from public.producers
    where id = p_seller_id and user_id = v_user_id
  ) then
    raise exception 'Vous ne pouvez pas noter votre propre boutique';
  end if;

  -- Upsert: one review per order
  insert into public.seller_reviews (seller_id, buyer_id, order_id, rating, comment)
  values (p_seller_id, v_user_id, p_order_id, p_rating, trim(coalesce(p_comment, '')))
  on conflict (order_id) do update set
    rating = excluded.rating,
    comment = excluded.comment,
    updated_at = now()
  returning id into v_review_id;

  -- Update producer aggregate stats
  update public.producers set
    rating = (
      select coalesce(avg(rating)::numeric(3,2), 0)
      from public.seller_reviews
      where seller_id = p_seller_id and is_active = true
    ),
    reviews_count = (
      select count(*)::integer
      from public.seller_reviews
      where seller_id = p_seller_id and is_active = true
    )
  where id = p_seller_id;

  return jsonb_build_object('id', v_review_id);
end;
$$;

-- --------------------------------------------------
-- 9. RPC: get_seller_stats (public)
-- --------------------------------------------------
create or replace function public.get_seller_stats(p_seller_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_avg numeric;
  v_count integer;
  v_orders integer;
  v_response_rate text;
  v_response_time text;
begin
  -- Average rating and count
  select
    coalesce(avg(rating)::numeric(3,2), null),
    count(*)::integer
  into v_avg, v_count
  from public.seller_reviews
  where seller_id = p_seller_id and is_active = true;

  -- Completed orders count (orders containing this seller's items)
  select count(distinct o.id)::integer into v_orders
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  join public.producers p on p.name = oi.seller
  where p.id = p_seller_id
    and o.status in ('delivered', 'confirmed', 'paid');

  -- Response rate: conversations with at least 1 seller message / total conversations
  -- For MVP, compute from messages table
  declare
    v_total_convo integer;
    v_replied_convo integer;
  begin
    select count(*) into v_total_convo
    from public.conversations
    where seller_id = p_seller_id;

    select count(distinct m.conversation_id) into v_replied_convo
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where c.seller_id = p_seller_id
      and m.sender_id != c.buyer_id
      and m.sender_id = c.seller_id;

    -- Check if the seller's user_id matches the messages sender
    select count(distinct m.conversation_id) into v_replied_convo
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    join public.producers p on p.id = c.seller_id
    where c.seller_id = p_seller_id
      and m.sender_id = p.user_id;

    if v_total_convo > 0 then
      v_response_rate := round((v_replied_convo::numeric / v_total_convo) * 100)::text || '%';
    else
      v_response_rate := null;
    end if;
  end;

  return jsonb_build_object(
    'avg_rating', v_avg,
    'reviews_count', v_count,
    'completed_orders', v_orders,
    'response_rate', v_response_rate,
    'response_time', null
  );
end;
$$;

-- --------------------------------------------------
-- 10. RPC: get_public_reviews
-- --------------------------------------------------
create or replace function public.get_public_reviews(p_seller_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', r.id,
      'rating', r.rating,
      'comment', r.comment,
      'created_at', r.created_at,
      'buyer_name', coalesce(p.full_name, 'Client'),
      'buyer_id', r.buyer_id,
      'order_id', r.order_id,
      'has_order', r.order_id is not null
    ) order by r.created_at desc)
    from public.seller_reviews r
    left join public.profiles p on p.id = r.buyer_id
    where r.seller_id = p_seller_id and r.is_active = true
  ), '[]'::jsonb);
end;
$$;

-- --------------------------------------------------
-- 11. RLS: conversations
-- --------------------------------------------------
alter table public.conversations enable row level security;

-- Buyers see their own conversations
drop policy if exists "conversations_buyer_select" on public.conversations;
create policy "conversations_buyer_select"
  on public.conversations for select
  using (buyer_id = auth.uid());

-- Sellers see conversations for their producers
drop policy if exists "conversations_seller_select" on public.conversations;
create policy "conversations_seller_select"
  on public.conversations for select
  using (
    exists (
      select 1 from public.producers p
      where p.id = seller_id and p.user_id = auth.uid()
    )
  );

-- Admin sees all
drop policy if exists "conversations_admin_all" on public.conversations;
create policy "conversations_admin_all"
  on public.conversations for all
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = auth.uid() and pr.role = 'admin'
    )
  );

-- --------------------------------------------------
-- 12. RLS: messages
-- --------------------------------------------------
alter table public.messages enable row level security;

-- Participants can read messages
drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (
          c.buyer_id = auth.uid()
          or exists (
            select 1 from public.producers p
            where p.id = c.seller_id and p.user_id = auth.uid()
          )
          or exists (
            select 1 from public.profiles pr
            where pr.id = auth.uid() and pr.role = 'admin'
          )
        )
    )
  );

-- Authenticated users can insert (RPC validates sender)
drop policy if exists "messages_insert_participant" on public.messages;
create policy "messages_insert_participant"
  on public.messages for insert to authenticated
  with check (sender_id = auth.uid());

-- Sender can update own messages (mark read etc.)
drop policy if exists "messages_update_own" on public.messages;
create policy "messages_update_own"
  on public.messages for update to authenticated
  using (sender_id = auth.uid() or exists (
    select 1 from public.conversations c
    join public.producers p on p.id = c.seller_id
    where c.id = conversation_id and p.user_id = auth.uid()
  ));

-- --------------------------------------------------
-- 13. RLS: seller_reviews
-- --------------------------------------------------
alter table public.seller_reviews enable row level security;

-- Public read for active reviews
drop policy if exists "seller_reviews_public_read" on public.seller_reviews;
create policy "seller_reviews_public_read"
  on public.seller_reviews for select
  using (is_active = true);

-- Buyers read own reviews (even inactive)
drop policy if exists "seller_reviews_buyer_read" on public.seller_reviews;
create policy "seller_reviews_buyer_read"
  on public.seller_reviews for select
  using (buyer_id = auth.uid());

-- Sellers read reviews for their shop
drop policy if exists "seller_reviews_seller_read" on public.seller_reviews;
create policy "seller_reviews_seller_read"
  on public.seller_reviews for select
  using (
    exists (
      select 1 from public.producers p
      where p.id = seller_id and p.user_id = auth.uid()
    )
  );

-- Admin full access
drop policy if exists "seller_reviews_admin_all" on public.seller_reviews;
create policy "seller_reviews_admin_all"
  on public.seller_reviews for all
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = auth.uid() and pr.role = 'admin'
    )
  );

-- Buyers can insert (RPC validates eligibility)
drop policy if exists "seller_reviews_buyer_insert" on public.seller_reviews;
create policy "seller_reviews_buyer_insert"
  on public.seller_reviews for insert to authenticated
  with check (buyer_id = auth.uid());

-- Buyers can update own reviews
drop policy if exists "seller_reviews_buyer_update" on public.seller_reviews;
create policy "seller_reviews_buyer_update"
  on public.seller_reviews for update to authenticated
  using (buyer_id = auth.uid());

-- --------------------------------------------------
-- 14. UPDATE_MY_SHOP v2: add logo_url support
-- --------------------------------------------------
create or replace function public.update_my_shop(
  p_name text,
  p_location text,
  p_description text,
  p_established integer,
  p_contact_email text,
  p_phone text,
  p_payment_info jsonb,
  p_image_url text,
  p_logo_url text default null
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
    image_url     = nullif(trim(coalesce(p_image_url, '')), ''),
    logo_url      = nullif(trim(coalesce(p_logo_url, '')), '')
  where user_id = auth.uid()
    and status = 'approved';

  if not found then
    raise exception 'Aucune boutique approuvée associée à votre compte';
  end if;
end;
$$;

-- --------------------------------------------------
-- 15. Storage: seller-logos bucket (public)
-- --------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('seller-logos', 'seller-logos', true, 2097152,
   array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Public read
drop policy if exists "seller_logos_public_read" on storage.objects;
create policy "seller_logos_public_read"
on storage.objects for select
using (bucket_id = 'seller-logos');

-- Upload: own folder only
drop policy if exists "seller_logos_insert_own" on storage.objects;
create policy "seller_logos_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'seller-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Update/delete: own folder
drop policy if exists "seller_logos_update_own" on storage.objects;
create policy "seller_logos_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'seller-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "seller_logos_delete_own" on storage.objects;
create policy "seller_logos_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'seller-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Admin full access
drop policy if exists "seller_logos_admin_all" on storage.objects;
create policy "seller_logos_admin_all"
on storage.objects for all to authenticated
using (
  bucket_id = 'seller-logos'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);
