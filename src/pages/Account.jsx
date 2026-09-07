import React from 'react';
import { Link } from 'react-router-dom';
import { User, Store, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { useLang } from '../context/LangContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import './animations.css';

const Account = () => {
  const { t } = useLang();

  return (
    <div className="account-page" style={{ padding: '0 0 80px', minHeight: '80vh', background: 'var(--bg-cream)' }}>
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('account.title')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('account.title')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('account.title')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('account.heroSubtitle')}</p>
          <div className="anim-fade-up stagger-4" style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <LanguageSwitcher />
          </div>
        </div>
      </section>

      <div className="container">

        <div className="account-types-grid scroll-animate" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Client Account */}
          <div className="account-card client-card premium-card" style={{ background: '#fff', borderRadius: '12px', padding: '40px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
            <div className="account-icon-wrapper" style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', background: 'rgba(30, 61, 47, 0.1)', color: 'var(--primary)' }}>
              <User size={32} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, margin: '0 0 15px', color: 'var(--text-dark)' }}>{t('account.clientTitle')}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', lineHeight: 1.6 }}>{t('account.clientText')}</p>

            <ul className="account-benefits" style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', flexGrow: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-dark)', fontSize: '0.95rem' }}><ArrowRight size={16} style={{ color: 'var(--primary)' }} /> {t('account.benefitHistory')}</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-dark)', fontSize: '0.95rem' }}><ArrowRight size={16} style={{ color: 'var(--primary)' }} /> {t('account.benefitPayment')}</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-dark)', fontSize: '0.95rem' }}><ArrowRight size={16} style={{ color: 'var(--primary)' }} /> {t('account.benefitOffers')}</li>
            </ul>

            <div className="account-forms" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}>{t('auth.login')}</Link>
              <Link to="/register" className="btn btn-outline" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>{t('account.createClient')}</Link>
            </div>
          </div>

          {/* Seller Account */}
          <div className="account-card seller-card premium-card" style={{ background: '#fff', borderRadius: '12px', padding: '40px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
            <div className="account-icon-wrapper" style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', background: 'rgba(189, 140, 97, 0.1)', color: 'var(--accent)' }}>
              <Store size={32} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, margin: '0 0 15px', color: 'var(--text-dark)' }}>{t('account.sellerTitle')}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', lineHeight: 1.6 }}>{t('account.sellerText')}</p>

            <ul className="account-benefits" style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', flexGrow: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-dark)', fontSize: '0.95rem' }}><TrendingUp size={16} style={{ color: 'var(--accent)' }} /> {t('account.benefitCatalog')}</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-dark)', fontSize: '0.95rem' }}><ShieldCheck size={16} style={{ color: 'var(--accent)' }} /> {t('account.benefitSupport')}</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-dark)', fontSize: '0.95rem' }}><ArrowRight size={16} style={{ color: 'var(--accent)' }} /> {t('account.benefitVisibility')}</li>
            </ul>

            <div className="account-forms" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Link to="/vendeur/devenir" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}>{t('account.becomeSeller')}</Link>
              <Link to="/login" className="btn btn-outline" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>{t('account.loginSeller')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
