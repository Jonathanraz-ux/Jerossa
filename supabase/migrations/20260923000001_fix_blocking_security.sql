-- ==================================================
-- MIGRATION CORRECTIVE — Jerossa — Correctifs bloquants
-- Fichier : 20260923000001_fix_blocking_security.sql
-- Nature  : ADDITIVE (surcouche). Aucune migration appliquée n'est réécrite.
--
-- Couvre les failles bloquantes de l'audit 2026-09-23 :
--   3.1 (critique)  create_order : prix/quantités recalculés côté serveur
--                   depuis le catalogue public.products — jamais depuis le
--                   JSON envoyé par le client.
--   3.2 (critique)  confirm_payment : n'est plus exécutable par anon /
--                   authenticated / public (réservé service_role / webhook).
--   3.3 (élevée)    products_insert_seller / products_update_seller :
--                   garde verified = false restaurée (anti-contournement
--                   de la modération produits).
--   3.4 (moyenne)   messages_update_own : un vendeur ne peut plus modifier
--                   les messages de l'acheteur (retour à sender_id = auth.uid()).
-- Principe : ne JAMAIS faire confiance aux valeurs monétaires / de quantité
-- fournies par le client ; la seule source de vérité est la table products.
-- ==================================================

-- ==================================================
-- 1. CREATE_ORDER : prix et quantités issus du CATALOGUE (serveur)
-- ==================================================
create or replace function public.create_order(
  p_items jsonb,
  p_subtotal numeric,
  p_shipping_fee numeric,
  p_total numeric,
  p_currency text,
  p_payment_method text,
  p_address jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_user_id uuid := auth.uid();
  v_seller_id uuid;
  v_is_paused boolean;
  v_computed_subtotal numeric := 0;
  v_item_price numeric;
  v_item_qty int;
  v_product_code text;
  v_catalog_product public.products;
  v_item_currency text;
begin
  if v_user_id is null then
    raise exception 'Vous devez être connecté pour passer une commande.';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Panier vide';
  end if;

  -- ==================================================
  -- SÉCURITÉ : chaque article est re-reporté au catalogue.
  -- Le prix, la devise, le titre, le vendeur et la quantité sont repris
  -- UNIQUEMENT depuis public.products. Les valeurs envoyées par le client
  -- (price_eur, currency, seller, title, quantity) sont IGNORÉES.
  -- ==================================================
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_code := v_item ->> 'product_code';

    IF v_product_code IS NULL OR v_product_code = '' THEN
      RAISE EXCEPTION 'Produit invalide dans le panier';
    END IF;

    -- Source de vérité : le catalogue, pas le payload client.
    SELECT * INTO v_catalog_product
    FROM public.products
    WHERE product_code = v_product_code
    LIMIT 1;

    IF v_catalog_product.id IS NULL THEN
      RAISE EXCEPTION 'Produit % introuvable dans le catalogue', v_product_code;
    END IF;

    -- La vente est réservée aux produits modérés et publiés.
    IF NOT v_catalog_product.verified
       OR (v_catalog_product.status IS NOT NULL
           AND v_catalog_product.status NOT IN ('verified', 'pending', 'draft'))
    THEN
      RAISE EXCEPTION 'Le produit % n''est pas disponible à la vente', v_catalog_product.title;
    END IF;

    v_item_qty := coalesce((v_item ->> 'quantity')::int, 1);

    IF v_item_qty <= 0 THEN
      RAISE EXCEPTION 'Quantité invalide pour le produit %', v_catalog_product.title;
    END IF;

    -- Stock catalogue (quantity en stock). 0 = non suivi (vendu à la demande).
    IF v_catalog_product.quantity > 0 AND v_item_qty > v_catalog_product.quantity THEN
      RAISE EXCEPTION 'Stock insuffisant pour le produit % (disponible : %)',
        v_catalog_product.title, v_catalog_product.quantity;
    END IF;

    -- Prix du catalogue — JAMAIS celui du client.
    v_item_price := v_catalog_product.price_eur;
    v_item_currency := coalesce(v_catalog_product.currency, 'EUR');

    IF v_item_currency IS DISTINCT FROM 'EUR' THEN
      RAISE EXCEPTION 'Devise % non supportée pour le produit %', v_item_currency, v_catalog_product.title;
    END IF;

    v_computed_subtotal := v_computed_subtotal + (v_item_price * v_item_qty);

    -- Vérifier que le vendeur n'est pas en pause (garde existante conservée).
    SELECT p.id, COALESCE(sp.is_paused, false)
    INTO v_seller_id, v_is_paused
    FROM public.producers p
    LEFT JOIN public.seller_preferences sp ON sp.producer_id = p.id
    WHERE p.id = v_catalog_product.seller_id
    LIMIT 1;

    IF v_is_paused THEN
      RAISE EXCEPTION 'Le vendeur est temporairement indisponible. Veuillez retirer ses produits de votre panier ou attendre sa réactivation.';
    END IF;
  END LOOP;

  -- Validation du total : le serveur recalcule et compare (tolérance centime).
  IF abs((v_computed_subtotal + p_shipping_fee) - p_total) > 0.01 THEN
    RAISE EXCEPTION 'Incohérence dans le total de la commande. Veuillez réessayer.';
  END IF;

  v_order_number := 'JRS-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 100000)::text, 5, '0');

  INSERT INTO public.orders (
    order_number, user_id, status, currency, subtotal, shipping_fee, total,
    payment_method, payment_status, shipping_address
  )
  VALUES (
    v_order_number, v_user_id, 'pending', p_currency, v_computed_subtotal, p_shipping_fee,
    (v_computed_subtotal + p_shipping_fee),
    p_payment_method, 'pending', coalesce(p_address, '{}'::jsonb)
  )
  RETURNING id INTO v_order_id;

  -- Lignes de commande : valeurs du catalogue (jamais du client).
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_catalog_product
    FROM public.products
    WHERE product_code = v_item ->> 'product_code'
    LIMIT 1;

    INSERT INTO public.order_items (
      order_id, product_code, title, seller, unit, price_eur, currency, quantity, image_url
    )
    VALUES (
      v_order_id,
      v_catalog_product.product_code,
      v_catalog_product.title,
      coalesce((SELECT slug FROM public.producers WHERE id = v_catalog_product.seller_id), ''),
      v_catalog_product.unit,
      v_catalog_product.price_eur,
      coalesce(v_catalog_product.currency, 'EUR'),
      coalesce((v_item ->> 'quantity')::int, 1),
      v_catalog_product.image_url
    );
  END LOOP;

  INSERT INTO public.payments (order_id, amount, currency, status, provider)
  VALUES (v_order_id, (v_computed_subtotal + p_shipping_fee), p_currency, 'pending', 'simulate');

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
end;
$$;

-- ==================================================
-- 2. CONFIRM_PAYMENT : réservé au provider / service_role
-- ==================================================
-- La confirmation de paiement est un retour webhook (provider). Un client ne
-- doit JAMAIS pouvoir passer sa propre commande en 'paid'. Le front-end passe
-- par submit_payment_proof + review_payment_submission (garde auth.uid() et
-- is_financial_admin() déjà en place). confirm_payment reste disponible pour
-- le webhook simulé (service_role) mais plus pour les rôles clients.
revoke execute on function public.confirm_payment(text, boolean, text) from anon;
revoke execute on function public.confirm_payment(text, boolean, text) from authenticated;
revoke execute on function public.confirm_payment(text, boolean, text) from public;

-- ==================================================
-- 3. PRODUCTS : modération restaurée (verified = false à la création)
-- ==================================================
-- Un vendeur ne peut ni publier directement (verified=true) ni modifier un
-- produit vérifié. La vérification (verified=true) passe uniquement par
-- update_product_status (admin, security definer + is_admin()).
drop policy if exists "products_insert_seller" on public.products;
create policy "products_insert_seller"
  on public.products for insert to authenticated
  with check (
    seller_id = public.my_producer_id()
    and verified = false
    and status in ('draft', 'pending')
  );

drop policy if exists "products_update_seller" on public.products;
create policy "products_update_seller"
  on public.products for update to authenticated
  using (
    seller_id = public.my_producer_id()
    and status in ('draft', 'pending', 'rejected')
    and verified = false
  )
  with check (
    seller_id = public.my_producer_id()
    and status in ('draft', 'pending')
    and verified = false
  );

-- ==================================================
-- 4. MESSAGES : retour à sender_id = auth.uid()
-- ==================================================
-- Un vendeur ne pouvait modifier/marquer les messages de l'acheteur via la
-- policy élargie "or exists(...sellers...)". La lecture est déjà couverte par
-- conversations_*_participant ; un utilisateur ne met à jour QUE ses messages.
drop policy if exists "messages_update_own" on public.messages;
create policy "messages_update_own"
  on public.messages for update to authenticated
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());
