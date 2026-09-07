import React, { useState, useEffect } from 'react';
import './Home.css';
import {
  Shield, ArrowRight, Star, MapPin, Globe,
  Heart, ShoppingBag, ChevronDown, Package, Truck, BadgeCheck, Quote,
  Mail, Sprout, TrendingUp, Handshake, Search,
  CheckCircle2, Eye, MessageSquare, BarChart3,
  UserPlus, Wallet, Lock, LayoutGrid, PlusCircle, Tag, FileText, Flag, LifeBuoy
} from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../services/catalog';
import { useCurrency, CURRENCY_NOTE } from '../context/CurrencyContext';
import { useLang } from '../context/LangContext';
import SmartImg from '../components/common/SmartImg';
import HeroCards from '../components/home/HeroCards';

const FAQ_ITEMS = [
  { q: "home.faq.1.q", a: "home.faq.1.a" },
  { q: "home.faq.2.q", a: "home.faq.2.a" },
  { q: "home.faq.3.q", a: "home.faq.3.a" },
  { q: "home.faq.4.q", a: "home.faq.4.a" },
  { q: "home.faq.5.q", a: "home.faq.5.a" },
];

const TRUST_ITEMS = [
  { icon: BadgeCheck, title: 'home.trust.verified.title', text: 'home.trust.verified.desc' },
  { icon: FileText, title: 'home.trust.detailed.title', text: 'home.trust.detailed.desc' },
  { icon: MessageSquare, title: 'home.trust.messaging.title', text: 'home.trust.messaging.desc' },
  { icon: Star, title: 'home.trust.reviews.title', text: 'home.trust.reviews.desc' },
  { icon: Flag, title: 'home.trust.report.title', text: 'home.trust.report.desc' },
  { icon: LifeBuoy, title: 'home.trust.assistance.title', text: 'home.trust.assistance.desc' },
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { convert, currency } = useCurrency();
  const { t } = useLang();
  const [openFaq, setOpenFaq] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [howTab, setHowTab] = useState('acheter');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchMarket, setSearchMarket] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchProducts().then((data) => setFeaturedProducts(data.slice(0, 8)));
  }, []);

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      }
    }
  }, [location]);

  const openQuickView = (productId) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('product', productId);
    setSearchParams(newParams);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchCategory) params.set('cat', searchCategory);
    if (searchMarket) params.set('market', searchMarket);
    window.location.href = `/boutique${params.toString() ? `?${params.toString()}` : ''}`;
  };

  return (
    <div className="home-page">
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section" id="accueil">
        <div className="hero-bg-media">
          <picture>
            <source media="(max-width: 768px)" srcSet="/hero-bg-mobile.jpg" />
            <img
              src="/hero-bg-desktop.jpg"
              alt={t('home.heroAlt')}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="hero-bg-img"
              width="2560"
              height="1440"
            />
          </picture>
        </div>
        <div className="hero-bg-gradient-vignette" aria-hidden="true"></div>

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge" id="hero-badge">
              <Sprout size={14} strokeWidth={1.75} className="hero-badge-icon" />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="hero-title">
              {t('hero.title.line1')}<br />
              <span className="hero-title-accent">{t('hero.title.accent')}</span>
            </h1>

            <p className="hero-description">
              {t('hero.desc')}
            </p>

            <div className="hero-actions">
              <Link to="/boutique" className="btn-hero-primary" id="hero-btn-explore">
                <span>{t('hero.cta.primary')}</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/publier" className="btn-hero-secondary" id="hero-btn-publish">
                <PlusCircle size={15} />
                <span>{t('hero.cta.secondary')}</span>
              </Link>
            </div>

            <div className="hero-trust-row" aria-label={t('home.trustAria')}>
              <div className="hero-trust-item">
                <BadgeCheck size={15} strokeWidth={1.75} />
                <span>{t('hero.trust.profiles')}</span>
              </div>
              <div className="hero-trust-item">
                <Truck size={15} strokeWidth={1.75} />
                <span>{t('hero.trust.shipping')}</span>
              </div>
              <div className="hero-trust-item">
                <Shield size={15} strokeWidth={1.75} />
                <span>{t('hero.trust.security')}</span>
              </div>
              <div className="hero-trust-item">
                <Heart size={15} strokeWidth={1.75} />
                <span>{t('hero.trust.direct')}</span>
              </div>
            </div>
          </div>

          <div className="hero-visual-zone">
            <HeroCards />
          </div>
        </div>

        <a href="#recherche" className="hero-scroll-indicator" aria-label={t('hero.scroll')}>
          <span className="hero-scroll-text">{t('hero.scroll')}</span>
          <ChevronDown size={14} strokeWidth={2} className="hero-scroll-chevron" />
        </a>
      </section>

      {/* ===== ADVANCED SEARCH ===== */}
      <section className="search-section" id="recherche">
        <div className="container">
          <form className="search-panel" onSubmit={submitSearch}>
            <div className="search-panel-head">
              <span className="search-panel-label">
                <Search size={15} strokeWidth={1.8} />
                {t('home.searchLabel')}
              </span>
            </div>
            <div className="search-panel-fields">
              <div className="search-input-wrap">
                <Search size={16} strokeWidth={1.8} />
                <input
                  type="text"
                  placeholder={t('home.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="search-select-wrap">
                <Tag size={15} strokeWidth={1.8} />
                <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                  <option value="">{t('home.searchCategory')}</option>
                  {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="search-select-wrap">
                <Globe size={15} strokeWidth={1.8} />
                <select value={searchMarket} onChange={(e) => setSearchMarket(e.target.value)}>
                  <option value="">{t('home.searchAllMarkets')}</option>
                  <option value="MG">🇲🇬 Madagascar</option>
                  <option value="MU">🇲🇺 Maurice</option>
                  <option value="INT">🌍 International</option>
                </select>
              </div>
              <button type="submit" className="search-submit">
                {t('home.searchBtn')}
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="search-panel-footer">
              <span className="search-popular">{t('home.searchPopular')}</span>
              {['Vanille de Madagascar', 'Cacao & Fèves', 'Café de spécialité', 'Fournisseur de cacao', 'Produits artisanaux'].map((q) => (
                <button
                  key={q}
                  type="button"
                  className="search-suggestion"
                  onClick={() => setSearchQuery(q)}
                >
                  {q}
                </button>
              ))}
              <span className="j-currency-note">
                <Wallet size={13} />
                {t('nav.displayCurrency')} : {currency} · {CURRENCY_NOTE}
              </span>
            </div>
          </form>
        </div>
      </section>

      {/* ===== MARKET BRIDGE ===== */}
      <section className="bridge-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-surtitre">{t('home.missionSurtitre')}</span>
            <h2 className="section-title">{t('home.missionTitle')}</h2>
            <p className="section-desc">
              {t('home.missionDesc')}
            </p>
          </div>
          <div className="bridge-grid">
            <div className="bridge-card bridge-card--mg">
              <div className="bridge-card-flag">🇲🇬</div>
              <h3>Madagascar</h3>
              <p>{t('home.mgDesc')}</p>
              <ul className="bridge-list">
                <li><CheckCircle2 size={15} /> {t('home.mg1')}</li>
                <li><CheckCircle2 size={15} /> {t('home.mg2')}</li>
                <li><CheckCircle2 size={15} /> {t('home.mg3')}</li>
              </ul>
            </div>
            <div className="bridge-link">
              <span className="bridge-link-ico"><Handshake size={26} strokeWidth={1.6} /></span>
              <span>{t('home.bridgeExchange')}</span>
            </div>
            <div className="bridge-card bridge-card--mu">
              <div className="bridge-card-flag">🇲🇺</div>
              <h3>Maurice</h3>
              <p>{t('home.muDesc')}</p>
              <ul className="bridge-list">
                <li><CheckCircle2 size={15} /> {t('home.mu1')}</li>
                <li><CheckCircle2 size={15} /> {t('home.mu2')}</li>
                <li><CheckCircle2 size={15} /> {t('home.mu3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRODUCT CATEGORIES ===== */}
      <section className="categories-section" id="categories">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-surtitre">{t('home.categoriesSurtitre')}</span>
              <h2 className="section-title">{t('home.categoriesTitle')}</h2>
              <p className="section-desc">{t('home.categoriesDesc')}</p>
            </div>
            <Link to="/boutique" className="section-link">
              {t('nav.allCatalogue')} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="categories-grid">
            {categories.slice(0, 10).map((cat) => (
              <Link to={`/categories/${cat.slug}`} key={cat.id} className="category-card">
                <div className="category-image-wrapper">
                  <div className="category-image">
                    <img src={cat.image} alt={cat.name} loading="lazy" />
                  </div>
                </div>
                <h3 className="category-title">{cat.name}</h3>
                <span className="category-short">{cat.short}</span>
                <span className="category-count">{cat.productCount} {t('common.offers')}</span>
                <span className="category-cta">{t('home.seeOffers')} <ArrowRight size={11} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="products-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-surtitre">{t('home.recentSurtitre')}</span>
              <h2 className="section-title">{t('home.recentTitle')}</h2>
              <p className="section-desc">{t('home.recentDesc')}</p>
            </div>
            <Link to="/boutique" className="section-link">
              {t('home.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="products-grid">
            {featuredProducts.map((prod) => (
              <div
                key={prod.id}
                className="product-card"
                onClick={() => openQuickView(prod.id)}
              >
                <div className="product-card-image">
                  <SmartImg src={prod.images[0]} alt={prod.title} />
                  {prod.tag && <span className="product-card-tag">{prod.tag}</span>}
                  <button className="product-card-wishlist" aria-label={t('product.wishlistLabel')} onClick={(e) => e.stopPropagation()}>
                    <Heart size={15} strokeWidth={1.5} />
                  </button>
                </div>
                <div className="product-card-body">
                  <div className="product-card-meta">
                    <span className="product-card-origin">
                      <MapPin size={11} /> {prod.origin}
                    </span>
                    {prod.verified && (
                      <span className="j-verified-chip">
                        <BadgeCheck size={13} /> {t('home.verifiedSupplier')}
                      </span>
                    )}
                  </div>
                  <h3 className="product-card-title">{prod.title}</h3>
                  <span className="product-card-seller">{prod.seller}</span>
                  <div className="product-card-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={13} fill={j < Math.floor(prod.rating) ? "#d4a373" : "rgba(212,163,115,0.25)"} color="#d4a373" />
                      ))}
                    </div>
                    <span className="product-card-reviews">({prod.reviews})</span>
                    <span className="product-card-availability">
                      <CheckCircle2 size={12} /> {prod.availability}
                    </span>
                  </div>
                  <div className="product-card-footer">
                    <div className="product-card-price">
                      <strong>{convert(prod.priceEUR)}</strong>
                      <span className="product-card-unit">/ {prod.unit}</span>
                    </div>
                    <button className="product-card-view" onClick={(e) => { e.stopPropagation(); openQuickView(prod.id); }}>
                      {t('home.viewOffer')} <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-section" id="comment-ca-marche">
        <div className="container">
          <div className="section-header-center">
            <span className="section-surtitre">{t('home.howSurtitre')}</span>
            <h2 className="section-title">{t('home.howTitle')}</h2>
            <p className="section-desc">{t('home.howDesc')}</p>
          </div>

          <div className="how-tabs">
            <button
              className={`how-tab${howTab === 'acheter' ? ' is-active' : ''}`}
              onClick={() => setHowTab('acheter')}
            >
              <ShoppingBag size={17} strokeWidth={1.8} /> {t('home.howTabBuy')}
            </button>
            <button
              className={`how-tab${howTab === 'vendre' ? ' is-active' : ''}`}
              onClick={() => setHowTab('vendre')}
            >
              <TrendingUp size={17} strokeWidth={1.8} /> {t('home.howTabSell')}
            </button>
          </div>

          <div className="how-steps">
            {(howTab === 'acheter'
              ? [
                  { icon: Search, title: 'home.howSearch', text: 'home.howSearchText' },
                  { icon: LayoutGrid, title: 'home.howCompare', text: 'home.howCompareText' },
                  { icon: MessageSquare, title: 'home.howContact', text: 'home.howContactText' },
                  { icon: Shield, title: 'home.howDeal', text: 'home.howDealText' },
                ]
              : [
                  { icon: UserPlus, title: 'home.howCreate', text: 'home.howCreateText' },
                  { icon: PlusCircle, title: 'home.howPublish', text: 'home.howPublishText' },
                  { icon: Eye, title: 'home.howPresent', text: 'home.howPresentText' },
                  { icon: TrendingUp, title: 'home.howGrow', text: 'home.howGrowText' },
                ]
            ).map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="how-step">
                  <span className="how-step-num">{i + 1}</span>
                  <span className="how-step-ico"><Icon size={20} strokeWidth={1.6} /></span>
                  <h3>{t(step.title)}</h3>
                  <p>{t(step.text)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== TRUST SPACE ===== */}
      <section className="trust-section" id="confiance">
        <div className="container">
          <div className="trust-section-inner">
            <div className="trust-section-head">
              <span className="section-surtitre">{t('home.trustSurtitre')}</span>
              <h2 className="section-title">{t('home.trustTitle')}</h2>
              <p className="section-desc">
                {t('home.trustDesc')}
              </p>
            </div>
            <div className="trust-grid">
              {TRUST_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="trust-card">
                    <span className="trust-card-ico"><Icon size={20} strokeWidth={1.6} /></span>
                    <h3>{t(item.title)}</h3>
                    <p>{t(item.text)}</p>
                  </div>
                );
              })}
            </div>
            <div className="trust-note">
              <Lock size={15} />
              {t('home.trustNote')}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SELLER / PROVIDER SPACE ===== */}
      <section className="seller-section" id="vendeurs">
        <div className="container">
          <div className="seller-inner">
            <div className="seller-copy">
              <span className="section-surtitre">{t('home.sellerSurtitre')}</span>
              <h2 className="section-title">{t('home.sellerTitle')}</h2>
              <p className="seller-desc">
                {t('home.sellerDesc')}
              </p>
              <div className="seller-actions">
                <Link to="/publier" className="j-pill-btn j-pill-btn--gold">
                  <PlusCircle size={16} /> {t('home.sellerPublishOffer')}
                </Link>
                <Link to="/register" className="j-pill-btn j-pill-btn--outline-dark">
                  {t('home.sellerCreateSpace')}
                </Link>
              </div>
            </div>
            <div className="seller-dashboard">
              <div className="seller-dash-head">
                <span className="seller-dash-title">{t('home.sellerDashOverview')}</span>
                <span className="seller-dash-tag">{t('home.sellerDashTag')}</span>
              </div>
              <div className="seller-dash-stats">
                <div className="seller-stat">
                  <span className="seller-stat-ico"><Eye size={16} /></span>
                  <strong>1 248</strong><span>{t('home.sellerViews')}</span>
                </div>
                <div className="seller-stat">
                  <span className="seller-stat-ico"><MessageSquare size={16} /></span>
                  <strong>56</strong><span>{t('home.sellerRequests')}</span>
                </div>
                <div className="seller-stat">
                  <span className="seller-stat-ico"><Package size={16} /></span>
                  <strong>12</strong><span>{t('home.sellerActiveOffers')}</span>
                </div>
                <div className="seller-stat">
                  <span className="seller-stat-ico"><BarChart3 size={16} /></span>
                  <strong>+18%</strong><span>{t('home.sellerNewContacts')}</span>
                </div>
              </div>
              <div className="seller-dash-menu">
                {[
                  "home.sellerMenuOverview", 'home.sellerMenuProducts', 'home.sellerMenuAddOffer',
                  'home.sellerMenuMessages', 'home.sellerMenuOrders', 'home.sellerMenuFavorites', 'home.sellerMenuStats', 'home.sellerMenuProfile', 'home.sellerMenuSettings',
                ].map((item, i) => (
                  <span key={item} className={`seller-menu-item${i === 0 ? ' is-active' : ''}`}>{t(item)}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">200+</div>
              <div className="stat-label">{t('home.statsSuppliers')}</div>
              <div className="stat-trend"><TrendingUp size={12} /> {t('home.statsThisYear')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">{t('home.statsSatisfaction')}</div>
              <div className="stat-trend"><Heart size={12} /> {t('home.statsFairTrade')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">2</div>
              <div className="stat-label">{t('home.statsTerritories')}</div>
              <div className="stat-trend">Madagascar ↔ Maurice</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">3</div>
              <div className="stat-label">{t('home.statsCurrencies')}</div>
              <div className="stat-trend"><Heart size={12} /> MGA · MUR · EUR</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRODUCERS / SUPPLIERS ===== */}
      <section className="producers-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-surtitre">{t('home.suppliersSurtitre')}</span>
            <h2 className="section-title">{t('home.suppliersTitle')}</h2>
            <p className="section-desc">{t('home.suppliersDesc')}</p>
          </div>

          <div className="producers-grid">
            {[
              { name: 'Coopérative SAVA Vanilla', region: 'Région SAVA, Madagascar', specialty: 'Vanille Bourbon Grade A', img: 'https://images.unsplash.com/photo-1610487512810-b614ad747572?w=400&auto=format&fit=crop&q=80' },
              { name: 'Domaine Sucrier Mauricien', region: 'Rivière Noire, Maurice', specialty: 'Sucre roux artisanal', img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80' },
              { name: 'Plantation Ambanja', region: 'Sambirano, Madagascar', specialty: 'Cacao Criollo Bio', img: 'https://images.unsplash.com/photo-1610450949065-1f2841536c88?w=400&auto=format&fit=crop&q=80' },
            ].map((producer, i) => (
              <div key={i} className="producer-card">
                <div className="producer-card-image">
                  <img src={producer.img} alt={producer.name} loading="lazy" />
                  <div className="producer-card-overlay">
                    <Link to="/producteurs" className="producer-card-link">{t('home.suppliersViewProfile')} <ArrowRight size={12} /></Link>
                  </div>
                </div>
                <div className="producer-card-body">
                  <h3>{producer.name}</h3>
                  <span className="producer-region"><MapPin size={12} /> {producer.region}</span>
                  <p className="producer-specialty">{producer.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-surtitre">{t('home.testimonialsSurtitre')}</span>
            <h2 className="section-title">{t('home.testimonialsTitle')}</h2>
            <p className="section-desc">{t('home.testimonialsDesc')}</p>
          </div>

          <div className="testimonials-grid">
            {[
              { name: 'home.testimonial.1.name', role: 'home.testimonial.1.role', text: 'home.testimonial.1.text', rating: 5 },
              { name: 'home.testimonial.2.name', role: 'home.testimonial.2.role', text: 'home.testimonial.2.text', rating: 5 },
              { name: 'home.testimonial.3.name', role: 'home.testimonial.3.role', text: 'home.testimonial.3.text', rating: 4 },
            ].map((tm, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={15} fill={j < tm.rating ? '#d4a373' : 'rgba(212,163,115,0.2)'} color="#d4a373" />
                  ))}
                </div>
                <div className="testimonial-quote">
                  <Quote size={18} strokeWidth={1.5} />
                </div>
                <p className="testimonial-text">"{t(tm.text)}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t(tm.name).split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <div className="testimonial-name">{t(tm.name)}</div>
                    <div className="testimonial-role">{t(tm.role)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-surtitre">{t('home.faqSurtitre')}</span>
            <h2 className="section-title">{t('home.faqTitle')}</h2>
            <p className="section-desc">{t('home.faqDesc')}</p>
          </div>

          <div className="faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'faq-item--open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{t(item.q)}</span>
                  <ChevronDown size={16} strokeWidth={1.5} className={`faq-chevron ${openFaq === i ? 'faq-chevron--open' : ''}`} />
                </button>
                <div className="faq-answer">
                  <p>{t(item.a)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-inner">
            <div className="newsletter-content">
              <span className="newsletter-surtitre">{t('home.newsletterSurtitre')}</span>
              <h2>{t('home.newsletterTitle')}</h2>
              <p>{t('home.newsletterDesc')}</p>
              <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); }}>
                <div className="newsletter-input-wrapper">
                  <Mail size={18} strokeWidth={1.5} />
                  <input type="email" placeholder={t('home.newsletterPlaceholder')} value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} required />
                </div>
                <button type="submit" className="newsletter-submit">
                  {t('home.newsletterBtn')}
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
              </form>
              <p className="newsletter-disclaimer">{t('home.newsletterDisclaimer')}</p>
            </div>
            <div className="newsletter-visual">
              <div className="newsletter-image-stack">
                <div className="newsletter-img-card">
                  <img src="https://images.unsplash.com/photo-1610487512810-b614ad747572?w=400&auto=format&fit=crop&q=80" alt="Vanille" loading="lazy" />
                </div>
                <div className="newsletter-img-card newsletter-img-card-2">
                  <img src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&auto=format&fit=crop&q=80" alt="Café" loading="lazy" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
