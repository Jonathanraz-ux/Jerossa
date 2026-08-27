import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Package, ShoppingCart, Euro, FileText, ArrowRight,
} from 'lucide-react';
import { fetchMyProducts, fetchMyOrders, fetchMyQuotes } from '../services/seller';
import { formatEUR } from '../admin/format';

const formatEURFull = (n) => `${Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const STATUS_FR = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

const SellerDashboard = () => {
  const { producer } = useOutletContext();
  const [data, setData] = useState({ products: [], orders: [], quotes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [products, orders, quotes] = await Promise.all([
        fetchMyProducts(producer.id),
        fetchMyOrders(),
        fetchMyQuotes(producer.id),
      ]);
      if (alive) {
        setData({ products, orders, quotes });
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [producer]);

  const activeProducts = data.products.filter((p) => p.active).length;
  const paidRevenue = data.orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((s, o) => s + o.itemsTotal, 0);
  const pendingQuotes = data.quotes.filter((q) => q.status === 'pending').length;

  if (loading) {
    return <div className="sv-loader"><div className="sv-loader-spinner" /><p>Chargement…</p></div>;
  }

  return (
    <div>
      <div className="sv-kpis">
        <div className="sv-kpi">
          <span className="sv-kpi-label"><Package size={13} /> Produits en ligne</span>
          <div className="sv-kpi-value">{activeProducts}</div>
          <div className="sv-kpi-sub">{data.products.length} au total</div>
        </div>
        <div className="sv-kpi">
          <span className="sv-kpi-label"><ShoppingCart size={13} /> Commandes reçues</span>
          <div className="sv-kpi-value">{data.orders.length}</div>
          <div className="sv-kpi-sub">contenant vos articles</div>
        </div>
        <div className="sv-kpi">
          <span className="sv-kpi-label"><Euro size={13} /> Chiffre d'affaires payé</span>
          <div className="sv-kpi-value">{formatEURFull(paidRevenue)}</div>
          <div className="sv-kpi-sub">hors commission plateforme</div>
        </div>
        <div className="sv-kpi">
          <span className="sv-kpi-label"><FileText size={13} /> Devis en attente</span>
          <div className="sv-kpi-value">{pendingQuotes}</div>
          <div className="sv-kpi-sub">{data.quotes.length} demande(s) au total</div>
        </div>
      </div>

      <div className="sv-grid-2">
        <section className="sv-panel" style={{ marginBottom: 0 }}>
          <h2 className="sv-section-title">Dernières commandes</h2>
          {data.orders.length === 0 ? (
            <div className="sv-empty">Aucune commande pour le moment.</div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {data.orders.slice(0, 4).map((o) => (
                <li key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.86rem' }}>
                  <div>
                    <strong>{o.orderNumber}</strong>
                    <div className="sv-dim">{new Date(o.createdAt).toLocaleDateString('fr-FR')} · {o.items.length} article(s)</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="sv-num" style={{ fontWeight: 700 }}>{formatEUR(o.itemsTotal)}</div>
                    <div className="sv-dim">{STATUS_FR[o.status] || o.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/espace-vendeur/commandes" className="sv-btn sv-btn--ghost" style={{ marginTop: '1rem' }}>
            Toutes les commandes <ArrowRight size={14} />
          </Link>
        </section>

        <section className="sv-panel" style={{ marginBottom: 0 }}>
          <h2 className="sv-section-title">Dernières demandes de devis</h2>
          {data.quotes.length === 0 ? (
            <div className="sv-empty">Aucune demande de devis pour le moment.</div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {data.quotes.slice(0, 4).map((q) => (
                <li key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.86rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{q.productTitle}</strong>
                    <div className="sv-dim">{q.quantity} {q.unit} · {new Date(q.createdAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <span className={`sv-badge sv-badge--${q.status === 'pending' ? 'amber' : q.status === 'responded' ? 'blue' : 'neutral'}`}>
                    {{ pending: 'À répondre', responded: 'Répondu', accepted: 'Accepté', declined: 'Refusé' }[q.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/espace-vendeur/devis" className="sv-btn sv-btn--ghost" style={{ marginTop: '1rem' }}>
            Tous les devis <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default SellerDashboard;
