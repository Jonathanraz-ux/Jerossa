import React, { useState } from 'react';
import './Home.css';
import { Shield, Award, Leaf, ArrowRight, Star, MapPin, Clock, Users, Globe, Heart, ShoppingBag, Check, Zap, ChevronDown, Package, Truck, BadgeCheck, Quote, Mail, Sprout, TrendingUp, Handshake } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { productsData } from '../data/products';

const FAQ_ITEMS = [
  { q: "Comment fonctionne la plateforme Jerossa ?", a: "Jerossa met en relation directe les producteurs de Madagascar et de Maurice avec des acheteurs du monde entier. Vous parcourez le catalogue, sélectionnez vos produits, passez commande et le producteur expédie directement." },
  { q: "Quels sont les délais de livraison ?", a: "Les délais varient selon les produits et les destinations. Comptez généralement 5 à 10 jours ouvrés pour les livraisons internationales depuis Madagascar." },
  { q: "Est-ce que les produits sont certifiés ?", a: "Oui, nous travaillons exclusivement avec des producteurs certifiés. Nos produits bénéficient de certifications bio, commerce équitable et traçabilité complète." },
  { q: "Puis-je commander des échantillons ?", a: "Absolument. Contactez le producteur directement via la plateforme pour demander des échantillons avant de passer une commande en gros." },
  { q: "Quels moyens de paiement acceptez-vous ?", a: "Nous acceptons les cartes bancaires, les virements internationaux et les paiements via mobile money (Orange Money, M-Pesa)." },
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openFaq, setOpenFaq] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const openQuickView = (productId) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('product', productId);
    setSearchParams(newParams);
  };

  return (
    <div className="home-page">
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-bg-overlay"></div>
        <div className="hero-deco-circle hero-deco-1"></div>
        <div className="hero-deco-circle hero-deco-2"></div>
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sprout size={14} strokeWidth={1.5} />
              <span>100% ORIGINE MADAGASCAR & ILE MAURICE</span>
            </div>
            <h1 className="hero-title">
              Matières premières<br />
              <span className="hero-title-accent">d'exception</span>
            </h1>
            <p className="hero-description">
              La plateforme B2B qui connecte producteurs et acheteurs du monde entier. 
              Vanille, cacao, épices, huiles essentielles — une traçabilité totale, 
              une qualité premium.
            </p>
            <div className="hero-actions">
              <Link to="/boutique" className="btn-primary-luxury">
                Explorer le catalogue
                <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="btn-outline-luxury">
                Notre histoire
              </Link>
            </div>

            <div className="hero-trust-row">
              <div className="hero-trust-item">
                <Shield size={14} strokeWidth={1.5} />
                <span>Paiement sécurisé</span>
              </div>
              <div className="hero-trust-item">
                <BadgeCheck size={14} strokeWidth={1.5} />
                <span>Producteurs vérifiés</span>
              </div>
              <div className="hero-trust-item">
                <Truck size={14} strokeWidth={1.5} />
                <span>Livraison internationale</span>
              </div>
              <div className="hero-trust-item">
                <Heart size={14} strokeWidth={1.5} />
                <span>Commerce équitable</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-card">
              <img src="https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80" alt="Vanille de Madagascar" loading="eager" />
            </div>
            <div className="hero-image-card hero-image-card-2">
              <img src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop&q=80" alt="Café de Madagascar" loading="eager" />
            </div>
            <div className="hero-floating-card hero-floating-1">
              <div className="floating-card-inner">
                <Check size={16} strokeWidth={2} />
                <div>
                  <strong>Qualité certifiée</strong>
                  <span>Contrôle rigoureux</span>
                </div>
              </div>
            </div>
            <div className="hero-floating-card hero-floating-2">
              <div className="floating-card-inner">
                <Users size={16} strokeWidth={2} />
                <div>
                  <strong>200+ producteurs</strong>
                  <span>Partenaires vérifiés</span>
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

      {/* ===== TRUST BADGES STRIP ===== */}
      <section className="trust-strip">
        <div className="container">
          <div className="trust-strip-grid">
            <div className="trust-strip-item">
              <div className="trust-strip-icon">
                <Leaf size={18} strokeWidth={1.5} />
              </div>
              <div>
                <h4>100% Origine Madagascar</h4>
                <p>Produits bruts & naturels, traçabilité totale</p>
              </div>
            </div>
            <div className="trust-strip-item">
              <div className="trust-strip-icon">
                <Users size={18} strokeWidth={1.5} />
              </div>
              <div>
                <h4>Vente directe producteur</h4>
                <p>Circuits courts, prix justes</p>
              </div>
            </div>
            <div className="trust-strip-item">
              <div className="trust-strip-icon">
                <Award size={18} strokeWidth={1.5} />
              </div>
              <div>
                <h4>Qualité & certifications</h4>
                <p>Bio, équitable, contrôle export</p>
              </div>
            </div>
            <div className="trust-strip-item">
              <div className="trust-strip-icon">
                <Shield size={18} strokeWidth={1.5} />
              </div>
              <div>
                <h4>Transactions sécurisées</h4>
                <p>Protection acheteur & vendeur</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">200+</div>
              <div className="stat-label">Producteurs partenaires</div>
              <div className="stat-trend"><TrendingUp size={12} /> +12% cette année</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">15</div>
              <div className="stat-label">Années d'expertise</div>
              <div className="stat-trend">Depuis 2011</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Pays desservis</div>
              <div className="stat-trend">Europe, Asie, Amériques</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction client</div>
              <div className="stat-trend"><Heart size={12} /> Clients fidèles</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-surtitre">Notre gamme</span>
            <h2 className="section-title">Grandes catégories</h2>
            <p className="section-desc">Les trésors agricoles et aromatiques de Madagascar, sélectionnés avec soin</p>
          </div>

          <div className="categories-grid">
            {[
              { title: 'Vanille Bourbon', count: '48 offres', type: 'vanilla', img: 'https://images.unsplash.com/photo-1610487512810-b614ad747572?w=600&auto=format&fit=crop&q=80' },
              { title: 'Cacao & Fèves Bio', count: '32 offres', type: 'cacao', img: 'https://images.unsplash.com/photo-1610450949065-1f2841536c88?w=600&auto=format&fit=crop&q=80' },
              { title: 'Huiles Essentielles', count: '65 offres', type: 'oil', img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80' },
              { title: 'Épices & Poivres Rares', count: '54 offres', type: 'spices', img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80' },
              { title: 'Café de Spécialité', count: '21 offres', type: 'coffee', img: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&auto=format&fit=crop&q=80' },
            ].map((cat, i) => (
              <Link to="/boutique" key={i} className="category-card">
                <div className="category-image-wrapper">
                  <div className="category-image">
                    <img src={cat.img} alt={cat.title} loading="lazy" />
                  </div>
                </div>
                <h3 className="category-title">{cat.title}</h3>
                <span className="category-count">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="values-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-surtitre">Pourquoi Jerossa</span>
            <h2 className="section-title">Ce qui nous distingue</h2>
            <p className="section-desc">Trois piliers qui font notre différence dans l'industrie</p>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-card-icon">
                <Sprout size={24} strokeWidth={1.5} />
              </div>
              <h3>Qualité Premium</h3>
              <p>Nous sélectionnons uniquement les meilleures matières premières, vérifiées et certifiées par nos experts sur place.</p>
            </div>
            <div className="value-card">
              <div className="value-card-icon">
                <Handshake size={24} strokeWidth={1.5} />
              </div>
              <h3>Commerce Équitable</h3>
              <p>Une rémunération juste pour nos producteurs, des prix transparents, et des conditions claires pour tous.</p>
            </div>
            <div className="value-card">
              <div className="value-card-icon">
                <TrendingUp size={24} strokeWidth={1.5} />
              </div>
              <h3>Excellence & Traçabilité</h3>
              <p>De la plantation à votre entrepôt, chaque lot est tracé, contrôlé et certifié pour une qualité constante.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="products-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-surtitre">Catalogue</span>
              <h2 className="section-title">Offres récentes des producteurs</h2>
              <p className="section-desc">Disponibles en gros et demi-gros, directement de Madagascar</p>
            </div>
            <Link to="/boutique" className="section-link">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>

          <div className="products-grid">
            {productsData.slice(0, 8).map((prod, i) => (
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
                  <span className="product-card-origin">{prod.seller}</span>
                  <h3 className="product-card-title">{prod.title}</h3>
                  <div className="product-card-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={13} fill={j < Math.floor(prod.rating) ? "#d4a373" : "rgba(212,163,115,0.25)"} color="#d4a373" />
                      ))}
                    </div>
                    <span className="product-card-reviews">({prod.reviews})</span>
                  </div>
                  <div className="product-card-footer">
                    <span className="product-card-price">{prod.price}</span>
                    <button className="product-card-add" aria-label="Ajouter au panier" onClick={(e) => { e.stopPropagation(); }}>
                      <ShoppingBag size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUCERS ===== */}
      <section className="producers-section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-surtitre">Nos producteurs</span>
            <h2 className="section-title">Producteurs partenaires</h2>
            <p className="section-desc">Des agriculteurs et artisans passionnés, sélectionnés pour leur excellence</p>
          </div>

          <div className="producers-grid">
            {[
              { name: 'Coopérative SAVA Vanilla', region: 'Région SAVA', specialty: 'Vanille Bourbon Grade A', img: 'https://images.unsplash.com/photo-1610487512810-b614ad747572?w=400&auto=format&fit=crop&q=80' },
              { name: 'Plantation Ambanja', region: 'Sambirano', specialty: 'Cacao Criollo Bio', img: 'https://images.unsplash.com/photo-1610450949065-1f2841536c88?w=400&auto=format&fit=crop&q=80' },
              { name: 'Distillerie Vatovavy', region: 'Vatovavy', specialty: 'Huiles essentielles pures', img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80' },
            ].map((producer, i) => (
              <div key={i} className="producer-card">
                <div className="producer-card-image">
                  <img src={producer.img} alt={producer.name} loading="lazy" />
                  <div className="producer-card-overlay">
                    <Link to="/producteurs" className="producer-card-link">Voir la boutique <ArrowRight size={12} /></Link>
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
            <h2 className="section-title">Ce que disent nos clients</h2>
            <p className="section-desc">Des professionnels du monde entier nous font confiance</p>
          </div>

          <div className="testimonials-grid">
            {[
              { name: 'Marie Laurent', role: 'Chocolatier, Paris', text: 'La qualité de la vanille Bourbon Jerossa est exceptionnelle. Nos clients remarquent la différence immédiatement. Le rapport qualité-prix est imbattable.', rating: 5 },
              { name: 'Thomas Renard', role: 'Chef pâtissier, Lyon', text: 'Je travaille avec Jerossa depuis plus de 3 ans. Livraison rapide, produits toujours frais, service client réactif et professionnel.', rating: 5 },
              { name: 'Sophie Moreau', role: 'Responsable qualité, Marseille', text: 'Les certifications bio et les circuits courts correspondent parfaitement à nos valeurs d\'entreprise. Un partenaire de confiance.', rating: 4 },
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
            <p className="section-desc">Tout ce que vous devez savoir avant de commander</p>
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
              <p>Recevez les nouvelles offres, les arrivages et les actualités du marché directement dans votre boîte mail.</p>
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
