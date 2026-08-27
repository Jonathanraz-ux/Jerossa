import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, FileText, Store, ExternalLink, RefreshCw,
} from 'lucide-react';
import { fetchMyProducer } from '../services/seller';
import './seller.css';

const TABS = [
  { to: '/espace-vendeur', end: true, label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/espace-vendeur/produits', label: 'Produits', icon: Package },
  { to: '/espace-vendeur/commandes', label: 'Commandes', icon: ShoppingCart },
  { to: '/espace-vendeur/devis', label: 'Devis', icon: FileText },
  { to: '/espace-vendeur/boutique', label: 'Ma boutique', icon: Store },
];

const SellerLayout = () => {
  const [producer, setProducer] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchMyProducer();
    setProducer(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

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
        <div className="container sv-tabs">
          {TABS.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sv-tab${isActive ? ' sv-tab--active' : ''}`}
            >
              <Icon size={15} /> {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="container sv-content">
        <Outlet context={{ producer }} />
      </main>
    </div>
  );
};

export default SellerLayout;
