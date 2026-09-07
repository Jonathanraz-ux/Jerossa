import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RotateCcw, Check, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { fetchOrderByNumber } from '../services/orders';
import { requestRefund } from '../services/refunds';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './animations.css';

const REASONS = [
  { value: 'produit_non_conforme', labelKey: 'refund.reasonNotConforming' },
  { value: 'produit_endommage', labelKey: 'refund.reasonDamaged' },
  { value: 'colis_non_recu', labelKey: 'refund.reasonNotReceived' },
  { value: 'erreur_commande', labelKey: 'refund.reasonOrderError' },
  { value: 'autre', labelKey: 'refund.reasonOther' },
];

const formatEUR = (value) => `${Number(value).toFixed(2).replace('.', ',')} €`;

const RefundRequest = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useLang();
  const orderNumber = searchParams.get('order') || '';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!orderNumber) {
      setLoading(false);
      return;
    }
    fetchOrderByNumber(orderNumber).then((fetched) => {
      if (!active) return;
      setOrder(fetched);
      setLoading(false);
      if (fetched) setAmount(String(fetched.total));
    });
    return () => { active = false; };
  }, [orderNumber]);

  const eligible = order && order.paymentStatus === 'paid' && ['paid', 'shipped', 'delivered'].includes(order.status);

  const handleSubmit = async () => {
    if (!reason) {
      setFormError(t('refund.reasonRequired'));
      return;
    }
    const amountNum = Number(String(amount).replace(',', '.'));
    if (!amountNum || amountNum <= 0) {
      setFormError(t('refund.invalidAmount'));
      return;
    }
    if (order && amountNum > order.total) {
      setFormError(t('refund.amountExceeds'));
      return;
    }
    setFormError('');
    setSubmitting(true);
    const res = await requestRefund({
      orderNumber,
      reason,
      description,
      amountRequested: amountNum,
      recipient: email,
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(res.data);
    } else {
      setFormError(res.error?.message || t('refund.submitError'));
    }
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
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('refund.refunds')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('refund.refunds')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('refund.requestTitle')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('refund.requestSubtitle')}</p>
        </div>
      </section>

      <div style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '3rem' }}>
        {loading ? (
          <div className="scroll-animate" style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>{t('common.loading')}…</p>
          </div>
        ) : !order ? (
          <div className="scroll-animate empty-state" style={{ textAlign: 'center', padding: '60px 0', background: 'var(--bg-cream)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>{t('refund.orderNotFound')}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{t('refund.orderNotFoundText')}</p>
            <Link to="/my-orders" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>{t('account.myOrders')}</Link>
          </div>
        ) : !eligible ? (
          <div className="scroll-animate empty-state" style={{ textAlign: 'center', padding: '60px 0', background: 'var(--bg-cream)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>{t('refund.notEligible')}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{t('refund.notEligibleText', { order: orderNumber })}</p>
            <Link to={`/order/${orderNumber}`} className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>{t('refund.viewOrder')}</Link>
          </div>
        ) : done ? (
          <div className="scroll-animate" style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={40} style={{ color: 'var(--success)' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>{t('refund.requestSent')}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{t('refund.requestReference')}</p>
            <div style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--bg-cream)', border: '1px dashed var(--border)', borderRadius: '8px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.5px', marginBottom: '24px' }}>{done.refund_number}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '440px', margin: '0 auto 32px' }}>
              {t('refund.requestFollowUp')}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={`/refund/${done.refund_number}`} className="btn btn-primary premium-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                <RotateCcw size={16} /> {t('refund.trackRequest')}
              </Link>
              <Link to="/my-orders" className="btn btn-outline premium-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                {t('account.myOrders')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="scroll-animate" style={{ background: 'var(--bg-cream)', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('refund.orderConcerned')}</div>
                <div style={{ fontWeight: 700 }}>{orderNumber}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('refund.totalPaid')}</div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatEUR(order.total)}</div>
              </div>
            </div>

            <div className="scroll-animate" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>{t('refund.yourRequest')}</h3>

              <div className="form-group">
                <label className="form-label">{t('refund.reason')}</label>
                <select className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                  <option value="">{t('refund.chooseReason')}</option>
                  {REASONS.map((r) => <option key={r.value} value={r.value}>{t(r.labelKey)}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('refund.description')}</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder={t('refund.descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('refund.amountRequestedField')}</label>
                <input type="number" min="0.01" step="0.01" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('refund.maximum', { amount: formatEUR(order.total) })}</span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={13} /> {t('refund.trackingEmail')}
                </label>
                <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" />
              </div>

              {formError && (
                <div style={{ marginBottom: '1rem', padding: '12px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px', fontSize: '13px' }}>{formError}</div>
              )}

              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? <><Loader2 size={16} className="spin" /> {t('refund.sending')}…</> : <><RotateCcw size={16} /> {t('refund.sendRequest')}</>}
              </button>
            </div>

            <div className="scroll-animate" style={{ padding: '14px 16px', background: 'var(--bg-cream)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>{t('refund.emailSimulated')}</span>
            </div>
          </>
        )}
      </div>

      <Link to={`/order/${orderNumber}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> {t('refund.backToOrder')}
      </Link>

      <style>{`
        .form-textarea { width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-family: inherit; font-size: 14px; color: var(--text-dark); background: var(--bg-white); resize: vertical; }
        .form-textarea:focus { outline: none; border-color: var(--primary); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default RefundRequest;
