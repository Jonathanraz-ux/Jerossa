-- ==================================================
-- JEROSSA — Migration 2026-09-28 (données de démonstration)
-- Rend la messagerie réellement testable.
-- ==================================================
--
-- PROBLÈME
--   La RPC public.create_or_get_conversation() n'accepte que les vendeurs
--   disposant d'un compte réel lié :
--
--     where id = p_seller_id and user_id is not null and status = 'approved'
--
--   État de la base liée avant ce correctif :
--     - 8 boutiques de démonstration ont chacune 1 produit, mais
--       user_id IS NULL → « Ce vendeur n'est pas encore disponible sur la
--       messagerie. » au premier « Contacter » ;
--     - la seule boutique avec un compte lié (Noctis Digital Forge) n'avait
--       AUCUN produit, donc rien à contacter.
--   Conséquence : 0 conversation créable, la page Messages restait vide et la
--   messagerie n'avait jamais pu être exercée en conditions réelles.
--
-- CORRECTIF
--   On publie un produit de démonstration sur la boutique approuvée qui possède
--   un compte lié ET aucun produit. La sélection est faite par requête, pas
--   en dur sur un nom ou un email : la migration cible l'état bloquant réel
--   (« vendeur joignable sans catalogue ») et devient sans effet dès que ce
--   vendeur publie son propre produit.
--
--   Ce n'est PAS un contournement de sécurité : la garde de la RPC est
--   inchangée, on l'alimente simplement en données. Le produit est inactif
--   pour la vente (aucun stock réel) et sert uniquement de point d'entrée au
--   bouton « Contacter ».
--
--   Idempotence : double garde (product_code unique + boutique déjà
--   pourvue), donc `db push` en rejoue sans effet.
-- ==================================================

do $$
declare
  v_producer public.producers;
  v_category uuid;
begin
  -- La boutique joignable encore sans catalogue.
  select * into v_producer
  from public.producers p
  where p.user_id is not null
    and p.status = 'approved'
    and not exists (select 1 from public.products pr where pr.seller_id = p.id)
  order by p.created_at
  limit 1;

  if v_producer.id is null then
    raise notice '[demo] Aucune boutique joignable sans produit : nothing à faire.';
    return;
  end if;

  if exists (select 1 from public.products where product_code = 'prod-012') then
    raise notice '[demo] Le produit de démonstration prod-012 existe déjà : nothing à faire.';
    return;
  end if;

  select id into v_category
  from public.categories
  where slug = 'cacao-feves-bio';

  insert into public.products (
    title,
    slug,
    seller_id,
    category_id,
    price_eur,
    unit,
    origin,
    market,
    availability,
    verified,
    reviews,
    type,
    tag,
    description,
    stock,
    delivery,
    variants,
    images,
    rating,
    active,
    product_code,
    status
  )
  values (
    'Cacao torréfié en grains - sélection Noctis',
    'cacao-torrefie-grains-noctis',
    v_producer.id,
    v_category,
    18.50,
    'kg',
    'Madagascar',
    'MG',
    'En stock',
    true,
    0,
    'cacao',
    'Direct Producteur',
    'Cacao torréfié en grains entiers, livré par la boutique de démonstration '
      || 'Noctis Digital Forge. Ce produit existe pour permettre un test complet '
      || 'de la messagerie (boutique « Contacter » → conversation → réponse vendeur) : '
      || 'il ne correspond à aucun stock réel.',
    'En stock',
    'Expédition sous 48h, livraison en 5-7 jours',
    array['500 g', '1 kg', '5 kg'],
    array['https://images.unsplash.com/photo-1610450949065-1f2841536c88?w=800&auto=format&fit=crop&q=80'],
    4.7,
    true,
    'prod-012',
    'draft'
  );

  raise notice '[demo] Produit prod-012 publié sur la boutique « % » (compte lié).', v_producer.name;
end;
$$;
