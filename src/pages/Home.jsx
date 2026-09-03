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
  { q: "Comment fonctionne la plateforme Jerossa ?", a: "Jerossa met en relation les producteurs et fournisseurs de Madagascar et de Maurice avec des acheteurs et des entreprises. Vous parcourez le catalogue de produits, comparez les offres et contactez directement le vendeur." },
  { q: "Puis-je publier un produit ?", a: "Oui. Créez votre compte, puis cliquez sur « Publier une offre » pour proposer un produit (vanille, épices, artisanat…). Votre offre devient visible auprès des acheteurs des deux territoires." },
  { q: "Dans quelle devise les prix sont-ils affichés ?", a: "Vous pouvez afficher les prix en Ariary (MGA), en Roupie mauricienne (MUR) ou en Euro (EUR) grâce au sélecteur de devise. Les montants sont indicatifs selon le taux de conversion en vigueur." },
  { q: "Comment les produits sont-ils vérifiés ?", a: "Des badges de confiance comme « Fournisseur vérifié » ou « Produit contrôlé » signalent les offres contrôlées. Le système de vérification des profils et d'avis accompagnera progressivement le développement de la plateforme." },
  { q: "Quels moyens de paiement acceptez-vous ?", a: "La plateforme prépare l'intégration de paiements sécurisés (cartes, virement, mobile money). Dans un premier temps, les échanges se font en toute transparence entre les parties, avec messagerie et assistance Jerossa." },
];

const TRUST_ITEMS = [
  { icon: BadgeCheck, title: 'Profils vérifiés', text: 'Identité et informations professionnelles contrôlées pour renforcer la confiance.' },
  { icon: FileText, title: 'Offres détaillées', text: 'Produits décrits avec précision : prix, unité, disponibilité, localisation.' },
  { icon: MessageSquare, title: 'Messagerie sécurisée', text: 'Échangez directement avec les vendeurs, sans partager vos coordonnées.' },
  { icon: Star, title: 'Système d’avis', text: 'Notes et retours d’expérience pour évaluer la fiabilité de chaque profil.' },
  { icon: Flag, title: 'Signalement d’annonces', text: 'Signalez toute offre suspecte : notre équipe traite chaque signalement.' },
  { icon: LifeBuoy, title: 'Assistance Jerossa', text: 'Une équipe disponible pour vous accompagner avant, pendant et après vos échanges.' },
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
              alt="Jerossa — Terroirs & Échanges Madagascar - Maurice"
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

            <div className="hero-trust-row" aria-label="Engagements de confiance">
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
                Que recherchez-vous aujourd'hui ?
              </span>
            </div>
            <div className="search-panel-fields">
              <div className="search-input-wrap">
                <Search size={16} strokeWidth={1.8} />
                <input
                  type="text"
                  placeholder="Vanille de Madagascar, fournisseur de cacao…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="search-select-wrap">
                <Tag size={15} strokeWidth={1.8} />
                <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                  <option value="">Catégorie</option>
                  {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
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
              Jerossa réunit producteurs, fournisseurs et commerçants de Madagascar et de Maurice,
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
              <p>Entreprises et acheteurs à la recherche de matières premières et de produits d'exception.</p>
              <ul className="bridge-list">
                <li><CheckCircle2 size={15} /> Acheteurs & importateurs</li>
                <li><CheckCircle2 size={15} /> Demande solvable & logistique développée</li>
                <li><CheckCircle2 size={15} /> Ouverture vers les marchés régionaux</li>
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
              <span className="section-surtitre">Produits</span>
              <h2 className="section-title">Nos catégories de produits</h2>
              <p className="section-desc">Les trésors agricoles et artisanaux de Madagascar et de Maurice</p>
            </div>
            <Link to="/boutique" className="section-link">
              Tout le catalogue <ArrowRight size={14} />
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
                  <SmartImg src={prod.images[0]} alt={prod.title} />
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
              <TrendingUp size={17} strokeWidth={1.8} /> Je souhaite vendre
            </button>
          </div>

          <div className="how-steps">
            {(howTab === 'acheter'
              ? [
                  { icon: Search, title: 'Recherchez', text: 'Trouvez un produit grâce à la recherche avancée et aux filtres.' },
                  { icon: LayoutGrid, title: 'Comparez', text: 'Comparez les offres et les prix en toute transparence.' },
                  { icon: MessageSquare, title: 'Contactez', text: 'Échangez directement avec un vendeur via la messagerie.' },
                  { icon: Shield, title: 'Réalisez', text: 'Concluez votre transaction en toute confiance, accompagné par l’assistance Jerossa.' },
                ]
              : [
                  { icon: UserPlus, title: 'Créez votre compte', text: 'Inscrivez-vous gratuitement en tant que vendeur.' },
                  { icon: PlusCircle, title: 'Publiez votre offre', text: 'Décrivez votre produit : prix, unité, disponibilité, photos.' },
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
                La confiance est au cœur de Jerossa. Chaque interaction est pensée pour protéger acheteurs et vendeurs.
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
              <span className="section-surtitre">Espace vendeur</span>
              <h2 className="section-title">Gérez votre activité depuis un tableau de bord unique</h2>
              <p className="seller-desc">
                Publiez vos offres, suivez vos commandes, discutez avec vos clients et pilotez vos performances.
                Un espace simple, moderne et professionnel, pensé pour les producteurs et les fournisseurs.
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
                  "Vue d'ensemble", 'Mes produits', 'Ajouter une offre',
                  'Messages', 'Commandes', 'Favoris', 'Statistiques', 'Profil', 'Paramètres',
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
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction client</div>
              <div className="stat-trend"><Heart size={12} /> Commerce équitable</div>
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
            <p className="section-desc">Des entreprises de Madagascar et de Maurice</p>
          </div>

          <div className="testimonials-grid">
            {[
              { name: 'Marie Laurent', role: 'Chocolatier, Port-Louis', text: 'La vanille Bourbon trouvée via Jerossa est exceptionnelle. La mise en relation avec la coopérative SAVA a été simple et rapide.', rating: 5 },
              { name: 'Rakoto Andry', role: 'Producteur, SAVA', text: 'Jerossa me permet de toucher des acheteurs à Maurice sans intermédiaire. Je publie mes offres et je reçois des demandes sérieuses.', rating: 5 },
              { name: 'Thomas Renard', role: 'Importateur, Curepipe', text: 'Le cacao et les épices trouvés via Jerossa dépassent nos attentes en qualité. Les échanges avec les fournisseurs sont clairs et rassurants.', rating: 4 },
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
              <p>Recevez les nouvelles offres et les actualités des marchés de Madagascar et Maurice.</p>
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
