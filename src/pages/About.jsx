import React from 'react';
import './animations.css';
import { Shield, Award, Leaf, Globe, Users, Clock, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page">
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>À propos</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">À propos</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">À propos de Jerossa</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Jerossa est une marketplace B2B dédiée aux matières premières d'exception de Madagascar et de l'Île Maurice. Nous connectons les producteurs locaux aux acheteurs internationaux avec transparence et qualité.</p>
        </div>
      </section>

      <div className="container">
        <div className="stats-section" style={{ padding: '4rem 0' }}>
          <div className="container">
            <div className="stats-grid" style={{ textAlign: 'center' }}>
              {[
                { num: '200+', label: 'Producteurs partenaires', icon: Users },
                { num: '15', label: 'Années d\'expérience', icon: Clock },
                { num: '50+', label: 'Pays desservis', icon: Globe },
                { num: '98%', label: 'Satisfaction client', icon: Heart }
              ].map((stat, i) => (
                <div key={i} className="stat-item" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    <stat.icon size={20} style={{ color: 'var(--primary)' }} />
                    <div className="stat-number" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>{stat.num}</div>
                  </div>
                  <div className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="scroll-animate" style={{ marginTop: '64px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, marginBottom: '32px', textAlign: 'center', color: 'var(--text-dark)' }}>Notre mission</h2>
          <div className="about-values-grid">
            {[
              { icon: Leaf, title: 'Qualité premium', desc: 'Nous sélectionnons uniquement les meilleures matières premières, vérifiées et certifiées par nos experts.' },
              { icon: Shield, title: 'Commerce équitable', desc: 'Nous garantissons une rémunération juste à nos producteurs et des conditions transparentes pour tous.' },
              { icon: Award, title: 'Excellence', desc: 'Notre engagement pour l\'excellence se reflète dans chaque produit que nous mettons à votre disposition.' }
            ].map((item, i) => (
              <div key={i} className="premium-card" style={{ textAlign: 'center', padding: '32px', background: '#fff', borderRadius: '12px', transition: 'all 0.3s ease' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <item.icon size={28} style={{ color: 'var(--primary)' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-dark)' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="scroll-animate" style={{ marginTop: '64px', padding: '48px', background: 'var(--bg-cream)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-dark)' }}>Notre histoire</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '15px' }}>
            Fondée en 2015, Jerossa est née d\'une passion commune pour les matières premières d\'exception de Madagascar et de l\'Île Maurice.
            Ce qui a commencé comme un petit projet de commerce équitable s\'est transformé en une marketplace B2B de référence,
            connectant plus de 200 producteurs locaux à des acheteurs du monde entier.<br /><br />
            Notre engagement envers la qualité, la transparence et le commerce équitable guide chacune de nos actions.
            Nous croyons que chaque produit raconte une histoire — celle de ses producteurs, de son terroir et de son savoir-faire ancestral.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;