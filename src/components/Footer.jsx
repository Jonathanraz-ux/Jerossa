import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, PlusCircle } from 'lucide-react';
import './Footer.css';
import { COMPANY_INFO } from '../config/companyInfo';
import { useLang } from '../context/LangContext';

const Footer = () => {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-block footer-block--brand">
            <div className="footer-logo-mark">
              <img
                src="/logo-jerossa.jpeg"
                alt="Jerossa — Madagascar · Maurice"
                className="footer-brand-logo"
              />
            </div>
            <p className="footer-desc">
              {COMPANY_INFO.description}
            </p>
            {(COMPANY_INFO.addressDisplay || COMPANY_INFO.contactEmail || COMPANY_INFO.phoneDisplay) && (
              <div className="footer-contact">
                {COMPANY_INFO.addressDisplay && (
                  <div className="footer-contact-item">
                    <MapPin size={14} />
                    <span>{COMPANY_INFO.addressDisplay}</span>
                  </div>
                )}
                {COMPANY_INFO.contactEmail && (
                  <div className="footer-contact-item">
                    <Mail size={14} />
                    <span>{COMPANY_INFO.contactEmail}</span>
                  </div>
                )}
                {COMPANY_INFO.phoneDisplay && (
                  <div className="footer-contact-item">
                    <Phone size={14} />
                    <span>{COMPANY_INFO.phoneDisplay}</span>
                  </div>
                )}
              </div>
            )}
            <div className="footer-market-row">
              <span className="footer-market-chip">🇲🇬 Madagascar</span>
              <span className="footer-market-chip">🇲🇺 Maurice</span>
              <span className="footer-market-chip">🌍 {t('footer.marketChipIn')}</span>
            </div>
          </div>

          <div className="footer-block">
            <h4 className="footer-col-title">{t('footer.marketplaceTitle')}</h4>
            <ul className="footer-links-list">
              <li><Link to="/boutique">{t('footer.exploreProducts')}</Link></li>
              <li><Link to="/publier">{t('footer.publishOffer')}</Link></li>
              <li><Link to="/vendeur/devenir">{t('footer.becomeSeller')}</Link></li>
              <li><Link to="/espace-vendeur">{t('footer.sellerSpace')}</Link></li>
              <li><Link to="/producteurs">{t('footer.sellersProducers')}</Link></li>
              <li><Link to="/blog">{t('footer.blogNews')}</Link></li>
              <li><Link to="/about">{t('footer.about')}</Link></li>
            </ul>
          </div>

          <div className="footer-block">
            <h4 className="footer-col-title">{t('footer.categoriesTitle')}</h4>
            <ul className="footer-links-list">
              <li><Link to="/categories/vanille-bourbon">{t('nav.catVanilla')}</Link></li>
              <li><Link to="/categories/cacao-feves-bio">{t('nav.catCacao')}</Link></li>
              <li><Link to="/categories/cafe-specialite">{t('nav.catCoffee')}</Link></li>
              <li><Link to="/categories/epices-poivres-rares">{t('nav.catSpices')}</Link></li>
              <li><Link to="/categories/produits-artisanaux">{t('nav.catArtisanal')}</Link></li>
              <li><Link to="/categories/matieres-premieres">{t('nav.catRaw')}</Link></li>
            </ul>
          </div>

          <div className="footer-block">
            <h4 className="footer-col-title">{t('footer.helpTitle')}</h4>
            <ul className="footer-links-list">
              <li><Link to="/faq">{t('footer.faq')}</Link></li>
              <li><Link to="/contact">{t('footer.contactUs')}</Link></li>
              <li><Link to="/legal">{t('footer.legal')}</Link></li>
              <li><Link to="/privacy">{t('footer.privacy')}</Link></li>
              <li><Link to="/cgv">{t('footer.cgv')}</Link></li>
            </ul>
            <Link to="/publier" className="footer-publish-link">
              <PlusCircle size={14} /> {t('footer.publishOffer')}
            </Link>
            <p className="footer-currency-note">
              {t('footer.currencyNote')}
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-flex">
          <p className="copyright">&copy; {new Date().getFullYear()} {COMPANY_INFO.legalName || COMPANY_INFO.brandName}. {t('footer.rights')}</p>
          <div className="footer-legal-links">
            <Link to="/legal">{t('footer.legal')}</Link>
            <Link to="/privacy">{t('footer.privacy')}</Link>
            <Link to="/cgv">{t('footer.cgv')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
