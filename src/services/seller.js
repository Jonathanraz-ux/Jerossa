import { supabase } from '../lib/supabase';

// ─── BOUTIQUE ──────────────────────────────────────────────

export const fetchMyProducer = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('producers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) {
    console.error('[seller] fetchMyProducer', error);
    return null;
  }
  return data;
};

export const saveMyShop = async ({
  name, location, description, established,
  contactEmail, phone, paymentInfo, imageUrl, logoUrl,
}) => {
  const { error } = await supabase.rpc('update_my_shop', {
    p_name: name,
    p_location: location || null,
    p_description: description || null,
    p_established: established ? Number(established) : null,
    p_contact_email: contactEmail || '',
    p_phone: phone || null,
    p_payment_info: paymentInfo || {},
    p_image_url: imageUrl || null,
    p_logo_url: logoUrl || null,
  });
  if (error) {
    console.error('[seller] saveMyShop', error);
    return { ok: false, error };
  }
  return { ok: true };
};

export const uploadShopImage = async (file) => {
  const { data: { user } } = await supabase.auth.getUser();
  const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
  const path = `${user.id}/shop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
};

export const uploadSellerLogo = async (file) => {
  const { data: { user } } = await supabase.auth.getUser();
  const ext = file.name.split('.').pop().toLowerCase() || 'png';
  const path = `${user.id}/logo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from('seller-logos')
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('seller-logos').getPublicUrl(path);
  return data.publicUrl;
};

// ─── PRODUITS ──────────────────────────────────────────────

const mapMyProduct = (row) => ({
  id: row.id,
  code: row.product_code,
  slug: row.slug,
  title: row.title,
  categoryId: row.category_id,
  priceEur: Number(row.price_eur),
  unit: row.unit,
  origin: row.origin,
  market: row.market,
  availability: row.availability,
  description: row.description,
  images: row.images || [],
  active: row.active,
  verified: row.verified,
  createdAt: row.created_at,
});

export const fetchMyProducts = async (producerId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', producerId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[seller] fetchMyProducts', error);
    return [];
  }
  return (data || []).map(mapMyProduct);
};

export const fetchMyProductById = async (productId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle();
  if (error) {
    console.error('[seller] fetchMyProductById', error);
    return null;
  }
  return data ? mapMyProduct(data) : null;
};

// RLS : le vendeur ne peut modifier que ses produits non vérifiés
// (updates : colonnes SQL — title, description, price_eur, unit, …)
export const updateMyProduct = async (productId, updates) => {
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId);
  if (error) {
    console.error('[seller] updateMyProduct', error);
    return { ok: false, error };
  }
  return { ok: true };
};

export const deleteMyProduct = async (productId) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
  if (error) {
    console.error('[seller] deleteMyProduct', error);
    return { ok: false, error };
  }
  return { ok: true };
};

export const fetchCategoriesForSelect = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('category_code', { ascending: true });
  if (error) {
    console.error('[seller] fetchCategoriesForSelect', error);
    return [];
  }
  return data || [];
};

// ─── COMMANDES ──────────────────────────────────────────────
// Le vendeur n'a PAS de RLS SELECT direct sur orders/order_items
// (recursion de policies). Tout passe par le RPC security definer
// fetch_my_orders() défini en migration 02 de l'espace vendeur.

export const fetchMyOrders = async () => {
  const { data, error } = await supabase.rpc('fetch_my_orders');
  if (error) {
    console.error('[seller] fetchMyOrders', error);
    return [];
  }
  return (data || []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    status: o.status,
    paymentStatus: o.payment_status,
    currency: o.currency,
    address: o.shipping_address || {},
    createdAt: o.created_at,
    itemsTotal: Number(o.items_total || 0),
    items: Array.isArray(o.items)
      ? o.items.map((i) => ({
          title: i.title,
          unit: i.unit,
          priceEur: Number(i.price_eur),
          quantity: Number(i.quantity),
          lineTotal: Number(i.price_eur) * Number(i.quantity),
        }))
      : [],
  }));
};

// ─── DEVIS ────────────────────────────────────────────────

export const fetchMyQuotes = async (producerId) => {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*, quote_responses(price_eur, unit, delay, message, created_at)')
    .eq('seller_id', producerId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[seller] fetchMyQuotes', error);
    return [];
  }
  return (data || []).map((row) => {
    const resp = Array.isArray(row.quote_responses) && row.quote_responses.length
      ? row.quote_responses[0]
      : null;
    return {
      id: row.id,
      quoteNumber: row.quote_number,
      productCode: row.product_code,
      productTitle: row.product_title,
      quantity: Number(row.quantity),
      unit: row.unit,
      message: row.message,
      delayRequested: row.delay_requested,
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at,
      response: resp
        ? {
            priceEur: Number(resp.price_eur),
            unit: resp.unit,
            delay: resp.delay,
            message: resp.message,
          }
        : null,
    };
  });
};

export const respondToQuote = async ({ quoteRequestId, priceEur, unit, delay, message }) => {
  const { data, error } = await supabase.rpc('respond_to_quote', {
    p_quote_request_id: quoteRequestId,
    p_price_eur: Number(priceEur),
    p_unit: unit || 'kg',
    p_delay: delay || '',
    p_message: message || '',
  });
  if (error) {
    console.error('[seller] respondToQuote', error);
    return { ok: false, error };
  }
  return { ok: true, data };
};
