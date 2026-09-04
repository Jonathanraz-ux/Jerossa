-- ============================================================================
-- Réattribution des produits seed vers le vendeur de démonstration
-- "Noctis Digital Forge" (5798cef9-1ae2-48ca-82ca-5ecb86e2eff3)
-- ============================================================================
--
-- Contexte :
--   Les producteurs seed (Coopérative SAVA Vanilla, Domaine Sucrier Mauricien,
--   etc.) ont user_id = NULL : ce ne sont pas de vrais vendeurs inscrits et
--   personne ne peut répondre aux messages/commandes qui leur sont adressés.
--   Pour rendre la messagerie testable sans casser le modèle de données
--   (contrainte unique producers_user_id_key : un vendeur par utilisateur),
--   on réattribue les produits seed au seul vendeur de démonstration réel,
--   lié à un compte : "Noctis Digital Forge" (user noctisdigitalforge@gmail.com).
--
--   La fiche publique de ces produits affichera donc "Noctis Digital Forge",
--   cohérent avec le destinataire réel des messages.
--
--   Aucune relation en aval n'est rompue : orders / order_items / quote_requests
--   stockent product_code / product_title / seller_name en texte (snapshots),
--   pas via une clé étrangère vers products.
--
--   Les producteurs seed sont laissés intacts (user_id = NULL), sans suppression
--   destructive : ils deviennent des "producteurs orphelins" sans produits.
-- ============================================================================

-- Target seller = Noctis Digital Forge
-- (5044e1f3-... est le product_id 5798cef9-1ae2-48ca-82ca-5ecb86e2eff3)
DO $$
DECLARE
  v_seller_id uuid := '5798cef9-1ae2-48ca-82ca-5ecb86e2eff3';
  v_from_seed int := 0;
  v_from_null int := 0;
BEGIN
  -- 1) Produits liés à un producteur seed (user_id IS NULL)
  UPDATE public.products p
     SET seller_id = v_seller_id
   WHERE p.seller_id IN (
          SELECT pr.id FROM public.producers pr
           WHERE pr.user_id IS NULL
         )
     AND p.seller_id IS DISTINCT FROM v_seller_id;
  GET DIAGNOSTICS v_from_seed = ROW_COUNT;

  -- 2) Produits seed sans vendeur (seller_id IS NULL) : prod-009, prod-010, prod-011
  UPDATE public.products
     SET seller_id = v_seller_id
   WHERE seller_id IS NULL;
  GET DIAGNOSTICS v_from_null = ROW_COUNT;

  RAISE NOTICE 'Produits réattribués à Noctis Digital Forge : % (depuis seed = %, sans vendeur = %)',
    v_from_seed + v_from_null, v_from_seed, v_from_null;
END $$;

-- Vérification : aucun produit ne doit plus pointer vers un vendeur sans user_id
SELECT p.product_code, p.title, pr.name AS seller_display, pr.user_id
  FROM public.products p
  LEFT JOIN public.producers pr ON pr.id = p.seller_id
 ORDER BY p.product_code;

-- Vérification : producteurs seed restés orphelins (user_id NULL), laissés intacts
SELECT pr.name, pr.status, pr.user_id
  FROM public.producers pr
 WHERE pr.user_id IS NULL
 ORDER BY pr.name;
