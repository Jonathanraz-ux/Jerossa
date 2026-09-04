-- ==================================================
-- JEROSSA — Migration 2026-09-05
-- 1. Sécuriser les commandes (supprimer accès guest)
-- 2. Activer Realtime sur la table messages
-- 3. Table seller_preferences + RPC + RLS
-- 4. Bloquer commandes si vendeur en mode pause
-- ==================================================

-- --------------------------------------------------
-- 1. SÉCURITÉ DES COMMANDES
--    Supprimer la politique guest ouverte (user_id IS NULL
--    readable par tous). Ajouter une politique owner-only
--    et une RPC vérifiant l'appartenance.
-- --------------------------------------------------

-- 1a. Supprimer les anciennes policies guest
DROP POLICY IF EXISTS "orders_select_own_or_guest" ON public.orders;
DROP POLICY IF EXISTS "order_items_select_via_order" ON public.order_items;
DROP POLICY IF EXISTS "payments_select_via_order" ON public.payments;

-- 1b. Policy owner-only sur orders
CREATE POLICY "orders_select_owner"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- 1c. Policy owner-only sur order_items (via parent order)
CREATE POLICY "order_items_select_owner"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );

-- 1d. Policy owner-only sur payments (via parent order)
CREATE POLICY "payments_select_owner"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
        AND o.user_id = auth.uid()
    )
  );

-- 1e. Admin restreint : conserver les policies admin existantes
--     (elles sont déjà créées dans 20260820000001_admin_rls.sql)

-- 1f. RPC pour vérifier qu'une commande appartient à l'utilisateur
CREATE OR REPLACE FUNCTION public.verify_order_owner(p_order_number text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE order_number = p_order_number
      AND user_id = auth.uid()
  );
$$;

-- --------------------------------------------------
-- 2. REALTIME SUR LA TABLE MESSAGES
--    Ajouter la table à la publication supabase_realtime
--    de façon idempotente (ne casse pas une publication existante).
-- --------------------------------------------------

-- Supabase gère la publication supabase_realtime automatiquement
-- sur les bases créées via le dashboard. Pour les migrations,
-- on utilise ALTER PUBLICATION qui est idempotent avec IF NOT EXISTS.
DO $$
BEGIN
  -- Tenter d'ajouter la table à la publication Realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN
  -- La table est déjà dans la publication, rien à faire
  NULL;
END $$;

-- --------------------------------------------------
-- 3. TABLE SELLER_PREFERENCES
--    Préférences de chaque vendeur (notifications, délai, pause)
-- --------------------------------------------------

CREATE TABLE IF NOT EXISTS public.seller_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL UNIQUE REFERENCES public.producers(id) ON DELETE CASCADE,
  notify_new_orders boolean NOT NULL DEFAULT true,
  notify_new_messages boolean NOT NULL DEFAULT true,
  notify_new_quotes boolean NOT NULL DEFAULT true,
  default_lead_time text NOT NULL DEFAULT '2-5 jours',
  is_paused boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seller_preferences_producer
  ON public.seller_preferences (producer_id);

ALTER TABLE public.seller_preferences ENABLE ROW LEVEL SECURITY;

-- Policy : le vendeur ne lit que ses propres préférences
DROP POLICY IF EXISTS "seller_preferences_select_own" ON public.seller_preferences;
CREATE POLICY "seller_preferences_select_own"
  ON public.seller_preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.producers p
      WHERE p.id = seller_preferences.producer_id
        AND p.user_id = auth.uid()
        AND p.status = 'approved'
    )
  );

-- Policy : le vendeur insère uniquement sa propre ligne (upsert)
DROP POLICY IF EXISTS "seller_preferences_insert_own" ON public.seller_preferences;
CREATE POLICY "seller_preferences_insert_own"
  ON public.seller_preferences FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.producers p
      WHERE p.id = producer_id
        AND p.user_id = auth.uid()
        AND p.status = 'approved'
    )
  );

