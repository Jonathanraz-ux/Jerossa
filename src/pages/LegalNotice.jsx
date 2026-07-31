import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './animations.css';

const LegalNotice = () => {
  return (
    <div className="legal-page">
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Mentions légales</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Informations légales</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Mentions légales</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Informations juridiques et réglementaires</p>
        </div>
      </section>

      <div className="container">

        <div className="scroll-animate" style={{ lineHeight: 1.8, color: 'var(--text-dark)', fontSize: '15px' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>Éditeur du site</h2>
            <p style={{ marginBottom: '12px' }}><strong>Jerossa Trading Ltd.</strong><br />
            Siège social : 123 Rue de l\'Import-Export, Antananarivo, Madagascar<br />
            Email : contact@jerosa.mg<br />
            Téléphone : +261 32 00 000 00<br />
            N° Registre : RM-2015-0012345</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>Hébergement</h2>
            <p style={{ marginBottom: '12px' }}>Ce site est hébergé par Vercel Inc., 340 S Lemon Ave, Walnut, CA 91789, États-Unis.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>Propriété intellectuelle</h2>
            <p style={{ marginBottom: '12px' }}>Tous les éléments du site (textes, images, logos, marques, graphismes) sont protégés par le droit d\'auteur et la propriété intellectuelle. Toute reproduction ou utilisation sans autorisation est strictement interdite.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>Protection des données</h2>
            <p style={{ marginBottom: '12px' }}>Jerossa Trading Ltd. respecte la réglementation applicable en matière de protection des données personnelles. Consultez notre <Link to="/privacy" style={{ color: 'var(--primary)', textDecoration: 'none' }}>politique de confidentialité</Link> pour plus d\'informations.</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>Limitation de responsabilité</h2>
            <p style={{ marginBottom: '12px' }}>Jerossa s\'efforce de fournir des informations exactes sur son site. Toutefois, Jerossa ne saurait être tenue responsable des erreurs, omissions ou interruptions pouvant affecter le contenu du site.</p>
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

export default LegalNotice;