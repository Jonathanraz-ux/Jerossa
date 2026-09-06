-- --------------------------------------------------
-- Correctifs post-audit espace vendeur (2B / 2C / 2D)
-- 1. Sécurise messages_insert_participant (2B)
-- 2. Supprime la requête morte dans get_seller_stats (2C)
-- 3. Corrige le statut 'needs_changes' (inexistant) dans svd_delete_own (2D)
-- --------------------------------------------------

-- --------------------------------------------------
-- 2C. get_seller_stats : supprime la première requête morte de v_replied_convo
-- (recréation de la fonction avec la seule requête utile)
-- --------------------------------------------------
create or replace function public.get_seller_stats(p_seller_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_avg numeric;
  v_count integer;
  v_orders integer;
  v_response_rate text;
  v_response_time text;
begin
  -- Average rating and count
  select
    coalesce(avg(rating)::numeric(3,2), null),
    count(*)::integer
  into v_avg, v_count
  from public.seller_reviews
  where seller_id = p_seller_id and is_active = true;

  -- Completed orders count (orders containing this seller's items)
  select count(distinct o.id)::integer into v_orders
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  join public.producers p on p.name = oi.seller
  where p.id = p_seller_id
    and o.status in ('delivered', 'confirmed', 'paid');

  -- Response rate: conversations with at least 1 seller message / total conversations
  declare
    v_total_convo integer;
    v_replied_convo integer;
  begin
    select count(*) into v_total_convo
    from public.conversations
    where seller_id = p_seller_id;

    -- Conversations replied by the seller (sender's user_id = producer's user_id)
    select count(distinct m.conversation_id) into v_replied_convo
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    join public.producers p on p.id = c.seller_id
    where c.seller_id = p_seller_id
      and m.sender_id = p.user_id;

    if v_total_convo > 0 then
      v_response_rate := round((v_replied_convo::numeric / v_total_convo) * 100)::text || '%';
    else
      v_response_rate := null;
    end if;
  end;

  return jsonb_build_object(
    'avg_rating', v_avg,
    'reviews_count', v_count,
    'completed_orders', v_orders,
    'response_rate', v_response_rate,
    'response_time', null
  );
end;
$$;

-- --------------------------------------------------
-- 2D. svd_delete_own : 'needs_changes' n'existe pas dans le check de producers.status
-- (seuls pending/approved/rejected/suspended sont valides)
-- --------------------------------------------------
drop policy if exists "svd_delete_own" on public.seller_verification_documents;
create policy "svd_delete_own"
  on public.seller_verification_documents for delete
  using (
    owner_id = auth.uid()
    and exists (
      select 1 from public.producers p
      where p.id = seller_verification_documents.seller_application_id
        and p.user_id = auth.uid()
        and p.status in ('pending', 'rejected')
    )
  );

-- --------------------------------------------------
-- 2B. messages_insert_participant : jusqu'ici `with check (sender_id = auth.uid())`
-- autorisait n'importe quel utilisateur authentifié à insérer un message dans
-- n'importe quelle conversation (le RPC send_message valide bien, mais un insert
-- RLS direct contournait). On aligne l'insert sur la policy SELECT : seul un
-- participant (acheteur, vendeur de la conversation, ou admin) peut insérer.
-- --------------------------------------------------
drop policy if exists "messages_insert_participant" on public.messages;
create policy "messages_insert_participant"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (
          c.buyer_id = auth.uid()
          or exists (
            select 1 from public.producers p
            where p.id = c.seller_id and p.user_id = auth.uid()
          )
          or exists (
            select 1 from public.profiles pr
            where pr.id = auth.uid() and pr.role = 'admin'
          )
        )
    )
  );