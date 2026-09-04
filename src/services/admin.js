import { supabase } from '../lib/supabase';

// ─── OVERVIEW / KPIs ──────────────────────────────────────

export const fetchAdminStats = async () => {
  const [ordersRes, productsRes, usersRes, revenueRes] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('total').eq('payment_status', 'paid'),
  ]);

  const totalRevenue = (revenueRes.data || []).reduce((sum, o) => sum + Number(o.total), 0);

  return {
    totalOrders: ordersRes.count || 0,
    totalProducts: productsRes.count || 0,
    totalUsers: usersRes.count || 0,
    totalRevenue,
  };
};

export const fetchRecentOrders = async (limit = 5) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[admin] fetchRecentOrders', error);
    return [];
  }
  return (data || []).map(mapAdminOrder);
};

export const fetchRecentNotifications = async (limit = 5) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[admin] fetchRecentNotifications', error);
    return [];
  }
  return data || [];
};

// ─── PRODUCTS ─────────────────────────────────────────────

const PRODUCT_SELECT = '*, producers(name), categories(name)';

const mapAdminProduct = (row) => ({
  id: row.id,
  code: row.product_code,
  slug: row.slug,
  title: row.title,
  category: row.categories?.name || '—',
  seller: row.producers?.name || '—',
  price: Number(row.price_eur),
  unit: row.unit,
  stock: row.stock,
  rating: Number(row.rating),
  reviews: row.reviews,
  active: row.active,
  verified: row.verified,
  images: row.images || [],
  origin: row.origin,
  market: row.market,
  createdAt: row.created_at,
});

export const fetchAdminProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[admin] fetchAdminProducts', error);
    return [];
  }
  return (data || []).map(mapAdminProduct);
};

export const toggleProductActive = async (productId, active) => {
  const { error } = await supabase
    .from('products')
    .update({ active })
    .eq('id', productId);
  if (error) {
    console.error('[admin] toggleProductActive', error);
    return { ok: false, error };
  }
  return { ok: true };
};

export const deleteProduct = async (productId) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
  if (error) {
    console.error('[admin] deleteProduct', error);
    return { ok: false, error };
  }
  return { ok: true };
};

// ─── ORDERS ───────────────────────────────────────────────

const mapAdminOrder = (row) => ({
  id: row.id,
  orderNumber: row.order_number,
  userId: row.user_id,
  status: row.status,
  currency: row.currency,
  subtotal: Number(row.subtotal),
  shippingFee: Number(row.shipping_fee),
  total: Number(row.total),
  paymentMethod: row.payment_method,
  paymentStatus: row.payment_status,
  address: row.shipping_address || {},
  tracking: row.tracking,
  createdAt: row.created_at,
  items: (row.order_items || []).map((it) => ({
    title: it.title,
    seller: it.seller,
    qty: it.quantity,
    price: Number(it.price_eur),
    unit: it.unit,
    imageUrl: it.image_url || null,
  })),
});

export const fetchAdminOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[admin] fetchAdminOrders', error);
    return [];
  }
  return (data || []).map(mapAdminOrder);
};

export const updateOrderStatus = async (orderId, status) => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) {
    console.error('[admin] updateOrderStatus', error);
    return { ok: false, error };
  }
  return { ok: true };
};

// ─── CATEGORIES ───────────────────────────────────────────

export const fetchAdminCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('category_code', { ascending: true });
  if (error) {
    console.error('[admin] fetchAdminCategories', error);
    return [];
  }
  return (data || []).map((row) => ({
    id: row.id,
    code: row.category_code,
    slug: row.slug,
    name: row.name,
    short: row.short,
    description: row.description,
    imageUrl: row.image_url,
    productCount: row.product_count,
    createdAt: row.created_at,
  }));
};

export const createCategory = async ({ name, slug, short, description, imageUrl }) => {
  const code = 'CAT-' + Date.now().toString(36).toUpperCase();
  const { data, error } = await supabase
    .from('categories')
    .insert({ category_code: code, name, slug, short, description, image_url: imageUrl })
    .select()
    .maybeSingle();
  if (error) {
    console.error('[admin] createCategory', error);
    return { ok: false, error };
  }
  return { ok: true, data };
};

export const updateCategory = async (categoryId, updates) => {
  const { error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', categoryId);
  if (error) {
    console.error('[admin] updateCategory', error);
    return { ok: false, error };
  }
  return { ok: true };
};

export const deleteCategory = async (categoryId) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);
  if (error) {
    console.error('[admin] deleteCategory', error);
    return { ok: false, error };
  }
  return { ok: true };
};

// ─── USERS / PROFILES ────────────────────────────────────

export const fetchAdminUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[admin] fetchAdminUsers', error);
    return [];
  }
  return (data || []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    role: row.role,
    phone: row.phone,
    country: row.country,
    createdAt: row.created_at,
  }));
};

export const updateUserRole = async (userId, role) => {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);
  if (error) {
    console.error('[admin] updateUserRole', error);
    return { ok: false, error };
  }
  return { ok: true };
};

// ─── QUOTES (admin read) ─────────────────────────────────

