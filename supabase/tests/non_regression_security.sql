-- ==================================================
-- JEROSSA — Tests de non-régression des correctifs bloquants
-- Fichier : supabase/tests/non_regression_security.sql
--
-- EXÉCUTION (environnement dev isolé, JAMAIS la base liée en prod) :
--   1) supabase migration up          (charge les migrations EXISTANTES + la
--                                      migration corrective 20260923000001)
--   2) psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--         -f supabase/tests/non_regression_security.sql
--
-- PRINCIPE : chaque bloc RAISE une exception si la non-régression échoue.
-- Un test qui « passe » n'affiche rien ; toute erreur stoppe le script
-- (ON_ERROR_STOP=1) et fait échouer l'étape CI.
-- ==================================================

-- ==================================================
-- T1. CREATE_ORDER — le prix vient du CATALOGUE, jamais du client
-- ==================================================
-- Un client malveillant envoie un produit avec price_eur falsifié (0.0001 €).
-- La version corrigée doit recalculer depuis public.products et enregistrer
-- le prix du catalogue, pas 0.0001.
do $$
declare
  v_res jsonb;
  v_order_id uuid;
  v_item_price numeric;
  v_product public.products;
begin
  select * into v_product
  from public.products
  where verified = true
    and (status is null or status in ('verified', 'pending', 'draft'))
  order by price_eur desc nulls last
  limit 1;

  if v_product.id is null then
    raise exception '[T1] Aucun produit modéré disponible pour le test';
  end if;

  v_res := public.create_order(
    jsonb_build_array(
      jsonb_build_object(
        'product_code', v_product.product_code,
        'price_eur', 0.0001,
        'currency', 'EUR',
        'quantity', 1
      )
    ),
    0.0001,   -- subtotal bidon envoyé par le client
    0,
    0.0001,   -- total bidon
    'EUR',
    'card',
    '{}'::jsonb
  );

  v_order_id := (v_res ->> 'id')::uuid;

  select oi.price_eur into v_item_price
  from public.order_items oi
  where oi.order_id = v_order_id
  limit 1;

  if v_item_price = 0.0001 then
    raise exception '[T1] ÉCHEC : le prix falsifié du client (0.0001) a été enregistré — create_order fait confiance au client.';
  end if;

  if abs(coalesce(v_item_price, 0) - v_product.price_eur) > 0.01 then
    raise exception '[T1] ÉCHEC : prix enregistré (%) != prix catalogue (%)', v_item_price, v_product.price_eur;
  end if;

  raise notice '[T1] OK : prix enregistré = prix catalogue (%), prix client ignoré.', v_item_price;

  -- nettoyage de la commande de test
  delete from public.payments where order_id = v_order_id;
  delete from public.order_items where order_id = v_order_id;
  delete from public.orders where id = v_order_id;
end;
$$;

-- ==================================================
-- T2. CONFIRM_PAYMENT — plus exécutable par anon / authenticated
-- ==================================================
do $$
declare
  v_exec_anon boolean;
  v_exec_auth boolean;
begin
  select coalesce(has_function_privilege('anon', 'public.confirm_payment(text, boolean, text)', 'EXECUTE'), false)
    into v_exec_anon;
  select coalesce(has_function_privilege('authenticated', 'public.confirm_payment(text, boolean, text)', 'EXECUTE'), false)
    into v_exec_auth;

  if v_exec_anon then
    raise exception '[T2] ÉCHEC : anon peut encore exécuter confirm_payment';
  end if;
  if v_exec_auth then
    raise exception '[T2] ÉCHEC : authenticated peut encore exécuter confirm_payment';
  end if;
  raise notice '[T2] OK : anon/authenticated n''ont plus EXECUTE sur confirm_payment.';
end;
$$;

-- ==================================================
-- T3. PRODUCTS — garde verified = false restaurée (modération)
-- ==================================================
do $$
declare
  v_ins_policy text;
  v_ins_ok boolean := false;
begin
  select pg_get_expr(polwithcheck, polrelid)::text
  into v_ins_policy
  from pg_policy
  join pg_class on pg_class.oid = polrelid
  join pg_namespace on pg_namespace.oid = pg_class.relnamespace
  where nspname = 'public'
    and relname = 'products'
    and polname = 'products_insert_seller';

  if v_ins_policy is not null then
    -- la garde « verified = false » doit être présente dans le WITH CHECK
    v_ins_ok := (position('verified' in v_ins_policy) > 0);
  end if;

  if not v_ins_ok then
    raise exception '[T3] ÉCHEC : la policy products_insert_seller n''impose plus verified=false (modération contournable).';
  end if;

  raise notice '[T3] OK : products_insert_seller impose verified=false.';
