import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, FileText, Store, ExternalLink,
  RefreshCw, MessageSquare, Star, TrendingUp, Settings,
} from 'lucide-react';
import { fetchMyProducer } from '../services/seller';
import { fetchMyConversations } from '../services/messages';
import './seller.css';

const TABS = [
  { to: '/espace-vendeur', end: true, label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/espace-vendeur/boutique', label: 'Ma boutique', icon: Store },
  { to: '/espace-vendeur/produits', label: 'Mes produits', icon: Package },
  { to: '/espace-vendeur/messages', label: 'Messages', icon: MessageSquare, hasBadge: true },
  { to: '/espace-vendeur/devis', label: 'Demandes de devis', icon: FileText },
  { to: '/espace-vendeur/commandes', label: 'Commandes reçues', icon: ShoppingCart },
  { to: '/espace-vendeur/avis', label: 'Avis', icon: Star },
  { to: '/espace-vendeur/statistiques', label: 'Statistiques', icon: TrendingUp },
  { to: '/espace-vendeur/parametres', label: 'Paramètres vendeur', icon: Settings },
];

const SellerLayout = () => {
  const [producer, setProducer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchMyProducer();
    setProducer(data);
    setLoading(false);
  }, []);

  const loadUnread = useCallback(async () => {
    try {
      const convos = await fetchMyConversations();
      const count = (convos || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setUnreadCount(count);
    } catch (e) {
      console.error('[SellerLayout] loadUnread error', e);
    }
  }, []);

  useEffect(() => {
    load();
    loadUnread();
  }, [load, loadUnread]);

  if (loading && !producer) {
    return (
      <div className="sv-page">
        <div className="sv-loader"><div className="sv-loader-spinner" /><p>Chargement…</p></div>
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="sv-page">
        <div className="container sv-content">
          <div className="sv-panel">
            <div className="sv-error-banner">
              <span>Impossible de charger votre boutique. Réessayez dans un instant.</span>
            </div>
            <button type="button" className="sv-btn sv-btn--ghost" onClick={load} disabled={loading}>
              {loading ? <span className="sv-loader-spinner" /> : <RefreshCw size={14} />}
              {loading ? 'Chargement…' : 'Réessayer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sv-page">
      <header className="sv-header">
        <div className="container sv-header-inner">
          <div>
            <span className="sv-eyebrow">Espace vendeur</span>
            <h1 className="sv-shop-name">{producer.name}</h1>
          </div>
          {producer.slug && (
            <Link to={`/producteur/${producer.slug}`} className="sv-view-shop">
              Voir ma boutique publique <ExternalLink size={14} />
            </Link>
          )}
        </div>
      </header>

      <nav className="sv-tabs-bar">
        <div className="container sv-tabs" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', gap: '4px', paddingBottom: '4px' }}>
          {TABS.map(({ to, end, label, icon: Icon, hasBadge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sv-tab${isActive ? ' sv-tab--active' : ''}`}
              style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon size={15} />
              <span>{label}</span>
              {hasBadge && unreadCount > 0 && (
                <span style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  borderRadius: '50%',
                  minWidth: 18,
                  height: 18,
                  padding: '0 4px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="container sv-content">
        <Outlet context={{ producer, onConversationUpdated: loadUnread }} />
      </main>
    </div>
  );
};

export default SellerLayout;
