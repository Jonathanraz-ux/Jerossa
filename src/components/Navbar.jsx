import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, ChevronDown, Menu, X, HelpCircle, Globe, PlusCircle, Package, ArrowRight, BadgeCheck, Home as HomeIcon, LayoutGrid, User, MessageSquare, Store } from 'lucide-react';
import './Navbar.css';
import { useCurrency, MARKETS, CURRENCIES } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchCategories } from '../services/catalog';
import { fetchMyConversations } from '../services/messages';

const Popover = ({ open, onClose, children, align = 'left' }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={`nav-popover nav-popover--${align}`} ref={ref} onClick={() => onClose()}>
      {children}
    </div>
  );
};

const MarketSelector = () => {
  const { market, setMarket, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const current = MARKETS.find((m) => m.code === market);

  return (
    <div className="nav-select">
      <button className="nav-select-trigger" onClick={() => setOpen(!open)} aria-label="Sélectionner le marché">
        <span className="nav-select-flag">{current.flag}</span>
        <span className="nav-select-label">{current.label}</span>
        <ChevronDown size={12} strokeWidth={2} className={`nav-select-chevron${open ? ' is-open' : ''}`} />
      </button>
      <Popover open={open} onClose={() => setOpen(false)}>
        <div className="nav-select-title">Votre marché</div>
        {MARKETS.map((m) => (
          <button
            key={m.code}
            className={`nav-select-option${market === m.code ? ' is-active' : ''}`}
            onClick={() => {
              setMarket(m.code);
              setCurrency(m.currency);
            }}
          >
            <span className="nav-select-flag">{m.flag}</span>
            <span>{m.label}</span>
            {market === m.code && <BadgeCheck size={14} />}
          </button>
        ))}
      </Popover>
    </div>
  );
};

const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const current = CURRENCIES.find((c) => c.code === currency);

  return (
    <div className="nav-select">
      <button className="nav-select-trigger" onClick={() => setOpen(!open)} aria-label="Sélectionner la devise">
        <Globe size={13} strokeWidth={2} />
        <span className="nav-select-label">
          Devise : <strong>{currency} – {current.short}</strong>
        </span>
        <ChevronDown size={12} strokeWidth={2} className={`nav-select-chevron${open ? ' is-open' : ''}`} />
      </button>
      <Popover open={open} onClose={() => setOpen(false)}>
        <div className="nav-select-title">Devise d'affichage</div>
        {CURRENCIES.map((c) => (
          <button
            key={c.code}
            className={`nav-select-option${currency === c.code ? ' is-active' : ''}`}
            onClick={() => setCurrency(c.code)}
          >
            <span><strong>{c.code}</strong> – {c.label}</span>
            {currency === c.code && <BadgeCheck size={14} />}
          </button>
        ))}
        <p className="nav-select-note">Montants indicatifs selon le taux de conversion en vigueur.</p>
      </Popover>
    </div>
  );
};

const PublishModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div className="j-modal-backdrop" onClick={onClose}>
      <div className="j-modal-panel publish-panel" onClick={(e) => e.stopPropagation()}>
        <div className="publish-panel-head">
          <span className="publish-panel-eyebrow">Nouvelle offre</span>
          <h3>Que souhaitez-vous publier ?</h3>
          <p>Rejoignez la marketplace JEROSSA et développez votre activité entre Madagascar et Maurice.</p>
          <button className="publish-panel-close" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        </div>
        <div className="publish-panel-options">
          <button
            className="publish-option"
            onClick={() => { onClose(); navigate('/publier?type=produit'); }}
          >
            <span className="publish-option-icon publish-option-icon--product"><Package size={22} strokeWidth={1.6} /></span>
            <span className="publish-option-body">
              <strong>Un produit</strong>
              <span>Vanille, cacao, épices, produits agricoles, artisanat…</span>
            </span>
            <ArrowRight size={16} className="publish-option-arrow" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { count } = useCart();
  const { isAuthenticated, signOut, user, profile } = useAuth();

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) { setUnreadCount(0); return; }
    fetchMyConversations().then((convos) => {
      const total = convos.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setUnreadCount(total);
    });
  }, [isAuthenticated, user]);

  const openPublish = () => { setMenuOpen(false); setPublishOpen(true); };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <header className="navbar-wrapper">
        {/* ===== UTILITY TOP BAR ===== */}
        <div className="nav-topbar">
          <div className="container nav-topbar-inner">
            <div className="nav-topbar-left">
              <MarketSelector />
              <span className="nav-topbar-divider" />
              <CurrencySelector />
            </div>
            <div className="nav-topbar-right">
              <Link to="/faq" className="nav-topbar-link"><HelpCircle size={13} strokeWidth={1.8} /> Aide</Link>
              <Link to="/about" className="nav-topbar-link">À propos</Link>
              {isAuthenticated ? (
                <>
                  {profile?.role === 'seller' && (
                    <Link to="/espace-vendeur" className="nav-topbar-link nav-topbar-link--seller" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      <Store size={13} strokeWidth={1.8} /> Espace vendeur
                    </Link>
                  )}
                  <Link to="/my-account" className="nav-topbar-link nav-topbar-link--strong">
                    <User size={13} strokeWidth={1.8} /> Mon compte
                  </Link>
                  <button type="button" className="nav-topbar-link" onClick={handleLogout}>
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-topbar-link">Se connecter</Link>
                  <Link to="/register" className="nav-topbar-link nav-topbar-link--strong">Créer un compte</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ===== MAIN NAVIGATION ===== */}
        <nav className="navbar container">
          <Link to="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
            <img
              src="/logo-jerossa.jpeg"
              alt="Jerossa — Madagascar · Maurice"
              className="nav-brand-logo"
            />
          </Link>

          <div className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Accueil</Link>
            <Link to="/boutique" className="nav-link" onClick={() => setMenuOpen(false)}>Produits</Link>
            <div className={`nav-link nav-link--dd${catsOpen ? ' is-open' : ''}`}>
              <button
                className="nav-link-dd-trigger"
                onClick={() => setCatsOpen(!catsOpen)}
                onMouseEnter={() => setCatsOpen(true)}
              >
                Catégories <ChevronDown size={13} strokeWidth={1.8} className="nav-link-dd-chevron" />
              </button>
              <div
                className="nav-mega"
                onMouseLeave={() => setCatsOpen(false)}
                onClick={() => { setCatsOpen(false); setMenuOpen(false); }}
              >
                <div className="nav-mega-head">
                  <span>Explorez nos catégories</span>
                  <Link to="/boutique" className="nav-mega-all">Tout le catalogue <ArrowRight size={12} /></Link>
                </div>
                <div className="nav-mega-grid">
                  {categories.slice(0, 8).map((cat) => (
                    <Link to={`/categories/${cat.slug}`} key={cat.id} className="nav-mega-item">
                      <span className="nav-mega-img">
                        <img src={cat.image} alt={cat.name} loading="lazy" />
                      </span>
                      <span className="nav-mega-item-body">
                        <strong>{cat.name}</strong>
                        <span>{cat.productCount} offres</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link to="/producteurs" className="nav-link" onClick={() => setMenuOpen(false)}>Fournisseurs</Link>
            {profile?.role === 'seller' ? (
              <Link to="/espace-vendeur" className="nav-link nav-link--seller" onClick={() => setMenuOpen(false)}>Espace vendeur</Link>
            ) : (
              <Link to="/vendeur/devenir" className="nav-link nav-link--seller" onClick={() => setMenuOpen(false)}>Devenir vendeur</Link>
            )}
            <Link to="/#comment-ca-marche" className="nav-link" onClick={() => setMenuOpen(false)}>Comment ça marche</Link>
          </div>

          <div className="nav-actions">
            <button
              className="nav-icon-btn nav-search-trigger"
              aria-label="Recherche"
              onClick={() => navigate('/search')}
            >
              <Search size={18} strokeWidth={1.6} />
            </button>

            <Link to="/cart" className="nav-icon-btn nav-cart" aria-label="Panier">
              <ShoppingCart size={18} strokeWidth={1.6} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>

            {isAuthenticated && (
              <Link to="/my-messages" className="nav-icon-btn nav-messages" aria-label="Messages">
                <MessageSquare size={18} strokeWidth={1.6} />
                {unreadCount > 0 && <span className="cart-badge">{unreadCount}</span>}
              </Link>
            )}

            <button className="nav-publish-btn" onClick={openPublish}>
              <PlusCircle size={16} strokeWidth={2} />
              <span className="nav-publish-label">Publier une offre</span>
            </button>

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

      <PublishModal open={publishOpen} onClose={() => setPublishOpen(false)} />

      {/* ===== MOBILE BOTTOM BAR ===== */}
      <div className="mobile-bar">
        <Link to="/" className="mobile-bar-item"><HomeIcon size={19} strokeWidth={1.8} /><span>Accueil</span></Link>
        <Link to="/boutique" className="mobile-bar-item"><LayoutGrid size={19} strokeWidth={1.8} /><span>Produits</span></Link>
        <button className="mobile-bar-item mobile-bar-publish" onClick={openPublish} aria-label="Publier une offre">
          <span className="mobile-bar-publish-ico"><PlusCircle size={22} strokeWidth={2} /></span>
          <span>Publier</span>
        </button>
        {isAuthenticated && (
          <Link to="/my-messages" className="mobile-bar-item">
            <span style={{ position: 'relative' }}>
              <MessageSquare size={19} strokeWidth={1.8} />
              {unreadCount > 0 && <span style={{ position: 'absolute', top: -4, right: -6, width: 14, height: 14, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '0.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>}
            </span>
            <span>Messages</span>
          </Link>
        )}
        <Link to={isAuthenticated ? '/my-account' : '/account'} className="mobile-bar-item"><User size={19} strokeWidth={1.8} /><span>Compte</span></Link>
      </div>
    </>
  );
};

export default Navbar;
