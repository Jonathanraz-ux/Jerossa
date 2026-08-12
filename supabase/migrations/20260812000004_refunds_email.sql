-- ==================================================
-- JEROSSA — PHASE 8 : Remboursements + Emails transactionnels
-- Tables : refunds, notifications, email_logs
-- RPC : request_refund (client), process_refund (admin, Phase 9)
-- NB EMAILS : pas encore de domaine professionnel → tous les emails sont
-- ENREGISTRÉS en statut 'simulated' (aucun envoi réel). Bascule vers Resend
-- quand le domaine est configuré (Phase 10 / provider emailService).
-- ==================================================

-- --------------------------------------------------
-- 1. REFUNDS (demande client → traitement admin)
-- --------------------------------------------------
create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  refund_number text not null unique,
  order_id uuid not null references public.orders (id) on delete cascade,
  order_number text not null,
  customer_id uuid references auth.users (id) on delete set null,
  seller_id uuid,
  amount_requested numeric(12, 2) not null check (amount_requested > 0),
  amount_refunded numeric(12, 2) not null default 0 check (amount_refunded >= 0),
  currency text not null default 'EUR',
  reason text not null,
  description text default '',
  status text not null default 'requested'
    check (status in ('requested', 'under_review', 'approved', 'rejected', 'processed')),
  admin_note text,
  refund_reference text,
  attachment_url text,
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists refunds_number_idx on public.refunds (refund_number);
create index if not exists refunds_order_idx on public.refunds (order_id);
create index if not exists refunds_customer_idx on public.refunds (customer_id);
create index if not exists refunds_status_idx on public.refunds (status);

-- --------------------------------------------------
-- 2. NOTIFICATIONS (cloche utilisateur — Phase 9)
-- --------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id);
create index if not exists notifications_created_idx on public.notifications (created_at desc);

-- --------------------------------------------------
-- 3. EMAIL_LOGS (journal des emails ; 'simulated' tant que pas de domaine pro)
-- --------------------------------------------------
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  recipient text not null,
  type text not null,
  subject text not null,
  status text not null default 'simulated'
    check (status in ('simulated', 'pending', 'sent', 'failed')),
  provider text not null default 'simulate',
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_logs_recipient_idx on public.email_logs (recipient);
create index if not exists email_logs_created_idx on public.email_logs (created_at desc);

