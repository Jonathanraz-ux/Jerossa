import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrderByNumber } from '../services/orders';
import { ArrowLeft, Truck, MapPin, CreditCard, RotateCcw } from 'lucide-react';
import './animations.css';

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

const STATUS_COLORS = {
  pending: { background: 'var(--warning-bg)', color: 'var(--warning)' },
  confirmed: { background: 'var(--success-bg)', color: 'var(--success)' },
  paid: { background: 'var(--success-bg)', color: 'var(--success)' },
  shipped: { background: '#eff6ff', color: '#1d4ed8' },
  delivered: { background: 'var(--success-bg)', color: 'var(--success)' },
  cancelled: { background: 'var(--danger-bg)', color: 'var(--danger)' },
  refunded: { background: 'var(--danger-bg)', color: 'var(--danger)' },
};

const formatEUR = (value) => `${Number(value).toFixed(2).replace('.', ',')} €`;

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let active = true;
    setOrder(null);
    fetchOrderByNumber(id).then((fetched) => {
      if (!active) return;
      setOrder(fetched || null);
    });
    return () => { active = false; };
  }, [id]);

  if (!order) {
    return (
      <div className="container" style={{ minHeight: '80vh', textAlign: 'center' }}>
        {/* Premium Hero */}
        <section className="page-hero" style={{ height: '420px' }}>
          <div className="page-hero-content">
            <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
              <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
                <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
                <li style={{ color: '#fff', fontWeight: 500 }}>Commande introuvable</li>
              </ol>
            </nav>
            <span className="page-hero-surtitre anim-fade-up stagger-1">Erreur</span>
            <h1 className="page-hero-title anim-fade-up stagger-2">Commande introuvable</h1>
            <p className="page-hero-subtitle anim-fade-up stagger-3">La commande demandée n'existe pas.</p>
          </div>
        </section>
        <div className="scroll-animate" style={{ padding: '40px 0' }}>
          <Link to="/my-orders" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Retour à mes commandes</Link>
        </div>
      </div>
    );
  }

  const statusColors = STATUS_COLORS[order.status] || { background: 'var(--danger-bg)', color: 'var(--danger)' };
  const statusLabel = order.statusLabel || STATUS_LABELS[order.status] || order.status;
  const items = order.items || [];
  const address = order.address || {};
  const hasRealAddress = address && address.address;

  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li><Link to="/my-orders" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Mes commandes</Link></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{order.id}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Commande</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{order.id}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Commandée le {order.date}</p>
        </div>
      </section>
      <Link to="/my-orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px', marginBottom: '24px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Retour aux commandes
      </Link>

      <div className="scroll-animate" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-dark)' }}>{order.id}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Commandée le {order.date}</p>
        </div>
        <span className="status-badge" style={{ background: statusColors.background, color: statusColors.color, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{statusLabel}</span>
      </div>

      {/* Timeline */}
      <div className="order-tracking scroll-animate premium-card" style={{ marginBottom: '32px', padding: '20px', background: 'var(--bg-cream)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-dark)' }}>Suivi de commande</h3>
        <div className="tracking-steps" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          {(order.steps || []).map((step, i) => (
            <div key={i} className={`tracking-step ${step.completed ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 3, width: '80px' }}>
              <div className="step-indicator" style={{ width: '30px', height: '30px', borderRadius: '50%', background: step.completed ? 'var(--success-bg)' : 'var(--bg-white)', border: `3px solid ${step.completed ? 'var(--success)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.completed ? 'var(--success)' : 'var(--text-muted)', fontSize: '11px', fontWeight: 700 }}>
                {step.completed ? '✓' : i + 1}
              </div>
              <div className="step-label" style={{ fontSize: '11px', fontWeight: step.completed ? 600 : 400, marginTop: '8px', textAlign: 'center', color: step.completed ? 'var(--text-dark)' : 'var(--text-muted)' }}>{step.label}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{step.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Grid */}
      <div className="scroll-animate order-info-grid">
        <div className="premium-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
            <MapPin size={18} style={{ color: 'var(--primary)' }} /> Livraison
          </h3>
          {hasRealAddress ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {address.firstName} {address.lastName}<br />
              {address.address}<br />
              {address.postalCode} {address.city}, {address.country}
            </p>
          ) : (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>Adresse de livraison non renseignée</p>
          )}
        </div>
        <div className="premium-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
            <CreditCard size={18} style={{ color: 'var(--primary)' }} /> Paiement
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {order.paymentMethod === 'card' ? 'Carte bancaire •••• 4242' : order.paymentMethod === 'mobile' ? 'Mobile Money' : order.paymentMethod === 'transfer' ? 'Virement bancaire' : 'Paiement confirmé'}
          </p>
        </div>
      </div>

      {/* Refund CTA */}
      {order.paymentStatus === 'paid' && ['paid', 'shipped', 'delivered'].includes(order.status) && (
        <div className="scroll-animate" style={{ marginBottom: '32px', padding: '20px 24px', background: 'var(--bg-cream)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-dark)' }}>Un problème avec cette commande ?</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Vous pouvez demander un remboursement dans les conditions prévues par nos CGV.</p>
          </div>
          <Link to={`/refund-request?order=${order.id}`} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
            <RotateCcw size={16} /> Demander un remboursement
          </Link>
        </div>
      )}

      {/* Order Items Table */}
      <div className="scroll-animate premium-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Produit</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Quantité</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Prix</th></tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>{item.qty}</td>
                <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>{item.price || formatEUR(item.priceEUR)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px' }}>
          <span>Total</span>
          <span style={{ color: 'var(--primary)' }}>{typeof order.total === 'string' ? order.total : formatEUR(order.total)}</span>
        </div>
      </div>

      {order.tracking && (
        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-cream)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
          <Truck size={20} style={{ color: 'var(--primary)' }} />
          <span><strong>Numéro de suivi :</strong> {order.tracking}</span>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
