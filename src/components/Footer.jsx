import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, PlusCircle } from 'lucide-react';
import './Footer.css';
import { COMPANY_INFO } from '../config/companyInfo';

const Footer = () => {
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
              <span className="footer-market-chip">🌍 International</span>
            </div>
          </div>

          <div className="footer-block">
            <h4 className="footer-col-title">Marketplace</h4>
            <ul className="footer-links-list">
              <li><Link to="/boutique">Explorer les produits</Link></li>
              <li><Link to="/publier">Publier une offre</Link></li>
              <li><Link to="/vendeur/devenir">Devenir vendeur</Link></li>
              <li><Link to="/espace-vendeur">Espace vendeur</Link></li>
              <li><Link to="/producteurs">Fournisseurs & producteurs</Link></li>
              <li><Link to="/blog">Blog & actualités</Link></li>
              <li><Link to="/about">À propos</Link></li>
            </ul>
          </div>

          <div className="footer-block">
            <h4 className="footer-col-title">Catégories produits</h4>
            <ul className="footer-links-list">
              <li><Link to="/categories/vanille-bourbon">Vanille de Madagascar</Link></li>
              <li><Link to="/categories/cacao-feves-bio">Cacao & Fèves</Link></li>
              <li><Link to="/categories/cafe-specialite">Café de Spécialité</Link></li>
              <li><Link to="/categories/epices-poivres-rares">Épices & Poivres</Link></li>
              <li><Link to="/categories/produits-artisanaux">Produits artisanaux</Link></li>
              <li><Link to="/categories/matieres-premieres">Matières premières</Link></li>
            </ul>
          </div>

          <div className="footer-block">
            <h4 className="footer-col-title">Aide & Ressources</h4>
            <ul className="footer-links-list">
              <li><Link to="/faq">Aide & FAQ</Link></li>
              <li><Link to="/contact">Nous contacter</Link></li>
              <li><Link to="/legal">Mentions légales</Link></li>
              <li><Link to="/privacy">Confidentialité</Link></li>
              <li><Link to="/cgv">CGV</Link></li>
            </ul>
            <Link to="/publier" className="footer-publish-link">
              <PlusCircle size={14} /> Publier une offre
            </Link>
            <p className="footer-currency-note">
              Devises : MGA · MUR · EUR — montants indicatifs selon le taux de conversion en vigueur.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-flex">
          <p className="copyright">&copy; {new Date().getFullYear()} {COMPANY_INFO.legalName || COMPANY_INFO.brandName}. Tous droits réservés.</p>
          <div className="footer-legal-links">
            <Link to="/legal">Mentions légales</Link>
            <Link to="/privacy">Confidentialité</Link>
            <Link to="/cgv">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
