-- ==================================================
-- JEROSSA — SÉCURITÉ / HARDENING
-- 1. products_select_public : exclure les produits non vérifiés
-- 2. process_refund : verrouiller avec is_admin()
-- ==================================================

-- --------------------------------------------------
-- 1. RLS PRODUCTS : restreindre la lecture publique
--    Les produits non vérifiés (verified=false) ne doivent pas
--    être visibles publiquement. Seuls :
--    - les produits verified=true
--    - le vendeur propriétaire (via my_producer_id)
--    - les admins
-- --------------------------------------------------
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
  on public.products for select
  using (
    verified = true
    or seller_id = public.my_producer_id()
    or public.is_admin()
  );

-- --------------------------------------------------
-- 2. process_refund : ajouter la garde is_admin()
--    La fonction est SECURITY DEFINER donc la garde
--    côté fonction est la seule protection fiable.
-- --------------------------------------------------
create or replace function public.process_refund(
  p_refund_number text,
  p_status text,
  p_amount_refunded numeric,
  p_admin_note text,
  p_refund_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_refund public.refunds;
  v_notif_body text;
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs';
  end if;

  if p_refund_number is null or p_refund_number = '' then
    raise exception 'Demande de remboursement invalide';
  end if;

  if p_status not in ('approved', 'rejected', 'processed') then
    raise exception 'Statut de traitement invalide';
  end if;

  select * into v_refund
  from public.refunds
  where refund_number = p_refund_number
  for update;

  if v_refund.id is null then
    raise exception 'Demande de remboursement introuvable';
  end if;

  if p_status = 'approved' then
    if p_amount_refunded is null or p_amount_refunded <= 0 then
      raise exception 'Montant réellement remboursé requis';
    end if;
    if p_amount_refunded > v_refund.amount_requested then
      raise exception 'Le montant remboursé dépasse le montant demandé';
    end if;

    update public.refunds
    set status = 'approved',
        amount_refunded = p_amount_refunded,
        admin_note = coalesce(p_admin_note, admin_note),
        updated_at = now()
    where id = v_refund.id;
    v_notif_body := 'Votre remboursement ' || p_refund_number || ' a été approuvé.';

  elsif p_status = 'rejected' then
    update public.refunds
    set status = 'rejected',
        admin_note = coalesce(p_admin_note, admin_note),
        updated_at = now()
    where id = v_refund.id;
    v_notif_body := 'Votre demande de remboursement ' || p_refund_number || ' a été refusée.';

  else -- processed
    if v_refund.status not in ('approved', 'processed') then
      raise exception 'Le remboursement doit d''abord être approuvé';
    end if;

    update public.refunds
    set status = 'processed',
        refund_reference = coalesce(p_refund_reference, refund_reference),
        processed_at = now(),
        updated_at = now()
    where id = v_refund.id;

    update public.orders
    set status = 'refunded',
        payment_status = 'refunded'
    where id = v_refund.order_id;

    v_notif_body := 'Votre remboursement ' || p_refund_number || ' a été traité.';
  end if;

  if v_refund.customer_id is not null then
    insert into public.notifications (user_id, type, title, body)
    values (v_refund.customer_id, 'refund_status', 'Mise à jour de votre remboursement', v_notif_body);
  end if;

  return jsonb_build_object('id', v_refund.id, 'refund_number', v_refund.refund_number, 'status', p_status);
end;
$$;
