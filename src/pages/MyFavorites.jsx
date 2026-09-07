import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useLang } from '../context/LangContext';
import './animations.css';
import EmptyState from '../components/common/EmptyState';

const MyFavorites = () => {
  const { t } = useLang();
  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('account.myFavorites')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('account.favorites')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('account.myFavoritesTitle')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('account.favoritesSubtitle')}</p>
        </div>
      </section>

      <div style={{ marginBottom: '32px' }}>
        <EmptyState
          icon={Heart}
          title={t('account.favoritesEmptyTitle')}
          text={t('account.favoritesEmptyText')}
          action={
            <Link to="/boutique" className="btn btn-primary premium-btn" style={{ padding: '14px 28px' }}>{t('account.discoverCatalog')}</Link>
          }
        />
      </div>
    </div>
  );
};

export default MyFavorites;
