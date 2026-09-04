-- ==================================================
-- JEROSSA — RPC Transactionnelle d'approbation / statut vendeur
-- Sécurisée par is_admin(), met à jour producers.status et profiles.role de manière atomique.
-- ==================================================

create or replace function public.admin_update_producer_status(
  p_producer_id uuid,
  p_status text,
  p_review_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prod_user_id uuid;
  v_new_role text;
begin
  -- 1. Vérification de sécurité stricte : seuls les administrateurs authentifiés sont autorisés
  if not public.is_admin() then
    raise exception 'Accès non autorisé : fonction réservée aux administrateurs';
  end if;

  -- 2. Validation du statut cible
  if p_status not in ('pending', 'approved', 'rejected', 'suspended') then
    raise exception 'Statut invalide : %', p_status;
  end if;

  -- 3. Récupération avec verrouillage de la ligne producteur
  select user_id into v_prod_user_id
  from public.producers
  where id = p_producer_id
  for update;

  if not found then
    raise exception 'Producteur/Vendeur introuvable';
  end if;

  -- 4. Mise à jour atomique du producteur
  update public.producers
  set status = p_status,
      review_note = coalesce(p_review_note, review_note),
      reviewed_at = case when p_status != 'pending' then now() else reviewed_at end,
      is_verified = case when p_status = 'approved' then true else is_verified end
  where id = p_producer_id;

  -- 5. Synchronisation atomique du rôle dans profiles (sans intervention du frontend)
  if v_prod_user_id is not null then
    if p_status = 'approved' then
      v_new_role := 'seller';
    elsif p_status in ('rejected', 'suspended') then
      v_new_role := 'customer';
    end if;

    if v_new_role is not null then
      update public.profiles
      set role = v_new_role
      where id = v_prod_user_id
        and role != 'admin'; -- Ne rétrograde jamais un administrateur
    end if;
  end if;

  return jsonb_build_object(
    'ok', true,
    'producer_id', p_producer_id,
    'status', p_status,
    'user_id', v_prod_user_id,
    'role', v_new_role
  );
end;
$$;
