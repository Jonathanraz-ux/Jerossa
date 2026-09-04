import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import './animations.css';
import EmptyState from '../components/common/EmptyState';

const Wishlist = () => {
  return (
    <div className="wishlist-page">
      {/* Hero */}
      <section className="page-hero" style={{ height: '340px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
  <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
    <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
    <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
    <li style={{ color: '#fff', fontWeight: 500 }}>Ma liste de souhaits</li>
  </ol>
</nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Mes Favoris</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Ma liste de souhaits</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Vos produits préférés, toujours à portée de main.</p>
        </div>
      </section>

      <div className="container page-container">
        <EmptyState
          icon={Heart}
          title="Aucun favori pour l'instant"
          text="Ajoutez des produits à vos favoris pour les retrouver facilement et les comparer plus tard."
          action={
            <Link to="/boutique" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
              Découvrir le catalogue
            </Link>
          }
        />
      </div>
    </div>
  );
};

export default Wishlist;