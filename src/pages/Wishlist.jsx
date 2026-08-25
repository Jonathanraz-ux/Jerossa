import React from 'react';
import { Link } from 'react-router-dom';
import { productsData } from '../data/products';
import { Heart, ArrowRight, Star, ShoppingBag } from 'lucide-react';
import './animations.css';
import SmartImg from '../components/common/SmartImg';
import EmptyState from '../components/common/EmptyState';

const Wishlist = () => {
  const favorites = productsData.slice(0, 3);

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
        {favorites.length === 0 ? (
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
        ) : (
          <>
            <div className="scroll-animate" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 600, margin: '0 0 4px' }}>Ma Liste de souhaits</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{favorites.length} produit{favorites.length > 1 ? 's' : ''} en favoris</p>
              </div>
              <Link to="/boutique" className="btn btn-outline premium-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px' }}>
                <ShoppingBag size={16} /> Découvrir le catalogue
              </Link>
            </div>

            <div className="product-grid">
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
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{prod.price}</span>
                      <Link to={`/product/${prod.id}`} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>Voir <ArrowRight size={12} /></Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;