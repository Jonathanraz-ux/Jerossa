-- ==================================================
-- JEROSSA — PHASE 1 : Réception manuelle des paiements
-- 1. Rôle financier (profiles.role) + helper is_financial_admin()
-- 2. payment_instructions : coordonnées officielles Jerossa (config admin)
-- 3. payment_submissions : preuves soumises par les acheteurs
-- 4. financial_audit_logs : journal d'audit non modifiable côté client
-- 5. Bucket storage privé "payment-proofs" (jpg/png/webp/pdf, 5 Mo)
-- 6. RPC : submit_payment_proof (acheteur, idempotent, transactionnel)
-- 7. RPC : update_payment_submission (acheteur, complément demandé)
-- 8. RPC : review_payment_submission (admin, approbation/rejet/complément)
--
-- NB COMMISSION : calculée sur le sous-total (produits) au moment de la
-- confirmation. Les frais de livraison n'entrent pas dans la base de
-- commission. Taux enregistré sur la commande (pas de recalcul rétroactif).
-- NB STATUTS COMMANDE : réutilise le vocabulaire existant
-- ('pending' → paiement attendu, 'confirmed' → paiement vérifié manuellement)
-- afin de rester 100 % additif avec l'existant.
-- ==================================================

-- --------------------------------------------------
-- 1. RÔLE FINANCIER
--    Une granularité "admin financier" est rendue possible de façon additive.
-- --------------------------------------------------
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
    check (role in ('customer', 'seller', 'admin', 'financial_admin'));

create or replace function public.is_financial_admin()
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
  return v_role in ('admin', 'financial_admin');
end;
$$;

-- --------------------------------------------------
-- 2. PAYMENT_INSTRUCTIONS (config administrable, source : Supabase)
--    Les numéros complets ne sont montrés qu'aux endroits nécessaires
--    (checkout côté acheteur, édition côté admin financier).
-- --------------------------------------------------
create table if not exists public.payment_instructions (
  id uuid primary key default gen_random_uuid(),
  beneficiary_legal_name text not null,
  payment_method text not null,
  bank_or_operator text not null,
  account_number text not null,
  currency text not null default 'EUR',
  country text not null default 'MG',
  instructions text default '',
  is_active boolean not null default true,
  commission_rate numeric(5, 2),
  payout_delay_days integer not null default 3,
  double_validation_threshold numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_instructions_active_idx
  on public.payment_instructions (is_active);

alter table public.payment_instructions enable row level security;

-- Acheteur : lit uniquement les instructions actives (nécessaires au paiement).
drop policy if exists "payment_instructions_select_active" on public.payment_instructions;
create policy "payment_instructions_select_active"
  on public.payment_instructions for select to authenticated
  using (is_active = true);

-- Admin financier : lecture complète (y compris inactives) + écriture.
drop policy if exists "payment_instructions_admin_all" on public.payment_instructions;
create policy "payment_instructions_admin_all"
  on public.payment_instructions for all to authenticated
  using (public.is_financial_admin())
  with check (public.is_financial_admin());

-- --------------------------------------------------
-- 3. PAYMENT_SUBMISSIONS
--    Une seule soumission "active" par commande (contrôlée en RPC via le
--    verrou FOR UPDATE de la ligne commande → double-soumission impossible).
-- --------------------------------------------------
create table if not exists public.payment_submissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  buyer_id uuid not null references auth.users (id) on delete set null,
  order_number text not null,
  payment_method_id uuid not null references public.payment_instructions (id),
  declared_amount numeric(12, 2) not null,
  expected_amount numeric(12, 2) not null default 0,
  currency text not null default 'EUR',
  external_reference text,
  payer_name text,
  paid_at timestamptz,
  proof_path text,
  proof_mime text not null default 'application/pdf',
  status text not null default 'proof_submitted'
    check (status in (
      'awaiting_payment', 'proof_submitted', 'under_review',
      'payment_confirmed', 'payment_rejected', 'refunded', 'partially_refunded'
    )),
  rejection_reason text,
  review_note text,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_submissions_order_idx
  on public.payment_submissions (order_id);
create index if not exists payment_submissions_buyer_idx
  on public.payment_submissions (buyer_id);
create index if not exists payment_submissions_status_idx
  on public.payment_submissions (status);
create index if not exists payment_submissions_created_idx
  on public.payment_submissions (created_at desc);

alter table public.payment_submissions enable row level security;

-- Acheteur : ne lit que ses propres soumissions.
drop policy if exists "payment_submissions_select_own" on public.payment_submissions;
create policy "payment_submissions_select_own"
  on public.payment_submissions for select
  using (auth.uid() = buyer_id);

-- Admin financier : lit toutes les soumissions.
drop policy if exists "payment_submissions_admin_select" on public.payment_submissions;
create policy "payment_submissions_admin_select"
  on public.payment_submissions for select
  using (public.is_financial_admin());

-- Insert/Update : uniquement via RPC security definer (pas de politique d'écriture).

-- --------------------------------------------------
-- 4. FINANCIAL_AUDIT_LOGS
--    Journal non modifiable depuis le frontend : aucune politique d'écriture.
--    Alimenté exclusivement par les RPC transactionnelles (security definer).
-- --------------------------------------------------
create table if not exists public.financial_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  previous_state jsonb not null default '{}'::jsonb,
  new_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists financial_audit_logs_actor_idx
  on public.financial_audit_logs (actor_id);
create index if not exists financial_audit_logs_entity_idx
  on public.financial_audit_logs (entity_type, entity_id);
create index if not exists financial_audit_logs_created_idx
  on public.financial_audit_logs (created_at desc);

alter table public.financial_audit_logs enable row level security;

-- Lecture : admin financier uniquement. Aucune écriture côté client.
drop policy if exists "financial_audit_logs_admin_select" on public.financial_audit_logs;
create policy "financial_audit_logs_admin_select"
  on public.financial_audit_logs for select
  using (public.is_financial_admin());

-- --------------------------------------------------
-- 5. STORAGE : BUCKET PAYMENT-PROOFS (privé, 5 Mo, types autorisés)
--    Convention de chemin : {auth.uid()}/{order_number}/{fichier}
-- --------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs', 'payment-proofs', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- Lecture : propriétaire du dossier OU admin financier.
drop policy if exists "payment_proofs_select_own_or_admin" on storage.objects;
create policy "payment_proofs_select_own_or_admin"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('admin', 'financial_admin')
      )
    )
  );

