import { supabase } from '../lib/supabase';

const STATUS_LABELS = {
  pending: 'En attente de réponse',
  responded: 'Réponse reçue',
  accepted: 'Acceptée',
  declined: 'Refusée',
};

const mapQuote = (row) => ({
  id: row.quote_number,
  quoteNumber: row.quote_number,
  uuid: row.id,
  date: row.created_at ? new Date(row.created_at).toLocaleDateString('fr-FR') : '—',
  createdAt: row.created_at,
  status: row.status,
  statusLabel: STATUS_LABELS[row.status] || row.status,
  productCode: row.product_code,
  productTitle: row.product_title,
  seller: row.seller_name,
  sellerId: row.seller_id,
  quantity: Number(row.quantity),
  unit: row.unit,
  currency: row.currency,
  message: row.message,
  delayRequested: row.delay_requested,
  orderNumber: row.order_number,
  response: row.quote_responses && row.quote_responses.length
    ? {
        priceEUR: Number(row.quote_responses[0].price_eur),
        unit: row.quote_responses[0].unit,
        delay: row.quote_responses[0].delay,
        message: row.quote_responses[0].message,
        date: row.quote_responses[0].created_at
          ? new Date(row.quote_responses[0].created_at).toLocaleDateString('fr-FR')
          : '—',
      }
    : null,
});

export const createQuoteRequest = async ({ productCode, productTitle, sellerId, sellerName, quantity, unit, message, delayRequested, currency }) => {
  const { data, error } = await supabase.rpc('create_quote_request', {
    p_product_code: productCode,
    p_product_title: productTitle,
    p_seller_id: sellerId,
    p_seller_name: sellerName,
    p_quantity: quantity,
    p_unit: unit,
    p_message: message,
    p_delay_requested: delayRequested,
    p_currency: currency,
  });
  if (error) {
    console.error('[quotes] createQuoteRequest', error);
    return { ok: false, error, data: null };
  }
  return { ok: true, error: null, data };
};

export const fetchMyQuoteRequests = async (userId) => {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*, quote_responses(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[quotes] fetchMyQuoteRequests', error);
    return [];
  }
  return (data || []).map(mapQuote);
};

export const fetchQuoteRequestByNumber = async (quoteNumber) => {
  if (!quoteNumber) return null;
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*, quote_responses(*)')
    .eq('quote_number', quoteNumber)
    .maybeSingle();
  if (error) {
    console.error('[quotes] fetchQuoteRequestByNumber', error);
    return null;
  }
  return data ? mapQuote(data) : null;
};

export const acceptQuote = async (quoteUuid) => {
  const { data, error } = await supabase.rpc('accept_quote', {
    p_quote_request_id: quoteUuid,
  });
  if (error) {
    console.error('[quotes] acceptQuote', error);
    return { ok: false, error, data: null };
  }
  return { ok: true, error: null, data };
};

export const declineQuote = async (quoteUuid) => {
  const { data, error } = await supabase.rpc('decline_quote', {
    p_quote_request_id: quoteUuid,
  });
  if (error) {
    console.error('[quotes] declineQuote', error);
    return { ok: false, error, data: null };
  }
  return { ok: true, error: null, data };
};
