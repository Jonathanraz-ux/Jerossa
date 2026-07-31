import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './animations.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Confidentialité</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Confidentialité</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Politique de confidentialité</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Protection de vos données personnelles</p>
        </div>
      </section>

      <div className="container">

        <div className="scroll-animate" style={{ lineHeight: 1.8, color: 'var(--text-dark)', fontSize: '15px' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>1. Introduction</h2>
            <p style={{ marginBottom: '12px' }}>Jerossa Trading Ltd. s\'engage à protéger vos données personnelles. Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre marketplace.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>2. Données collectées</h2>
            <p style={{ marginBottom: '12px' }}>Nous collectons les données suivantes : informations d\'identification (nom, email, téléphone), données de commande (adresses de livraison, historique d\'achats), et données techniques (adresse IP, navigateur, pages visitées).</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>3. Utilisation des données</h2>
            <p style={{ marginBottom: '12px' }}>Vos données sont utilisées pour traiter vos commandes, améliorer nos services, personnaliser votre expérience et vous envoyer des communications commerciales avec votre consentement.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>4. Stockage et sécurité</h2>
            <p style={{ marginBottom: '12px' }}>Vos données sont stockées de manière sécurisée et ne sont accessibles qu\'à notre personnel autorisé. Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>5. Vos droits</h2>
            <p style={{ marginBottom: '12px' }}>Vous disposez d\'un droit d\'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à privacy@jerosa.mg.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>6. Contact</h2>
            <p style={{ marginBottom: '12px' }}>Pour toute question concernant cette politique, contactez-nous à privacy@jerosa.mg.</p>
          </section>
        </div>

        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Retour à l\'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;