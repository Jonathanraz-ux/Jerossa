import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCategoryByIdentifier, fetchProductsByCategory } from '../services/catalog';
import { ArrowRight, Star, PackageSearch } from 'lucide-react';
import './animations.css';
import SmartImg from '../components/common/SmartImg';
import { ProductGridSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';

const Category = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      fetchCategoryByIdentifier(slug),
      fetchProductsByCategory(slug),
    ]).then(([cat, prods]) => {
      if (!active) return;
      setCategory(cat);
      setProducts(prods);
      setNotFound(!cat);
      setLoading(false);
    });
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="container page-container">
        <ProductGridSkeleton count={8} />
      </div>
    );
  }

  if (notFound || !category) {
    return (
      <div className="container page-container" style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>Catégorie introuvable</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>La catégorie que vous recherchez n\'existe pas.</p>
        <Link to="/boutique" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px' }}>Retour au catalogue</Link>
      </div>
    );
  }

  return (
    <div className="category-page">
      {/* Hero */}
      <section className="page-hero" style={{ height: '350px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
  <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
    <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
    <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
    <li style={{ color: '#fff', fontWeight: 500 }}>{category.name}</li>
  </ol>
</nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Catégorie</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{category.name}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{category.description}</p>
        </div>
      </section>

      <div className="container page-container">
        {/* Products */}
        <div className="scroll-animate" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 600 }}>{category.productCount} produits</h2>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Cette catégorie est encore vide"
            text="Les produits seront publiés ici dès que les producteurs auront ajouté leurs offres."
            action={
              <Link to="/boutique" className="btn btn-outline">Explorer tout le catalogue</Link>
            }
          />
        ) : (
          <div className="product-grid">
            {products.map((prod, i) => (
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
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{prod.price}</span>
                      <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>Voir <ArrowRight size={12} /></span>
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

export default Category;