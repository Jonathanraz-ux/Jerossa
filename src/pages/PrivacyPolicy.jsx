import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '../context/LangContext';
import './animations.css';

const PrivacyPolicy = () => {
  const { t } = useLang();
  return (
    <div className="legal-page">
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('legal.privacy.breadcrumb')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('legal.privacy.surtitre')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('legal.privacy.title')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('legal.privacy.desc')}</p>
        </div>
      </section>

      <div className="container">

        <div className="scroll-animate" style={{ lineHeight: 1.8, color: 'var(--text-dark)', fontSize: '15px' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.privacy.introTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.privacy.introText')}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.privacy.dataTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.privacy.dataText')}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.privacy.usageTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.privacy.usageText')}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.privacy.storageTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.privacy.storageText')}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.privacy.rightsTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.privacy.rightsText')}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.privacy.contactTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.privacy.contactText')}</p>
          </section>
        </div>

        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> {t('legal.privacy.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;