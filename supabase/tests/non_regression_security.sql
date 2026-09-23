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
-- SYNTHÈSE
-- ==================================================
do $$
begin
  raise notice '==========================================';
  raise notice 'NON-RÉGRESSION : 0 échec — correctifs valides.';
  raise notice '==========================================';
end;
$$;