-- Dépôt : utilisateur authentifié dans son propre dossier. Les types MIME et la
-- taille sont déjà contraints par le bucket → aucun fichier exécutable.
drop policy if exists "payment_proofs_insert_own" on storage.objects;
create policy "payment_proofs_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Remplacement : propriétaire ou admin financier.
drop policy if exists "payment_proofs_update_own_or_admin" on storage.objects;
create policy "payment_proofs_update_own_or_admin"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('admin', 'financial_admin')
      )
    )
  );

drop policy if exists "payment_proofs_delete_own_or_admin" on storage.objects;
create policy "payment_proofs_delete_own_or_admin"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('admin', 'financial_admin')
      )
    )
  );

-- --------------------------------------------------
-- 6. HELPERS
-- --------------------------------------------------

-- Type MIME dérivé de l'extension du fichier (pour l'affichage admin).
create or replace function public.payment_proof_mime(p_path text)
returns text
language sql
immutable
as $$
  select case
    when lower(p_path) like '%.jpg' or lower(p_path) like '%.jpeg' then 'image/jpeg'
    when lower(p_path) like '%.png' then 'image/png'
    when lower(p_path) like '%.webp' then 'image/webp'
    when lower(p_path) like '%.pdf' then 'application/pdf'
    else 'application/octet-stream'
  end;
$$;

