import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard } from 'lucide-react';
import './animations.css';

const Payment = () => {
  return (
    <div className="container page-container">
      {/* Hero */}
      <section className="page-hero" style={{ height: '300px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
  <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
    <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
    <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
    <li style={{ color: '#fff', fontWeight: 500 }}>Paiement</li>
  </ol>
</nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Paiement</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Paiement sécurisé</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Votre transaction est simulée. Aucun paiement réel ne sera effectué.</p>
        </div>
      </section>

      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="scroll-animate" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CreditCard size={36} style={{ color: 'var(--primary)' }} />
        </div>
        <h1 className="scroll-animate" style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 600, marginBottom: '16px' }}>Paiement simulé</h1>
        <p className="scroll-animate" style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
          Ce site utilise un simulateur de paiement. Aucune transaction réelle ne sera effectuée.<br />
          Votre commande est enregistrée en attente de confirmation.
        </p>

        <div className="scroll-animate" style={{ background: 'var(--bg-cream)', borderRadius: '12px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Résumé de la commande</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <span>Sous-total</span><span>448,50 €</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <span>Livraison</span><span>Gratuite</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border)', fontWeight: 700 }}>
            <span>Total</span><span>448,50 €</span>
          </div>
        </div>

        <div className="scroll-animate sim-container" style={{ textAlign: 'left', marginBottom: '32px' }}>
          <div className="sim-title">🔒 Mode simulation</div>
          <p className="sim-text">Le paiement est simulé. Vous serez redirigé vers la page de confirmation.</p>
          <div className="qr-code-placeholder">PAIEMENT<br />MOCK</div>
        </div>

        <Link to="/order-confirmation" className="btn btn-primary premium-btn scroll-animate" style={{ marginTop: '24px', width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
          Voir la confirmation de commande
        </Link>
        <Link to="/" className="btn btn-outline scroll-animate" style={{ marginTop: '12px', width: '100%', padding: '12px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
          <ArrowLeft size={16} /> Retour à l\'accueil
        </Link>
      </div>
    </div>
  );
};

export default Payment;