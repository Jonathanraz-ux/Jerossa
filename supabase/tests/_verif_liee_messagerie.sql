-- ==================================================
-- JEROSSA — Vérification LECTURE-SEULE : état de la messagerie
-- Fichier : supabase/tests/_verif_liee_messagerie.sql
-- Usage   : supabase db query --linked --file supabase/tests/_verif_liee_messagerie.sql
--
-- PRINCIPE : AUCUN DDL/DML — lecture seule (pg_publication_tables,
--            pg_proc, information_schema, pg_policies, pg_indexes).
-- SORTIE   : UNE seule ligne de verdicts (la CLI n'affiche que le dernier
--            jeu de résultats, d'où une requête agrégée).
-- ==================================================
with fn as (
  select
    d.oid,
    d.prosecdef,
    pg_get_functiondef(d.oid)::text as def,
    -- Signature de RETOUR effective : liste ordonnee des colonnes exposees
    -- au client (les OUT d'un RETURNS TABLE n'apparaissent PAS dans
    -- proargnames, qui ne contient que les arguments d'ENTREE).
    pg_get_function_result(d.oid)::text as result_sig
  from pg_proc d
  join pg_namespace n on n.oid = d.pronamespace
  where n.nspname = 'public'
    and d.proname = 'list_my_conversations'
    and d.prokind = 'f'
  limit 1
),
published as (
  select
    exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
    ) as messages,
    exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations'
    ) as conversations
)
select
  -- [M1] Realtime sur messages : sans publication, aucun message entrant n'est
  --      poussé et le chat ne se remplit qu'au rechargement de page.
  case when published.messages
    then 'OK      messages est dans supabase_realtime'
    else 'ABSENT  messages HORS publication -> chat sans push'
  end as m1_realtime_messages,

  -- [M2] Realtime sur conversations (badge de non-lus en direct).
  case when published.conversations
    then 'OK      conversations est dans supabase_realtime'
    else 'INFO    conversations hors publication (badge moins temps reel)'
  end as m2_realtime_conversations,

  -- [M3] La fonction doit exister et n'etre accessible qu'a authenticated
  --      (la cle anon est publique dans le bundle).
  case
    when (select count(*) from fn) = 0
      then 'ABSENT  list_my_conversations introuvable -> boite de reception vide'
    when exists (
      select 1 from information_schema.role_routine_grants g
      where g.specific_schema = 'public'
        and g.routine_name = 'list_my_conversations'
        and g.grantee in ('anon', 'public')
        and g.privilege_type = 'EXECUTE'
    ) then 'FUITE   list_my_conversations executable par anon/public'
    else 'OK      list_my_conversations reservee a authenticated'
  end as m3_rpc_grants,

  -- [M4] SECURITY DEFINER (contourne la RLS profiles pour le libelle de
  --      l'acheteur) + filtre participant explicite (sinon pas de
  --      cloisonnement, la RLS n'etant pas appliquee).
  case
    when (select count(*) from fn) = 0
      then 'ABSENT  list_my_conversations introuvable'
    when not (select prosecdef from fn)
      then 'ABSENT  list_my_conversations n''est pas SECURITY DEFINER'
    when (select position('auth.uid()' in def) from fn) = 0
       or (select position('buyer_id = auth.uid()' in def) from fn) = 0
      then 'ABSENT  list_my_conversations sans garde auth.uid() / buyer_id'
    else 'OK      SECURITY DEFINER + filtre participants explicite'
  end as m4_rpc_guard,

  -- [M5] Aucun email en clair : la messagerie sert justement a eviter le
  --      contact direct acheteur/vendeur. On teste l'ACCES REEL a une
  --      colonne de contact : signature de retour (colonnes exposees) et
  --      corps de la fonction — pas le mot "email" dans un commentaire.
  case
    when (select count(*) from fn) = 0
      then 'ABSENT  list_my_conversations introuvable'
    when (select result_sig from fn) ~* 'email|mail|phone'
      then 'FUITE   une colonne de retour expose une donnee de contact'
    when (select def from fn) ~ '\.email'
      then 'FUITE   le corps reference une colonne email'
    else 'OK      aucune colonne email exposee au vendeur'
  end as m5_no_email_leak,

  -- [M6] La RLS de lecture conditionne le PostgREST ET la diffusion
  --      Realtime : sans elle, chaque abonne recoit tous les messages.
  case when exists (
    select 1 from pg_policy po
    join pg_class c on c.oid = po.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'messages'
      and po.polname = 'messages_select_participant'
  ) then 'OK      messages_select_participant presente'
    else 'ABSENT  policy messages_select_participant manquante (fuite)'
  end as m6_messages_select_rls,

  -- [M7] Index de support des aggregations de la boite de reception.
  --      L'index porte les DEUX colonnes de tri : created_at seul n'est pas
  --      un tri total (migration 20260928000002).
  case when exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'messages_conversation_seq_idx'
  ) then 'OK      index de tri (conversation, created_at, seq) present'
    else 'PARTIEL index messages_conversation_seq_idx absent'
  end as m7_index,

  -- [M8] Chronologie deterministe : la colonne `seq` (identity) doit exister
  --      ET le corps de la fonction doit trier dessus. Sans elle, deux
  --      messages inseres dans la meme transaction partagent le meme
  --      created_at (now() fige au debut de transaction) et la fonction
  --      renvoie un "dernier message" arbitraire — bug PROUVE en base liee.
  case
    when not exists (
      select 1 from pg_attribute a
      join pg_class c on c.oid = a.attrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'messages'
        and a.attname = 'seq' and a.attnum > 0 and not a.attisdropped
    ) then 'ABSENT  colonne messages.seq absente -> ex-aequo de created_at non tranche'
    when (select count(*) from fn) = 0
      then 'ABSENT  list_my_conversations introuvable'
    when (select def from fn) !~ 'seq'
      then 'ABSENT  le dernier message n''est pas trie par seq (tri non deterministe)'
    else 'OK      colonne seq presente + dernier message trie par (created_at, seq)'
  end as m8_chronologie
from published;
