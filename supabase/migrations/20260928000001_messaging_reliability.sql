-- ==================================================
-- MIGRATION CORRECTIVE — Jerossa — Fiabilisation messagerie
-- Fichier : 20260928000001_messaging_reliability.sql
-- Nature  : ADDITIVE (surcouche). Aucune migration appliquée n'est réécrite.
--
-- Couvre les défauts bloquants de la messagerie (client + vendeur) :
--   1. list_my_conversations : la liste des conversations est désormais
--      calculée en UN seul aller-retour (dernier message + compteur non lus
--      + nom d'affichage de l'interlocuteur), au lieu de 2 requêtes par
--      conversation depuis le navigateur.
--   2. Nom du counterpart : public.profiles est en RLS « propriétaire seul »
--      et ne possède AUCUNE colonne email. Le client lisait donc
--      « id, full_name, email » => erreur PostgREST silencieusement avalée =>
--      le vendeur voyait toujours « Client ». La fonction expose désormais
--      le libellé du counterpart sans jamais divulguer d'email.
--   3. Publication Realtime : garantie idempotente que public.messages ET
--      public.conversations figurent bien dans supabase_realtime, sans
--      casser une publication existante.
--
-- Principe : SECURITY DEFINER + filtre explicite sur auth.uid(), donc
-- aucune ligne ne sort du périmètre de l'appelant (RLS non contournée).
-- ==================================================

-- --------------------------------------------------
-- 1. RPC LIST_MY_CONVERSATIONS
-- --------------------------------------------------
-- Source unique de vérité pour la boîte de réception (client ET vendeur).
-- Une seule requête, donc plus de motif N+1 (2 requêtes par conversation,
-- ré-exécutées par la Navbar, Mon compte, l'espace vendeur et les 2 écrans
-- de messagerie à chaque rafraîchissement de badge).
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
      (array_agg(m.content order by m.created_at desc))[1] as last_message,
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
    -- Libellé de l'acheteur vu par le vendeur. Jamais d'email en clair :
    -- la messagerie sert justement à éviter le contact direct.
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
  'Liste les conversations de l''appelant (acheteur ou vendeur) avec dernier message et compteur de non-lus. SECURITY DEFINER : le filtre participant est appliqué explicitement, pas via RLS.';

revoke all on function public.list_my_conversations() from anon;
revoke all on function public.list_my_conversations() from public;
grant execute on function public.list_my_conversations() to authenticated;

-- Index de support des agrégations de la fonction (dernier message par
-- conversation). Utile dès que la table messages grossit.
create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at desc);

-- --------------------------------------------------
-- 2. PUBLICATION REALTIME (idempotente)
-- --------------------------------------------------
-- Sans cet abonnement, aucun message entrant n'est poussé : le chat se
-- remplissait uniquement au rechargement de page. Le garde rend la
-- migration rejouable sans casser une publication déjà configurée.
do $$
declare
  v_missing text;
begin
  select string_agg(t, ', ')
    into v_missing
  from (
    select t
    from unnest(array['messages', 'conversations']) as t
    where not exists (
      select 1
      from pg_publication_tables pt
      where pt.pubname = 'supabase_realtime'
        and pt.schemaname = 'public'
        and pt.tablename = t
    )
  ) pending;

  if v_missing is not null then
    raise notice 'Messaging realtime: publication des tables manquantes (%)', v_missing;
    if v_missing like '%messages%' then
      alter publication supabase_realtime add table public.messages;
    end if;
    if v_missing like '%conversations%' then
      alter publication supabase_realtime add table public.conversations;
    end if;
  else
    raise notice 'Messaging realtime: publication déjà complète, rien à faire';
  end if;
end $$;
