import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, PlusCircle } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-block footer-block--brand">
            <div className="footer-logo-mark">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginBottom: '0.5rem' }}>
                <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="#3a6b4f" opacity="0.25"/>
                <path d="M16 6c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6z" fill="none" stroke="#d4a373" strokeWidth="1.5"/>
                <path d="M12 16c0 0 1.5-3 4-3s4 3 4 3" stroke="#d4a373" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M14 16l-1 2M18 16l1 2" stroke="#d4a373" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M16 13v-2M16 19v2" stroke="#d4a373" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span className="footer-logo-title">Jerossa</span>
              <span className="footer-logo-sub">Madagascar · Maurice</span>
            </div>
            <p className="footer-desc">
              La marketplace de référence entre Madagascar et Maurice : produits authentiques,
              matières premières et fournisseurs.
              Créer des opportunités. Développer les échanges.
            </p>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <MapPin size={14} />
                <span>Antananarivo, Madagascar · Port-Louis, Maurice</span>
              </div>
              <div className="footer-contact-item">
                <Mail size={14} />
                <span>contact@jerossa.com</span>
              </div>
              <div className="footer-contact-item">
                <Phone size={14} />
                <span>+261 20 123 4567 · +230 5 234 5678</span>
              </div>
            </div>
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
          <p className="copyright">&copy; {new Date().getFullYear()} Jerossa Trading Ltd. Tous droits réservés.</p>
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
