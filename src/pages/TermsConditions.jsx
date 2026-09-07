import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '../context/LangContext';
import './animations.css';

const TermsConditions = () => {
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
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('legal.terms.breadcrumb')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('legal.terms.surtitre')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('legal.terms.title')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('legal.terms.desc')}</p>
        </div>
      </section>

      <div className="container scroll-animate" style={{ maxWidth: '800px' }}>
        <div style={{ lineHeight: 1.8, color: 'var(--text-dark)', fontSize: '15px' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.terms.objetTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.terms.objetText')}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.terms.ordersTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.terms.ordersText')}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.terms.priceTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.terms.priceText')}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.terms.deliveryTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.terms.deliveryText')}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.terms.returnsTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.terms.returnsText')}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.terms.ipTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.terms.ipText')}</p>
          </section>
        </div>

        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <Link to="/" className="link-premium" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> {t('legal.terms.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