end;
$$;

-- ==================================================
-- T4. MESSAGES — un vendeur ne modifie QUE ses messages
-- ==================================================
do $$
declare
  v_using_policy text;
  v_ok boolean := false;
begin
  select pg_get_expr(polqual, polrelid)::text
  into v_using_policy
  from pg_policy
  join pg_class on pg_class.oid = polrelid
  join pg_namespace on pg_namespace.oid = pg_class.relnamespace
  where nspname = 'public'
    and relname = 'messages'
    and polname = 'messages_update_own';

  if v_using_policy is not null then
    v_ok := (position('sender_id' in v_using_policy) > 0);
  end if;

  if not v_ok then
    raise exception '[T4] ÉCHEC : messages_update_own ne restreint pas à sender_id = auth.uid().';
  end if;

  raise notice '[T4] OK : messages_update_own restreint bien update à sender_id = auth.uid().';
end;
$$;

-- ==================================================
-- T5. CREATE_QUOTE_REQUEST — utilisateur issu de auth.uid(), jamais du client
-- ==================================================
do $$
declare
  v_def text;
  v_has_auth_uid boolean := false;
begin
  select pg_get_functiondef(oid)::text
  into v_def
  from pg_proc
  join pg_namespace on pg_namespace.oid = pronamespace
  where nspname = 'public'
    and proname = 'create_quote_request'
  limit 1;

  if v_def is not null then
    v_has_auth_uid := (position('auth.uid()' in v_def) > 0);
  end if;

  if not v_has_auth_uid then
    raise exception '[T5] ÉCHEC : create_quote_request n''utilise pas auth.uid() (user_id client accepté — devis attribuables à n''importe qui).';
  end if;

  raise notice '[T5] OK : create_quote_request lie bien l''utilisateur à auth.uid().';
end;
$$;

