import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Loader2, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { fetchMyQuotes, respondToQuote } from '../services/seller';
import { formatEUR, formatDateTime } from '../admin/format';

const STATUS = {
  pending: { label: 'À répondre', tone: 'amber' },
  responded: { label: 'Répondu', tone: 'blue' },
  accepted: { label: 'Accepté par le client', tone: 'green' },
  declined: { label: 'Refusé par le client', tone: 'red' },
};

const QuoteBadge = ({ status }) => (
  <span className={`sv-badge sv-badge--${STATUS[status]?.tone || 'neutral'}`}>
    {STATUS[status]?.label || status}
  </span>
);

const RespondModal = ({ quote, onClose, onDone }) => {
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
      setError('Indiquez un prix valide.');
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
      setError(res.error?.message || 'Échec de l\'envoi de la réponse.');
      return;
    }
    onDone();
  };

  return (
    <div className="sv-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sv-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3>Répondre au devis {quote.quoteNumber}</h3>
          <button type="button" className="sv-icon-btn" onClick={onClose} aria-label="Fermer"><X size={14} /></button>
        </div>
        <p className="sv-modal-sub">{quote.productTitle} — {quote.quantity} {quote.unit}</p>

        {error && <div className="sv-error-banner"><AlertTriangle size={15} /><span>{error}</span></div>}

        <form onSubmit={submit}>
          <div className="sl-field">
            <label className="sl-label">Prix proposé (€ / {unit}) <span className="sl-required">*</span></label>
            <input className="sl-input" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="sv-form-row">
            <div className="sl-field">
              <label className="sl-label">Unité</label>
              <select className="sl-input" value={unit} onChange={(e) => setUnit(e.target.value)}>
                {['kg', 'g', 'L', 'Pièce', 'Unitaire', 'Tonnes'].map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="sl-field">
              <label className="sl-label">Délai proposé</label>
              <input className="sl-input" placeholder="Ex. : 2 à 3 semaines" value={delay} onChange={(e) => setDelay(e.target.value)} />
            </div>
          </div>
          <div className="sl-field">
            <label className="sl-label">Message au client</label>
            <textarea className="sl-input sl-textarea" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Précisez la qualité, les conditions d'expédition…" />
          </div>

          <div className="sv-quote-foot" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="sv-btn sv-btn--ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="sv-btn sv-btn--primary" disabled={busy}>
              {busy && <Loader2 size={14} style={{ animation: 'sv-rotate 0.9s linear infinite' }} />}
              Envoyer la réponse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SellerQuotes = () => {
  const { producer } = useOutletContext();
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
    return <div className="sv-loader"><div className="sv-loader-spinner" /><p>Chargement…</p></div>;
  }

  return (
    <div style={{ maxWidth: 780 }}>
      <h2 className="sv-section-title">Demandes de devis reçues ({quotes.length})</h2>

      {quotes.length === 0 ? (
        <div className="sv-panel">
          <div className="sv-empty">
            <FileText size={30} />
            <p>Aucune demande de devis pour le moment.<br />Les demandes déposées depuis vos fiches produits apparaîtront ici.</p>
          </div>
        </div>
      ) : (
        quotes.map((q) => (
          <article key={q.id} className="sv-quote-card">
            <div className="sv-quote-head">
              <div>
                <span className="sv-quote-number">{q.quoteNumber} · {formatDateTime(q.createdAt)}</span>
                <div className="sv-quote-title">{q.productTitle}</div>
              </div>
              <QuoteBadge status={q.status} />
            </div>

            <dl className="sv-quote-meta">
              <div><dt>Quantité</dt><dd>{q.quantity} {q.unit}</dd></div>
              {q.delayRequested && <div><dt>Délai souhaité</dt><dd>{q.delayRequested}</dd></div>}
              <div><dt>Devise</dt><dd>{q.currency}</dd></div>
            </dl>

            {q.message && (
              <div className="sv-quote-msg">
                «&nbsp;{q.message}&nbsp;»
              </div>
            )}

            {q.response && (
              <div className="sv-response-box">
                <CheckCircle2 size={13} style={{ verticalAlign: '-2px', color: '#2e7d32' }} />
                {' '}Votre réponse : <strong>{formatEUR(q.response.priceEur)} / {q.response.unit}</strong>
                {q.response.delay && <> · délai {q.response.delay}</>}
                {q.message !== q.response.message && q.response.message && (
                  <div className="sv-dim" style={{ marginTop: 4 }}>{q.response.message}</div>
                )}
              </div>
            )}

            <div className="sv-quote-foot">
              {(q.status === 'pending' || q.status === 'responded') && (
                <button type="button" className="sv-btn sv-btn--primary" onClick={() => setResponding(q)}>
                  {q.response ? 'Modifier ma réponse' : 'Répondre à la demande'}
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
        />
      )}
    </div>
  );
};

export default SellerQuotes;