-- Policy : le vendeur met à jour uniquement ses propres préférences
DROP POLICY IF EXISTS "seller_preferences_update_own" ON public.seller_preferences;
CREATE POLICY "seller_preferences_update_own"
  ON public.seller_preferences FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.producers p
      WHERE p.id = seller_preferences.producer_id
        AND p.user_id = auth.uid()
        AND p.status = 'approved'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.producers p
      WHERE p.id = producer_id
        AND p.user_id = auth.uid()
        AND p.status = 'approved'
    )
  );

-- Policy : admin peut tout lire
DROP POLICY IF EXISTS "seller_preferences_admin_all" ON public.seller_preferences;
CREATE POLICY "seller_preferences_admin_all"
  ON public.seller_preferences FOR ALL
  USING (public.is_admin());

-- --------------------------------------------------
-- 3b. RPC : UPSERT SELLER PREFERENCES
--     Crée ou met à jour les préférences du vendeur.
-- --------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_seller_preferences(
  p_notify_new_orders boolean DEFAULT true,
  p_notify_new_messages boolean DEFAULT true,
  p_notify_new_quotes boolean DEFAULT true,
  p_default_lead_time text DEFAULT '2-5 jours',
  p_is_paused boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_producer_id uuid;
  v_result jsonb;
BEGIN
  -- Trouver le producer_id de l'utilisateur connecté
  SELECT id INTO v_producer_id
  FROM public.producers
  WHERE user_id = auth.uid() AND status = 'approved';

  IF v_producer_id IS NULL THEN
    RAISE EXCEPTION 'Aucun compte vendeur actif trouvé.';
  END IF;

  -- Upsert les préférences
  INSERT INTO public.seller_preferences (
    producer_id, notify_new_orders, notify_new_messages,
    notify_new_quotes, default_lead_time, is_paused, updated_at
  ) VALUES (
    v_producer_id, p_notify_new_orders, p_notify_new_messages,
    p_notify_new_quotes, p_default_lead_time, p_is_paused, now()
  )
  ON CONFLICT (producer_id) DO UPDATE SET
    notify_new_orders = EXCLUDED.notify_new_orders,
    notify_new_messages = EXCLUDED.notify_new_messages,
    notify_new_quotes = EXCLUDED.notify_new_quotes,
    default_lead_time = EXCLUDED.default_lead_time,
    is_paused = EXCLUDED.is_paused,
    updated_at = now()
  RETURNING to_jsonb(seller_preferences.*) INTO v_result;

  RETURN v_result;
END;
$$;

-- --------------------------------------------------
-- 3c. RPC : FETCH SELLER PREFERENCES
--     Récupère les préférences du vendeur connecté.
-- --------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_seller_preferences()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    to_jsonb(sp.*),
    jsonb_build_object(
      'producer_id', p.id,
      'notify_new_orders', true,
      'notify_new_messages', true,
      'notify_new_quotes', true,
      'default_lead_time', '2-5 jours',
      'is_paused', false
    )
  )
  FROM public.producers p
  LEFT JOIN public.seller_preferences sp ON sp.producer_id = p.id
  WHERE p.user_id = auth.uid() AND p.status = 'approved'
  LIMIT 1;
$$;

-- --------------------------------------------------
-- 4. BLOQUER COMMANDES SI VENDEUR EN MODE PAUSE
--     Modifier create_order pour vérifier que les vendeurs
--     concernés ne sont pas en pause.
-- --------------------------------------------------

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
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Vous devez être connecté pour passer une commande.';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Panier vide';
  END IF;

  IF p_total < 0 THEN
    RAISE EXCEPTION 'Total invalide';
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

  INSERT INTO public.orders (
    order_number, user_id, status, currency, subtotal, shipping_fee, total,
    payment_method, payment_status, shipping_address
  )
  VALUES (
    v_order_number, v_user_id, 'pending', p_currency, p_subtotal, p_shipping_fee, p_total,
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
  VALUES (v_order_id, p_total, p_currency, 'pending', 'simulate');

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$;

-- --------------------------------------------------
-- 4b. TRIGGER : updated_at pour seller_preferences
-- --------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_seller_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS seller_preferences_updated_at ON public.seller_preferences;
CREATE TRIGGER seller_preferences_updated_at
  BEFORE UPDATE ON public.seller_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_seller_preferences_updated_at();