export const fetchAdminQuotes = async () => {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*, quote_responses(*)')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[admin] fetchAdminQuotes', error);
    return [];
  }
  return (data || []).map((row) => {
    const resp = Array.isArray(row.quote_responses) && row.quote_responses.length
      ? row.quote_responses[0]
      : null;
    return {
      id: row.id,
      quoteNumber: row.quote_number,
      userId: row.user_id,
      productTitle: row.product_title,
      sellerName: row.seller_name,
      quantity: row.quantity,
      unit: row.unit,
      message: row.message,
      status: row.status,
      orderNumber: row.order_number,
      createdAt: row.created_at,
      response: resp ? {
        priceEur: Number(resp.price_eur),
        unit: resp.unit,
        delay: resp.delay,
        message: resp.message,
      } : null,
    };
  });
};

// ─── REFUNDS (admin read + process) ──────────────────────

export const fetchAdminRefunds = async () => {
  const { data, error } = await supabase
    .from('refunds')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[admin] fetchAdminRefunds', error);
    return [];
  }
  return (data || []).map((row) => ({
    id: row.id,
    refundNumber: row.refund_number,
    orderId: row.order_id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    amountRequested: Number(row.amount_requested),
    amountRefunded: Number(row.amount_refunded),
    currency: row.currency,
    reason: row.reason,
    description: row.description,
    status: row.status,
    adminNote: row.admin_note,
    refundReference: row.refund_reference,
    requestedAt: row.requested_at,
    processedAt: row.processed_at,
    createdAt: row.created_at,
  }));
};

export const processRefund = async ({ refundNumber, status, amountRefunded, adminNote, refundReference }) => {
  const { data, error } = await supabase.rpc('process_refund', {
    p_refund_number: refundNumber,
    p_status: status,
    p_amount_refunded: amountRefunded || 0,
    p_admin_note: adminNote || '',
    p_refund_reference: refundReference || '',
  });
  if (error) {
    console.error('[admin] processRefund', error);
    return { ok: false, error };
  }
  return { ok: true, data };
};

// ─── NOTIFICATIONS ────────────────────────────────────────

export const fetchAllNotifications = async () => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[admin] fetchAllNotifications', error);
    return [];
  }
  return data || [];
};

export const markNotificationRead = async (notifId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notifId);
  if (error) {
    console.error('[admin] markNotificationRead', error);
    return { ok: false, error };
  }
  return { ok: true };
};

// ─── EMAIL LOGS ───────────────────────────────────────────

export const fetchEmailLogs = async () => {
  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[admin] fetchEmailLogs', error);
    return [];
  }
  return data || [];
};

// ─── PLATFORM SETTINGS ───────────────────────────────────

export const fetchPlatformSettings = async () => {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('*');
  if (error) {
    console.error('[admin] fetchPlatformSettings', error);
    return [];
  }
  return data || [];
};

export const updatePlatformSetting = async (key, value) => {
  const { data, error } = await supabase
    .from('platform_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) {
    console.error('[admin] updatePlatformSetting', error);
    return { ok: false, error };
  }
  return { ok: true, data };
};

// ─── PRODUCERS (admin) ───────────────────────────────────

export const fetchAdminProducers = async () => {
  const { data, error } = await supabase
    .from('producers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[admin] fetchAdminProducers', error);
    return [];
  }
  return data || [];
};

// Candidatures vendeurs : uniquement les boutiques liées à un compte utilisateur.
// Merge manuel avec profiles (pas de FK directe producers.user_id ↔ profiles.id).
export const fetchSellerApplications = async () => {
  const { data, error } = await supabase
    .from('producers')
    .select('*')
    .not('user_id', 'is', null)
    .order('submitted_at', { ascending: false });
  if (error) {
    console.error('[admin] fetchSellerApplications', error);
    return [];
  }
  const userIds = [...new Set((data || []).map((p) => p.user_id).filter(Boolean))];
  let profilesById = {};
  if (userIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    profilesById = Object.fromEntries(
      (profiles || []).map((pr) => [pr.id, { fullName: pr.full_name }])
    );
  }
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    location: row.location,
    description: row.description,
    established: row.established,
    contactEmail: row.contact_email,
    phone: row.phone,
    paymentInfo: row.payment_info || {},
    documents: Array.isArray(row.documents) ? row.documents : [],
    reviewNote: row.review_note,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    ownerName: profilesById[row.user_id]?.fullName || null,
  }));
};

export const updateProducerStatus = async (producerId, status, reviewNote = '') => {
  const { data, error } = await supabase.rpc('admin_update_producer_status', {
    p_producer_id: producerId,
    p_status: status,
    p_review_note: reviewNote || '',
  });
  if (error) {
    console.error('[admin] updateProducerStatus', error);
    return { ok: false, error };
  }
  return { ok: true, data };
};

// URL signée (10 min) pour consulter une pièce du bucket privé seller-documents
export const getDocumentSignedUrl = async (path) => {
  const { data, error } = await supabase.storage
    .from('seller-documents')
    .createSignedUrl(path, 600);
  if (error) {
    console.error('[admin] getDocumentSignedUrl', error);
    return null;
  }
  return data?.signedUrl || null;
};
