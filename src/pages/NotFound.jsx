import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { useLang } from '../context/LangContext';
import './animations.css';

const NotFound = () => {
  const { t } = useLang();
  return (
    <div className="not-found-page">
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('notFound.surtitre')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('notFound.title')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('notFound.desc')}</p>
        </div>
      </section>

      <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="scroll-animate" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Home size={16} /> {t('nav.home')}
          </Link>
          <Link to="/boutique" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Search size={16} /> {t('notFound.catalogue')}
          </Link>
          <Link to="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
            <ArrowLeft size={16} /> {t('common.back')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;