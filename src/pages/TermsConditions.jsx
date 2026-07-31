import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './animations.css';

const TermsConditions = () => {
  return (
    <div className="legal-page">
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Conditions</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Conditions</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Conditions Générales de Vente</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Modalités de vente et d'utilisation</p>
        </div>
      </section>

      <div className="container scroll-animate" style={{ maxWidth: '800px' }}>
        <div style={{ lineHeight: 1.8, color: 'var(--text-dark)', fontSize: '15px' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>1. Objet</h2>
            <p style={{ marginBottom: '12px' }}>Les présentes conditions générales de vente régissent les relations entre Jerossa Trading Ltd. et tout acheteur utilisant la marketplace Jerossa pour l'achat de matières premières.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>2. Commandes</h2>
            <p style={{ marginBottom: '12px' }}>Toute commande passée sur Jerossa implique l'acceptation sans réserve des présentes conditions. Jerossa se réserve le droit de refuser ou d'annuler toute commande jugée anormale ou frauduleuse.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>3. Prix et paiement</h2>
            <p style={{ marginBottom: '12px' }}>Les prix indiqués sont exprimés en euros et s'entendent hors taxes sauf indication contraire. Le paiement doit être effectué au moment de la commande. Jerossa accepte les cartes bancaires, le paiement mobile et les virements.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>4. Livraison</h2>
            <p style={{ marginBottom: '12px' }}>Jerossa s'engage à expédier les produits dans les meilleurs délais. Les délais de livraison sont indicatifs et ne constituent pas un délai de livraison garanti. Les risques sont transférés à l'acheteur à la livraison.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>5. Retours et remboursements</h2>
            <p style={{ marginBottom: '12px' }}>Les retours sont acceptés sous 30 jours suivant la réception. Les produits doivent être retournés dans leur état d'origine. Le remboursement est effectué dans un délai de 14 jours après réception du retour.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>6. Propriété intellectuelle</h2>
            <p style={{ marginBottom: '12px' }}>Tous les contenus du site (textes, images, logos, marques, graphismes) sont la propriété exclusive de Jerossa Trading Ltd. Toute reproduction est interdite sans autorisation préalable.</p>
          </section>
        </div>

        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <Link to="/" className="link-premium" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
