-- ==================================================
-- MIGRATION CORRECTIVE — Jerossa — Chronologie de la messagerie
-- Fichier : 20260928000002_messaging_chronological_tiebreak.sql
-- Nature  : ADDITIVE (surcouche). Aucune migration appliquée n'est réécrite.
--
-- DÉFAUT PROUVÉ (preuve fonctionnelle F1 sur la base liée, données synthétiques
-- annulées) : avec deux messages partageant le même `created_at`, la fonction
-- list_my_conversations renvoyait le MAUVAIS dernier message.
--
--   Cause : `order by m.created_at desc` n'est PAS un tri total. `now()` est
--   figé au début de la transaction, donc TOUS les messages insérés dans une
--   même transaction ont exactement le même created_at — et deux envois très
--   rapprochés (envoi optimiste + réconciliation serveur, ou double clic) peu
--   vent aussi retomber sur la même valeur. Le résultat devenait alors
--   arbitraire, donc différent en base et en mémoire.
--
--   Symptôme visible côté client : la liste des conversations affiche un
--   aperçu périmé, et l'ordre des bulles peut sautiller à chaque rechargement.
--
-- CORRECTIF : colonne `seq` bigint monotone (identity) sur public.messages.
--   1. `seq` donne un ordre total et STABLE, indépendant de l'horloge.
--   2. La fonction range par (created_at desc, seq desc).
--   3. Le tri des bulles côté client passe aussi en (created_at, seq).
--
-- `generated always as identity` : Postgres remplit les lignes existantes
-- depuis la séquence, donc la migration est sûre sur une table déjà peuplée.
-- ==================================================

-- --------------------------------------------------
-- 1. COLONNE MONOTONE
-- --------------------------------------------------
alter table public.messages
  add column if not exists seq bigint generated always as identity;

comment on column public.messages.seq is
  'Ordre total et stable des messages. Tiebreaker d''created_at (qui peut être identique pour plusieurs messages insérés dans la même transaction).';

-- Index de tri : conversation + chronologie décroissante.
-- Remplace messages_conversation_created_idx (created_at, conversation_id),
-- désormais insuffisant puisque le tri involve seq.
drop index if exists public.messages_conversation_created_idx;

create index if not exists messages_conversation_seq_idx
  on public.messages (conversation_id, created_at desc, seq desc);

-- --------------------------------------------------
-- 2. FONCTION : RANGEMENT DÉTERMINISTE
-- --------------------------------------------------
create or replace function public.list_my_conversations()
returns table (
  id uuid,
  buyer_id uuid,
  seller_id uuid,
  seller_name text,
  seller_slug text,
  seller_logo text,
  buyer_display_name text,
  product_code text,
  product_title text,
  subject text,
  last_message text,
  last_message_at timestamptz,
  unread_count bigint,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with mine as (
    select c.*
    from public.conversations c
    where c.buyer_id = auth.uid()
       or c.seller_id in (
         select pr.id from public.producers pr where pr.user_id = auth.uid()
       )
  ),
  agg as (
    select
      m.conversation_id,
      (array_agg(m.content order by m.created_at desc, m.seq desc))[1] as last_message,
      max(m.created_at) as last_message_at,
      count(*) filter (
        where m.is_read = false and m.sender_id is distinct from auth.uid()
      ) as unread_count
    from public.messages m
    where m.conversation_id in (select mn.id from mine mn)
    group by m.conversation_id
  )
  select
    c.id,
    c.buyer_id,
    c.seller_id,
    p.name,
    p.slug,
    p.logo_url,
    nullif(bp.full_name, ''),
    c.product_code,
    c.product_title,
    c.subject,
    a.last_message,
    coalesce(a.last_message_at, c.updated_at),
    coalesce(a.unread_count, 0),
    c.created_at
  from mine c
  join public.producers p on p.id = c.seller_id
  left join public.profiles bp on bp.id = c.buyer_id
  left join agg a on a.conversation_id = c.id
  order by coalesce(a.last_message_at, c.updated_at) desc;
$$;

comment on function public.list_my_conversations() is
  'Liste les conversations de l''appelant (acheteur ou vendeur) avec dernier message et compteur de non-lus. SECURITY DEFINER : le filtre participant est appliqué explicitement, pas via RLS. Tri du dernier message déterministe (created_at, seq).';

revoke all on function public.list_my_conversations() from anon;
revoke all on function public.list_my_conversations() from public;
grant execute on function public.list_my_conversations() to authenticated;
