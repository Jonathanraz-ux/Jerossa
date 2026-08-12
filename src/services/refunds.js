import { supabase } from '../lib/supabase';

const STATUS_LABELS = {
  requested: 'Demandée',
  under_review: 'En cours d\'examen',
  approved: 'Approuvée',
  rejected: 'Refusée',
  processed: 'Remboursée',
};

const mapRefund = (row) => ({
  id: row.refund_number,
  refundNumber: row.refund_number,
  uuid: row.id,
  orderNumber: row.order_number,
  date: row.created_at ? new Date(row.created_at).toLocaleDateString('fr-FR') : '—',
  requestedAt: row.requested_at,
  status: row.status,
  statusLabel: STATUS_LABELS[row.status] || row.status,
  currency: row.currency,
  amountRequested: Number(row.amount_requested),
  amountRefunded: Number(row.amount_refunded),
  reason: row.reason,
  description: row.description,
  adminNote: row.admin_note,
  refundReference: row.refund_reference,
  processedAt: row.processed_at,
});

export const requestRefund = async ({ orderNumber, reason, description, amountRequested, recipient }) => {
  const { data, error } = await supabase.rpc('request_refund', {
    p_order_number: orderNumber,
    p_reason: reason,
    p_description: description,
    p_amount_requested: amountRequested,
    p_recipient: recipient,
  });
  if (error) {
    console.error('[refunds] requestRefund', error);
    return { ok: false, error, data: null };
  }
  return { ok: true, error: null, data };
};

export const fetchMyRefunds = async (userId) => {
  const { data, error } = await supabase
    .from('refunds')
    .select('*')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[refunds] fetchMyRefunds', error);
    return [];
  }
  return (data || []).map(mapRefund);
};

export const fetchRefundByNumber = async (refundNumber) => {
  if (!refundNumber) return null;
  const { data, error } = await supabase
    .from('refunds')
    .select('*')
    .eq('refund_number', refundNumber)
    .maybeSingle();
  if (error) {
    console.error('[refunds] fetchRefundByNumber', error);
    return null;
  }
  return data ? mapRefund(data) : null;
};
