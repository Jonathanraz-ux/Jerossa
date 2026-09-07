import React from 'react';
import './animations.css';
import { useLang } from '../context/LangContext';
import { Shield, Award, Leaf, Globe, Users, Clock, Heart } from 'lucide-react';

const About = () => {
  const { t } = useLang();
  return (
    <div className="about-page">
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('about.breadcrumb')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('about.surtitre')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('about.title')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('about.desc')}</p>
        </div>
      </section>

      <div className="container">
        <div className="stats-section" style={{ padding: '4rem 0' }}>
          <div className="container">
            <div className="stats-grid" style={{ textAlign: 'center' }}>
              {[
                { num: '200+', label: t('about.stat.producers'), icon: Users },
                { num: '15', label: t('about.stat.years'), icon: Clock },
                { num: '50+', label: t('about.stat.countries'), icon: Globe },
                { num: '98%', label: t('about.stat.satisfaction'), icon: Heart }
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
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, marginBottom: '32px', textAlign: 'center', color: 'var(--text-dark)' }}>{t('about.mission')}</h2>
          <div className="about-values-grid">
            {[
              { icon: Leaf, title: t('about.value.qualityTitle'), desc: t('about.value.qualityDesc') },
              { icon: Shield, title: t('about.value.fairTitle'), desc: t('about.value.fairDesc') },
              { icon: Award, title: t('about.value.excellenceTitle'), desc: t('about.value.excellenceDesc') }
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
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-dark)' }}>{t('about.storyTitle')}</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '15px' }}>
            {t('about.storyP1')}
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '15px' }}>
            {t('about.storyP2')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;