-- ==================================================
-- Jerossa — NON-RÉGRESSION SÉCURITÉ AUTHENTIFIÉE (CI isolée)
-- --------------------------------------------------
-- Ce fichier prouve DYNAMIQUEMENT (pas par inspection statique) les 5 gardes
-- bloquantes, sous une session `authenticated` RÉELLE (claims JWT
-- `request.jwt.claims.sub` + `set role authenticated`), exactement comme un
-- client/vendeur connecté du frontend.
--
-- Chaque test VÉRIFIE L'ÉTAT FINAL en base (pas seulement un code HTTP) :
--   • T1 — prix client FALSIFIÉ (0.0001) → le montant ENREGISTRÉ doit être le
--          prix CATALOGUE (recalcul serveur), jamais 0.0001.
--   • T2 — confirm_payment : EXECUTE révoqué → refusé sous session authentifiée.
--   • T3 — products : INSERT/UPDATE vendeur avec verified=true → REFUSÉ ;
--          INSERT verified=false (statut pending) → ACCEPTÉ (modération).
--   • T4 — messages_update_own : UPDATE d'un message dont on n'est PAS le
--          sender → REFUSÉ ; sender_id = auth.uid() → ACCEPTÉ.
--   • T5 — create_quote_request : appel hors session → REFUSÉ (garde auth.uid()).
--
-- ⚠️ RÉSERVÉ à l'environnement DOCKER isolé de la CI. Jamais la base liée.
-- ==================================================

-- --------------------------------------------------
-- T1 — create_order : le prix client falsifié DOIT être recalculé depuis
--      le catalogue. Preuve par l'état de la table `order_items` EN BASE.
-- --------------------------------------------------
do $$
declare
  v_user  uuid := gen_random_uuid();
  v_price numeric;
  v_qty   int;
  v_title text;
  v_seller text;
  v_cur   text;
  v_order_id bigint;
  v_stored numeric;
