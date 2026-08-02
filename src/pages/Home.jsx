import React, { useState, useEffect } from 'react';
import './Home.css';
import {
  Shield, Award, ArrowRight, Star, MapPin, Clock, Users, Globe,
  Heart, ShoppingBag, Check, ChevronDown, Package, Truck, BadgeCheck, Quote,
  Mail, Sprout, TrendingUp, Handshake, Search, Building2, Home as HomeIco,
  Car, Briefcase, Sparkles, CheckCircle2, Eye, MessageSquare, BarChart3,
  UserPlus, Wallet, Lock, LayoutGrid, PlusCircle, Tag, FileText, Flag, LifeBuoy
} from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { productsData } from '../data/products';
import { categoriesData } from '../data/categories';
import { servicesData, serviceCategories } from '../data/services';
import { useCurrency, CURRENCY_NOTE } from '../context/CurrencyContext';

const FAQ_ITEMS = [
  { q: "Comment fonctionne la plateforme Jerossa ?", a: "Jerossa met en relation les producteurs, fournisseurs et prestataires de Madagascar et de Maurice avec des acheteurs et des entreprises. Vous parcourez le catalogue de produits ou de services, comparez les offres et contactez directement le vendeur ou le professionnel." },
  { q: "Puis-je publier un produit ou un service ?", a: "Oui. Créez votre compte, puis cliquez sur « Publier une offre » pour proposer un produit (vanille, épices, artisanat…) ou un service (construction, transport, comptabilité…). Votre offre devient visible auprès des acheteurs des deux territoires." },
  { q: "Dans quelle devise les prix sont-ils affichés ?", a: "Vous pouvez afficher les prix en Ariary (MGA), en Roupie mauricienne (MUR) ou en Euro (EUR) grâce au sélecteur de devise. Les montants sont indicatifs selon le taux de conversion en vigueur." },
  { q: "Les prestataires de services sont-ils vérifiés ?", a: "Des badges de confiance comme « Professionnel vérifié » ou « Prestataire recommandé » signalent les offres contrôlées. Le système de vérification des profils et d'avis accompagnera progressivement le développement de la plateforme." },
  { q: "Quels moyens de paiement acceptez-vous ?", a: "La plateforme prépare l'intégration de paiements sécurisés (cartes, virement, mobile money). Dans un premier temps, les échanges se font en toute transparence entre les parties, avec messagerie et assistance Jerossa." },
];

const SERVICES_ICONS = {
  'construction-batiment': Building2,
  'maison-entretien': HomeIco,
  'automobile-transport': Car,
  'services-professionnels': Briefcase,
  'evenementiel-personnels': Sparkles,
};

