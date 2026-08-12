import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchQuoteRequestByNumber, acceptQuote, declineQuote } from '../services/quotes';
import { ArrowLeft, FileText, MessageSquare, Clock, CheckCircle2, XCircle, Loader2, PackageCheck, UserRound } from 'lucide-react';
import './animations.css';

const STATUS_LABELS = {
  pending: 'En attente de réponse',
  responded: 'Réponse reçue',
  accepted: 'Acceptée',
  declined: 'Refusée',
};

const STATUS_COLORS = {
  pending: { background: 'var(--warning-bg)', color: 'var(--warning)' },
  responded: { background: '#eff6ff', color: '#1d4ed8' },
  accepted: { background: 'var(--success-bg)', color: 'var(--success)' },
  declined: { background: 'var(--danger-bg)', color: 'var(--danger)' },
};

const formatEUR = (value) => `${Number(value).toFixed(2).replace('.', ',')} €`;

const QuoteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [action, setAction] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchQuoteRequestByNumber(id).then((fetched) => {
      if (!active) return;
      setQuote(fetched);
    });
    return () => { active = false; };
  }, [id]);

  const handleAccept = async () => {
    if (!quote) return;
    setAction('accepting');
    setError('');
    const res = await acceptQuote(quote.uuid);
    if (res.ok) {
      navigate(`/order-confirmation?ref=${res.data.order_number}`);
      return;
    }
    setError(res.error?.message || "Impossible d'accepter cette offre.");
    setAction('idle');
  };

  const handleDecline = async () => {
    if (!quote) return;
    setAction('declining');
    setError('');
    const res = await declineQuote(quote.uuid);
    if (res.ok) {
      const fresh = await fetchQuoteRequestByNumber(id);
      setQuote(fresh);
      setAction('idle');
      return;
    }
    setError(res.error?.message || 'Impossible de refuser cette offre.');
    setAction('idle');
  };

  if (!quote) {
    return (
      <div className="container" style={{ minHeight: '80vh', textAlign: 'center' }}>
        <section className="page-hero" style={{ height: '420px' }}>
          <div className="page-hero-content">
            <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
              <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
                <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
                <li style={{ color: '#fff', fontWeight: 500 }}>Demande de devis introuvable</li>
              </ol>
            </nav>
            <span className="page-hero-surtitre anim-fade-up stagger-1">Erreur</span>
            <h1 className="page-hero-title anim-fade-up stagger-2">Demande introuvable</h1>
            <p className="page-hero-subtitle anim-fade-up stagger-3">La demande de devis demandée n'existe pas.</p>
          </div>
        </section>
        <div className="scroll-animate" style={{ padding: '40px 0' }}>
          <Link to="/my-quotes" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Retour à mes devis</Link>
        </div>
      </div>
    );
  }

  const statusColors = STATUS_COLORS[quote.status] || { background: 'var(--danger-bg)', color: 'var(--danger)' };
  const response = quote.response;
  const subtotal = response ? response.priceEUR * quote.quantity : null;
  const shipping = subtotal != null ? (subtotal < 200 ? 15 : 0) : null;

  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li><Link to="/my-quotes" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Mes devis</Link></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{quote.id}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Devis</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{quote.id}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Demandée le {quote.date}</p>
        </div>
      </section>
      <Link to="/my-quotes" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px', marginBottom: '24px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Retour aux devis
      </Link>

      <div className="scroll-animate" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-dark)' }}>{quote.id}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Demandée le {quote.date} — {quote.productTitle}</p>
        </div>
        <span className="status-badge" style={{ background: statusColors.background, color: statusColors.color, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{quote.statusLabel || STATUS_LABELS[quote.status] || quote.status}</span>
      </div>

      {error && (
        <div style={{ marginBottom: '24px', padding: '14px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px', fontSize: '14px' }}>{error}</div>
      )}

      {/* Demande */}
      <div className="scroll-animate premium-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
          <FileText size={18} style={{ color: 'var(--primary)' }} /> Votre demande
        </h3>
        <div className="quote-detail-grid">
          <div>
            <div className="quote-detail-label">Produit</div>
            <div className="quote-detail-value">{quote.productTitle}</div>
          </div>
          <div>
            <div className="quote-detail-label">Vendeur</div>
            <div className="quote-detail-value">{quote.seller}</div>
          </div>
          <div>
            <div className="quote-detail-label">Quantité</div>
            <div className="quote-detail-value">{quote.quantity} {quote.unit}</div>
          </div>
          <div>
            <div className="quote-detail-label">Délai souhaité</div>
            <div className="quote-detail-value">{quote.delayRequested || 'Non précisé'}</div>
          </div>
        </div>
        {quote.message && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--bg-cream)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            « {quote.message} »
          </div>
        )}
      </div>

      {/* Réponse vendeur */}
      <div className="scroll-animate premium-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
          <UserRound size={18} style={{ color: 'var(--primary)' }} /> Offre du vendeur
        </h3>

        {response ? (
          <>
            <div className="quote-detail-grid">
              <div>
                <div className="quote-detail-label">Prix proposé</div>
                <div className="quote-detail-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatEUR(response.priceEUR)} / {response.unit}</div>
              </div>
              <div>
                <div className="quote-detail-label">Sous-total</div>
                <div className="quote-detail-value">{formatEUR(subtotal)}</div>
              </div>
              <div>
                <div className="quote-detail-label">Livraison</div>
                <div className="quote-detail-value">{shipping === 0 ? 'Offerte' : formatEUR(shipping)}</div>
              </div>
              <div>
                <div className="quote-detail-label">Total estimé</div>
                <div className="quote-detail-value" style={{ fontWeight: 700 }}>{formatEUR(subtotal + shipping)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {response.delay && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={15} style={{ color: 'var(--primary)' }} /> Délai : {response.delay}</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MessageSquare size={15} style={{ color: 'var(--primary)' }} /> Répondu le {response.date}</span>
            </div>
            {response.message && (
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--bg-cream)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                « {response.message} »
              </div>
            )}

            {quote.status === 'responded' && (
              <div className="quote-detail-actions">
                <button className="btn btn-primary" onClick={handleAccept} disabled={action !== 'idle'} style={{ textDecoration: 'none' }}>
                  {action === 'accepting' ? <><Loader2 size={16} className="spin" /> Création de la commande…</> : <><PackageCheck size={16} /> Accepter l'offre</>}
                </button>
                <button className="btn btn-outline" onClick={handleDecline} disabled={action !== 'idle'} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                  {action === 'declining' ? <><Loader2 size={16} className="spin" /> Refus…</> : <><XCircle size={16} /> Refuser l'offre</>}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--warning-bg)', borderRadius: '8px', fontSize: '14px', color: 'var(--warning)' }}>
            <Clock size={20} />
            <span>En attente de la réponse du vendeur. Vous serez notifié dès qu'une offre sera disponible.</span>
          </div>
        )}

        {quote.status === 'accepted' && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'var(--success-bg)', borderRadius: '8px', fontSize: '14px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <CheckCircle2 size={20} />
            <span>Vous avez accepté cette offre. Une commande a été créée :</span>
            <Link to={`/order/${quote.orderNumber}`} style={{ fontWeight: 700, textDecoration: 'none', color: 'var(--success)' }}>{quote.orderNumber}</Link>
          </div>
        )}

        {quote.status === 'declined' && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'var(--danger-bg)', borderRadius: '8px', fontSize: '14px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <XCircle size={20} />
            <span>Vous avez refusé cette offre. La demande de devis est clôturée.</span>
          </div>
        )}
      </div>

      <style>{`
        .quote-detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .quote-detail-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 4px; }
        .quote-detail-value { font-size: 14px; color: var(--text-dark); font-weight: 500; }
        .quote-detail-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
        .quote-detail-actions .btn { display: inline-flex; align-items: center; gap: 6px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 560px) { .quote-detail-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default QuoteDetails;
