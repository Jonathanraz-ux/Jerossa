import React, { useState } from 'react';
import { Truck, Clock, Search } from 'lucide-react';
import { fetchOrderByNumber } from '../services/orders';
import './animations.css';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    const normalized = orderId.trim().toUpperCase();
    if (!normalized) return;
    setSearching(true);
    const found = await fetchOrderByNumber(normalized);
    setTrackingOrder(found || null);
    setSearching(false);
  };

  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Suivi</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Suivi</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Suivi de commande</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Entrez votre numéro de commande pour suivre votre livraison</p>
        </div>
      </section>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        <form onSubmit={handleTrack} className="scroll-animate" style={{ display: 'flex', gap: '12px', marginBottom: '48px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Entrez votre numéro de commande (ex: CMD-2026-001)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{ width: '100%', padding: '12px 14px 12px 44px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', transition: 'all 0.2s' }}>{searching ? 'Recherche…' : 'Suivre'}</button>
        </form>

        {trackingOrder && (
          <div className="scroll-animate premium-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-dark)' }}>{trackingOrder.id}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Commandée le {trackingOrder.date}</p>
              </div>
              <span className="status-badge" style={{ background: trackingOrder.status === 'delivered' || trackingOrder.status === 'paid' || trackingOrder.status === 'confirmed' ? 'var(--success-bg)' : trackingOrder.status === 'shipped' ? '#eff6ff' : trackingOrder.status === 'pending' ? 'var(--warning-bg)' : 'var(--danger-bg)', color: trackingOrder.status === 'delivered' || trackingOrder.status === 'paid' || trackingOrder.status === 'confirmed' ? 'var(--success)' : trackingOrder.status === 'shipped' ? '#1d4ed8' : trackingOrder.status === 'pending' ? 'var(--warning)' : 'var(--danger)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{trackingOrder.statusLabel || trackingOrder.status}</span>
            </div>

            <div className="order-tracking scroll-animate" style={{ marginBottom: '24px', padding: '20px', background: 'var(--bg-cream)', borderRadius: '12px' }}>
              <div className="tracking-steps" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {trackingOrder.steps.map((step, i) => (
                  <div key={i} className={`tracking-step ${step.completed ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 3, width: '80px' }}>
                    <div className="step-indicator" style={{ width: '30px', height: '30px', borderRadius: '50%', background: step.completed ? 'var(--success-bg)' : '#fff', border: `3px solid ${step.completed ? 'var(--success)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.completed ? 'var(--success)' : 'var(--text-muted)', fontSize: '11px', fontWeight: 700 }}>
                      {step.completed ? '✓' : i + 1}
                    </div>
                    <div className="step-label" style={{ fontSize: '11px', marginTop: '8px', textAlign: 'center', color: step.completed ? 'var(--text-dark)' : 'var(--text-muted)', fontWeight: step.completed ? 600 : 400 }}>{step.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{step.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {trackingOrder.tracking && (
              <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-cream)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                <Truck size={20} style={{ color: 'var(--primary)' }} />
                <span><strong>Numéro de suivi :</strong> {trackingOrder.tracking}</span>
              </div>
            )}
          </div>
        )}

        {!trackingOrder && orderId && (
          <div className="scroll-animate premium-card" style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-cream)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Clock size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>Commande non trouvée</h3>
            <p style={{ color: 'var(--text-muted)' }}>Vérifiez le numéro de commande et réessayez.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;