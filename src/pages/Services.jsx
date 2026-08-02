import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, Star, MapPin, Clock, BadgeCheck, Award, Sparkles, Briefcase, PlusCircle, X, SlidersHorizontal } from 'lucide-react';
import { servicesData, serviceCategories } from '../data/services';
import { useCurrency } from '../context/CurrencyContext';
import './Services.css';

const Services = () => {
  const [searchParams] = useSearchParams();
  const { convert } = useCurrency();

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
    'construction-batiment': 'Construction & Bâtiment',
    'maison-entretien': 'Maison & Entretien',
    'automobile-transport': 'Automobile & Transport',
    'services-professionnels': 'Services Professionnels',
    'evenementiel-personnels': 'Événementiel & Personnels',
  };

  return (
    <div className="services-page">
      {/* Page Hero */}
      <section className="services-hero">
        <div className="container">
          <nav className="services-breadcrumb">
            <Link to="/">Accueil</Link>
            <span>/</span>
            <span>Services</span>
          </nav>
          <span className="services-hero-tag">Marketplace Services</span>
          <h1>Services & Professionnels</h1>
          <p>
            Publiez, comparez et contactez des prestataires fiables à Maurice et à Madagascar :
            construction, entretien, transport, comptabilité, développement web, événementiel et bien plus.
          </p>

          <form className="services-search" onSubmit={submit}>
            <div className="services-search-input">
              <Search size={17} strokeWidth={1.8} />
              <input
                type="text"
                placeholder="Maçon à Port-Louis, Plombier à Curepipe, transport de marchandises…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button type="button" className="services-search-clear" onClick={() => { setQuery(''); setActiveQuery(''); }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="services-search-btn">Rechercher <ArrowRight size={15} /></button>
          </form>

          <div className="services-hero-actions">
            <Link to="/publier?type=service" className="services-hero-btn">
              <PlusCircle size={16} /> Publier mon service
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
            Toutes les catégories
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
              <option value="all">Tous les marchés</option>
              <option value="MG">🇲🇬 Madagascar</option>
              <option value="MU">🇲🇺 Maurice</option>
              <option value="INT">🌍 International</option>
            </select>
            <label className="services-check">
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
              Professionnels vérifiés
            </label>
            <button className="services-mobile-filters" onClick={() => setShowMobileFilters(!showMobileFilters)}>
              <SlidersHorizontal size={15} /> Filtres
            </button>
          </div>
          <span className="services-count">
            {filtered.length} service{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
            {category !== 'all' && <> dans <strong>{categoryNames[category]}</strong></>}
          </span>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="services-empty">
            <div className="services-empty-ico"><Briefcase size={26} /></div>
            <h3>Aucun service trouvé</h3>
            <p>Modifiez vos filtres ou élargissez votre recherche.</p>
            <button
              className="j-pill-btn j-pill-btn--outline-dark"
              onClick={() => { setCategory('all'); setMarket('all'); setVerifiedOnly(false); setActiveQuery(''); setQuery(''); }}
            >
              Réinitialiser
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
                      <span className="services-result-time"><Clock size={12} /> Réponse {svc.responseTime}</span>
                    </div>
                    <div className="services-result-footer">
                      <span className="services-result-price">
                        {svc.quoteOnly
                          ? <strong>Sur devis</strong>
                          : <><strong>À partir de {convert(svc.priceEUR)}</strong> <em>{svc.rateLabel}</em></>}
                      </span>
                      <span className="services-result-view">
                        Voir le professionnel <ArrowRight size={13} />
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
            <span className="services-cta-tag">Vous êtes prestataire ?</span>
            <h3>Publiez votre service et développez votre clientèle</h3>
            <p>Titre, catégorie, zone d'intervention, tarif, photos de réalisations : créez une offre complète en quelques minutes.</p>
          </div>
          <Link to="/publier?type=service" className="j-pill-btn j-pill-btn--gold">
            <PlusCircle size={16} /> Publier mon service
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
