import { supabase } from '../lib/supabase';

export const fetchSellerStats = async (sellerId) => {
  const { data, error } = await supabase.rpc('get_seller_stats', {
    p_seller_id: sellerId,
  });
  if (error) {
    console.error('[reviews] fetchSellerStats', error);
    return null;
  }
  return data;
};

export const fetchPublicReviews = async (sellerId) => {
  const { data, error } = await supabase.rpc('get_public_reviews', {
    p_seller_id: sellerId,
  });
  if (error) {
    console.error('[reviews] fetchPublicReviews', error);
    return [];
  }
  return data || [];
};

export const submitSellerReview = async ({ sellerId, orderId, rating, comment }) => {
  const { data, error } = await supabase.rpc('submit_seller_review', {
    p_seller_id: sellerId,
    p_order_id: orderId,
    p_rating: rating,
    p_comment: comment || '',
  });
  if (error) {
    console.error('[reviews] submitSellerReview', error);
    return { ok: false, error };
  }
  return { ok: true, data };
};

export const fetchCompletedOrdersForSeller = async (sellerId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch orders that contain items from this seller
  const { data: sellerData } = await supabase
    .from('producers')
    .select('name')
    .eq('id', sellerId)
    .maybeSingle();

  if (!sellerData) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, status, created_at')
    .eq('user_id', user.id)
    .in('status', ['delivered', 'confirmed', 'paid'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[reviews] fetchCompletedOrdersForSeller', error);
    return [];
  }

  // Filter orders that have items from this seller
  const filtered = [];
  for (const order of (data || [])) {
    const { data: items } = await supabase
      .from('order_items')
      .select('seller')
      .eq('order_id', order.id)
      .eq('seller', sellerData.name);

    if (items && items.length > 0) {
      filtered.push({
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        createdAt: order.created_at,
      });
    }
  }

  return filtered;
};
