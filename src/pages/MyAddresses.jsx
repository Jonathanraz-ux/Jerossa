import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, ArrowRight } from 'lucide-react';
import './animations.css';

const MyAddresses = () => {
  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Mes adresses</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Adresses</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Mes Adresses</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Gérez vos adresses de livraison</p>
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 600, margin: 0, color: 'var(--text-dark)' }}>Mes Adresses</h1>
        <button className="btn btn-primary premium-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', transition: 'all 0.2s' }}>
          <Plus size={16} /> Nouvelle adresse
        </button>
      </div>

      <div className="scroll-animate" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        <div className="premium-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', position: 'relative', transition: 'all 0.2s' }}>
          <span className="status-badge" style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--success-bg)', color: 'var(--success)', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>Par défaut</span>
          <h3 style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-dark)' }}>Adresse principale</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            12 Rue de la Vanille<br />
            75001 Paris, France<br />
            +33 6 12 34 56 78
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', fontWeight: 500, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>Modifier</button>
            <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', fontWeight: 500, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--danger)' }}>Supprimer</button>
          </div>
        </div>

        <div className="premium-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', transition: 'all 0.2s' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-dark)' }}>Adresse de bureau</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            45 Avenue des Champs, Batiment B<br />
            69002 Lyon, France<br />
            +33 4 98 76 54 32
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', fontWeight: 500, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>Modifier</button>
            <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', fontWeight: 500, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--danger)' }}>Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAddresses;