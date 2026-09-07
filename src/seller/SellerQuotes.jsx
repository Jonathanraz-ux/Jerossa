import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Loader2, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { fetchMyQuotes, respondToQuote } from '../services/seller';
import { formatEUR, formatDateTime } from '../admin/format';
import { useLang } from '../context/LangContext';

const QUOTE_STATUS_TONES = {
  pending: 'amber',
  responded: 'blue',
  accepted: 'green',
  declined: 'red',
};

const QuoteBadge = ({ status, t }) => (
  <span className={`sv-badge sv-badge--${QUOTE_STATUS_TONES[status] || 'neutral'}`}>
    {t('seller.quotes.status' + status.charAt(0).toUpperCase() + status.slice(1)) || status}
  </span>
);

const RespondModal = ({ quote, onClose, onDone, t }) => {
  const [price, setPrice] = useState(quote.response ? String(quote.response.priceEur) : '');
  const [unit, setUnit] = useState(quote.unit);
  const [delay, setDelay] = useState(quote.delayRequested || '');
  const [message, setMessage] = useState(quote.response?.message || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!price || Number(price) <= 0) {
      setError(t('seller.quotes.errorPrice'));
      return;
    }
    setBusy(true);
    const res = await respondToQuote({
      quoteRequestId: quote.id,
      priceEur: price,
      unit,
      delay,
      message,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error?.message || t('seller.quotes.errorSend'));
      return;
    }
    onDone();
  };

  return (
    <div className="sv-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sv-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3>{t('seller.quotes.modalTitle', { number: quote.quoteNumber })}</h3>
          <button type="button" className="sv-icon-btn" onClick={onClose} aria-label={t('seller.quotes.modalClose')}><X size={14} /></button>
        </div>
        <p className="sv-modal-sub">{quote.productTitle} — {quote.quantity} {quote.unit}</p>

        {error && <div className="sv-error-banner"><AlertTriangle size={15} /><span>{error}</span></div>}

        <form onSubmit={submit}>
          <div className="sl-field">
            <label className="sl-label">{t('seller.quotes.fieldPrice', { unit })} <span className="sl-required">*</span></label>
            <input className="sl-input" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="sv-form-row">
            <div className="sl-field">
              <label className="sl-label">{t('seller.quotes.fieldUnit')}</label>
              <select className="sl-input" value={unit} onChange={(e) => setUnit(e.target.value)}>
                {['kg', 'g', 'L', 'Pièce', 'Unitaire', 'Tonnes'].map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="sl-field">
              <label className="sl-label">{t('seller.quotes.fieldDelay')}</label>
              <input className="sl-input" placeholder={t('seller.quotes.fieldDelayPlaceholder')} value={delay} onChange={(e) => setDelay(e.target.value)} />
            </div>
          </div>
          <div className="sl-field">
            <label className="sl-label">{t('seller.quotes.fieldMessage')}</label>
            <textarea className="sl-input sl-textarea" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('seller.quotes.fieldMessagePlaceholder')} />
          </div>

          <div className="sv-quote-foot" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="sv-btn sv-btn--ghost" onClick={onClose}>{t('seller.quotes.cancel')}</button>
            <button type="submit" className="sv-btn sv-btn--primary" disabled={busy}>
              {busy && <Loader2 size={14} style={{ animation: 'sv-rotate 0.9s linear infinite' }} />}
              {t('seller.quotes.sendResponse')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SellerQuotes = () => {
  const { producer } = useOutletContext();
  const { t, lang } = useLang();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchMyQuotes(producer.id);
    setQuotes(data);
    setLoading(false);
  }, [producer]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="sv-loader"><div className="sv-loader-spinner" /><p>{t('common.loading')}</p></div>;
  }

  return (
    <div style={{ maxWidth: 780 }}>
      <h2 className="sv-section-title">{t('seller.quotes.title', { count: quotes.length })}</h2>

      {quotes.length === 0 ? (
        <div className="sv-panel">
          <div className="sv-empty">
            <FileText size={30} />
            <p>{t('seller.quotes.empty')}<br />{t('seller.quotes.emptyHint')}</p>
          </div>
        </div>
      ) : (
        quotes.map((q) => (
          <article key={q.id} className="sv-quote-card">
            <div className="sv-quote-head">
              <div>
                <span className="sv-quote-number">{q.quoteNumber} · {formatDateTime(q.createdAt, lang)}</span>
                <div className="sv-quote-title">{q.productTitle}</div>
              </div>
              <QuoteBadge status={q.status} t={t} />
            </div>

            <dl className="sv-quote-meta">
              <div><dt>{t('seller.quotes.quantity')}</dt><dd>{q.quantity} {q.unit}</dd></div>
              {q.delayRequested && <div><dt>{t('seller.quotes.desiredDelay')}</dt><dd>{q.delayRequested}</dd></div>}
              <div><dt>{t('seller.quotes.currency')}</dt><dd>{q.currency}</dd></div>
            </dl>

            {q.message && (
              <div className="sv-quote-msg">
                «&nbsp;{q.message}&nbsp;»
              </div>
            )}

            {q.response && (
              <div className="sv-response-box">
                <CheckCircle2 size={13} style={{ verticalAlign: '-2px', color: '#2e7d32' }} />
                {' '}{t('seller.quotes.yourResponse')} : <strong>{formatEUR(q.response.priceEur)} / {q.response.unit}</strong>
                {q.response.delay && <> · {t('seller.quotes.delay', { delay: q.response.delay })}</>}
                {q.message !== q.response.message && q.response.message && (
                  <div className="sv-dim" style={{ marginTop: 4 }}>{q.response.message}</div>
                )}
              </div>
            )}

            <div className="sv-quote-foot">
              {(q.status === 'pending' || q.status === 'responded') && (
                <button type="button" className="sv-btn sv-btn--primary" onClick={() => setResponding(q)}>
                  {q.response ? t('seller.quotes.editResponse') : t('seller.quotes.respond')}
                </button>
              )}
            </div>
          </article>
        ))
      )}

      {responding && (
        <RespondModal
          quote={responding}
          onClose={() => setResponding(null)}
          onDone={() => { setResponding(null); load(); }}
          t={t}
        />
      )}
    </div>
  );
};

export default SellerQuotes;
