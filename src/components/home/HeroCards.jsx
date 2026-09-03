import React from 'react';
import { Truck, ShieldCheck, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LangContext';

const HeroCards = () => {
  const { t } = useLang();

  return (
    <div className="hero-cards-stack">
      {/* Card 1: Livraison & Export */}
      <div className="hero-editorial-card hero-editorial-card--export">
        <div className="hero-card-img-wrap">
          <img
            src="/hero-export.jpg"
            alt={t('hero.card1.title') || 'Madagascar ↔ Maurice'}
            loading="lazy"
            decoding="async"
            width="600"
            height="450"
          />
          <div className="hero-card-img-gradient"></div>
          <div className="hero-card-floating-badge">
            <span className="hero-badge-pulse"></span>
            <span>{t('hero.card1.status') || 'Liaison directe'}</span>
          </div>
        </div>
        <div className="hero-card-body">
          <div className="hero-card-kicker">
            <Truck size={13} className="hero-card-kicker-icon" />
            <span>{t('hero.card1.tag') || 'LIVRAISON & EXPORT'}</span>
          </div>
          <h3 className="hero-card-title">{t('hero.card1.title') || 'Madagascar ↔ Maurice'}</h3>
          <p className="hero-card-desc">
            {t('hero.card1.desc') || 'Une logistique pensée pour vos échanges régionaux.'}
          </p>
          <div className="hero-card-footer">
            <span className="hero-card-meta">
              <CheckCircle2 size={13} className="hero-check-icon" />
              {t('hero.card1.meta') || 'Fret maritime & aérien sécurisé'}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Traçabilité & Origine */}
      <div className="hero-editorial-card hero-editorial-card--trace">
        <div className="hero-card-img-wrap">
          <img
            src="/hero-traceability.jpg"
            alt={t('hero.card2.title') || 'Traçabilité & Origine'}
            loading="lazy"
            decoding="async"
            width="600"
            height="450"
          />
          <div className="hero-card-img-gradient"></div>
          <div className="hero-card-floating-badge hero-card-floating-badge--gold">
            <ShieldCheck size={13} />
            <span>{t('hero.card2.badge') || '100% Documenté'}</span>
          </div>
        </div>
        <div className="hero-card-body">
          <div className="hero-card-kicker hero-card-kicker--gold">
            <ShieldCheck size={13} className="hero-card-kicker-icon" />
            <span>{t('hero.card2.tag') || 'TRAÇABILITÉ'}</span>
          </div>
          <h3 className="hero-card-title">{t('hero.card2.title') || 'Des informations fournisseur transparentes'}</h3>
          <p className="hero-card-desc">
            {t('hero.card2.desc') || 'Données documentées et contact direct auprès des producteurs.'}
          </p>
          <div className="hero-card-footer">
            <span className="hero-card-meta">
              <CheckCircle2 size={13} className="hero-check-icon" />
              {t('hero.card2.meta') || 'Vanille, épices & matières d\'exception'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCards;
