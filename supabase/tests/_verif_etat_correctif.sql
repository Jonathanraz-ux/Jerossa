-- ==================================================
-- JEROSSA — VÉRIFICATION LECTURE-SEULE (jamais d'écriture)
-- Usage : supabase db query --linked --file verif_state_correctif.sql
-- Objectif : déterminer si la migration corrective 20260923000001
--            est VRAIMENT en place sur la base liée, sans rien modifier.
-- Chaque SELECT renvoie une ligne de preuve ; aucun DDL/DML.
-- ==================================================

-- [V1] create_order : le corps contient-il le recalcul catalogue
--      (lecture du catalogue + auth.uid) — O/N
select
  case when position('verified' in a.fn_def) > 0
            and position('auth.uid()' in a.fn_def) > 0
       then 'CORRECTIF-EN-PLACE'
       else 'ABSENT' end as create_order_etat
from (
  select pg_get_functiondef('public.create_order(public.jsonb, numeric, numeric, numeric, text, text, public.jsonb)'::regprocedure)::text as fn_def
) a;

-- [V2] confirm_payment : privilège EXECUTE révoqué pour anon/authenticated — O/N
select
  case when (
    select count(*) from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'confirm_payment'
      and not exists (
        select 1 from information_schema.role_routine_grants g
        join pg_proc p2 on p2.oid = concat('public.', g.routine_name)::regprocedure
        where g.routine_schema = g.specific_schema
          and g.grantee in ('anon','authenticated','public')
      )
  ) > 0 then 'REVOQUE'
  else 'NON-REVOQUE' end as confirm_payment_revoke_etat;

-- [V3] produits : l'INSERT/UPDATE vendeur impose-t-il verified = false — O/N (via pg_get_expr des policies)
select
  case when (
    select count(*) from pg_policy po
    join pg_class rc on rc.oid = po.polrelid
    join pg_namespace rn on rn.oid = rc.relnamespace
    where rn.nspname = 'public' and rc.relname = 'products'
      and po.polname in ('products_insert_seller', 'products_update_seller')
      and position('verified' in coalesce(pg_get_expr(po.polwithcheck, po.polrelid), '')) > 0
  ) = 2 then 'MODERATION-RESTAUREE'
  else 'MODERATION-ABSENTE' end as products_moderation_etat;

-- [V4] messages : UPDATE restreint à sender_id = auth.uid() — O/N
select
  case when (
    select count(*) from pg_policy po
    join pg_class rc on rc.oid = po.polrelid
    join pg_namespace rn on rn.oid = rc.relnamespace
    where rn.nspname = 'public' and rc.relname = 'messages'
      and po.polname = 'messages_update_own'
      and position('sender_id' in coalesce(pg_get_expr(po.polqual, po.polrelid), '')) > 0
      and position('auth.uid()' in coalesce(pg_get_expr(po.polqual, po.polrelid), '')) > 0
  ) = 1 then 'RESTREINT-AUTH-UID'
  else 'ELARGI-OU-ABSENT' end as messages_update_etat;

-- [V5] create_quote_request : garde auth.uid() dans le corps — O/N
select
  case when (
    select count(*) from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'create_quote_request'
      and position('auth.uid()' in pg_get_functiondef(p.oid)) > 0
  ) > 0 then 'GARDE-AUTH'
  else 'SANS-GARDE' end as quote_guard_etat;
