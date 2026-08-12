import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchRefundByNumber } from '../services/refunds';
import { ArrowLeft, RotateCcw, Package, Landmark } from 'lucide-react';
import './animations.css';

const STATUS_LABELS = {
  requested: 'Demandée',
  under_review: 'En cours d\'examen',
  approved: 'Approuvée',
  rejected: 'Refusée',
  processed: 'Remboursée',
};

const STATUS_COLORS = {
  requested: { background: 'var(--warning-bg)', color: 'var(--warning)' },
  under_review: { background: '#eff6ff', color: '#1d4ed8' },
  approved: { background: 'var(--success-bg)', color: 'var(--success)' },
  rejected: { background: 'var(--danger-bg)', color: 'var(--danger)' },
  processed: { background: 'var(--success-bg)', color: 'var(--success)' },
};

const formatEUR = (value) => `${Number(value).toFixed(2).replace('.', ',')} €`;

const RefundDetails = () => {
  const { id } = useParams();
  const [refund, setRefund] = useState(null);

  useEffect(() => {
    let active = true;
    fetchRefundByNumber(id).then((fetched) => {
      if (!active) return;
      setRefund(fetched);
    });
    return () => { active = false; };
  }, [id]);

  if (!refund) {
    return (
      <div className="container" style={{ minHeight: '80vh', textAlign: 'center' }}>
        <section className="page-hero" style={{ height: '420px' }}>
          <div className="page-hero-content">
            <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
              <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
                <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
                <li style={{ color: '#fff', fontWeight: 500 }}>Remboursement introuvable</li>
              </ol>
            </nav>
            <span className="page-hero-surtitre anim-fade-up stagger-1">Erreur</span>
            <h1 className="page-hero-title anim-fade-up stagger-2">Demande introuvable</h1>
            <p className="page-hero-subtitle anim-fade-up stagger-3">La demande de remboursement demandée n'existe pas.</p>
          </div>
        </section>
        <div className="scroll-animate" style={{ padding: '40px 0' }}>
          <Link to="/my-refunds" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Retour à mes remboursements</Link>
        </div>
      </div>
    );
  }

  const statusColors = STATUS_COLORS[refund.status] || { background: 'var(--danger-bg)', color: 'var(--danger)' };
  const statusLabel = refund.statusLabel || STATUS_LABELS[refund.status] || refund.status;

  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li><Link to="/my-refunds" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Mes remboursements</Link></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{refund.id}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Remboursement</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{refund.id}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Demandée le {refund.date}</p>
        </div>
      </section>
      <Link to="/my-refunds" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px', marginBottom: '24px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Retour aux remboursements
      </Link>

      <div className="scroll-animate" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-dark)' }}>{refund.id}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Demandée le {refund.date}</p>
        </div>
        <span className="status-badge" style={{ background: statusColors.background, color: statusColors.color, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{statusLabel}</span>
      </div>

      {/* Montants */}
      <div className="scroll-animate premium-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
          <RotateCcw size={18} style={{ color: 'var(--primary)' }} /> Montants
        </h3>
        <div className="refund-detail-grid">
          <div>
            <div className="refund-detail-label">Montant demandé</div>
            <div className="refund-detail-value">{formatEUR(refund.amountRequested)}</div>
          </div>
          <div>
            <div className="refund-detail-label">Montant remboursé</div>
            <div className="refund-detail-value" style={{ color: refund.amountRefunded > 0 ? 'var(--success)' : 'inherit' }}>{refund.amountRefunded > 0 ? formatEUR(refund.amountRefunded) : '—'}</div>
          </div>
          <div>
            <div className="refund-detail-label">Commande concernée</div>
            <div className="refund-detail-value"><Link to={`/order/${refund.orderNumber}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{refund.orderNumber}</Link></div>
          </div>
          <div>
            <div className="refund-detail-label">Référence remboursement</div>
            <div className="refund-detail-value">{refund.refundReference || '—'}</div>
          </div>
        </div>
      </div>

      {/* Motif */}
      <div className="scroll-animate premium-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
          <Package size={18} style={{ color: 'var(--primary)' }} /> Motif de la demande
        </h3>
        <div className="refund-detail-label">Motif</div>
        <div className="refund-detail-value" style={{ marginBottom: '12px' }}>{refund.reason}</div>
        {refund.description && (
          <div style={{ padding: '12px 16px', background: 'var(--bg-cream)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            « {refund.description} »
          </div>
        )}
        {refund.adminNote && (
          <div style={{ marginTop: '12px', padding: '12px 16px', background: 'var(--bg-cream)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, borderLeft: '3px solid var(--primary)' }}>
            <strong>Note de l'équipe :</strong> {refund.adminNote}
          </div>
        )}
      </div>

      {refund.processedAt && (
        <div className="scroll-animate" style={{ padding: '16px', background: 'var(--success-bg)', borderRadius: '8px', fontSize: '14px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Landmark size={20} />
          <span>Remboursement traité le {new Date(refund.processedAt).toLocaleDateString('fr-FR')}.</span>
        </div>
      )}

      <style>{`
        .refund-detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .refund-detail-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 4px; }
        .refund-detail-value { font-size: 14px; color: var(--text-dark); font-weight: 500; }
        @media (max-width: 560px) { .refund-detail-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default RefundDetails;
