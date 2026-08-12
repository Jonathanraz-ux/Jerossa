import { supabase } from '../lib/supabase';

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

const buildTimeline = (status, createdAt) => {
  const date = (completed) =>
    completed && createdAt ? new Date(createdAt).toLocaleDateString('fr-FR') : '—';
  const flags = {
    placed: true,
    paid: ['paid', 'shipped', 'delivered'].includes(status),
    shipped: ['shipped', 'delivered'].includes(status),
    out: status === 'delivered',
    delivered: status === 'delivered',
  };
  if (status === 'confirmed') flags.paid = true;
  if (status === 'pending') {
    flags.paid = false;
    flags.shipped = false;
    flags.out = false;
    flags.delivered = false;
  }
  return [
    { label: 'Commande passée', date: date(true), completed: flags.placed },
    { label: 'Paiement confirmé', date: date(flags.paid), completed: flags.paid },
    { label: 'Expédié', date: date(flags.shipped), completed: flags.shipped },
    { label: 'En livraison', date: date(flags.out), completed: flags.out },
    { label: 'Livré', date: date(flags.delivered), completed: flags.delivered },
  ];
};

const mapOrder = (row) => ({
  id: row.order_number,
  orderNumber: row.order_number,
  uuid: row.id,
  date: row.created_at ? new Date(row.created_at).toLocaleDateString('fr-FR') : '—',
  createdAt: row.created_at,
  status: row.status,
  statusLabel: STATUS_LABELS[row.status] || row.status,
  currency: row.currency,
  subtotal: Number(row.subtotal),
  shippingFee: Number(row.shipping_fee),
  total: Number(row.total),
  paymentMethod: row.payment_method,
  paymentStatus: row.payment_status,
  address: row.shipping_address || {},
  tracking: row.tracking,
  items: (row.order_items || []).map((it) => ({
    productId: it.product_code,
    name: it.title,
    seller: it.seller,
    qty: it.quantity,
    price: `${Number(it.price_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € / ${it.unit}`,
    priceEUR: Number(it.price_eur),
    unit: it.unit,
    image: it.image_url,
  })),
  steps: buildTimeline(row.status, row.created_at),
});

export const createOrder = async ({ items, subtotal, shippingFee, total, currency, paymentMethod, address }) => {
  const { data, error } = await supabase.rpc('create_order', {
    p_items: items,
    p_subtotal: subtotal,
    p_shipping_fee: shippingFee,
    p_total: total,
    p_currency: currency,
    p_payment_method: paymentMethod,
    p_address: address,
  });
  if (error) {
    console.error('[orders] createOrder', error);
    return { ok: false, error, data: null };
  }
  return { ok: true, error: null, data };
};

export const confirmPayment = async (orderNumber, success, provider) => {
  const { data, error } = await supabase.rpc('confirm_payment', {
    p_order_number: orderNumber,
    p_success: success,
    p_provider: provider || 'simulate',
  });
  if (error) {
    console.error('[orders] confirmPayment', error);
    return { ok: false, error, data: null };
  }
  return { ok: true, error: null, data };
};

export const fetchMyOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[orders] fetchMyOrders', error);
    return [];
  }
  return (data || []).map(mapOrder);
};

export const fetchOrderByNumber = async (orderNumber) => {
  if (!orderNumber) return null;
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', orderNumber)
    .maybeSingle();
  if (error) {
    console.error('[orders] fetchOrderByNumber', error);
    return null;
  }
  return data ? mapOrder(data) : null;
};
