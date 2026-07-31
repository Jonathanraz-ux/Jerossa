import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productsData } from '../data/products';
import { Search as SearchIcon, ArrowRight, Star, Filter } from 'lucide-react';
import './animations.css';

const Search = () => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return productsData;
    return productsData.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.seller.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div className="search-page">
      {/* Hero */}
      <section className="page-hero" style={{ height: '400px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
  <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
    <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
    <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
    <li style={{ color: '#fff', fontWeight: 500 }}>Recherche</li>
  </ol>
</nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Recherche</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Trouvez vos matières premières</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Explorez notre catalogue de produits d'exception, directement des producteurs de Madagascar et de l'Île Maurice.</p>
        </div>
      </section>

      <div className="container page-container">
        {/* Search Bar */}
        <div className="scroll-animate" style={{ maxWidth: '600px', margin: '0 auto 48px' }}>
          <div style={{ position: 'relative' }}>
             <SearchIcon size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un produit, un producteur..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', padding: '14px 16px 14px 48px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '16px', background: 'var(--bg-white)', outline: 'none', transition: 'var(--transition)' }}
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="scroll-animate" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 600 }}>
            {query ? `Résultats pour "${query}"` : 'Tous les produits'}
          </h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{results.length} produit{results.length > 1 ? 's' : ''}</span>
        </div>

        {results.length === 0 ? (
          <div className="scroll-animate" style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
               <SearchIcon size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>Aucun résultat</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Essayez avec d\'autres mots-clés ou explorez notre catalogue.</p>
            <Link to="/boutique" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px' }}>Voir le catalogue</Link>
          </div>
        ) : (
          <div className="product-grid">
            {results.map((prod, i) => (
              <Link key={prod.id || i} to={`/product/${prod.id}`} className="scroll-animate" style={{ textDecoration: 'none', color: 'inherit', animationDelay: `${i * 0.05}s` }}>
                <div className="premium-card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                  <div className="img-zoom" style={{ position: 'relative', aspectRatio: '1', background: '#fafafa', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                    <img src={prod.images[0]} alt={prod.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
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
                      <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>Voir <ArrowRight size={12} /></span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;