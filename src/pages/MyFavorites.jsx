import React from 'react';
import { Link } from 'react-router-dom';
import { productsData } from '../data/products';
import { Heart, ArrowRight, Star } from 'lucide-react';
import './animations.css';
import SmartImg from '../components/common/SmartImg';
import EmptyState from '../components/common/EmptyState';
import { formatUnitPriceFromEUR } from '../lib/currency.js';

const MyFavorites = () => {
  const favorites = productsData.slice(0, 3);

  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Mes favoris</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Favoris</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Mes Favoris</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Retrouvez vos produits préférés</p>
        </div>
      </section>

      <div style={{ marginBottom: '32px' }}>
        {favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Aucun favori pour l'instant"
            text="Ajoutez des produits à vos favoris pour les retrouver facilement et les comparer plus tard."
            action={
              <Link to="/boutique" className="btn btn-primary premium-btn" style={{ padding: '14px 28px' }}>Découvrir le catalogue</Link>
            }
          />
        ) : (
          <div className="product-grid scroll-animate">
            {favorites.map((prod, i) => (
              <div key={prod.id || i} className="scroll-animate premium-card" style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                <div className="img-zoom" style={{ position: 'relative', aspectRatio: '1', background: '#fafafa', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                  <SmartImg src={prod.images[0]} alt={prod.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {prod.tag && <span className="product-badge" style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(30, 61, 47, 0.9)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>{prod.tag}</span>}
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>{prod.type}</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-dark)', lineHeight: 1.4 }}>{prod.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#777', marginTop: 'auto', marginBottom: '12px' }}>
                    <div className="stars" style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={14} fill={j < Math.floor(prod.rating) ? '#fbbf24' : 'rgba(251,191,36,0.25)'} color="#fbbf24" />
                      ))}
                    </div>
                    <span>({prod.reviews})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{formatUnitPriceFromEUR(prod.priceEUR, prod.unit, 'EUR')}</span>
                    <Link to={`/product/${prod.id}`} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>Voir <ArrowRight size={12} /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFavorites;
