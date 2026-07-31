import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, ChevronDown, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar-wrapper">
      <nav className="navbar container">
        <Link to="/" className="nav-brand">
          <div className="nav-brand-icon">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="#d4a373" opacity="0.2"/>
              <path d="M16 6c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6z" fill="none" stroke="#8c6239" strokeWidth="1.5"/>
              <path d="M12 16c0 0 1.5-3 4-3s4 3 4 3" stroke="#8c6239" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M14 16l-1 2M18 16l1 2" stroke="#8c6239" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M16 13v-2M16 19v2" stroke="#8c6239" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="nav-brand-text">
            <span className="nav-brand-title">Jerossa</span>
            <span className="nav-brand-subtitle">Madagascar · Maurice</span>
          </div>
        </Link>

        <div className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link to="/boutique" className="nav-link" onClick={() => setMenuOpen(false)}>Boutique</Link>
          <Link to="/producteurs" className="nav-link" onClick={() => setMenuOpen(false)}>Producteurs</Link>
          <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>À propos</Link>
          <Link to="/blog" className="nav-link" onClick={() => setMenuOpen(false)}>Blog</Link>
          <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
        </div>

        <div className="nav-actions">
          <Link to="/search" className="nav-icon-btn" aria-label="Recherche">
            <Search size={18} strokeWidth={1.5} />
          </Link>

          <Link to="/cart" className="nav-icon-btn nav-cart" aria-label="Panier">
            <ShoppingCart size={18} strokeWidth={1.5} />
            <span className="cart-badge">3</span>
          </Link>

          <Link to="/account" className="account-btn">
            <User size={15} strokeWidth={1.5} />
            <span className="account-label">Compte</span>
          </Link>

          <div className="lang-selector">
            FR
            <ChevronDown size={12} strokeWidth={1.5} />
          </div>

          <button
            className="nav-hamburger"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setMenuOpen(prev => !prev)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
