import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProducerByIdentifier, fetchProductsByProducer } from '../services/catalog';
import {
  Star, MapPin, Award, ArrowLeft, ArrowRight, MessageSquare, FileText,
  Store, Info, ShieldCheck, Truck, Package,
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import SmartImg from '../components/common/SmartImg';
import EmptyState from '../components/common/EmptyState';
import ContactSellerModal from '../components/ContactSellerModal';
import SellerReviews from '../components/SellerReviews';
import { fetchSellerStats } from '../services/reviews';
import { formatUnitPriceFromEUR } from '../lib/currency.js';
import './animations.css';

const TABS = {
  products: 'products',
  about: 'about',
  reviews: 'reviews',
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

const getAvailabilityLabel = (availability, t) => {
  const key = `shop.product.${(availability || '').toLowerCase().replace(/\s+/g, '_')}`;
  const translated = t(key);
  if (translated !== key) return translated;
  if (!availability) return t('shop.product.available');
  return availability;
};

const ProducerShop = () => {
  const { id } = useParams();
  const { t } = useLang();
  const [producer, setProducer] = useState(null);
  const [producerProducts, setProducerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.products);
  const [contactModal, setContactModal] = useState(null); // null | { mode: 'contact' | 'quote', product? }
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      fetchProducerByIdentifier(id),
      fetchProductsByProducer(id),
    ]).then(([pro, prods]) => {
      if (!active) return;
      setProducer(pro);
      setProducerProducts(prods);
      setNotFound(!pro);
      setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  // Fetch real stats
  useEffect(() => {
    if (!producer?.rawId) return;
    fetchSellerStats(producer.rawId).then((s) => {
      if (s) setStats(s);
    });
  }, [producer?.rawId]);

  if (loading) {
    return (
      <div className="container page-container" style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
          {t('lang') === 'en' ? 'Loading…' : 'Chargement…'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {t('lang') === 'en' ? 'Fetching seller information.' : 'Récupération du producteur.'}
        </p>
      </div>
    );
  }

  if (notFound || !producer) {
    return (
      <div className="container page-container" style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
          {t('lang') === 'en' ? 'Seller not found' : 'Producteur introuvable'}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          {t('lang') === 'en' ? 'The seller you are looking for does not exist.' : 'Le producteur que vous recherchez n\'existe pas.'}
        </p>
        <Link to="/producteurs" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px' }}>
          {t('lang') === 'en' ? 'Back to suppliers' : 'Retour aux producteurs'}
        </Link>
      </div>
    );
  }

  const displayRating = stats?.avg_rating || (stats?.reviews_count > 0 ? producer.rating : null);
  const displayReviewCount = stats?.reviews_count ?? producer.reviews ?? 0;
  const displayOrders = stats?.completed_orders ?? 0;
  const displayResponseRate = stats?.response_rate || producer.responseRate || null;
  const hasReviews = displayReviewCount > 0;

  return (
    <div className="producer-shop-page">
      {/* Hero */}
      <section className="page-hero" style={{ height: '320px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><Link to="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('shop.breadcrumb.home')}</Link></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li><Link to="/producteurs" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('shop.breadcrumb.sellers')}</Link></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{producer.name}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('shop.breadcrumb.sellers')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{producer.name}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{producer.location}</p>
        </div>
      </section>

      <div className="container page-container">
        <Link to="/producteurs" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px', marginBottom: '32px', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> {t('lang') === 'en' ? 'Back to suppliers' : 'Retour aux producteurs'}
        </Link>

        {/* Profile + Actions */}
        <div className="scroll-animate ps-profile-card">
          <div className="producer-profile-grid">
            {/* Logo / Image */}
            <div className="ps-logo-wrap">
              {producer.logoUrl ? (
                <img
                  src={producer.logoUrl}
                  alt={producer.name}
                  style={{
                    width: '100%', height: '100%', objectFit: 'contain',
                    padding: '12px', background: '#fafafa',
                  }}
                />
              ) : producer.image ? (
                <SmartImg src={producer.image} alt={producer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="ps-initials-fallback">
                  {getInitials(producer.name)}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <h1 style={{
                  fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: 600, margin: 0, color: 'var(--text-dark)',
                }}>
                  {producer.name}
                </h1>
                {producer.isVerified && (
                  <span className="j-badge j-badge--verified" style={{ fontSize: '0.7rem' }}>
                    <ShieldCheck size={12} /> {t('shop.verified')}
                  </span>
                )}
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px', flexWrap: 'wrap',
              }}>
                {producer.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> {producer.location}
                  </span>
                )}
                {producer.established && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={14} /> {t('shop.since')} {producer.established}
                  </span>
                )}
              </div>

              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '700px', fontSize: '15px', marginBottom: '12px' }}>
                {producer.description}
              </p>

              {producer.certifications?.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {producer.certifications.map((cert, i) => (
                    <span key={i} style={{
                      background: 'var(--primary-light)', color: 'var(--primary)',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                    }}>
                      {cert}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                {producer.sellerAvailable ? (
                  <button
                    className="j-pill-btn j-pill-btn--primary"
                    onClick={() => setContactModal({ mode: 'contact' })}
                  >
                    <MessageSquare size={15} /> {t('shop.contact')}
                  </button>
                ) : (
                  <button
                    className="j-pill-btn j-pill-btn--primary"
                    disabled
                    title="Ce vendeur n'est pas encore disponible sur la messagerie."
                  >
                    <MessageSquare size={15} /> {t('shop.contact_unavailable') || 'Vendeur indisponible'}
                  </button>
                )}
                <button
                  className="j-pill-btn j-pill-btn--outline-dark"
                  onClick={() => setContactModal({ mode: 'quote' })}
                >
                  <FileText size={15} /> {t('shop.quote')}
                </button>
              </div>
              {!producer.sellerAvailable && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Ce vendeur n'est pas encore disponible sur la messagerie.
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="producer-stats-grid" style={{ padding: '20px 32px', background: 'var(--bg-cream)', borderTop: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>
                {hasReviews ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={16} fill="#fbbf24" color="#fbbf24" /> {displayRating}/5
                  </span>
                ) : (
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {t('shop.stats.new_seller')}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {hasReviews ? `${displayReviewCount} avis` : t('shop.stats.no_reviews')}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>
                {displayOrders > 0 ? displayOrders : '—'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('shop.stats.orders')}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>
                {displayResponseRate || (
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {t('shop.stats.na')}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('shop.stats.response_rate')}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="ps-tabs" style={{ marginTop: '2rem' }}>
          <button
            className={`ps-tab ${activeTab === TABS.products ? 'ps-tab--active' : ''}`}
            onClick={() => setActiveTab(TABS.products)}
          >
            <Store size={15} /> {t('shop.tabs.products')} ({producerProducts.length})
          </button>
          <button
            className={`ps-tab ${activeTab === TABS.about ? 'ps-tab--active' : ''}`}
            onClick={() => setActiveTab(TABS.about)}
          >
            <Info size={15} /> {t('shop.tabs.about')}
          </button>
          <button
            className={`ps-tab ${activeTab === TABS.reviews ? 'ps-tab--active' : ''}`}
            onClick={() => setActiveTab(TABS.reviews)}
          >
            <Star size={15} /> {t('shop.tabs.reviews')} ({displayReviewCount})
          </button>
        </div>

        {/* Tab Content */}
        <div className="ps-tab-content">
          {/* Products Tab */}
          {activeTab === TABS.products && (
            <>
              {producerProducts.length === 0 ? (
                <div className="scroll-animate" style={{
                  background: '#fff', borderRadius: '14px',
                  border: '1px solid var(--border)', padding: '3rem 2rem', textAlign: 'center',
                }}>
                  <EmptyState
                    icon={Store}
                    title={t('shop.empty.title')}
                    text={t('shop.empty.text')}
                    action={
                      <button
                        className="j-pill-btn j-pill-btn--primary"
                        onClick={() => setContactModal({ mode: 'contact' })}
                        disabled={!producer.sellerAvailable}
                        title={producer.sellerAvailable ? undefined : "Ce vendeur n'est pas encore disponible sur la messagerie."}
                      >
                        <MessageSquare size={15} /> {t('shop.empty.cta')}
                      </button>
                    }
                  />
                </div>
              ) : (
                <div className="product-grid" style={{ marginTop: '0.5rem' }}>
                  {producerProducts.map((prod, i) => (
                    <div
                      key={prod.id || i}
                      className="scroll-animate ps-product-card"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <Link to={`/product/${prod.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div className="img-zoom" style={{
                          position: 'relative', aspectRatio: '1', background: '#fafafa',
                          overflow: 'hidden', borderRadius: '12px 12px 0 0',
                        }}>
                          <SmartImg src={prod.images[0]} alt={prod.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {prod.tag && (
                            <span style={{
                              position: 'absolute', top: '10px', left: '10px',
                              background: 'rgba(30, 61, 47, 0.9)', color: '#fff',
                              padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600,
                            }}>
                              {prod.tag}
                            </span>
                          )}
                          {prod.availability && (
                            <span style={{
                              position: 'absolute', top: '10px', right: '10px',
                              background: prod.availability === 'Disponible' || prod.availability === 'Available'
                                ? 'rgba(43, 122, 75, 0.9)' : 'rgba(184, 134, 11, 0.9)',
                              color: '#fff', padding: '3px 8px', borderRadius: '20px',
                              fontSize: '0.65rem', fontWeight: 600,
                            }}>
                              {getAvailabilityLabel(prod.availability, t)}
                            </span>
                          )}
                        </div>
                        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          {prod.type && (
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>
                              {prod.type}
                            </div>
                          )}
                          <h3 style={{
                            fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600,
                            margin: '0 0 6px', color: 'var(--text-dark)', lineHeight: 1.4,
                          }}>
                            {prod.title}
                          </h3>

                          {/* Meta info */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            {prod.origin && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <MapPin size={10} /> {prod.origin}
                              </span>
                            )}
                            {prod.stock && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Package size={10} /> {prod.stock}
                              </span>
                            )}
                            {prod.delivery && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Truck size={10} /> {prod.delivery}
                              </span>
                            )}
                          </div>

                          {/* Price + Rating */}
                          <div style={{ marginTop: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#777', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {[...Array(5)].map((_, j) => (
                                  <Star key={j} size={12} fill={j < Math.floor(prod.rating) ? '#fbbf24' : 'rgba(251,191,36,0.25)'} color="#fbbf24" />
                                ))}
                              </div>
                              <span>({prod.reviews})</span>
                            </div>
                            <div style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              paddingTop: '10px', borderTop: '1px solid var(--border)',
                            }}>
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                                {formatUnitPriceFromEUR(prod.priceEUR, prod.unit, 'EUR')}
                              </span>
                              <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                {t('shop.product.view')} <ArrowRight size={12} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Quote button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setContactModal({ mode: 'quote', product: prod });
                        }}
                        className="ps-card-quote-btn"
                      >
                        <FileText size={13} /> {t('shop.product.quote')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* About Tab */}
          {activeTab === TABS.about && (
            <div className="scroll-animate" style={{
              background: '#fff', borderRadius: '14px',
              border: '1px solid var(--border)', padding: '2rem',
            }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1rem' }}>
                {t('shop.tabs.about')}
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                {producer.description}
              </p>
              {producer.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  <MapPin size={15} color="var(--primary)" /> <strong>Localisation :</strong> {producer.location}
                </div>
              )}
              {producer.established && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  <Award size={15} color="var(--primary)" /> <strong>Créée en</strong> {producer.established}
                </div>
              )}
              {producer.contactEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  <MessageSquare size={15} color="var(--primary)" /> <strong>Email :</strong> {producer.contactEmail}
                </div>
              )}
              {producer.certifications?.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Certifications</strong>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {producer.certifications.map((cert, i) => (
                      <span key={i} style={{
                        background: 'var(--primary-light)', color: 'var(--primary)',
                        padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                      }}>
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === TABS.reviews && (
            <div className="scroll-animate" style={{
              background: '#fff', borderRadius: '14px',
              border: '1px solid var(--border)', padding: '2rem',
            }}>
              <SellerReviews sellerId={producer.rawId} sellerName={producer.name} />
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      {contactModal && (
        <ContactSellerModal
          seller={producer}
          product={contactModal.product || null}
          mode={contactModal.mode}
          onClose={() => setContactModal(null)}
        />
      )}

      <style>{`
        .ps-profile-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 0;
        }
        .ps-logo-wrap {
          aspect-ratio: 1;
          overflow: hidden;
          background: #fafafa;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ps-initials-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary-light);
          color: var(--primary);
          font-family: var(--font-serif);
          font-size: 3rem;
          font-weight: 700;
        }
        .ps-tabs {
          display: flex;
          gap: 0.25rem;
          border-bottom: 1px solid var(--border);
          background: #fff;
          border-radius: 14px 14px 0 0;
          border: 1px solid var(--border);
          border-bottom: none;
          overflow-x: auto;
        }
        .ps-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          white-space: nowrap;
          padding: 0.9rem 1.25rem;
          font-size: 0.86rem;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          background: none;
          border-top: none;
          border-left: none;
          border-right: none;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
          font-family: inherit;
        }
        .ps-tab:hover { color: var(--text-dark); }
        .ps-tab--active {
          color: var(--text-dark);
          border-bottom-color: var(--accent);
        }
        .ps-tab-content {
          background: #fff;
          border: 1px solid var(--border);
          border-top: none;
          border-radius: 0 0 14px 14px;
          padding: 1.5rem;
          min-height: 200px;
        }
        .ps-product-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .ps-product-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--accent);
        }
        .ps-card-quote-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: calc(100% - 2rem);
          margin: 0 1rem 1rem;
          padding: 0.55rem 0;
          border: 1px dashed var(--primary);
          background: var(--primary-light);
          color: var(--primary);
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ps-card-quote-btn:hover {
          background: var(--primary);
          color: #fff;
          border-style: solid;
        }

        @media (max-width: 768px) {
          .producer-profile-grid { grid-template-columns: 1fr; }
          .ps-logo-wrap { aspect-ratio: 16/9; max-height: 200px; }
          .producer-stats-grid { padding: 16px !important; }
          .ps-tabs { border-radius: 14px 14px 0 0; }
          .ps-tab-content { border-radius: 0 0 14px 14px; padding: 1rem; }
        }
        @media (max-width: 600px) {
          .producer-stats-grid { grid-template-columns: 1fr; gap: 12px; }
        }
      `}</style>
    </div>
  );
};

export default ProducerShop;
