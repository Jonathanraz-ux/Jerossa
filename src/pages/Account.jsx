import React from 'react';
import { Link } from 'react-router-dom';
import { User, Store, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import './animations.css';

const Account = () => {

  return (
    <div className="account-page" style={{ padding: '0 0 80px', minHeight: '80vh', background: 'var(--bg-cream)' }}>
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Mon compte</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Mon compte</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Mon Compte</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Rejoignez la communauté Jerossa, en tant que client ou partenaire.</p>
        </div>
      </section>

      <div className="container">

        <div className="account-types-grid scroll-animate" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Client Account */}
          <div className="account-card client-card premium-card" style={{ background: '#fff', borderRadius: '12px', padding: '40px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
            <div className="account-icon-wrapper" style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', background: 'rgba(30, 61, 47, 0.1)', color: 'var(--primary)' }}>
              <User size={32} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, margin: '0 0 15px', color: 'var(--text-dark)' }}>Compte Client</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', lineHeight: 1.6 }}>Accédez à vos commandes, suivez vos livraisons et profitez d\'offres exclusives sur nos vanilles premium.</p>

            <ul className="account-benefits" style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', flexGrow: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-dark)', fontSize: '0.95rem' }}><ArrowRight size={16} style={{ color: 'var(--primary)' }} /> Historique de commandes</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-dark)', fontSize: '0.95rem' }}><ArrowRight size={16} style={{ color: 'var(--primary)' }} /> Paiement rapide et sécurisé</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-dark)', fontSize: '0.95rem' }}><ArrowRight size={16} style={{ color: 'var(--primary)' }} /> Offres personnalisées</li>
            </ul>

            <div className="account-forms" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}>Se connecter</Link>
              <Link to="/register" className="btn btn-outline" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>Créer un compte client</Link>
            </div>
          </div>

          {/* Seller Account */}
          <div className="account-card seller-card premium-card" style={{ background: '#fff', borderRadius: '12px', padding: '40px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
            <div className="account-icon-wrapper" style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', background: 'rgba(189, 140, 97, 0.1)', color: 'var(--accent)' }}>
              <Store size={32} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, margin: '0 0 15px', color: 'var(--text-dark)' }}>Compte Vendeur</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', lineHeight: 1.6 }}>Devenez partenaire Jerossa. Vendez vos produits de qualité à notre réseau international de clients.</p>

            <ul className="account-benefits" style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', flexGrow: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-dark)', fontSize: '0.95rem' }}><TrendingUp size={16} style={{ color: 'var(--accent)' }} /> Outils de gestion de catalogue</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-dark)', fontSize: '0.95rem' }}><ShieldCheck size={16} style={{ color: 'var(--accent)' }} /> Accompagnement dédié</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-dark)', fontSize: '0.95rem' }}><ArrowRight size={16} style={{ color: 'var(--accent)' }} /> Visibilité accrue</li>
            </ul>

            <div className="account-forms" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button className="btn" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 600, background: 'var(--bg-cream)', color: 'var(--text-dark)', border: '1px solid var(--border)' }}>Accès Partenaire</button>
              <Link to="/register" className="btn btn-outline" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>Devenir Vendeur</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
