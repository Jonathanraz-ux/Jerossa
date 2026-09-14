import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/catalog';
import { Search as SearchIcon, ArrowRight, Star } from 'lucide-react';
import './animations.css';
import SmartImg from '../components/common/SmartImg';
import { ProductGridSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';
import { useLang } from '../context/LangContext';
import { formatUnitPriceFromEUR } from '../lib/currency.js';
import { useCurrency } from '../context/CurrencyContext';

const Search = () => {
  const { t } = useLang();
  const { currency } = useCurrency();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return products;
    return products.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.seller.toLowerCase().includes(query.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(query.toLowerCase())
    );
  }, [query, products]);

  return (
    <div className="search-page">
      {/* Hero */}
      <section className="page-hero" style={{ height: '400px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
  <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
    <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
    <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
    <li style={{ color: '#fff', fontWeight: 500 }}>{t('search.surtitre')}</li>
  </ol>
</nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('search.surtitre')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('search.title')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('search.desc')}</p>
        </div>
      </section>

      <div className="container page-container">
        {/* Search Bar */}
        <div className="scroll-animate" style={{ maxWidth: '600px', margin: '0 auto 48px' }}>
          <div style={{ position: 'relative' }}>
             <SearchIcon size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={t('search.placeholder')}
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
            {query ? t('search.resultsFor', { q: query }) : t('search.allProducts')}
          </h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('search.count', { count: results.length })}</span>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : results.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title={t('common.noResults')}
            text={t('search.noResultsText')}
            action={
              <Link to="/boutique" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px' }}>
                {t('search.viewCatalogue')}
              </Link>
            }
          />
        ) : (
          <div className="product-grid">
            {results.map((prod, i) => (
              <Link key={prod.id || i} to={`/product/${prod.id}`} className="scroll-animate" style={{ textDecoration: 'none', color: 'inherit', animationDelay: `${i * 0.05}s` }}>
                <div className="premium-card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
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
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{formatUnitPriceFromEUR(prod.priceEUR, prod.unit, currency)}</span>
                      <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>{t('search.view')} <ArrowRight size={12} /></span>
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