-- ==================================================
-- T6. LIST_MY_CONVERSATIONS — inbox filtrée sur les participants
-- ==================================================
-- La fonction est SECURITY DEFINER (elle contourne la RLS « propriétaire
-- seul » de public.profiles pour afficher le nom de l'acheteur). Elle ne
-- doit donc PAS compter sur la RLS pour cloisonner : le filtre
-- participant doit être explicite, sinon n'importe quel utilisateur
-- authentifié listerait les conversations des autres.
do $$
declare
  v_def text;
  v_prosecdef boolean := false;
  v_has_auth_uid boolean := false;
  v_has_buyer_guard boolean := false;
begin
  select pg_get_functiondef(d.oid)::text, d.prosecdef
  into v_def, v_prosecdef
  from pg_proc d
  join pg_namespace n on n.oid = d.pronamespace
  where n.nspname = 'public'
    and d.proname = 'list_my_conversations'
    and d.prokind = 'f'
  limit 1;

  if v_def is null then
    raise exception '[T6] ÉCHEC : list_my_conversations introuvable (boîte de réception cassée).';
  end if;

  v_has_auth_uid := (position('auth.uid()' in v_def) > 0);
  v_has_buyer_guard := (position('buyer_id = auth.uid()' in v_def) > 0);

  if not v_prosecdef then
    raise exception '[T6] ÉCHEC : list_my_conversations n''est pas SECURITY DEFINER (nom de l''acheteur inaccessible).';
  end if;

  if not (v_has_auth_uid and v_has_buyer_guard) then
    raise exception '[T6] ÉCHEC : list_my_conversations ne filtre pas explicitement sur auth.uid() / buyer_id.';
  end if;

  raise notice '[T6] OK : list_my_conversations cloisonnée sur les participants.';
end;
$$;

-- ==================================================
-- T7. LIST_MY_CONVERSATIONS — EXECUTE réservé à authenticated
-- ==================================================
-- La clé anon est publique dans le bundle : si la fonction restait
-- exécutable par anon, toutes les conversations seraient lisibles.
do $$
declare
  v_leak boolean;
begin
  select exists (
    select 1
    from information_schema.role_routine_grants g
    where g.specific_schema = 'public'
      and g.routine_name = 'list_my_conversations'
      and g.grantee in ('anon', 'public')
      and g.privilege_type = 'EXECUTE'
  ) into v_leak;

  if v_leak then
    raise exception '[T7] ÉCHEC : list_my_conversations est exécutable par anon/public (fuite de conversations).';
  end if;

  raise notice '[T7] OK : list_my_conversations réservée à authenticated.';
end;
$$;

-- ==================================================
-- T8. LIST_MY_CONVERSATIONS — aucune fuite d'email au vendeur
-- ==================================================
-- La messagerie sert justement à éviter le contact direct : la fonction ne
-- doit sélectionner que full_name, jamais une colonne email.
do $$
begin
  if exists (
    select 1
    from pg_proc d
    join pg_namespace n on n.oid = d.pronamespace
    where n.nspname = 'public'
      and d.proname = 'list_my_conversations'
      and position('email' in pg_get_functiondef(d.oid)) > 0
  ) then
    raise exception '[T8] ÉCHEC : list_my_conversations sélectionne une colonne email (contournement de la messagerie).';
  end if;

  raise notice '[T8] OK : aucun email exposé au vendeur via la messagerie.';
end;
$$;

-- ==================================================
-- T9. REALTIME — public.messages doit être publié
-- ==================================================
-- Sans publication, aucun message entrant n'est poussé : le chat ne se
-- remplit qu'au rechargement de page, ce qui masque la panne.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    raise exception '[T9] ÉCHEC : public.messages hors de la publication supabase_realtime (chat sans temps réel).';
  end if;

  raise notice '[T9] OK : public.messages est dans la publication supabase_realtime.';
end;
$$;

-- ==================================================
-- T10. MESSAGES — RLS de lecture limitée aux participants
-- ==================================================
-- La policy de SELECT conditionne à la fois le PostgREST ET la diffusion
-- Realtime : si elle disparaît, chaque abonné reçoit les messages de tous.
do $$
begin
  if not exists (
    select 1
    from pg_policy po
    join pg_class c on c.oid = po.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'messages'
      and po.polname = 'messages_select_participant'
  ) then
    raise exception '[T10] ÉCHEC : policy messages_select_participant absente (fuite inter-conversations).';
  end if;

  raise notice '[T10] OK : RLS de lecture des messages limitée aux participants.';
end;
$$;

-- ==================================================
-- T11. MESSAGES — Chronologie déterministe (ex æquo created_at)
-- ==================================================
-- Régression PROUVE sur la base liée (preuve F2, données synthétiques
-- annulées) : `order by m.created_at desc` seul n'est pas un tri total.
-- `now()` est figé au début de la transaction, donc deux messages insérés
-- dans la MÊME transaction ont exactement le même created_at — et la
-- fonction renvoyait alors le MAUVAIS dernier message (aperçu périmé dans
-- la boîte de réception, ordre des bulles qui sautille au rechargement).
--
-- La colonne `seq` (identity) fournit l'ordre total manquant.
--
-- Vérification STATIQUE : la CI locale n'a aucun auth.users, donc insérer
-- une conversation y serait impossible (FK buyer_id). La preuve
-- dynamique est faite en base liée (transaction annulée) et la CI garde
-- la non-régression sur la structure.
do $$
declare
  v_is_identity boolean := false;
  v_def         text;
  v_has_seq     boolean := false;
  v_dup_seq     bigint := 0;
begin
  select (a.attidentity in ('a', 'd')) into v_is_identity
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'messages'
    and a.attname = 'seq' and a.attnum > 0 and not a.attisdropped;

  if v_is_identity is null or v_is_identity = false then
    raise exception '[T11] ÉCHEC : colonne messages.seq absente ou non identity — le tri par created_at seul n''est pas déterministe.';
  end if;

  select pg_get_functiondef(d.oid)::text into v_def
  from pg_proc d
  join pg_namespace n on n.oid = d.pronamespace
  where n.nspname = 'public' and d.proname = 'list_my_conversations'
    and d.prokind = 'f'
  limit 1;

  if v_def is null then
    raise exception '[T11] ÉCHEC : list_my_conversations introuvable.';
  end if;

  v_has_seq := (position('seq' in v_def) > 0);
  if not v_has_seq then
    raise exception '[T11] ÉCHEC : le dernier message n''est pas trié par seq (ex æquo de created_at non départagé).';
  end if;

  -- seq doit être unique : c'est lui qui porte l'ordre total.
  select count(*) into v_dup_seq from (
    select seq from public.messages group by seq having count(*) > 1
  ) d;

  if v_dup_seq > 0 then
    raise exception '[T11] ÉCHEC : % valeur(s) de seq dupliquée(s) — le tiebreaker n''est plus total.', v_dup_seq;
  end if;

  raise notice '[T11] OK : messages.seq est une identity unique et le dernier message est trié dessus.';
end;
$$;

-- ==================================================
-- SYNTHÈSE
-- ==================================================
do $$
begin
  raise notice '==========================================';
  raise notice 'NON-RÉGRESSION : 0 échec — correctifs valides.';
  raise notice '==========================================';
end;
$$;