-- --------------------------------------------------
-- 4. RPC : REQUEST_REFUND (client)
--    Enregistre la demande + notification + email simulé.
-- --------------------------------------------------
create or replace function public.request_refund(
  p_order_number text,
  p_reason text,
  p_description text,
  p_amount_requested numeric,
  p_recipient text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_refund_id uuid;
  v_refund_number text;
  v_user_id uuid := auth.uid();
begin
  if p_order_number is null or p_order_number = '' then
    raise exception 'Commande invalide';
  end if;

  if p_reason is null or p_reason = '' then
    raise exception 'Merci d''indiquer un motif';
  end if;

  if p_amount_requested is null or p_amount_requested <= 0 then
    raise exception 'Montant de remboursement invalide';
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

  if v_order.payment_status <> 'paid' then
    raise exception 'Cette commande n''est pas éligible à un remboursement';
  end if;

  if v_order.status not in ('paid', 'shipped', 'delivered') then
    raise exception 'Cette commande n''est pas éligible à un remboursement';
  end if;

  if p_amount_requested > v_order.total then
    raise exception 'Le montant demandé dépasse le total de la commande';
  end if;

  if exists (
    select 1 from public.refunds r
    where r.order_id = v_order.id and r.status in ('requested', 'under_review', 'approved')
  ) then
    raise exception 'Une demande de remboursement est déjà en cours pour cette commande';
  end if;

  v_refund_number := 'RMB-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 100000)::text, 5, '0');

  insert into public.refunds (
    refund_number, order_id, order_number, customer_id, amount_requested,
    currency, reason, description, status
  )
  values (
    v_refund_number, v_order.id, v_order.order_number, v_user_id, p_amount_requested,
    v_order.currency, p_reason, coalesce(p_description, ''), 'requested'
  )
  returning id into v_refund_id;

  -- Notification client (si connecté)
  if v_user_id is not null then
    insert into public.notifications (user_id, type, title, body)
    values (
      v_user_id, 'refund_status',
      'Demande de remboursement enregistrée',
      'Votre demande ' || v_refund_number || ' est en cours d''examen.'
    );
  end if;

  -- Email (simulé : pas de domaine professionnel pour l'instant)
  insert into public.email_logs (user_id, recipient, type, subject, status, provider)
  values (
    v_user_id,
    coalesce(nullif(p_recipient, ''), 'client@jerossa.mg'),
    'refund_status',
    'Votre demande de remboursement ' || v_refund_number || ' a été enregistrée',
    'simulated', 'simulate'
  );

  return jsonb_build_object('id', v_refund_id, 'refund_number', v_refund_number);
end;
$$;

-- --------------------------------------------------
-- 5. RPC : PROCESS_REFUND (admin)
--    NB : l'identité admin arrive en Phase 9 → fonction volontairement non
--    gatée ici, à verrouiller avec le dashboard admin.
-- --------------------------------------------------
create or replace function public.process_refund(
  p_refund_number text,
  p_status text,
  p_amount_refunded numeric,
  p_admin_note text,
  p_refund_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_refund public.refunds;
  v_notif_body text;
begin
  if p_refund_number is null or p_refund_number = '' then
    raise exception 'Demande de remboursement invalide';
  end if;

  if p_status not in ('approved', 'rejected', 'processed') then
    raise exception 'Statut de traitement invalide';
  end if;

  select * into v_refund
  from public.refunds
  where refund_number = p_refund_number
  for update;

  if v_refund.id is null then
    raise exception 'Demande de remboursement introuvable';
  end if;

  if p_status = 'approved' then
    if p_amount_refunded is null or p_amount_refunded <= 0 then
      raise exception 'Montant réellement remboursé requis';
    end if;
    if p_amount_refunded > v_refund.amount_requested then
      raise exception 'Le montant remboursé dépasse le montant demandé';
    end if;

    update public.refunds
    set status = 'approved',
        amount_refunded = p_amount_refunded,
        admin_note = coalesce(p_admin_note, admin_note),
        updated_at = now()
    where id = v_refund.id;
    v_notif_body := 'Votre remboursement ' || p_refund_number || ' a été approuvé.';

  elsif p_status = 'rejected' then
    update public.refunds
    set status = 'rejected',
        admin_note = coalesce(p_admin_note, admin_note),
        updated_at = now()
    where id = v_refund.id;
    v_notif_body := 'Votre demande de remboursement ' || p_refund_number || ' a été refusée.';

  else -- processed
    if v_refund.status not in ('approved', 'processed') then
      raise exception 'Le remboursement doit d''abord être approuvé';
    end if;

    update public.refunds
    set status = 'processed',
        refund_reference = coalesce(p_refund_reference, refund_reference),
        processed_at = now(),
        updated_at = now()
    where id = v_refund.id;

    update public.orders
    set status = 'refunded',
        payment_status = 'refunded'
    where id = v_refund.order_id;

    v_notif_body := 'Votre remboursement ' || p_refund_number || ' a été traité.';
  end if;

  if v_refund.customer_id is not null then
    insert into public.notifications (user_id, type, title, body)
    values (v_refund.customer_id, 'refund_status', 'Mise à jour de votre remboursement', v_notif_body);
  end if;

  return jsonb_build_object('id', v_refund.id, 'refund_number', v_refund.refund_number, 'status', p_status);
end;
$$;

-- --------------------------------------------------
-- 6. RLS
-- --------------------------------------------------
-- REFUNDS : le client lit ses propres demandes (ou invité par référence).
alter table public.refunds enable row level security;

drop policy if exists "refunds_select_own_or_guest" on public.refunds;
create policy "refunds_select_own_or_guest"
  on public.refunds for select
  using (auth.uid() = customer_id or customer_id is null);

-- NOTIFICATIONS : lecture de ses propres notifications uniquement
-- (écriture via RPC security definer).
alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

-- EMAIL_LOGS : aucun accès client (admin Phase 9). Insertion RPC uniquement.
alter table public.email_logs enable row level security;
