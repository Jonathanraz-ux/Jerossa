import { supabase } from '../lib/supabase';

// ─── INSTRUCTIONS DE PAIEMENT (coordonnées officielles Jerossa) ─────

// Côté acheteur : uniquement les méthodes actives (nécessaires au paiement).
export const fetchActivePaymentInstructions = async () => {
  const { data, error } = await supabase
    .from('payment_instructions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[payments] fetchActivePaymentInstructions', error);
    return [];
  }
  return (data || []).map(mapInstruction);
};

// Côté admin financier : toutes les méthodes (actives ou non).
export const fetchAllPaymentInstructions = async () => {
  const { data, error } = await supabase
    .from('payment_instructions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[payments] fetchAllPaymentInstructions', error);
    return [];
  }
  return (data || []).map(mapInstruction);
};

const mapInstruction = (row) => ({
  id: row.id,
  beneficiary: row.beneficiary_legal_name,
  paymentMethod: row.payment_method,
  bankOrOperator: row.bank_or_operator,
  accountNumber: row.account_number,
  currency: row.currency,
  country: row.country,
  instructions: row.instructions || '',
  active: row.is_active,
  commissionRate: row.commission_rate == null ? null : Number(row.commission_rate),
  payoutDelayDays: row.payout_delay_days,
  doubleValidationThreshold: Number(row.double_validation_threshold || 0),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Les numéros complets ne sont montrés qu'aux endroits nécessaires (édition admin).
export const maskAccount = (value) => {
  if (!value) return '—';
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '');
  if (cleaned.length <= 4) return '••••';
  return '•••• •••• ' + cleaned.slice(-4);
};

export const upsertPaymentInstruction = async (payload) => {
  const { error } = await supabase.from('payment_instructions').upsert({
    ...(payload.id ? { id: payload.id } : {}),
    beneficiary_legal_name: payload.beneficiary,
    payment_method: payload.paymentMethod,
    bank_or_operator: payload.bankOrOperator,
    account_number: payload.accountNumber,
    currency: payload.currency,
    country: payload.country,
    instructions: payload.instructions || '',
    is_active: payload.active,
    commission_rate: payload.commissionRate == null ? null : Number(payload.commissionRate),
    payout_delay_days: Number(payload.payoutDelayDays || 3),
    double_validation_threshold: Number(payload.doubleValidationThreshold || 0),
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error('[payments] upsertPaymentInstruction', error);
    return { ok: false, error };
  }
  return { ok: true };
};

export const togglePaymentInstructionActive = async (instructionId, active) => {
  const { error } = await supabase
    .from('payment_instructions')
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq('id', instructionId);
  if (error) {
    console.error('[payments] togglePaymentInstructionActive', error);
    return { ok: false, error };
  }
  return { ok: true };
};

export const deletePaymentInstruction = async (instructionId) => {
  const { error } = await supabase
    .from('payment_instructions')
    .delete()
    .eq('id', instructionId);
  if (error) {
    console.error('[payments] deletePaymentInstruction', error);
    return { ok: false, error };
  }
  return { ok: true };
};

// ─── PREUVE DE PAIEMENT (bucket privé) ───────────────────────────────

export const uploadPaymentProof = async (file) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: new Error('Non connecté') };

  const base = encodeURIComponent(file.name.replace(/\.(jpg|jpeg|png|webp|pdf)$/i, ''))
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 60);
  const safeName = `${Date.now()}-${base}.${(file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i) || ['.pdf'])[0].replace('.', '')}`;
  const path = `payment-proofs/${user.id}/${safeName}`;

  const { data, error } = await supabase.storage
    .from('payment-proofs')
    .upload(path, file, {
      contentType: file.type || 'application/pdf',
      upsert: false,
      cacheControl: '3600',
    });
  if (error) {
    console.error('[payments] uploadPaymentProof', error);
    return { ok: false, error };
  }
  return { ok: true, path: data?.path || path };
};

export const getProofSignedUrl = async (proofPath) => {
  if (!proofPath) return null;
  const { data, error } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(proofPath, 600);
  if (error) {
    console.error('[payments] getProofSignedUrl', error);
    return null;
  }
  return data?.signedUrl || null;
};

// ─── SOUMISSIONS (acheteur) ─────────────────────────────────────────

export const submitPaymentProof = async (payload) => {
  const { data, error } = await supabase.rpc('submit_payment_proof', {
    p_order_number: payload.orderNumber,
    p_payment_method_id: payload.paymentMethodId,
    p_declared_amount: Number(payload.declaredAmount),
    p_currency: payload.currency,
    p_external_reference: payload.externalReference || '',
    p_payer_name: payload.payerName || '',
    p_paid_at: payload.paidAt || null,
    p_proof_path: payload.proofPath,
  });
  if (error) {
    console.error('[payments] submitPaymentProof', error);
    return { ok: false, error, data: null };
  }
  return { ok: true, error: null, data };
};

