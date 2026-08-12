import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProducerByIdentifier, fetchProductsByProducer } from '../services/catalog';
import { Star, MapPin, Award, Truck, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import './animations.css';

const ProducerShop = () => {
  const { id } = useParams();
  const [producer, setProducer] = useState(null);
  const [producerProducts, setProducerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      fetchProducerByIdentifier(id),
      fetchProductsByProducer(id),
    ]).then(([pro, prods]) => {
      if (!active) return;
      setProducer(pro);
      setProducerProducts(prods);
      setNotFound(!pro);
      setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="container page-container" style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>Chargement…</h1>
        <p style={{ color: 'var(--text-muted)' }}>Récupération du producteur.</p>
      </div>
    );
  }

  if (notFound || !producer) {
    return (
      <div className="container page-container" style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>Producteur introuvable</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Le producteur que vous recherchez n\'existe pas.</p>
        <Link to="/producteurs" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px' }}>Retour aux producteurs</Link>
      </div>
    );
  }

  return (
    <div className="producer-shop-page">
      {/* Hero */}
      <section className="page-hero" style={{ height: '360px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
  <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
    <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
    <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
    <li style={{ color: '#fff', fontWeight: 500 }}>{producer.name}</li>
  </ol>
</nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Producteur</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{producer.name}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{producer.location}</p>
        </div>
      </section>

      <div className="container page-container">
        <Link to="/producteurs" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px', marginBottom: '32px', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Retour aux producteurs
        </Link>

        {/* Profile */}
        <div className="scroll-animate" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '48px' }}>
          <div className="producer-profile-grid">
            <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#fafafa' }}>
              <img src={producer.image} alt={producer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '32px' }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-dark)' }}>{producer.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {producer.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Award size={14} /> Depuis {producer.established}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '700px', fontSize: '15px' }}>{producer.description}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                {producer.certifications.map((cert, i) => (
                  <span key={i} style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{cert}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="producer-stats-grid" style={{ padding: '24px 32px', background: 'var(--bg-cream)', borderTop: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>{producer.rating}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Note moyenne</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>{producer.responseRate}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Taux de réponse</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>{producer.responseTime}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Temps de réponse</div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="scroll-animate" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 600 }}>Produits de {producer.name}</h2>
        </div>

        {producerProducts.length === 0 ? (
          <div className="scroll-animate" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', background: '#fff', borderRadius: '12px', border: '1px solid var(--border)' }}>
            Aucun produit disponible pour le moment.
          </div>
        ) : (
          <div className="product-grid">
            {producerProducts.map((prod, i) => (
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

export default ProducerShop;