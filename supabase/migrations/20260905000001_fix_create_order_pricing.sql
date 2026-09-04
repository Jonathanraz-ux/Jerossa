-- ==================================================
-- FIX : Sécuriser create_order contre les prix falsifiés par le client
-- Le client ne doit jamais faire confiance aux prix envoyés.
-- Le serveur doit recalculer et valider.
-- ==================================================

CREATE OR REPLACE FUNCTION public.create_order(
  p_items jsonb,
  p_subtotal numeric,
  p_shipping_fee numeric,
  p_total numeric,
  p_currency text,
  p_payment_method text,
  p_address jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_user_id uuid := auth.uid();
  v_seller_id uuid;
  v_is_paused boolean;
  v_computed_subtotal numeric := 0;
  v_item_price numeric;
  v_item_qty int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Vous devez être connecté pour passer une commande.';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Panier vide';
  END IF;

  -- ==================================================
  -- SÉCURITÉ : Recalculer le subtotal à partir des items
  -- Ignorer les prix fournis par le client
  -- ==================================================
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_price := coalesce((v_item ->> 'price_eur')::numeric, 0);
    v_item_qty := coalesce((v_item ->> 'quantity')::int, 1);

    -- Valider les valeurs individuelles
    IF v_item_price < 0 THEN
      RAISE EXCEPTION 'Prix invalide pour le produit %', v_item ->> 'title';
    END IF;
    IF v_item_qty <= 0 THEN
      RAISE EXCEPTION 'Quantité invalide pour le produit %', v_item ->> 'title';
    END IF;

    v_computed_subtotal := v_computed_subtotal + (v_item_price * v_item_qty);
  END LOOP;

  -- Valider le shipping
  IF p_shipping_fee < 0 THEN
    RAISE EXCEPTION 'Frais de livraison invalides';
  END IF;

  -- Valider que le total correspond au calcul serveur
  IF abs(v_computed_subtotal + p_shipping_fee - p_total) > 0.01 THEN
    RAISE EXCEPTION 'Incohérence dans le total de la commande. Veuillez réessayer.';
  END IF;

  -- Vérifier que les vendeurs impliqués ne sont pas en pause
  FOR v_item IN SELECT DISTINCT value->>'seller' as seller_slug
                FROM jsonb_array_elements(p_items)
                WHERE value->>'seller' IS NOT NULL AND value->>'seller' != ''
  LOOP
    SELECT p.id, COALESCE(sp.is_paused, false)
    INTO v_seller_id, v_is_paused
    FROM public.producers p
    LEFT JOIN public.seller_preferences sp ON sp.producer_id = p.id
    WHERE p.slug = v_item.seller_slug OR p.name = v_item.seller_slug
    LIMIT 1;

    IF v_is_paused THEN
      RAISE EXCEPTION 'Le vendeur "%" est temporairement indisponible. Veuillez retirer ses produits de votre panier ou attendre sa réactivation.', v_item.seller_slug;
    END IF;
  END LOOP;

  v_order_number := 'JRS-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 100000)::text, 5, '0');

  -- Utiliser le subtotal recalculé par le serveur, pas celui du client
  INSERT INTO public.orders (
    order_number, user_id, status, currency, subtotal, shipping_fee, total,
    payment_method, payment_status, shipping_address
  )
  VALUES (
    v_order_number, v_user_id, 'pending', p_currency, v_computed_subtotal, p_shipping_fee, (v_computed_subtotal + p_shipping_fee),
    p_payment_method, 'pending', coalesce(p_address, '{}'::jsonb)
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (
      order_id, product_code, title, seller, unit, price_eur, currency, quantity, image_url
    )
    VALUES (
      v_order_id,
      v_item ->> 'product_code',
      v_item ->> 'title',
      coalesce(v_item ->> 'seller', ''),
      coalesce(v_item ->> 'unit', 'kg'),
      coalesce((v_item ->> 'price_eur')::numeric, 0),
      coalesce(v_item ->> 'currency', 'EUR'),
      coalesce((v_item ->> 'quantity')::int, 1),
      v_item ->> 'image_url'
    );
  END LOOP;

  INSERT INTO public.payments (order_id, amount, currency, status, provider)
  VALUES (v_order_id, (v_computed_subtotal + p_shipping_fee), p_currency, 'pending', 'simulate');

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$;
