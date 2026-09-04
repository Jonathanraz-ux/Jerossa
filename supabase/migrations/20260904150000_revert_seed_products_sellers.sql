-- ==================================================
-- JEROSSA — Annulation de la réaffectation définitive des produits seed à Noctis
-- -------------------------------------------------------------------------------
-- Le produit seed ne doit PAS appartenir en permanence à un seul vendeur de démo.
-- On restaure l'affectation d'origine (contenu de démonstration, producteurs
-- orphelins sans compte réel lié). Les produits concernés restent visibles en
-- catalogue mais leur messagerie est désactivée (voir garde RLS/RPC associée).
-- ==================================================

-- 1) Restauration des produits associés à l'origine aux producteurs seed (prod-001..008)
update public.products p
set seller_id = (
  select pr.id from public.producers pr where pr.seller_code = pv.orig_seller_code
)
from (
  values
    ('prod-001', 'seller-001'),
    ('prod-002', 'seller-002'),
    ('prod-003', 'seller-003'),
    ('prod-004', 'seller-004'),
    ('prod-005', 'seller-005'),
    ('prod-006', 'seller-006'),
    ('prod-007', 'seller-007'),
    ('prod-008', 'seller-008')
) as pv(product_code, orig_seller_code)
where p.product_code = pv.product_code;

-- 2) Produits seed sans vendeur à l'origine (prod-009, prod-010, prod-011) => seller_id NULL
update public.products
set seller_id = null
where product_code in ('prod-009', 'prod-010', 'prod-011');

-- ==================================================
-- 3) Garde RLS/RPC : interdire la messagerie vers un vendeur sans compte réel
--    Un producteur sans user_id (démo/orphelin) ne peut recevoir de messages.
--    Le destinataire doit être un vrai vendeur lié à un compte actif/approuvé.
-- ==================================================
create or replace function public.create_or_get_conversation(
  p_seller_id uuid,
  p_product_code text default null,
  p_product_title text default null,
  p_subject text default '',
  p_message text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_convo_id uuid;
  v_is_new boolean := false;
  v_seller_present boolean;
begin
  if v_user_id is null then
    raise exception 'Authentification requise';
  end if;

  if p_seller_id is null then
    raise exception 'Vendeur invalide';
  end if;

  -- Le vendeur destinataire doit exister ET disposer d'un compte réel lié
  -- (producers.user_id non nul) et d'un statut actif (approuvé).
  -- Sans cela, la messagerie est désactivée pour les producteurs de démo.
  select exists (
    select 1 from public.producers
    where id = p_seller_id
      and user_id is not null
      and status = 'approved'
  ) into v_seller_present;

  if not v_seller_present then
    raise exception 'Ce vendeur n''est pas encore disponible sur la messagerie.';
  end if;

  -- Prevent messaging yourself
  if exists (
    select 1 from public.producers
    where id = p_seller_id and user_id = v_user_id
  ) then
    raise exception 'Vous ne pouvez pas vous contacter vous-même';
  end if;

  -- Try to find existing conversation
  select id into v_convo_id
  from public.conversations
  where buyer_id = v_user_id
    and seller_id = p_seller_id
    and coalesce(product_code, '') = coalesce(p_product_code, '')
  limit 1;

  if v_convo_id is null then
    -- Create new conversation
    insert into public.conversations (buyer_id, seller_id, product_code, product_title, subject)
    values (
      v_user_id,
      p_seller_id,
      p_product_code,
      coalesce(p_product_title, ''),
      coalesce(p_subject, '')
    )
    returning id into v_convo_id;

    v_is_new := true;

    -- Send initial message if provided
    if p_message is not null and trim(p_message) != '' then
      insert into public.messages (conversation_id, sender_id, content)
      values (v_convo_id, v_user_id, trim(p_message));
    end if;
  elsif p_message is not null and trim(p_message) != '' and v_is_new = false then
    -- Add message to existing conversation
    insert into public.messages (conversation_id, sender_id, content)
    values (v_convo_id, v_user_id, trim(p_message));

    update public.conversations set updated_at = now() where id = v_convo_id;
  end if;

  return jsonb_build_object(
    'conversation_id', v_convo_id,
    'is_new', v_is_new
  );
end;
$$;
