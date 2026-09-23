-- ==================================================
-- JEROSSA — Vérification LECTURE-SEULE des correctifs sur la base LIÉE
-- Fichier : supabase/tests/_verif_liee_etat_correctifs.sql
-- Usage   : supabase db query --linked --file supabase/tests/_verif_liee_etat_correctifs.sql
-- PRINCIPE : AUCUN DDL/DML — uniquement pg_get_functiondef + position() +
--            pg_policy (lecture). Chaque requête sort un verdict par faille.
-- ==================================================

-- [F1] create_order : garde verif statut produits + auth.uid() ?
select
  case when position('verified = true' in pg_get_functiondef(d.oid)) > 0
        and position('auth.uid()' in pg_get_functiondef(d.oid)) > 0
       then '[F1] OK : create_order garde catalogue (verified) + auth.uid()'
       else '[F1] ABSENT : create_order sans garde catalogue complète'
  end as F1_create_order
from pg_proc d
join pg_namespace dn on dn.oid = d.pronamespace
where dn.nspname = 'public' and d.proname = 'create_order'
  and d.prokind = 'f'
limit 1;

-- [F2] confirm_payment : EXECUTE révoqué pour anon/authenticated ?
select
  case when not exists (
    select 1 from information_schema.role_routine_grants g
    where g.specific_schema = 'public'
      and g.routine_name = 'confirm_payment'
      and g.grantee in ('anon', 'authenticated', 'public')
      and g.privilege_type = 'EXECUTE'
  ) then '[F2] OK : confirm_payment EXECUTE révoqué pour anon/authenticated'
       else '[F2] ABSENT : confirm_payment encore exécutable par le client'
  end as F2_confirm_payment;

-- [F3] products : policies insert/update imposent verified=false (modération) ?
select
  case when (
    select count(*) from pg_policy po
    join pg_class c on c.oid = po.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'products'
      and po.polname in ('products_insert_seller', 'products_update_seller')
      and position('verified' in coalesce(pg_get_expr(po.polwithcheck, po.polrelid), '')) > 0
      and position('false' in coalesce((pg_get_expr(po.polwithcheck, po.polrelid)), '')) > 0
  ) = 2 then '[F3] OK : insertion/modif produits verrouillées à verified=false'
       else '[F3] ABSENT : une policy products n''impose pas verified=false'
  end as F3_products_moderation
from (select 1) x;

-- [F4] messages : update-limited à sender_id = auth.uid() ?
select
  case when exists (
    select 1 from pg_policy po
    join pg_class c on c.oid = po.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'messages'
      and po.polname = 'messages_update_own'
      and position('sender_id' in coalesce(pg_get_expr(po.polqual, po.polrelid), '')) > 0
      and position('auth.uid()' in coalesce(pg_get_expr(po.polqual, po.polrelid), '')) > 0
  ) then '[F4] OK : messages restreints à sender_id = auth.uid()'
       else '[F4] ABSENT : messages_update_own pas restreinte'
  end as F4_messages
from (select 1) x;

-- [F5] create_quote_request : lie user_id à auth.uid() (pas à un id client) ?
select
  case when exists (
    select 1 from pg_proc d
    join pg_namespace dn on dn.oid = d.pronamespace
    where dn.nspname = 'public' and d.proname = 'create_quote_request'
      and position('auth.uid()' in pg_get_functiondef(d.oid)) > 0
  ) then '[F5] OK : create_quote_request lie bien auth.uid()'
       else '[F5] ABSENT : create_quote_request sans garde auth.uid()'
  end as F5_quote
from (select 1) x;

-- ==================================================
-- SYNTHÈSE
-- ==================================================
select '=== 5/5 correctifs vérifiés en LECTURE SEULE sur la base liée ===' as synthese;
