import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducers } from '../services/catalog';
import { Star, MapPin, Award, Clock } from 'lucide-react';
import './animations.css';

const Producer = () => {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducers().then((data) => {
      setProducers(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="producers-page">
      {/* Hero */}
      <section className="page-hero" style={{ height: '380px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
  <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
    <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
    <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
    <li style={{ color: '#fff', fontWeight: 500 }}>Producteurs</li>
  </ol>
</nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Nos Producteurs</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Les Artisans de Jerossa</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Rencontrez les producteurs qui façonnent l\'excellence de nos matières premières.</p>
        </div>
      </section>

      <div className="container page-container">
        {/* Producers Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Chargement des producteurs…</div>
        ) : (
          <div className="producers-list-grid">
            {producers.map((producer, i) => (
              <Link to={`/producteur/${producer.slug}`} key={producer.slug} className="scroll-animate" style={{ textDecoration: 'none', color: 'inherit', animationDelay: `${i * 0.05}s` }}>
                <div className="premium-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div className="img-zoom" style={{ aspectRatio: '1', overflow: 'hidden', background: '#fafafa' }}>
                    <img src={producer.image} alt={producer.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} loading="lazy" />
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, margin: '0 0 6px', color: 'var(--text-dark)' }}>{producer.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <MapPin size={12} /> {producer.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-dark)' }}>
                      <div className="stars" style={{ display: 'flex', gap: '2px' }}>
                        <Star size={12} fill="#e9c46a" color="#e9c46a" />
                        <span style={{ fontWeight: 600 }}>{producer.rating}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <span style={{ color: 'var(--text-muted)' }}>Depuis {producer.established}</span>
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

export default Producer;