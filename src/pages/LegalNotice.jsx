import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './animations.css';
import { COMPANY_INFO } from '../config/companyInfo';
import { useLang } from '../context/LangContext';

const LegalNotice = () => {
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
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('legal.notice.breadcrumb')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('legal.notice.surtitre')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('legal.notice.title')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('legal.notice.desc')}</p>
        </div>
      </section>

      <div className="container">

        <div className="scroll-animate" style={{ lineHeight: 1.8, color: 'var(--text-dark)', fontSize: '15px' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.notice.editor')}</h2>
            <p style={{ marginBottom: '12px' }}>
              <strong>{t('legal.notice.platform', { brand: COMPANY_INFO.brandName })}</strong><br />
              {COMPANY_INFO.legalName ? (
                <>
                  {t('legal.notice.legalName')}{COMPANY_INFO.legalName}<br />
                  {COMPANY_INFO.addressDisplay && <>{t('legal.notice.address')}{COMPANY_INFO.addressDisplay}<br /></>}
                  {COMPANY_INFO.contactEmail && <>{t('legal.notice.email')}{COMPANY_INFO.contactEmail}<br /></>}
                  {COMPANY_INFO.phoneDisplay && <>{t('legal.notice.phone')}{COMPANY_INFO.phoneDisplay}<br /></>}
                  {COMPANY_INFO.registrationNumber && <>{t('legal.notice.registration')}{COMPANY_INFO.registrationNumber}</>}
                </>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>
                  {t('legal.notice.noticeText')}
                </span>
              )}
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.notice.hostingTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.notice.hostingText', { provider: COMPANY_INFO.hostingProvider })}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.notice.ipTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.notice.ipText')}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.notice.dataTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.notice.dataText', { brand: COMPANY_INFO.brandName })}<Link to="/privacy" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{t('legal.notice.dataPrivacyLink')}</Link>{t('legal.notice.dataTextEnd')}</p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>{t('legal.notice.liabilityTitle')}</h2>
            <p style={{ marginBottom: '12px' }}>{t('legal.notice.liabilityText')}</p>
          </section>
        </div>

        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> {t('legal.notice.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LegalNotice;