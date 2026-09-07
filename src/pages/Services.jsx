import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, Star, MapPin, Clock, BadgeCheck, Award, Sparkles, Briefcase, PlusCircle, X, SlidersHorizontal } from 'lucide-react';
import { servicesData, serviceCategories } from '../data/services';
import { useCurrency } from '../context/CurrencyContext';
import { useLang } from '../context/LangContext';
import './Services.css';

const Services = () => {
  const [searchParams] = useSearchParams();
  const { convert } = useCurrency();
  const { t } = useLang();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeQuery, setActiveQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('cat') || 'all');
  const [market, setMarket] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setActiveQuery(searchParams.get('q') || '');
    setCategory(searchParams.get('cat') || 'all');
  }, [searchParams]);

  const filtered = servicesData.filter((s) => {
    const matchQuery = !activeQuery ||
      (s.title + ' ' + s.provider + ' ' + s.subcategory + ' ' + s.location).toLowerCase().includes(activeQuery.toLowerCase());
    const matchCat = category === 'all' || s.category === category;
    const matchMarket = market === 'all' || s.market === market;
    const matchVerified = !verifiedOnly || s.verified;
    return matchQuery && matchCat && matchMarket && matchVerified;
  });

  const submit = (e) => {
    e.preventDefault();
    setActiveQuery(query);
  };

  const categoryNames = {
    'construction-batiment': t('services.cat.construction'),
    'maison-entretien': t('services.cat.maison'),
    'automobile-transport': t('services.cat.auto'),
    'services-professionnels': t('services.cat.pro'),
    'evenementiel-personnels': t('services.cat.event'),
  };

  return (
    <div className="services-page">
      {/* Page Hero */}
      <section className="services-hero">
        <div className="container">
          <nav className="services-breadcrumb">
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <span>{t('services.breadcrumb')}</span>
          </nav>
          <span className="services-hero-tag">{t('services.tag')}</span>
          <h1>{t('services.title')}</h1>
          <p>
            {t('services.desc')}
          </p>

          <form className="services-search" onSubmit={submit}>
            <div className="services-search-input">
              <Search size={17} strokeWidth={1.8} />
              <input
                type="text"
                placeholder={t('services.searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button type="button" className="services-search-clear" onClick={() => { setQuery(''); setActiveQuery(''); }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="services-search-btn">{t('services.search')} <ArrowRight size={15} /></button>
          </form>

          <div className="services-hero-actions">
            <Link to="/publier?type=service" className="services-hero-btn">
              <PlusCircle size={16} /> {t('services.publishService')}
            </Link>
          </div>
        </div>
      </section>

      <div className="container services-body">
        {/* Category chips */}
        <div className="services-cat-chips">
          <button
            className={`service-chip${category === 'all' ? ' is-active' : ''}`}
            onClick={() => setCategory('all')}
          >
            {t('services.allCategories')}
          </button>
          {serviceCategories.map((c) => (
            <button
              key={c.id}
              className={`service-chip${category === c.slug ? ' is-active' : ''}`}
              onClick={() => setCategory(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="services-toolbar">
          <div className="services-filters">
            <select value={market} onChange={(e) => setMarket(e.target.value)} className="services-select">
              <option value="all">{t('services.allMarkets')}</option>
              <option value="MG">{t('services.market.mg')}</option>
              <option value="MU">{t('services.market.mu')}</option>
              <option value="INT">{t('services.market.int')}</option>
            </select>
            <label className="services-check">
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
              {t('services.verifiedOnly')}
            </label>
            <button className="services-mobile-filters" onClick={() => setShowMobileFilters(!showMobileFilters)}>
              <SlidersHorizontal size={15} /> {t('services.filters')}
            </button>
          </div>
          <span className="services-count">
            {t('services.count', { count: filtered.length })}
            {category !== 'all' && <> {t('services.in')} <strong>{categoryNames[category]}</strong></>}
          </span>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="services-empty">
            <div className="services-empty-ico"><Briefcase size={26} /></div>
            <h3>{t('services.emptyTitle')}</h3>
            <p>{t('services.emptyText')}</p>
            <button
              className="j-pill-btn j-pill-btn--outline-dark"
              onClick={() => { setCategory('all'); setMarket('all'); setVerifiedOnly(false); setActiveQuery(''); setQuery(''); }}
            >
              {t('services.reset')}
            </button>
          </div>
        ) : (
          <div className="services-results-grid">
            {filtered.map((svc) => {
              const badgeTone = svc.badgeTone || 'verified';
              return (
                <Link to={`/services/${svc.id}`} key={svc.id} className="services-result-card">
                  <div className="services-result-img">
                    <img src={svc.image} alt={svc.title} loading="lazy" />
                    <span className={`j-badge j-badge--${badgeTone}`}>
                      {badgeTone === 'verified' && <BadgeCheck size={12} />}
                      {badgeTone === 'recommended' && <Award size={12} />}
                      {badgeTone === 'new' && <Sparkles size={12} />}
                      {svc.badge}
                    </span>
                  </div>
                  <div className="services-result-body">
                    <span className="services-result-sub">{svc.subcategory}</span>
                    <h3>{svc.title}</h3>
                    <div className="services-result-provider">
                      <span className="services-result-avatar">{svc.provider.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
                      <div>
                        <strong>{svc.provider}</strong>
                        <span><MapPin size={11} /> {svc.location}</span>
                      </div>
                    </div>
                    <div className="services-result-rating">
                      <div className="stars">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={12} fill={j < Math.floor(svc.rating) ? '#d4a373' : 'rgba(212,163,115,0.25)'} color="#d4a373" />
                        ))}
                      </div>
                      <span>({svc.reviews})</span>
                      <span className="services-result-time"><Clock size={12} /> {t('services.detail.responseTimeLabel')} {svc.responseTime}</span>
                    </div>
                    <div className="services-result-footer">
                      <span className="services-result-price">
                        {svc.quoteOnly
                          ? <strong>{t('services.onQuote')}</strong>
                          : <><strong>{t('services.fromPrice', { price: convert(svc.priceEUR) })}</strong> <em>{svc.rateLabel}</em></>}
                      </span>
                      <span className="services-result-view">
                        {t('services.viewPro')} <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Publish CTA */}
        <div className="services-cta">
          <div>
            <span className="services-cta-tag">{t('services.ctaTag')}</span>
            <h3>{t('services.ctaTitle')}</h3>
            <p>{t('services.ctaText')}</p>
          </div>
          <Link to="/publier?type=service" className="j-pill-btn j-pill-btn--gold">
            <PlusCircle size={16} /> {t('services.publishService')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
