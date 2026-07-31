import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-block footer-block--brand">
            <div className="footer-logo-mark">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{marginBottom: '0.5rem'}}>
                <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="#d4a373" opacity="0.15"/>
                <path d="M16 6c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6z" fill="none" stroke="#d4a373" strokeWidth="1.5"/>
                <path d="M12 16c0 0 1.5-3 4-3s4 3 4 3" stroke="#d4a373" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M14 16l-1 2M18 16l1 2" stroke="#d4a373" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M16 13v-2M16 19v2" stroke="#d4a373" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span className="footer-logo-title">Jerossa</span>
              <span className="footer-logo-sub">Madagascar · Maurice</span>
            </div>
            <p className="footer-desc">
              Plateforme B2B connectant les producteurs de Madagascar et de l'Île Maurice aux acheteurs du monde entier. Qualité premium, commerce équitable, traçabilité totale.
            </p>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <MapPin size={14} />
                <span>Antananarivo, Madagascar</span>
              </div>
              <div className="footer-contact-item">
                <Mail size={14} />
                <span>contact@jerossa.com</span>
              </div>
              <div className="footer-contact-item">
                <Phone size={14} />
                <span>+261 20 123 4567</span>
              </div>
            </div>
          </div>

          <div className="footer-block">
            <h4 className="footer-col-title">Liens rapides</h4>
            <ul className="footer-links-list">
              <li><Link to="/boutique">Catalogue</Link></li>
              <li><Link to="/producteurs">Nos producteurs</Link></li>
              <li><Link to="/about">À propos</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-block">
            <h4 className="footer-col-title">Catégories</h4>
            <ul className="footer-links-list">
              <li><Link to="/boutique?type=vanilla">Vanille Bourbon</Link></li>
              <li><Link to="/boutique?type=cacao">Cacao & Fèves Bio</Link></li>
              <li><Link to="/boutique?type=oil">Huiles Essentielles</Link></li>
              <li><Link to="/boutique?type=spices">Épices & Poivres</Link></li>
              <li><Link to="/boutique?type=coffee">Café de Spécialité</Link></li>
            </ul>
          </div>

          <div className="footer-block">
            <h4 className="footer-col-title">Newsletter</h4>
            <p className="footer-newsletter-desc">
              Recevez les nouvelles offres, les arrivages et les actualités du marché.
            </p>
            <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Votre adresse email" aria-label="Email newsletter" />
              <button type="submit" className="footer-newsletter-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </form>
            <div className="footer-social">
              <a href="#" aria-label="Facebook" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
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