-- Notification des vendeurs associés aux lignes d'une commande.
-- Le lien vendeur ↔ ligne est le libellé (name/slug) stocké dans order_items.
create or replace function public.notify_order_sellers(
  p_order_id uuid,
  p_type text,
  p_title text,
  p_body text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (user_id, type, title, body)
  select distinct p.user_id, p_type, p_title, p_body
  from public.order_items oi
  join public.producers p
    on (p.name = oi.seller or p.slug = oi.seller)
  where oi.order_id = p_order_id
    and p.user_id is not null;
$$;

-- --------------------------------------------------
-- 7. RPC : SUBMIT_PAYMENT_PROOF (acheteur)
--    - Verrouille la commande (double-soumission impossible même simultanée)
--    - Validation : propriété, devise, montant positif, chemin de preuve conforme
--    - Crée la soumission + notifie admins (et alerte montant incohérent)
-- ==================================================
create or replace function public.submit_payment_proof(
  p_order_number text,
  p_payment_method_id uuid,
  p_declared_amount numeric,
  p_currency text,
  p_external_reference text,
  p_payer_name text,
  p_paid_at timestamptz,
  p_proof_path text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order public.orders;
  v_instruction public.payment_instructions;
  v_submission_id uuid;
  v_admin_msg text;
begin
  if v_user_id is null then
    raise exception 'Vous devez être connecté pour transmettre une preuve de paiement.';
  end if;

  if p_order_number is null or p_order_number = '' then
    raise exception 'Commande invalide.';
  end if;

  select * into v_order
  from public.orders
  where order_number = p_order_number
  for update;

  if v_order.id is null then
    raise exception 'Commande introuvable.';
  end if;

  if v_order.user_id is distinct from v_user_id then
    raise exception 'Accès refusé.';
  end if;

  -- Idempotence : déjà confirmé, on renvoie l'état sans rien re-créer.
  if v_order.payment_status = 'paid' then
    return jsonb_build_object(
      'id', v_order.id, 'order_number', v_order.order_number,
      'already_paid', true, 'status', v_order.status
    );
  end if;

  if v_order.status <> 'pending' or v_order.payment_status <> 'pending' then
    raise exception 'Cette commande ne peut pas recevoir de preuve de paiement.';
  end if;

  -- Une seule soumission active par commande (verrou de ligne ci-dessus).
  if exists (
    select 1 from public.payment_submissions ps
    where ps.order_id = v_order.id
      and ps.status in ('awaiting_payment', 'proof_submitted', 'under_review')
  ) then
    raise exception 'Une preuve de paiement est déjà en cours de vérification pour cette commande.';
  end if;

  select * into v_instruction
  from public.payment_instructions
  where id = p_payment_method_id;

  if v_instruction.id is null then
    raise exception 'Coordonnées de paiement introuvables.';
  end if;

  if not v_instruction.is_active then
    raise exception 'Ces coordonnées de paiement ne sont plus actives. Veuillez utiliser une autre méthode.';
  end if;

  if p_currency is distinct from v_order.currency then
    raise exception 'La devise déclarée ne correspond pas à celle de la commande.';
  end if;

  if p_declared_amount is null or p_declared_amount <= 0 then
    raise exception 'Montant déclaré invalide.';
  end if;

  if p_proof_path is null
     or not starts_with(p_proof_path, 'payment-proofs/' || v_user_id::text || '/')
     or length(p_proof_path) > 512 then
    raise exception 'Preuve de paiement invalide.';
  end if;

  insert into public.payment_submissions (
    order_id, buyer_id, order_number, payment_method_id,
    declared_amount, expected_amount, currency,
    external_reference, payer_name, paid_at,
    proof_path, proof_mime, status
  )
  values (
    v_order.id, v_user_id, v_order.order_number, v_instruction.id,
    p_declared_amount, v_order.total, v_order.currency,
    nullif(p_external_reference, ''), nullif(p_payer_name, ''), p_paid_at,
    p_proof_path, public.payment_proof_mime(p_proof_path), 'proof_submitted'
  )
  returning id into v_submission_id;

  -- Notification administrateurs : nouvelle preuve à vérifier.
  v_admin_msg := 'La commande ' || v_order.order_number || ' attend une vérification de paiement ('
    || p_declared_amount || ' ' || v_order.currency || ').';

  insert into public.notifications (user_id, type, title, body)
  select id, 'payment_proof_received', 'Nouvelle preuve de paiement', v_admin_msg
  from public.profiles
  where role in ('admin', 'financial_admin');

  -- Alerte administrateurs : montant déclaré ≠ montant attendu.
  if abs(p_declared_amount - v_order.total) > 0.01 then
    insert into public.notifications (user_id, type, title, body)
    select id, 'payment_amount_mismatch', 'Montant potentiellement incohérent',
      'La commande ' || v_order.order_number || ' déclare ' || p_declared_amount || ' '
      || v_order.currency || ' alors que le montant attendu est ' || v_order.total || ' '
      || v_order.currency || '.'
    from public.profiles
    where role in ('admin', 'financial_admin');
  end if;

  -- Notification acheteur : preuve reçue.
  insert into public.notifications (user_id, type, title, body)
  values (
    v_user_id, 'payment_proof_received', 'Preuve de paiement transmise',
    'Votre preuve pour la commande ' || v_order.order_number || ' a bien été reçue. '
    || 'Elle sera vérifiée manuellement par Jerossa.'
  );

  return jsonb_build_object(
    'id', v_submission_id, 'order_number', v_order.order_number, 'status', 'proof_submitted'
  );
end;
$$;

-- --------------------------------------------------
-- 8. RPC : UPDATE_PAYMENT_SUBMISSION (acheteur — complément demandé)
--    Permet de corriger une preuve tant qu'elle n'est pas traitée
--    (statuts 'proof_submitted' ou 'under_review').
-- ==================================================
create or replace function public.update_payment_submission(
  p_submission_id uuid,
  p_declared_amount numeric,
  p_external_reference text,
  p_payer_name text,
  p_paid_at timestamptz,
  p_proof_path text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_submission public.payment_submissions;
begin
  if v_user_id is null then
    raise exception 'Vous devez être connecté.';
  end if;

  select * into v_submission
  from public.payment_submissions
  where id = p_submission_id
  for update;

  if v_submission.id is null then
    raise exception 'Preuve de paiement introuvable.';
  end if;

  if v_submission.buyer_id is distinct from v_user_id then
    raise exception 'Accès refusé.';
  end if;

  if v_submission.status not in ('proof_submitted', 'under_review') then
    raise exception 'Cette preuve ne peut plus être modifiée.';
  end if;

  if p_declared_amount is not null then
    if p_declared_amount <= 0 then
      raise exception 'Montant déclaré invalide.';
    end if;
    update public.payment_submissions set declared_amount = p_declared_amount
      where id = v_submission.id;
  end if;

  if p_proof_path is not null then
    if not starts_with(p_proof_path, 'payment-proofs/' || v_user_id::text || '/')
       or length(p_proof_path) > 512 then
      raise exception 'Preuve de paiement invalide.';
    end if;
    update public.payment_submissions
      set proof_path = p_proof_path,
          proof_mime = public.payment_proof_mime(p_proof_path)
      where id = v_submission.id;
  end if;

  update public.payment_submissions
    set external_reference = coalesce(nullif(p_external_reference, ''), external_reference),
        payer_name = coalesce(nullif(p_payer_name, ''), payer_name),
        paid_at = coalesce(p_paid_at, paid_at),
        updated_at = now()
    where id = v_submission.id;

  return jsonb_build_object('id', v_submission.id, 'status', v_submission.status);
end;
$$;

-- --------------------------------------------------
-- 9. RPC : REVIEW_PAYMENT_SUBMISSION (admin financier)
--    Verrouille la soumission puis la commande → double validation simultanée
--    impossible (le second appel bloque puis constate le statut final).
--    'approve'            → paiement confirmé + commande confirmée
--                            + commission recalculée côté serveur
--    'reject'             → motif obligatoire, l'acheteur peut resoumettre
--    'request_more_info'  → complément demandé (note adressée à l'acheteur)
-- ==================================================
create or replace function public.review_payment_submission(
  p_submission_id uuid,
  p_action text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_submission public.payment_submissions;
  v_instruction public.payment_instructions;
  v_order public.orders;
  v_commission_rate numeric(5, 2) := 10;
  v_commission_amount numeric(12, 2) := 0;
  v_seller_amount numeric(12, 2) := 0;
  v_platform_amount numeric(12, 2) := 0;
  v_payment_ref text;
  v_prev_order jsonb;
  v_prev_payment jsonb;
  v_notify_seller_id uuid;
begin
  if not public.is_financial_admin() then
    raise exception 'Accès réservé aux administrateurs financiers.';
  end if;

  if p_action is null or p_action not in ('approve', 'reject', 'request_more_info') then
    raise exception 'Action invalide.';
  end if;

  -- Verrou de la soumission : deux admins simultanés → premier gagne.
  select * into v_submission
  from public.payment_submissions
  where id = p_submission_id
  for update;

  if v_submission.id is null then
    raise exception 'Preuve de paiement introuvable.';
  end if;

  -- Idempotence : déjà confirmée → on renvoie l'état sans re-créditer.
  if v_submission.status = 'payment_confirmed' then
    return jsonb_build_object(
      'id', v_submission.id, 'order_number', v_submission.order_number,
      'status', v_submission.status, 'already_reviewed', true
    );
  end if;

  if v_submission.status not in ('proof_submitted', 'under_review') then
    raise exception 'Cette preuve de paiement n''est pas en attente de vérification.';
  end if;

  -- Verrou de la commande associée.
  select * into v_order
  from public.orders
  where id = v_submission.order_id
  for update;

  if v_order.id is null then
    raise exception 'Commande associée introuvable.';
  end if;

  select * into v_instruction
  from public.payment_instructions
  where id = v_submission.payment_method_id;

  if p_action = 'approve' then
    -- Re-calculs côté base : montants et devise recalculés, jamais confiés au client.
    if abs(v_submission.declared_amount - v_order.total) > 0.01 then
      raise exception 'Montant déclaré (% %) ne correspond pas au total attendu (% %).',
        v_submission.declared_amount, v_submission.currency,
        v_order.total, v_order.currency;
    end if;

    if v_submission.currency is distinct from v_order.currency then
      raise exception 'La devise de la preuve ne correspond pas à celle de la commande.';
    end if;

    v_prev_order := row_to_json(v_order)::jsonb;
    select to_jsonb(p.*) into v_prev_payment
    from public.payments p
    where p.order_id = v_order.id;

    -- Commission : taux global au moment de la confirmation (taux figé).
    select coalesce(value::numeric, 10) into v_commission_rate
    from public.platform_settings
    where key = 'commission_rate';

    v_commission_amount := round(v_order.subtotal * v_commission_rate / 100, 2);
    v_seller_amount := round(v_order.subtotal - v_commission_amount, 2);
    v_platform_amount := v_commission_amount;

    update public.orders
    set status = 'confirmed',
        payment_status = 'paid',
        payment_method = case when v_instruction.id is not null
                             then v_instruction.payment_method else payment_method end,
        commission_rate = v_commission_rate,
        commission_amount = v_commission_amount,
        seller_amount = v_seller_amount,
        platform_amount = v_platform_amount
    where id = v_order.id;

    v_payment_ref := coalesce(nullif(v_submission.external_reference, ''),
      'JER-' || upper(substr(md5(random()::text), 1, 12)));

    -- Nouvelle ligne de paiement si absente (anciennes commandes pré-v2),
    -- sinon mise à jour. Aucun transfert simulé : provider 'manual' = vérifié
    -- manuellement hors plateforme, référence = référence externe fournie.
    if v_prev_payment is null then
      insert into public.payments (order_id, amount, currency, status, provider, provider_ref)
      values (v_order.id, v_order.total, v_order.currency, 'succeeded', 'manual', v_payment_ref);
    else
      update public.payments
      set status = 'succeeded',
          provider = 'manual',
          provider_ref = v_payment_ref
      where order_id = v_order.id;
    end if;

    update public.payment_submissions
    set status = 'payment_confirmed',
        reviewed_by = v_user_id,
        reviewed_at = now(),
        review_note = coalesce(nullif(p_reason, ''), review_note),
        updated_at = now()
    where id = v_submission.id;

    -- Journal d'audit (commande + soumission + paiement).
    insert into public.financial_audit_logs
      (actor_id, action, entity_type, entity_id, previous_state, new_state)
    values
      (v_user_id, 'payment_confirmed', 'order', v_order.id::text, v_prev_order,
       to_jsonb(v_order)::jsonb || jsonb_build_object('status', 'confirmed', 'payment_status', 'paid')),
      (v_user_id, 'payment_confirmed', 'payment_submission', v_submission.id::text,
       to_jsonb(v_submission)::jsonb,
       jsonb_build_object('id', v_submission.id, 'status', 'payment_confirmed',
                          'reviewed_by', v_user_id, 'reviewed_at', now()));

    -- Notifications client : paiement confirmé + commande confirmée.
    insert into public.notifications (user_id, type, title, body) values
      (v_submission.buyer_id, 'payment_confirmed', 'Paiement confirmé par Jerossa',
       'Votre paiement pour la commande ' || v_submission.order_number
       || ' a été confirmé manuellement par l''équipe Jerossa.'),
      (v_submission.buyer_id, 'order_confirmed', 'Commande confirmée',
       'La commande ' || v_submission.order_number || ' est confirmée et va être préparée.');

    -- Notifications vendeurs : vente confirmée.
    perform public.notify_order_sellers(
      v_order.id, 'sale_confirmed', 'Vente confirmée',
      'Une commande contenant vos produits est confirmée et payée (' || v_order.total || ' '
      || v_order.currency || ').'
    );

    return jsonb_build_object(
      'id', v_submission.id, 'order_number', v_submission.order_number,
      'status', 'payment_confirmed', 'order_status', 'confirmed'
    );

  elsif p_action = 'reject' then
    if p_reason is null or length(trim(p_reason)) = 0 then
      raise exception 'Un motif de rejet est obligatoire.';
    end if;

    update public.payment_submissions
    set status = 'payment_rejected',
        rejection_reason = p_reason,
        reviewed_by = v_user_id,
        reviewed_at = now(),
        updated_at = now()
    where id = v_submission.id;

    insert into public.financial_audit_logs
      (actor_id, action, entity_type, entity_id, previous_state, new_state)
    values
      (v_user_id, 'payment_rejected', 'payment_submission', v_submission.id::text,
       to_jsonb(v_submission)::jsonb,
       jsonb_build_object('id', v_submission.id, 'status', 'payment_rejected',
                          'rejection_reason', p_reason, 'reviewed_by', v_user_id));

    insert into public.notifications (user_id, type, title, body)
    values (v_submission.buyer_id, 'payment_rejected', 'Paiement rejeté',
      'Votre preuve pour la commande ' || v_submission.order_number || ' a été rejetée : '
      || p_reason || '. Vous pouvez la corriger et la retransmettre.');

    return jsonb_build_object(
      'id', v_submission.id, 'order_number', v_submission.order_number, 'status', 'payment_rejected'
    );

  else -- request_more_info
    if p_reason is null or length(trim(p_reason)) = 0 then
      raise exception 'Veuillez préciser les informations complémentaires demandées.';
    end if;

    update public.payment_submissions
    set status = 'under_review',
        review_note = p_reason,
        reviewed_by = v_user_id,
        reviewed_at = now(),
        updated_at = now()
    where id = v_submission.id;

    insert into public.financial_audit_logs
      (actor_id, action, entity_type, entity_id, previous_state, new_state)
    values
      (v_user_id, 'request_more_info', 'payment_submission', v_submission.id::text,
       to_jsonb(v_submission)::jsonb,
       jsonb_build_object('id', v_submission.id, 'status', 'under_review',
                          'review_note', p_reason));

    insert into public.notifications (user_id, type, title, body)
    values (v_submission.buyer_id, 'payment_more_info', 'Informations complémentaires demandées',
      'Pour la commande ' || v_submission.order_number || ' : ' || p_reason
      || '. Merci de compléter votre preuve de paiement.');

    return jsonb_build_object(
      'id', v_submission.id, 'order_number', v_submission.order_number, 'status', 'under_review'
    );
  end if;
end;
$$;

-- ==================================================
-- FIN PHASE 1 — Réception manuelle des paiements
-- ==================================================