const TRUST_ITEMS = [
  { icon: BadgeCheck, title: 'Profils vérifiés', text: 'Identité et informations professionnelles contrôlées pour renforcer la confiance.' },
  { icon: FileText, title: 'Offres détaillées', text: 'Produits et services décrits avec précision : prix, unité, disponibilité, localisation.' },
  { icon: MessageSquare, title: 'Messagerie sécurisée', text: 'Échangez directement avec les vendeurs et prestataires, sans partager vos coordonnées.' },
  { icon: Star, title: 'Système d’avis', text: 'Notes et retours d’expérience pour évaluer la fiabilité de chaque profil.' },
  { icon: Flag, title: 'Signalement d’annonces', text: 'Signalez toute offre suspecte : notre équipe traite chaque signalement.' },
  { icon: LifeBuoy, title: 'Assistance Jerossa', text: 'Une équipe disponible pour vous accompagner avant, pendant et après vos échanges.' },
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { convert, currency } = useCurrency();
  const [openFaq, setOpenFaq] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [howTab, setHowTab] = useState('acheter');

  const [searchType, setSearchType] = useState('produits');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchMarket, setSearchMarket] = useState('');

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
    const base = searchType === 'services' ? '/services' : '/boutique';
    window.location.href = `${base}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const featuredProducts = productsData.slice(0, 8);
  const featuredServices = [
    ...servicesData.filter((s) => s.recommended),
    ...servicesData.filter((s) => !s.recommended),
  ].slice(0, 6);

  return (
    <div className="home-page">
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section" id="accueil">
        <div className="hero-bg-overlay"></div>
        <div className="hero-deco-circle hero-deco-1"></div>
        <div className="hero-deco-circle hero-deco-2"></div>
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sprout size={14} strokeWidth={1.5} />
              <span>La marketplace entre Madagascar & Maurice</span>
            </div>
            <h1 className="hero-title">
              Les richesses de Madagascar,<br />
              <span className="hero-title-accent">les opportunités de Maurice.</span>
            </h1>
            <p className="hero-description">
              Découvrez des produits authentiques, trouvez des fournisseurs fiables et accédez
              à des services professionnels sur une plateforme conçue pour rapprocher Madagascar et Maurice.
            </p>
            <div className="hero-actions">
              <Link to="/boutique" className="btn-primary-luxury">
                Explorer les produits
                <ArrowRight size={16} />
              </Link>
              <Link to="/services" className="btn-outline-luxury">
                Découvrir les services
              </Link>
              <Link to="/publier" className="btn-ghost-luxury">
                <PlusCircle size={15} />
                Publier une offre
              </Link>
            </div>

            <div className="hero-trust-row">
              <div className="hero-trust-item">
                <BadgeCheck size={14} strokeWidth={1.5} />
                <span>Profils vérifiés</span>
              </div>
              <div className="hero-trust-item">
                <Truck size={14} strokeWidth={1.5} />
                <span>Échanges Madagascar ↔ Maurice</span>
              </div>
              <div className="hero-trust-item">
                <Shield size={14} strokeWidth={1.5} />
                <span>Échanges sécurisés</span>
              </div>
              <div className="hero-trust-item">
                <Heart size={14} strokeWidth={1.5} />
                <span>Commerce équitable</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-card">
              <img src="https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80" alt="Gousses de vanille de Madagascar" loading="eager" />
            </div>
            <div className="hero-image-card hero-image-card-2">
              <img src="https://images.unsplash.com/photo-1566837010278-2d8bae399e9b?w=800&auto=format&fit=crop&q=80" alt="Épices et poivres de Madagascar" loading="eager" />
            </div>
            <div className="hero-floating-card hero-floating-1">
              <div className="floating-card-inner">
                <Check size={16} strokeWidth={2} />
                <div>
                  <strong>Qualité certifiée</strong>
                  <span>Origine contrôlée</span>
                </div>
              </div>
            </div>
            <div className="hero-floating-card hero-floating-2">
              <div className="floating-card-inner">
                <Users size={16} strokeWidth={2} />
                <div>
                  <strong>Produits & services</strong>
                  <span>Un seul espace de confiance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span>Découvrir</span>
          <ChevronDown size={14} strokeWidth={1.5} />
        </div>
      </section>

      {/* ===== ADVANCED SEARCH ===== */}
      <section className="search-section" id="recherche">
        <div className="container">
          <form className="search-panel" onSubmit={submitSearch}>
            <div className="search-panel-head">
              <span className="search-panel-label">
                <Search size={15} strokeWidth={1.8} />
                Que recherchez-vous aujourd'hui ?
              </span>
              <div className="search-type-toggle">
                <button
                  type="button"
                  className={`search-type-btn${searchType === 'produits' ? ' is-active' : ''}`}
                  onClick={() => setSearchType('produits')}
                >
                  <Package size={15} strokeWidth={1.8} /> Produits
                </button>
                <button
                  type="button"
                  className={`search-type-btn${searchType === 'services' ? ' is-active' : ''}`}
                  onClick={() => setSearchType('services')}
                >
                  <Briefcase size={15} strokeWidth={1.8} /> Services
                </button>
              </div>
            </div>
            <div className="search-panel-fields">
              <div className="search-input-wrap">
                <Search size={16} strokeWidth={1.8} />
                <input
                  type="text"
                  placeholder={searchType === 'services'
                    ? 'Maçon à Port-Louis, Plombier à Curepipe, transport…'
                    : 'Vanille de Madagascar, fournisseur de cacao…'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="search-select-wrap">
                <Tag size={15} strokeWidth={1.8} />
                <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                  <option value="">Catégorie</option>
                  {searchType === 'services'
                    ? serviceCategories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)
                    : categoriesData.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="search-select-wrap">
                <Globe size={15} strokeWidth={1.8} />
                <select value={searchMarket} onChange={(e) => setSearchMarket(e.target.value)}>
                  <option value="">Tous les marchés</option>
                  <option value="MG">🇲🇬 Madagascar</option>
                  <option value="MU">🇲🇺 Maurice</option>
                  <option value="INT">🌍 International</option>
                </select>
              </div>
              <button type="submit" className="search-submit">
                Rechercher
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="search-panel-footer">
              <span className="search-popular">Populaires :</span>
              {['Vanille de Madagascar', 'Maçon à Port-Louis', 'Plombier à Curepipe', 'Fournisseur de cacao', 'Transport de marchandises'].map((q) => (
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
                Devise : {currency} · {CURRENCY_NOTE}
              </span>
            </div>
          </form>
        </div>
      </section>

      {/* ===== MARKET BRIDGE ===== */}
      <section className="bridge-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-surtitre">Notre mission</span>
            <h2 className="section-title">Un pont commercial entre deux territoires</h2>
            <p className="section-desc">
              Jerossa réunit producteurs, fournisseurs, commerçants et professionnels de Madagascar et de Maurice,
              pour créer des échanges plus simples, plus transparents et plus fiables.
            </p>
          </div>
          <div className="bridge-grid">
            <div className="bridge-card bridge-card--mg">
              <div className="bridge-card-flag">🇲🇬</div>
              <h3>Madagascar</h3>
              <p>Vanille, cacao, épices, produits agricoles, artisanat et matières premières d'exception.</p>
              <ul className="bridge-list">
                <li><CheckCircle2 size={15} /> Producteurs & coopératives</li>
                <li><CheckCircle2 size={15} /> Matières premières & produits locaux</li>
                <li><CheckCircle2 size={15} /> Traçabilité de la plantation à l'expédition</li>
              </ul>
            </div>
            <div className="bridge-link">
              <span className="bridge-link-ico"><Handshake size={26} strokeWidth={1.6} /></span>
              <span>Des échanges<br />renforcés</span>
            </div>
            <div className="bridge-card bridge-card--mu">
              <div className="bridge-card-flag">🇲🇺</div>
              <h3>Maurice</h3>
              <p>Professionnels, prestataires de services et entreprises à la recherche d'opportunités.</p>
              <ul className="bridge-list">
                <li><CheckCircle2 size={15} /> Services & professionnels</li>
                <li><CheckCircle2 size={15} /> Demande solvable & logistique développée</li>
                <li><CheckCircle2 size={15} /> Ouverture vers les marchés régionaux</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TWO PILLARS ===== */}
      <section className="pillars-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-surtitre">Deux marchés, une seule plateforme</span>
            <h2 className="section-title">Achetez, vendez et proposez vos services</h2>
            <p className="section-desc">Jerossa repose sur deux piliers complémentaires, conçus pour couvrir tous vos besoins commerciaux.</p>
          </div>
          <div className="pillars-grid">
            <div className="pillar-card pillar-card--products">
              <div className="pillar-card-top">
                <span className="pillar-ico"><Package size={26} strokeWidth={1.6} /></span>
                <span className="pillar-tag">Pilier 1</span>
              </div>
              <h3>Marketplace Produits</h3>
              <p>Vanille, café, cacao, épices, produits agricoles, artisanat et matières premières. Des offres vérifiées, directement des producteurs et fournisseurs.</p>
              <ul className="pillar-list">
                <li><Check size={14} /> Produits authentiques d'origine contrôlée</li>
                <li><Check size={14} /> Prix affichés dans votre devise</li>
                <li><Check size={14} /> Vente en gros, demi-gros et détail</li>
                <li><Check size={14} /> Contact direct avec le vendeur</li>
              </ul>
              <Link to="/boutique" className="pillar-btn">
                Explorer les produits <ArrowRight size={15} />
              </Link>
            </div>
            <div className="pillar-card pillar-card--services">
              <div className="pillar-card-top">
                <span className="pillar-ico"><Briefcase size={26} strokeWidth={1.6} /></span>
                <span className="pillar-tag">Pilier 2</span>
              </div>
              <h3>Marketplace Services</h3>
              <p>Construction, entretien, transport, services professionnels et événementiel. Les compétences mauriciennes au service de vos projets.</p>
              <ul className="pillar-list">
                <li><Check size={14} /> Prestataires et professionnels référencés</li>
                <li><Check size={14} /> Tarifs clairs ou sur devis</li>
                <li><Check size={14} /> Zone d'intervention géolocalisée</li>
                <li><Check size={14} /> Badges de confiance visibles</li>
              </ul>
              <Link to="/services" className="pillar-btn">
                Découvrir les services <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRODUCT CATEGORIES ===== */}
      <section className="categories-section" id="categories">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-surtitre">Produits</span>
              <h2 className="section-title">Nos catégories de produits</h2>
              <p className="section-desc">Les trésors agricoles et artisanaux de Madagascar et de Maurice</p>
            </div>
            <Link to="/boutique" className="section-link">
              Tout le catalogue <ArrowRight size={14} />
            </Link>
          </div>

          <div className="categories-grid">
            {categoriesData.slice(0, 10).map((cat) => (
              <Link to={`/categories/${cat.slug}`} key={cat.id} className="category-card">
                <div className="category-image-wrapper">
                  <div className="category-image">
                    <img src={cat.image} alt={cat.name} loading="lazy" />
                  </div>
                </div>
                <h3 className="category-title">{cat.name}</h3>
                <span className="category-short">{cat.short}</span>
                <span className="category-count">{cat.productCount} offres</span>
                <span className="category-cta">Voir les offres <ArrowRight size={11} /></span>
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
              <span className="section-surtitre">Offres récentes</span>
              <h2 className="section-title">Produits à découvrir</h2>
              <p className="section-desc">Disponibles en gros et demi-gros, directement des fournisseurs</p>
            </div>
            <Link to="/boutique" className="section-link">
              Voir tout <ArrowRight size={14} />
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
                  <img src={prod.images[0]} alt={prod.title} loading="lazy" />
                  {prod.tag && <span className="product-card-tag">{prod.tag}</span>}
                  <button className="product-card-wishlist" aria-label="Ajouter aux favoris" onClick={(e) => e.stopPropagation()}>
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
                        <BadgeCheck size={13} /> Fournisseur vérifié
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
                      Voir l'offre <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICE CATEGORIES ===== */}
      <section className="service-cats-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-surtitre">Services & Professionnels</span>
            <h2 className="section-title">Des services pour tous vos projets</h2>
            <p className="section-desc">Un véritable second marché : publiez, comparez et contactez des professionnels en quelques clics.</p>
          </div>
          <div className="service-cats-grid">
            {serviceCategories.map((cat) => {
              const Icon = SERVICES_ICONS[cat.slug] || Briefcase;
              return (
                <Link to={`/services?cat=${cat.slug}`} key={cat.id} className="service-cat-card">
                  <div className="service-cat-head">
                    <span className="service-cat-ico"><Icon size={22} strokeWidth={1.6} /></span>
                    <span className="service-cat-count">{cat.count} offres</span>
                  </div>
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                  <div className="service-cat-chips">
                    {cat.subcategories.slice(0, 4).map((s) => <span key={s}>{s}</span>)}
                  </div>
                  <span className="service-cat-link">Voir les offres <ArrowRight size={13} /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURED SERVICES ===== */}
      <section className="services-section" id="services">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-surtitre">Professionnels à la une</span>
              <h2 className="section-title">Services recommandés</h2>
              <p className="section-desc">Des prestataires vérifiés, prêts à intervenir à Maurice et à Madagascar</p>
            </div>
            <Link to="/services" className="section-link">
              Tous les services <ArrowRight size={14} />
            </Link>
          </div>

          <div className="services-grid">
            {featuredServices.map((svc) => {
              const badgeTone = svc.badgeTone || 'verified';
              return (
                <Link to={`/services/${svc.id}`} key={svc.id} className="service-card">
                  <div className="service-card-image">
                    <img src={svc.image} alt={svc.title} loading="lazy" />
                    <span className={`j-badge j-badge--${badgeTone} service-card-badge`}>
                      {badgeTone === 'verified' && <BadgeCheck size={12} />}
                      {badgeTone === 'recommended' && <Award size={12} />}
                      {badgeTone === 'new' && <Sparkles size={12} />}
                      {svc.badge}
                    </span>
                    <span className="service-card-availability">
                      <Clock size={12} /> {svc.availability}
                    </span>
                  </div>
                  <div className="service-card-body">
                    <h3 className="service-card-title">{svc.title}</h3>
                    <div className="service-card-provider">
                      <span className="service-card-avatar">{svc.provider.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                      <div>
                        <strong>{svc.provider}</strong>
                        <span className="service-card-location"><MapPin size={11} /> {svc.location}</span>
                      </div>
                    </div>
                    <div className="service-card-rating">
                      <div className="stars">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={12} fill={j < Math.floor(svc.rating) ? "#d4a373" : "rgba(212,163,115,0.25)"} color="#d4a373" />
                        ))}
                      </div>
                      <span>({svc.reviews}) · {svc.experience} ans d'exp.</span>
                    </div>
                    <div className="service-card-footer">
                      <div className="service-card-price">
                        {svc.quoteOnly
                          ? <strong>Sur devis</strong>
                          : <>
                              <strong>À partir de {convert(svc.priceEUR)}</strong>
                              <span className="service-card-rate">{svc.rateLabel}</span>
                            </>}
                      </div>
                      <span className="service-card-view">
                        Voir le professionnel <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-section" id="comment-ca-marche">
        <div className="container">
          <div className="section-header-center">
            <span className="section-surtitre">Comment ça marche</span>
            <h2 className="section-title">Simple, rapide, en toute confiance</h2>
            <p className="section-desc">Que vous achetiez ou que vous proposiez, Jerossa guide chaque étape.</p>
          </div>

          <div className="how-tabs">
            <button
              className={`how-tab${howTab === 'acheter' ? ' is-active' : ''}`}
              onClick={() => setHowTab('acheter')}
            >
              <ShoppingBag size={17} strokeWidth={1.8} /> Je souhaite acheter
            </button>
            <button
              className={`how-tab${howTab === 'vendre' ? ' is-active' : ''}`}
              onClick={() => setHowTab('vendre')}
            >
              <TrendingUp size={17} strokeWidth={1.8} /> Je souhaite vendre ou proposer un service
            </button>
          </div>

          <div className="how-steps">
            {(howTab === 'acheter'
              ? [
                  { icon: Search, title: 'Recherchez', text: 'Trouvez un produit ou un service grâce à la recherche avancée et aux filtres.' },
                  { icon: LayoutGrid, title: 'Comparez', text: 'Comparez les offres, les prix et les prestataires en toute transparence.' },
                  { icon: MessageSquare, title: 'Contactez', text: 'Échangez directement avec un vendeur ou un professionnel via la messagerie.' },
                  { icon: Shield, title: 'Réalisez', text: 'Concluez votre transaction en toute confiance, accompagné par l’assistance Jerossa.' },
                ]
              : [
                  { icon: UserPlus, title: 'Créez votre compte', text: 'Inscrivez-vous gratuitement en tant que vendeur ou prestataire.' },
                  { icon: PlusCircle, title: 'Publiez votre offre', text: 'Décrivez votre produit ou votre service : prix, zone, disponibilité, photos.' },
                  { icon: Eye, title: 'Présentez-vous', text: 'Mettez en avant vos compétences, votre expérience et vos réalisations.' },
                  { icon: TrendingUp, title: 'Développez votre activité', text: 'Recevez des demandes, fidélisez vos clients et élargissez votre marché.' },
                ]
            ).map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="how-step">
                  <span className="how-step-num">{i + 1}</span>
                  <span className="how-step-ico"><Icon size={20} strokeWidth={1.6} /></span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
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
              <span className="section-surtitre">Espace de confiance</span>
              <h2 className="section-title">Des échanges plus simples, plus transparents et plus fiables.</h2>
              <p className="section-desc">
                La confiance est au cœur de Jerossa. Chaque interaction est pensée pour protéger acheteurs, vendeurs et prestataires.
              </p>
            </div>
            <div className="trust-grid">
              {TRUST_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="trust-card">
                    <span className="trust-card-ico"><Icon size={20} strokeWidth={1.6} /></span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                );
              })}
            </div>
            <div className="trust-note">
              <Lock size={15} />
              Fonctionnalités de confiance prévues pour accompagner le développement de la plateforme.
            </div>
          </div>
        </div>
      </section>

      {/* ===== SELLER / PROVIDER SPACE ===== */}
      <section className="seller-section" id="vendeurs">
        <div className="container">
          <div className="seller-inner">
            <div className="seller-copy">
              <span className="section-surtitre">Espace vendeur & prestataire</span>
              <h2 className="section-title">Gérez votre activité depuis un tableau de bord unique</h2>
              <p className="seller-desc">
                Publiez vos offres, suivez vos demandes, discutez avec vos clients et pilotez vos performances.
                Un espace simple, moderne et professionnel, pensé pour les producteurs comme pour les indépendants.
              </p>
              <div className="seller-actions">
                <Link to="/publier" className="j-pill-btn j-pill-btn--gold">
                  <PlusCircle size={16} /> Publier une offre
                </Link>
                <Link to="/register" className="j-pill-btn j-pill-btn--outline-dark">
                  Créer mon espace
                </Link>
              </div>
            </div>
            <div className="seller-dashboard">
              <div className="seller-dash-head">
                <span className="seller-dash-title">Vue d'ensemble</span>
                <span className="seller-dash-tag">Mon activité</span>
              </div>
              <div className="seller-dash-stats">
                <div className="seller-stat">
                  <span className="seller-stat-ico"><Eye size={16} /></span>
                  <strong>1 248</strong><span>Vues</span>
                </div>
                <div className="seller-stat">
                  <span className="seller-stat-ico"><MessageSquare size={16} /></span>
                  <strong>56</strong><span>Demandes reçues</span>
                </div>
                <div className="seller-stat">
                  <span className="seller-stat-ico"><Package size={16} /></span>
                  <strong>12</strong><span>Offres actives</span>
                </div>
                <div className="seller-stat">
                  <span className="seller-stat-ico"><BarChart3 size={16} /></span>
                  <strong>+18%</strong><span>Nouveaux contacts</span>
                </div>
              </div>
              <div className="seller-dash-menu">
                {[
                  "Vue d'ensemble", 'Mes produits', 'Mes services', 'Ajouter une offre',
                  'Messages', 'Demandes reçues', 'Favoris', 'Statistiques', 'Profil', 'Paramètres',
                ].map((item, i) => (
                  <span key={item} className={`seller-menu-item${i === 0 ? ' is-active' : ''}`}>{item}</span>
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
              <div className="stat-label">Producteurs & fournisseurs</div>
              <div className="stat-trend"><TrendingUp size={12} /> +12% cette année</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">150+</div>
              <div className="stat-label">Professionnels & prestataires</div>
              <div className="stat-trend">Services vérifiés</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">2</div>
              <div className="stat-label">Territoires connectés</div>
              <div className="stat-trend">Madagascar ↔ Maurice</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">3</div>
              <div className="stat-label">Devises d'affichage</div>
              <div className="stat-trend"><Heart size={12} /> MGA · MUR · EUR</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRODUCERS / SUPPLIERS ===== */}
      <section className="producers-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-surtitre">Fournisseurs & Producteurs</span>
            <h2 className="section-title">Nos partenaires de confiance</h2>
            <p className="section-desc">Des producteurs et fournisseurs sélectionnés pour leur excellence</p>
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
                    <Link to="/producteurs" className="producer-card-link">Voir le profil <ArrowRight size={12} /></Link>
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
            <span className="section-surtitre">Témoignages</span>
            <h2 className="section-title">Ils nous font confiance</h2>
            <p className="section-desc">Des entreprises et professionnels de Madagascar et de Maurice</p>
          </div>

          <div className="testimonials-grid">
            {[
              { name: 'Marie Laurent', role: 'Chocolatier, Port-Louis', text: 'La vanille Bourbon trouvée via Jerossa est exceptionnelle. La mise en relation avec la coopérative SAVA a été simple et rapide.', rating: 5 },
              { name: 'Rakoto Andry', role: 'Producteur, SAVA', text: 'Jerossa me permet de toucher des acheteurs à Maurice sans intermédiaire. Je publie mes offres et je reçois des demandes sérieuses.', rating: 5 },
              { name: 'Thomas Renard', role: 'Promoteur immobilier, Curepipe', text: 'J\'ai trouvé un plombier et un électricien vérifiés en quelques minutes. La plateforme est claire, professionnelle et rassurante.', rating: 4 },
            ].map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={15} fill={j < t.rating ? '#d4a373' : 'rgba(212,163,115,0.2)'} color="#d4a373" />
                  ))}
                </div>
                <div className="testimonial-quote">
                  <Quote size={18} strokeWidth={1.5} />
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
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
            <span className="section-surtitre">FAQ</span>
            <h2 className="section-title">Questions fréquentes</h2>
            <p className="section-desc">Tout ce que vous devez savoir avant de commencer</p>
          </div>

          <div className="faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'faq-item--open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <ChevronDown size={16} strokeWidth={1.5} className={`faq-chevron ${openFaq === i ? 'faq-chevron--open' : ''}`} />
                </button>
                <div className="faq-answer">
                  <p>{item.a}</p>
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
              <span className="newsletter-surtitre">Newsletter</span>
              <h2>Restez informés</h2>
              <p>Recevez les nouvelles offres, les nouveaux professionnels et les actualités des marchés de Madagascar et Maurice.</p>
              <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); }}>
                <div className="newsletter-input-wrapper">
                  <Mail size={18} strokeWidth={1.5} />
                  <input type="email" placeholder="Votre adresse email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} required />
                </div>
                <button type="submit" className="newsletter-submit">
                  S'abonner
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
              </form>
              <p className="newsletter-disclaimer">En vous inscrivant, vous acceptez de recevoir nos communications. Désabonnement à tout moment.</p>
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