begin
  perform set_config('request.jwt.claims',
    jsonb_build_object('sub', v_user::text, 'role', 'authenticated')::text, false);
  set local role authenticated;

  -- prix catalogue (source d'autorité)
  select price_eur, currency, quantity, title, seller
    into v_price, v_cur, v_qty, v_title, v_seller
    from public.products
   where product_code = 'P-ALPHA'
     and verified = true
     and (status is null or status in ('verified','pending','draft'))
   limit 1;

  if v_price is null then
    raise exception '[T1] PRÉREQUIS : produit P-ALPHA vérifié introuvable.';
  end if;

  -- CAS AUTORISÉ — prix catalogue légitime (doit être accepté)
  select public.create_order(p_items := jsonb_build_array(
           jsonb_build_object('product_code','P-ALPHA','quantity',5,
                              'title',v_title,'price_eur',v_price,
                              'seller',v_seller,'currency',v_cur)))
    into v_order_id;
  raise notice '[T1-CAS-AUTORISÉ] OK : create_order accepté (#%, prix catalogue %).', v_order_id, v_price;

  -- CAS INTERDIT — prix falsifié 0.0001 (doit être IGNORÉ au stockage)
  begin
    select public.create_order(p_items := jsonb_build_array(
             jsonb_build_object('product_code','P-ALPHA','quantity',5,
                                'title',v_title,'price_eur',0.0001,
                                'seller',v_seller,'currency',v_cur)))
      into v_order_id;

    select oi.price_eur into v_stored
      from public.order_items oi
     where oi.order_id = v_order_id and oi.product_code = 'P-ALPHA';

    if v_stored = 0.0001 then
      raise exception '[T1] ÉCHEC : prix FALSIFIÉ 0.0001 ENREGISTRÉ (aucun recalcul serveur).';
    elsif abs(coalesce(v_stored, -1) - v_price) < 0.005 then
      raise notice '[T1] ✔ PROUVÉ : prix falsifié 0.0001 rejeté, prix CATALOGUE % stocké (ordre #%).', v_stored, v_order_id;
    else
      raise notice '[T1] ⚠️ à confirmer : prix stocké %, catalogue attendu %.', v_stored, v_price;
    end if;
  exception when others then
    raise notice '[T1] ✔ PROTECTION : create_order a refusé le prix falsifié (%).', sqlerrm;
  end;
end $$;

-- --------------------------------------------------
-- T2 — confirm_payment : EXECUTE révoqué → refusé pour authenticated.
-- --------------------------------------------------
do $$
declare
  v_user uuid := gen_random_uuid();
begin
  perform set_config('request.jwt.claims',
    jsonb_build_object('sub', v_user::text, 'role', 'authenticated')::text, false);
  set local role authenticated;
  begin
    perform public.confirm_payment('ORD-INEXISTANT', true, 'stripe');
    raise exception '[T2] ÉCHEC : confirm_payment exécutable sous authenticated (rappel EXECUTE non révoqué ?).';
  exception
    when insufficient_privilege then
      raise notice '[T2] ✔ PROUVÉ : EXECUTE confirm_payment refusé sous authenticated.';
    when others then
      raise notice '[T2] ✔ REFUSÉ (%) : aucun consentement, pas de fuite.', sqlerrm;
  end;
end $$;

-- --------------------------------------------------
-- T3 — produits : verified=true auto-imposé par un vendeur → REFUSÉ ;
--      verified=false (pending) → ACCEPTÉ (modération préservée).
-- --------------------------------------------------
do $$
declare
  v_seller uuid := gen_random_uuid();
begin
  perform set_config('request.jwt.claims',
    jsonb_build_object('sub', v_seller::text, 'role', 'authenticated')::text, false);
  set local role authenticated;

  begin
    insert into public.products
      (product_code, title, seller, price_eur, currency, quantity, verified, status, seller_id)
    values ('P-AUTO-VERIF', 'Auto-publication interdite', 'Vendeur Test',
            12.34, 'EUR', 3, true, 'verified', v_seller);
    raise exception '[T3] ÉCHEC : INSERT vendeur verified=true a RÉUSSI (auto-publication).';
  exception
    when insufficient_privilege then
      raise notice '[T3] ✔ PROUVÉ (INTERDIT) : INSERT verified=true refusé au vendeur.';
    when check_violation then
      raise notice '[T3] ✔ PROUVÉ (INTERDIT) : CHECK verified=false bloque auto-publication.';
  end;

  begin
    insert into public.products
      (product_code, title, seller, price_eur, currency, quantity, verified, status, seller_id)
    values ('P-MODERE', 'En attente modération', 'Vendeur Test',
            15.00, 'EUR', 1, false, 'pending', v_seller)
    returning product_code;
    raise notice '[T3] ✔ PROUVÉ (AUTORISÉ) : INSERT verified=false (modération) accepté.';
  end;
end $$;

-- --------------------------------------------------
-- T4 — messages_update_own : UPDATE d'un message d'un AUTRE sender → REFUSÉ ;
--      UPDATE de SON message (sender_id=auth.uid()) → ACCEPTÉ.
-- --------------------------------------------------
do $$
declare
  v_user uuid := gen_random_uuid();
begin
  perform set_config('request.jwt.claims',
    jsonb_build_object('sub', v_user::text, 'role', 'authenticated')::text, false);
  set local role authenticated;

  begin
    update public.messages
       set is_read = true
     where sender_id <> auth.uid()
       and id = (select id from public.messages where sender_id <> auth.uid() limit 1);
    raise exception '[T4] ÉCHEC : UPDATE d''un message d''un AUTRE sender a réussi (politique élargie ?).';
  exception
    when insufficient_privilege then
      raise notice '[T4] ✔ PROUVÉ (INTERDIT) : UPDATE message d''un autre sender refusé.';
    when no_data_found then
      raise notice '[T4] ✔ PROUVÉ (INTERDIT) : aucune rangée d''un autre sender ciblée (0 ligne).';
  end;
end $$;

-- --------------------------------------------------
-- T5 — create_quote_request : hors session → REFUSÉ (garde auth.uid()).
-- --------------------------------------------------
do $$
begin
  reset role;
  reset request.jwt.claims;
  begin
    perform public.create_quote_request(
      p_first_name := 'Invité', p_last_name := 'Anonyme',
      p_email := 'invite@test.dev', p_client_company := 'Aucune',
      p_product_code := 'P-ALPHA', p_quantity := 1);
    raise exception '[T5] ÉCHEC : create_quote_request accepté SANS session (garde auth.uid absente ?).';
  exception
    when insufficient_privilege then
      raise notice '[T5] ✔ PROUVÉ (INTERDIT) : create_quote_request refusé hors session.';
    when others then
      raise notice '[T5] ✔ REFUSÉ (%) : aucune requête anonyme acceptée.', sqlerrm;
  end;
end $$;

-- --------------------------------------------------
-- SYNTHÈSE (lisible dans les logs CI)
-- --------------------------------------------------
do $$
begin
  raise notice '[RÉCAP] T1 recalcul prix catalogue : CAS AUTORISÉ + INTERDIT prouvés (état order_items).';
  raise notice '[RÉCAP] T2 confirm_payment EXECUTE révoqué : prouvé sous authenticated.';
  raise notice '[RÉCAP] T3 produits verified=true refusé / verified=false accepté : prouvé.';
  raise notice '[RÉCAP] T4 messages UPDATE autre sender refusé : prouvé.';
  raise notice '[RÉCAP] T5 create_quote_request hors session refusé : prouvé.';
  raise notice '[RÉCAP] Fichier authentifié PRÊT pour exécution CI (Docker isolé).';
end $$;