export const updatePaymentSubmission = async (payload) => {
  const { data, error } = await supabase.rpc('update_payment_submission', {
    p_submission_id: payload.submissionId,
    p_declared_amount: payload.declaredAmount == null ? null : Number(payload.declaredAmount),
    p_external_reference: payload.externalReference || '',
    p_payer_name: payload.payerName || '',
    p_paid_at: payload.paidAt || null,
    p_proof_path: payload.proofPath || null,
  });
  if (error) {
    console.error('[payments] updatePaymentSubmission', error);
    return { ok: false, error, data: null };
  }
  return { ok: true, error: null, data };
};

export const fetchMySubmissions = async (orderNumber) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !orderNumber) return [];
  const { data, error } = await supabase
    .from('payment_submissions')
    .select('*')
    .eq('order_number', orderNumber)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[payments] fetchMySubmissions', error);
    return [];
  }
  return (data || []).map(mapSubmission);
};

const mapSubmission = (row) => ({
  id: row.id,
  orderId: row.order_id,
  orderNumber: row.order_number,
  paymentMethodId: row.payment_method_id,
  declaredAmount: Number(row.declared_amount),
  expectedAmount: Number(row.expected_amount),
  currency: row.currency,
  externalReference: row.external_reference,
  payerName: row.payer_name,
  paidAt: row.paid_at,
  proofPath: row.proof_path,
  proofMime: row.proof_mime,
  status: row.status,
  rejectionReason: row.rejection_reason,
  reviewNote: row.review_note,
  reviewedAt: row.reviewed_at,
  createdAt: row.created_at,
});

// ─── ADMIN : PAIEMENTS À VÉRIFIER ────────────────────────────────────

export const fetchPaymentSubmissionsAdmin = async () => {
  const { data, error } = await supabase
    .from('payment_submissions')
    .select('*, payment_instructions(id, beneficiary_legal_name, payment_method, bank_or_operator)')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[payments] fetchPaymentSubmissionsAdmin', error);
    return [];
  }

  const rows = data || [];
  const orderIds = [...new Set(rows.map((r) => r.order_id).filter(Boolean))];
  const buyerIds = [...new Set(rows.map((r) => r.buyer_id).filter(Boolean))];

  const [{ data: orders }, { data: profiles }] = await Promise.all([
    orderIds.length
      ? supabase.from('orders').select('*, order_items(*)').in('id', orderIds)
      : Promise.resolve({ data: [] }),
    buyerIds.length
      ? supabase.from('profiles').select('id, full_name').in('id', buyerIds)
      : Promise.resolve({ data: [] }),
  ]);

  const ordersById = Object.fromEntries((orders || []).map((o) => [o.id, o]));
  const namesById = Object.fromEntries((profiles || []).map((p) => [p.id, p.full_name]));

  return rows.map((r) => {
    const order = ordersById[r.order_id];
    const proofFull = r.proof_path || '';
    return {
      ...mapSubmission(r),
      instruction: r.payment_instructions
        ? {
            beneficiary: r.payment_instructions.beneficiary_legal_name,
            paymentMethod: r.payment_instructions.payment_method,
            bankOrOperator: r.payment_instructions.bank_or_operator,
            id: r.payment_instructions.id,
          }
        : null,
      order: order
        ? {
            id: order.id,
            subtotal: Number(order.subtotal),
            shippingFee: Number(order.shipping_fee),
            total: Number(order.total),
            currency: order.currency,
            status: order.status,
            paymentStatus: order.payment_status,
            address: order.shipping_address || {},
            createdAt: order.created_at,
            sellers: [...new Set((order.order_items || []).map((it) => it.seller).filter(Boolean))],
          }
        : null,
      buyerName: namesById[r.buyer_id] || null,
      proofFull,
    };
  });
};

export const reviewPaymentSubmission = async ({ submissionId, action, reason }) => {
  const { data, error } = await supabase.rpc('review_payment_submission', {
    p_submission_id: submissionId,
    p_action: action,
    p_reason: reason || '',
  });
  if (error) {
    console.error('[payments] reviewPaymentSubmission', error);
    return { ok: false, error, data: null };
  }
  return { ok: true, error: null, data };
};

// ─── NOTIFICATIONS (acheteur) ────────────────────────────────────────

export const fetchMyNotifications = async (limit = 12) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[payments] fetchMyNotifications', error);
    return [];
  }
  return data || [];
};