import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MapPin, Clock, Star, BadgeCheck, Award, Sparkles, ArrowRight, MessageSquare,
  Shield, CheckCircle2, PlusCircle, Calendar
} from 'lucide-react';
import { servicesData, getServiceCategory } from '../data/services';
import { useCurrency, CURRENCY_NOTE } from '../context/CurrencyContext';

const ServiceDetails = () => {
  const { id } = useParams();
  const { convert, currency } = useCurrency();
  const svc = servicesData.find((s) => s.id === id);

  if (!svc) {
    return (
      <div className="container" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <h1>Service introuvable</h1>
        <p style={{ color: 'var(--text-muted)' }}>Ce service n'existe pas ou n'est plus disponible.</p>
        <Link to="/services" className="j-pill-btn j-pill-btn--primary" style={{ marginTop: '1rem' }}>
          Retour aux services
        </Link>
      </div>
    );
  }

  const cat = getServiceCategory(svc.category);
  const badgeTone = svc.badgeTone || 'verified';
  const badgeIcon = badgeTone === 'verified'
    ? <BadgeCheck size={14} />
    : badgeTone === 'recommended'
      ? <Award size={14} />
      : <Sparkles size={14} />;

  const similar = servicesData.filter((s) => s.category === svc.category && s.id !== svc.id).slice(0, 3);

  return (
    <div className="svc-page">
      <div className="svc-hero" style={{ backgroundImage: `url(${svc.image})` }}>
        <div className="svc-hero-overlay"></div>
        <div className="container svc-hero-content">
          <nav className="svc-breadcrumb">
            <Link to="/">Accueil</Link>
            <span>/</span>
            <Link to="/services">Services</Link>
            <span>/</span>
            <span>{svc.subcategory}</span>
          </nav>
          <span className="svc-cat-tag">{cat?.name}</span>
          <h1>{svc.title}</h1>
          <div className="svc-hero-meta">
            <span className={`j-badge j-badge--${badgeTone}`}>{badgeIcon} {svc.badge}</span>
            <span className="svc-hero-loc"><MapPin size={13} /> {svc.location}</span>
            <span className="svc-hero-avail"><Clock size={13} /> {svc.availability}</span>
          </div>
        </div>
      </div>

      <div className="container svc-body">
        <div className="svc-layout">
          <div className="svc-main">
            <section className="svc-block">
              <h2>À propos de ce service</h2>
              <p className="svc-desc">{svc.description}</p>
              <div className="svc-facts">
                <div className="svc-fact">
                  <CheckCircle2 size={16} />
                  <span><strong>Spécialité</strong>{svc.subcategory}</span>
                </div>
                <div className="svc-fact">
                  <MapPin size={16} />
                  <span><strong>Zone d'intervention</strong>{svc.location}</span>
                </div>
                <div className="svc-fact">
                  <Calendar size={16} />
                  <span><strong>Disponibilité</strong>{svc.availability}</span>
                </div>
                <div className="svc-fact">
                  <Clock size={16} />
                  <span><strong>Délai de réponse</strong>{svc.responseTime}</span>
                </div>
              </div>
            </section>

            <section className="svc-block svc-pricing-block">
              <h2>Tarif</h2>
              {svc.quoteOnly ? (
                <div className="svc-quote">
                  <strong>Sur devis</strong>
                  <p>Contactez le professionnel pour obtenir un devis adapté à votre projet.</p>
                </div>
              ) : (
                <div className="svc-price-row">
                  <span className="svc-price">À partir de {convert(svc.priceEUR)}</span>
                  <span className="svc-rate">{svc.rateLabel}</span>
                  <p className="j-currency-note">
                    <Shield size={13} />
                    Devise : {currency} · {CURRENCY_NOTE}
                  </p>
                </div>
              )}
              <div className="svc-trust-row">
                {[
                  { icon: BadgeCheck, text: svc.verified ? 'Profil vérifié' : 'Profil en cours de vérification' },
                  { icon: Shield, text: 'Échanges sécurisés Jerossa' },
                  { icon: MessageSquare, text: 'Messagerie intégrée' },
                ].map((t, i) => (
                  <span key={i} className="svc-trust-item"><t.icon size={14} /> {t.text}</span>
                ))}
              </div>
            </section>
          </div>

          <aside className="svc-side">
            <div className="svc-provider-card">
              <div className="svc-provider-head">
                <span className="svc-provider-avatar">{svc.provider.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
                <div>
                  <strong>{svc.provider}</strong>
                  <span className="j-verified-chip"><BadgeCheck size={13} /> {svc.verified ? 'Professionnel vérifié' : 'Prestataire'}</span>
                </div>
              </div>
              <div className="svc-provider-rating">
                <div className="stars">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} fill={j < Math.floor(svc.rating) ? '#d4a373' : 'rgba(212,163,115,0.25)'} color="#d4a373" />
                  ))}
                </div>
                <span>{svc.rating} · {svc.reviews} avis</span>
              </div>
              <div className="svc-provider-stats">
                <div><strong>{svc.experience} ans</strong><span>d'expérience</span></div>
                <div><strong>{svc.responseTime}</strong><span>délai de réponse</span></div>
                <div><strong>{svc.reviews}</strong><span>avis clients</span></div>
              </div>
              <button className="svc-contact-btn">
                <MessageSquare size={16} /> Contacter le professionnel
              </button>
              <p className="svc-contact-note">
                La messagerie Jerossa vous permet d'échanger sans partager vos coordonnées.
              </p>
            </div>

            <div className="svc-side-note">
              <Shield size={15} />
              Fonctionnalités de confiance prévues pour accompagner le développement de la plateforme :
              avis, vérification renforcée et paiements sécurisés.
            </div>
          </aside>
        </div>

        {/* Similar services */}
        {similar.length > 0 && (
          <section className="svc-similar">
            <div className="section-header-row">
              <div>
                <span className="section-surtitre">Dans la même catégorie</span>
                <h2 className="section-title">Services similaires</h2>
              </div>
              <Link to="/services" className="section-link">Tous les services <ArrowRight size={14} /></Link>
            </div>
            <div className="svc-similar-grid">
              {similar.map((s) => (
                <Link to={`/services/${s.id}`} key={s.id} className="svc-similar-card">
                  <div className="svc-similar-img">
                    <img src={s.image} alt={s.title} loading="lazy" />
                  </div>
                  <div className="svc-similar-body">
                    <span className="svc-similar-sub">{s.subcategory}</span>
                    <h3>{s.title}</h3>
                    <span className="svc-similar-loc"><MapPin size={11} /> {s.location}</span>
                    <span className="svc-similar-price">
                      {s.quoteOnly ? 'Sur devis' : `À partir de ${convert(s.priceEUR)}`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Publish CTA */}
        <div className="svc-publish-cta">
          <div>
            <h3>Vous proposez un service similaire ?</h3>
            <p>Rejoignez la marketplace et faites-vous connaître des clients de Madagascar et de Maurice.</p>
          </div>
          <Link to="/publier?type=service" className="j-pill-btn j-pill-btn--gold">
            <PlusCircle size={16} /> Publier mon service
          </Link>
        </div>
      </div>

      <style>{`
        .svc-page { min-height: 100vh; background: var(--bg-white); }
        .svc-hero {
          position: relative;
          min-height: 360px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .svc-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(20,33,26,0.55), rgba(20,33,26,0.92));
        }
        .svc-hero-content { position: relative; z-index: 2; padding: 3rem 2rem; color: #fff; }
        .svc-breadcrumb { display: flex; gap: 0.5rem; align-items: center; font-size: 0.8rem; color: rgba(255,255,255,0.55); margin-bottom: 1rem; }
        .svc-breadcrumb a { color: rgba(255,255,255,0.65); }
        .svc-breadcrumb a:hover { color: var(--accent); }
        .svc-cat-tag { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--accent); display: block; margin-bottom: 0.4rem; }
        .svc-hero h1 { font-family: var(--font-serif); font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 500; margin-bottom: 0.9rem; max-width: 720px; line-height: 1.25; }
        .svc-hero-meta { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .svc-hero-loc, .svc-hero-avail { display: inline-flex; align-items: center; gap: 5px; font-size: 0.82rem; color: rgba(255,255,255,0.85); }
        .svc-body { padding: 3rem 0 5rem; }
        .svc-layout { display: grid; grid-template-columns: 1fr 360px; gap: 2.5rem; align-items: start; }
        .svc-block { margin-bottom: 2.5rem; }
        .svc-block h2 { font-family: var(--font-serif); font-size: 1.35rem; color: var(--text-dark); margin-bottom: 1rem; }
        .svc-desc { font-size: 0.95rem; color: var(--text-muted); line-height: 1.8; margin-bottom: 1.5rem; }
        .svc-facts { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .svc-fact { display: flex; align-items: center; gap: 0.7rem; background: var(--bg-cream); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.9rem 1rem; }
        .svc-fact svg { color: var(--brand-green); flex-shrink: 0; }
        .svc-fact span { display: flex; flex-direction: column; font-size: 0.72rem; color: var(--text-muted); }
        .svc-fact strong { font-size: 0.8rem; color: var(--text-dark); margin-bottom: 1px; }
        .svc-price-row { background: linear-gradient(135deg, var(--brand-gold-soft), transparent 70%); border: 1px solid rgba(212,163,115,0.4); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.25rem; }
        .svc-price { font-family: var(--font-display); font-size: 1.7rem; font-weight: 700; color: var(--primary); display: block; }
        .svc-rate { font-size: 0.85rem; color: var(--text-muted); }
        .svc-quote { background: var(--bg-cream); border: 1px dashed var(--accent); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.25rem; }
        .svc-quote strong { font-family: var(--font-display); font-size: 1.3rem; color: var(--primary); display: block; margin-bottom: 0.4rem; }
        .svc-quote p { font-size: 0.85rem; color: var(--text-muted); }
        .svc-trust-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .svc-trust-item { display: inline-flex; align-items: center; gap: 5px; font-size: 0.75rem; color: var(--text-muted); background: var(--bg-cream); border-radius: 20px; padding: 6px 12px; }
        .svc-trust-item svg { color: var(--success); }
        .svc-provider-card { background: var(--bg-white); border: 1px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); padding: 1.5rem; margin-bottom: 1.25rem; position: sticky; top: 96px; }
        .svc-provider-head { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
        .svc-provider-avatar { width: 52px; height: 52px; border-radius: 50%; background: var(--brand-green-light); color: var(--brand-green); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 700; flex-shrink: 0; }
        .svc-provider-head div { display: flex; flex-direction: column; }
        .svc-provider-head strong { font-size: 0.95rem; color: var(--text-dark); }
        .svc-provider-rating { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1rem; }
        .svc-provider-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1.25rem; }
        .svc-provider-stats div { background: var(--bg-cream); border-radius: var(--radius-sm); padding: 0.6rem 0.4rem; text-align: center; display: flex; flex-direction: column; }
        .svc-provider-stats strong { font-family: var(--font-display); font-size: 0.9rem; color: var(--text-dark); }
        .svc-provider-stats span { font-size: 0.62rem; color: var(--text-muted); }
        .svc-contact-btn { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem 1rem; background: var(--brand-green); color: #fff; border: none; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.25s; }
        .svc-contact-btn:hover { background: var(--brand-green-dark); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(58,107,79,0.3); }
        .svc-contact-note { font-size: 0.68rem; color: var(--text-muted); text-align: center; margin-top: 0.75rem; line-height: 1.5; }
        .svc-side-note { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.72rem; color: var(--text-muted); background: var(--bg-cream); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.9rem 1rem; line-height: 1.5; }
        .svc-side-note svg { color: var(--accent); flex-shrink: 0; margin-top: 1px; }
        .svc-similar { padding-top: 1rem; border-top: 1px solid var(--border); }
        .svc-similar-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        .svc-similar-card { background: var(--bg-white); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; transition: all 0.3s; display: flex; flex-direction: column; }
        .svc-similar-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--brand-green); }
        .svc-similar-img { height: 130px; overflow: hidden; }
        .svc-similar-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .svc-similar-card:hover .svc-similar-img img { transform: scale(1.06); }
        .svc-similar-body { padding: 1rem; display: flex; flex-direction: column; gap: 3px; }
        .svc-similar-sub { font-size: 0.64rem; font-weight: 700; text-transform: uppercase; color: var(--brand-green); }
        .svc-similar-body h3 { font-family: var(--font-serif); font-size: 0.92rem; color: var(--text-dark); }
        .svc-similar-loc { font-size: 0.72rem; color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px; }
        .svc-similar-price { font-family: var(--font-display); font-size: 0.85rem; font-weight: 700; color: var(--primary); margin-top: 4px; }
        .svc-publish-cta { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; background: linear-gradient(135deg, var(--brand-green-light), transparent 70%); border: 1px solid rgba(58,107,79,0.25); border-radius: var(--radius-xl); padding: 1.75rem 2rem; margin-top: 3rem; flex-wrap: wrap; }
        .svc-publish-cta h3 { font-family: var(--font-serif); font-size: 1.15rem; color: var(--text-dark); margin-bottom: 0.3rem; }
        .svc-publish-cta p { font-size: 0.85rem; color: var(--text-muted); }

        @media (max-width: 1024px) {
          .svc-layout { grid-template-columns: 1fr; }
          .svc-provider-card { position: static; }
        }
        @media (max-width: 768px) {
          .svc-hero { min-height: 300px; }
          .svc-facts { grid-template-columns: 1fr; }
          .svc-similar-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .svc-provider-stats { grid-template-columns: 1fr 1fr 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ServiceDetails;
