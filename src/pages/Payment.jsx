import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Landmark, Smartphone, CreditCard, ShieldCheck, CheckCircle,
  Loader2, AlertTriangle, Upload, RefreshCcw, Copy, Check,
} from 'lucide-react';
import { fetchOrderByUser } from '../services/orders';
import {
  fetchActivePaymentInstructions,
  uploadPaymentProof,
  submitPaymentProof,
  updatePaymentSubmission,
  fetchMySubmissions,
  getProofSignedUrl,
} from '../services/payments';
import { useLang } from '../context/LangContext';
import { useCurrency } from '../context/CurrencyContext';
import './animations.css';

const METHOD_ICONS = {
  bank_transfer: Landmark,
  bank: Landmark,
  transfer: Landmark,
  virement: Landmark,
  mobile_money: Smartphone,
  mobile: Smartphone,
  card: CreditCard,
};

const MAX_FILE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const Payment = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || '';
  const { t } = useLang();
  const { convert } = useCurrency();

  const [order, setOrder] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  // Formulaire
  const [selectedId, setSelectedId] = useState(null);
  const [payerName, setPayerName] = useState('');
  const [externalReference, setExternalReference] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [file, setFile] = useState(null);
  const [declaredAmount, setDeclaredAmount] = useState('');
  const fileInputRef = useRef(null);

  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [proofUrl, setProofUrl] = useState(null);

  const load = async () => {
    setLoading(true);
    setNotFound(false);
    if (!orderNumber) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const [fetched, instr, subs] = await Promise.all([
      fetchOrderByUser(orderNumber),
      fetchActivePaymentInstructions(),
      fetchMySubmissions(orderNumber),
    ]);
    setOrder(fetched);
    setNotFound(!fetched);
    setInstructions(instr);
    setSubmissions(subs);
    setSelectedId((cur) => (cur || (instr[0] && instr[0].id)));
    setDeclaredAmount((cur) => (cur || (fetched ? String(fetched.total).replace('.', ',') : '')));
    setFormSuccess('');
    setFormError('');
    setProofUrl(null);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [orderNumber]);

  // Prendre le focus sur le flux d'édition quand l'admin demande un complément
  const activeSubmission = submissions[0];
  const awaitingReview = activeSubmission &&
    ['proof_submitted', 'under_review'].includes(activeSubmission.status);

  const canSubmit = order && order.paymentStatus !== 'paid' &&
    (!activeSubmission || activeSubmission.status === 'payment_rejected');

  const copyRef = async (ref) => {
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard indisponible */
    }
  };

  const validateFile = (f) => {
    if (!f) return t('payment.chooseProof');
    if (!ALLOWED_TYPES.includes(f.type)) return t('payment.badType');
    if (f.size > MAX_FILE_MB * 1024 * 1024) return t('payment.badSize', { size: MAX_FILE_MB });
    return null;
  };

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    const err = validateFile(f);
    setFormError(err || '');
    if (!err) setFile(f);
  };

  const doSubmit = async () => {
    if (!order || !declaredAmount) {
      setFormError(t('payment.amountRequired'));
      return;
    }
    if (!selectedId) {
      setFormError(t('payment.chooseMethod'));
      return;
    }
    const amount = Number(String(declaredAmount).replace(',', '.'));
    if (!(amount > 0)) {
      setFormError(t('payment.badAmount'));
      return;
    }
    if (!file) {
      setFormError(t('payment.chooseProof'));
      return;
    }

    setBusy(true);
    setFormError('');
    setFormSuccess('');
    const up = await uploadPaymentProof(file);
    if (!up.ok) {
      setFormError(t('payment.uploadFailed'));
      setBusy(false);
      return;
    }

    const res = await submitPaymentProof({
      orderNumber: order.id,
      paymentMethodId: selectedId,
      declaredAmount: amount,
      currency: order.currency,
      externalReference,
      payerName,
      paidAt: paidAt ? new Date(paidAt).toISOString() : null,
      proofPath: up.path,
    });
    setBusy(false);

    if (!res.ok) {
      setFormError(res.error?.message || t('payment.submitFailed'));
      return;
    }
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    await load();
    setFormSuccess(t('payment.proofReceived'));
  };

  // Complément demandé par l'admin : correction de la preuve existante
  const doUpdate = async () => {
    if (!activeSubmission) return;
    let proofPath;
    if (file) {
      setBusy(true);
      const up = await uploadPaymentProof(file);
      if (!up.ok) {
        setFormError(t('payment.uploadFailed'));
        setBusy(false);
        return;
      }
      proofPath = up.path;
    }
    const amount = declaredAmount ? Number(String(declaredAmount).replace(',', '.')) : activeSubmission.declaredAmount;
    setBusy(true);
    setFormError('');
    const res = await updatePaymentSubmission({
      submissionId: activeSubmission.id,
      declaredAmount: amount,
      externalReference,
      payerName,
      paidAt: paidAt ? new Date(paidAt).toISOString() : null,
      proofPath: proofPath || null,
    });
    setBusy(false);
    if (!res.ok) {
      setFormError(res.error?.message || t('payment.updateFailed'));
      return;
    }
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    await load();
    setFormSuccess(t('payment.updated'));
  };

  const openProof = async () => {
    if (!activeSubmission?.proofPath) return;
    let url = proofUrl;
    if (!url) {
      url = await getProofSignedUrl(activeSubmission.proofPath);
      setProofUrl(url);
    }
    if (url) window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="container page-container">
      {/* Hero */}
      <section className="page-hero" style={{ height: '300px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('payment.title')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('payment.title')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('payment.securePayment')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('payment.manualHero')}</p>
        </div>
      </section>

      <div style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '3rem' }}>
        {loading ? (
          <div aria-hidden="true">
            <div className="jr-skel-rows" style={{ marginBottom: 16 }}>
              {[...Array(3)].map((_, i) => (
                <div className="jr-skel-row" key={i}>
                  <span className="jr-skel" style={{ width: '30%', height: 12 }} />
                  <span className="jr-skel" style={{ flex: 1, height: 12 }} />
                </div>
              ))}
            </div>
            <span className="jr-skel" style={{ display: 'block', width: '100%', height: 220, borderRadius: 12 }} />
          </div>
        ) : notFound ? (
          <div className="scroll-animate empty-state" style={{ textAlign: 'center', padding: '60px 0', background: 'var(--bg-cream)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <AlertTriangle size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>{t('payment.orderNotFound')}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{t('payment.orderNotFoundText')}</p>
            <Link to="/my-orders" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>{t('account.myOrders')}</Link>
          </div>
        ) : order && order.paymentStatus === 'paid' ? (
          <div className="scroll-animate empty-state" style={{ textAlign: 'center', padding: '60px 0', background: 'var(--success-bg)', borderRadius: '12px', border: '1px solid var(--success)' }}>
            <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>{t('payment.alreadyPaid')}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{t('payment.alreadyPaidText', { order: orderNumber })}</p>
            <Link to={`/order-confirmation?ref=${orderNumber}`} className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>{t('payment.viewConfirmation')}</Link>
          </div>
        ) : order ? (
          <>
            {/* Récapitulatif */}
            <div className="scroll-animate" style={{ background: 'var(--bg-cream)', borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'left' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>{t('payment.orderSummary', { order: orderNumber })}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span>{t('checkout.subtotal')}</span><span>{convert(order.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span>{t('checkout.shipping')}</span><span>{order.shippingFee === 0 ? t('checkout.freeShipping') : convert(order.shippingFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border)', fontWeight: 700 }}>
                <span>{t('common.total')}</span><span>{convert(order.total)}</span>
              </div>
              {order.paymentStatus === 'pending' && (
                <div style={{ marginTop: '14px', padding: '12px 14px', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={15} /> {t('payment.pendingNote')}
                </div>
              )}
            </div>

            {activeSubmission && (
              <SubmissionStatus
                submission={activeSubmission}
                onOpenProof={openProof}
              />
            )}

            {awaitingReview ? (
              <div className="scroll-animate" style={{ marginTop: '24px', background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{t('payment.completeProof')}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {activeSubmission.reviewNote
                    ? t('payment.reviewNotice', { note: activeSubmission.reviewNote })
                    : t('payment.reviewNoticeGeneric')}
                </p>
                <PaymentForm
                  method={activeSubmission}
                  declaredAmount={declaredAmount}
                  setDeclaredAmount={setDeclaredAmount}
                  payerName={payerName}
                  setPayerName={setPayerName}
                  externalReference={externalReference}
                  setExternalReference={setExternalReference}
                  paidAt={paidAt}
                  setPaidAt={setPaidAt}
                  handleFile={handleFile}
                  fileInputRef={fileInputRef}
                  formError={formError}
                  formSuccess={formSuccess}
                  busy={busy}
                  onAction={doUpdate}
                  actionLabel={t('payment.resubmit')}
                  currency={order.currency}
                />
              </div>
            ) : canSubmit ? (
              <div className="scroll-animate" style={{ marginTop: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('payment.instructionsTitle')}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{t('payment.instructionsIntro')}</p>

                {/* Référence unique Jerossa */}
                <div className="scroll-animate" style={{ background: '#fff', border: '1px dashed var(--primary)', borderRadius: '12px', padding: '18px 20px', marginBottom: '16px' }}>
                  <div className="pay-ref-label">{t('payment.refLabel')}</div>
                  <div className="pay-ref-value">
                    <code style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.5px' }}>{orderNumber}</code>
                    <button className="pay-ref-copy" onClick={() => copyRef(orderNumber)} aria-label={t('common.unitsCopied')} title={t('payment.copyRef')}>
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{t('payment.refSuffix')}</p>
                </div>

                {instructions.length === 0 ? (
                  <div className="scroll-animate" style={{ padding: '20px', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '12px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{t('payment.noInstructions')}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {instructions.map((instr) => {
                      const Icon = METHOD_ICONS[instr.paymentMethod] || Landmark;
                      const selected = selectedId === instr.id;
                      return (
                        <label
                          key={instr.id}
                          className={`pay-method-card ${selected ? 'pay-method-card--selected' : ''}`}
                          onClick={() => setSelectedId(instr.id)}
                        >
                          <input
                            type="radio"
                            name="payment-instruction"
                            checked={selected}
                            onChange={() => setSelectedId(instr.id)}
                            style={{ accentColor: 'var(--primary)' }}
                          />
                          <Icon size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div className="pay-method-name">{t('payment.method.' + instr.paymentMethod)}</div>
                            <div className="pay-method-sub">{instr.beneficiary} · {instr.bankOrOperator}</div>
                            <div className="pay-method-acc">{t('payment.account')} : {instr.accountNumber}</div>
                            {instr.instructions && (
                              <div className="pay-method-details">{instr.instructions}</div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                <PaymentForm
                  method={null}
                  declaredAmount={declaredAmount}
                  setDeclaredAmount={setDeclaredAmount}
                  payerName={payerName}
                  setPayerName={setPayerName}
                  externalReference={externalReference}
                  setExternalReference={setExternalReference}
                  paidAt={paidAt}
                  setPaidAt={setPaidAt}
                  handleFile={handleFile}
                  fileInputRef={fileInputRef}
                  formError={formError}
                  formSuccess={formSuccess}
                  busy={busy}
                  onAction={doSubmit}
                  actionLabel={t('payment.submitProof')}
                  currency={order.currency}
                />
              </div>
            ) : (
              <div className="scroll-animate empty-state" style={{ textAlign: 'center', padding: '40px 0', background: 'var(--bg-cream)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '24px' }}>
                <ShieldCheck size={40} style={{ color: 'var(--success)', marginBottom: '12px' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>{t('payment.noAction')}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '13px' }}>{t('payment.noActionText')}</p>
                <Link to={`/order-confirmation?ref=${orderNumber}`} className="btn btn-primary premium-btn" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>{t('payment.viewConfirmation')}</Link>
              </div>
            )}

            <div className="scroll-animate" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
              {t('payment.secureFooter')}
            </div>
          </>
        ) : null}
      </div>

      <style>{`
        .pay-ref-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; }
        .pay-ref-value { display: flex; align-items: center; gap: 10px; }
        .pay-ref-copy { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-white); color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .pay-ref-copy:hover { border-color: var(--primary); color: var(--primary); }
        .pay-method-card { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-white); cursor: pointer; transition: all 0.2s; }
        .pay-method-card:hover { border-color: var(--primary); }
        .pay-method-card--selected { border-color: var(--primary); background: var(--primary-light); }
        .pay-method-card input { margin-top: 3px; }
        .pay-method-name { font-weight: 600; font-size: 14px; color: var(--text-dark); }
        .pay-method-sub { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
        .pay-method-acc { font-size: 13px; font-weight: 600; color: var(--text-dark); margin-top: 6px; font-family: monospace; letter-spacing: 0.3px; }
        .pay-method-details { font-size: 12px; color: var(--text-muted); margin-top: 6px; line-height: 1.5; }
        .pay-form { display: flex; flex-direction: column; gap: 14px; margin-top: 6px; }
        .pay-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 640px) { .pay-form-grid { grid-template-columns: 1fr; } }
        .pay-label { font-size: 12px; font-weight: 600; color: var(--text-dark); margin-bottom: 5px; display: block; }
        .pay-input, .pay-select { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13.5px; color: var(--text-dark); background: var(--bg-white); }
        .pay-input:focus, .pay-select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .pay-file { width: 100%; padding: 10px 12px; border: 1px dashed var(--border); border-radius: 8px; font-size: 13px; background: var(--bg-cream); cursor: pointer; color: var(--text-muted); }
        .pay-file::-webkit-file-upload-button { margin-right: 12px; padding: 7px 12px; background: var(--primary); color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .pay-action { width: 100%; padding: 13px; background: var(--success); color: #fff; border: none; border-radius: 9px; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
        .pay-action:hover { background: #23663f; }
        .pay-action:disabled { opacity: 0.6; cursor: not-allowed; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// ── Statut courant de la preuve ─────────────────────────────────────

const STATUS_TONE = {
  proof_submitted: { icon: ShieldCheck, tone: 'blue' },
  under_review: { icon: AlertTriangle, tone: 'amber' },
  payment_confirmed: { icon: CheckCircle, tone: 'green' },
  refunded: { icon: RefreshCcw, tone: 'neutral' },
  partially_refunded: { icon: RefreshCcw, tone: 'neutral' },
};

const SubmissionStatus = ({ submission, onOpenProof }) => {
  const { t } = useLang();
  const tonal = STATUS_TONE[submission.status] || { icon: ShieldCheck, tone: 'blue' };
  const ToneIcon = tonal.icon;
  const palette = {
    blue: { bg: 'var(--success-bg)', fg: 'var(--success)' },
    amber: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
    green: { bg: 'var(--success-bg)', fg: 'var(--success)' },
    neutral: { bg: 'var(--bg-cream)', fg: 'var(--text-muted)' },
  }[tonal.tone];

  return (
    <div className="scroll-animate" style={{ background: palette.bg, border: `1px solid ${palette.fg}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ToneIcon size={18} style={{ color: palette.fg, flexShrink: 0 }} />
        <strong style={{ fontSize: '13.5px', color: 'var(--text-dark)' }}>{t('status.' + submission.status)}</strong>
        {submission.proofPath && (
          <button
            onClick={onOpenProof}
            style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', background: 'transparent', border: '1px solid var(--primary)', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer' }}
          >
            {t('payment.viewProof')}
          </button>
        )}
      </div>
      {(submission.rejectionReason || submission.reviewNote) && (
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.5 }}>
          {submission.status === 'payment_rejected'
            ? `${t('payment.rejectedNotice')} : ${submission.rejectionReason}`
            : submission.reviewNote && `${t('payment.adminNote')} : ${submission.reviewNote}`}
        </p>
      )}
    </div>
  );
};

// ── Formulaire partagé (soumission initiale / correction) ───────────

const PaymentForm = ({
  declaredAmount, setDeclaredAmount,
  payerName, setPayerName,
  externalReference, setExternalReference,
  paidAt, setPaidAt,
  handleFile, fileInputRef,
  formError, formSuccess, busy, onAction, actionLabel, currency,
}) => {
  const { t } = useLang();
  return (
    <div className="pay-form">
      <div className="pay-form-grid">
        <div>
          <label className="pay-label" htmlFor="pay-amount">{t('payment.declaredAmount')} ({currency})</label>
          <input
            id="pay-amount"
            className="pay-input"
            type="text"
            inputMode="decimal"
            value={declaredAmount}
            onChange={(e) => setDeclaredAmount(e.target.value)}
            placeholder="0,00"
          />
          <span className="pay-hint" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>{t('payment.exactAmountHint')}</span>
        </div>
        <div>
          <label className="pay-label" htmlFor="pay-payer">{t('payment.payerName')}</label>
          <input
            id="pay-payer"
            className="pay-input"
            type="text"
            value={payerName}
            onChange={(e) => setPayerName(e.target.value)}
            placeholder={t('payment.payerNamePh')}
          />
        </div>
        <div>
          <label className="pay-label" htmlFor="pay-ref">{t('payment.externalReference')}</label>
          <input
            id="pay-ref"
            className="pay-input"
            type="text"
            value={externalReference}
            onChange={(e) => setExternalReference(e.target.value)}
            placeholder={t('payment.externalReferencePh')}
          />
        </div>
        <div>
          <label className="pay-label" htmlFor="pay-date">{t('payment.paidOn')}</label>
          <input
            id="pay-date"
            className="pay-input"
            type="date"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            defaultValue=""
          />
        </div>
      </div>

      <div>
        <label className="pay-label" htmlFor="pay-file">{t('payment.proofLabel')}</label>
        <input
          id="pay-file"
          ref={fileInputRef}
          className="pay-file"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFile}
        />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
          {t('payment.proofHint', { size: MAX_FILE_MB })}
        </span>
      </div>

      {formError && (
        <div style={{ padding: '12px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={15} /> {formError}
        </div>
      )}
      {formSuccess && (
        <div style={{ padding: '12px 14px', background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={15} /> {formSuccess}
        </div>
      )}

      <button
        className="pay-action"
        onClick={onAction}
        disabled={busy}
        style={{ opacity: busy ? 0.7 : 1 }}
      >
        {busy
          ? <><Loader2 size={16} className="spin" /> {t('payment.processing')}…</>
          : <><Upload size={16} /> {actionLabel}</>}
      </button>
    </div>
  );
};

export default Payment;