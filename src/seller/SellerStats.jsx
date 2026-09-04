import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  TrendingUp, Euro, ShoppingCart, FileText, CheckCircle2,
  Clock, Award, BarChart3,
} from 'lucide-react';
import { fetchMyProducts, fetchMyOrders, fetchMyQuotes } from '../services/seller';
import { formatEUR } from '../admin/format';

const formatEURFull = (n) => `${Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const SellerStats = () => {
  const { producer } = useOutletContext();
  const [data, setData] = useState({ products: [], orders: [], quotes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
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

  const totalRevenue = data.orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((s, o) => s + o.itemsTotal, 0);

  const avgOrderValue = data.orders.length > 0
    ? (totalRevenue / (data.orders.filter(o => o.paymentStatus === 'paid').length || 1))
    : 0;

  const quoteConversion = data.quotes.length > 0
    ? Math.round((data.quotes.filter((q) => q.status === 'accepted').length / data.quotes.length) * 100)
    : 0;

  const deliveredOrders = data.orders.filter((o) => o.status === 'delivered').length;
  const activeProducts = data.products.filter((p) => p.active).length;

  if (loading) {
    return (
      <div className="sv-loader">
        <div className="sv-loader-spinner" />
        <p>Calcul des statistiques…</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 className="sv-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} color="var(--primary)" /> Statistiques & Performances
        </h2>
        <p className="sv-dim">
          Indicateurs clés de votre activité commerciale, commandes, devis et dynamisme de votre boutique.
        </p>
      </div>

      {/* Main KPIs */}
      <div className="sv-kpis" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="sv-kpi">
          <span className="sv-kpi-label"><Euro size={13} /> Chiffre d'affaires payé</span>
          <div className="sv-kpi-value">{formatEURFull(totalRevenue)}</div>
          <div className="sv-kpi-sub">Total encaissé via Jerossa</div>
        </div>

        <div className="sv-kpi">
          <span className="sv-kpi-label"><ShoppingCart size={13} /> Panier moyen</span>
          <div className="sv-kpi-value">{formatEUR(avgOrderValue)}</div>
          <div className="sv-kpi-sub">Par commande payée</div>
        </div>

        <div className="sv-kpi">
          <span className="sv-kpi-label"><FileText size={13} /> Conversion Devis</span>
          <div className="sv-kpi-value">{quoteConversion}%</div>
          <div className="sv-kpi-sub">{data.quotes.filter(q => q.status === 'accepted').length} devis accepté(s)</div>
        </div>

        <div className="sv-kpi">
          <span className="sv-kpi-label"><CheckCircle2 size={13} /> Commandes honorées</span>
          <div className="sv-kpi-value">{deliveredOrders}</div>
          <div className="sv-kpi-sub">{data.orders.length} commande(s) au total</div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="sv-grid-2">
        {/* Status Breakdown */}
        <section className="sv-panel" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart3 size={16} /> Répartition des commandes
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Livrées avec succès', count: data.orders.filter(o => o.status === 'delivered').length, color: 'var(--brand-green)' },
              { label: 'Expédiées / En transit', count: data.orders.filter(o => o.status === 'shipped').length, color: '#3b82f6' },
              { label: 'Payées / En préparation', count: data.orders.filter(o => o.status === 'paid' || o.status === 'confirmed').length, color: 'var(--accent)' },
              { label: 'En attente de paiement', count: data.orders.filter(o => o.status === 'pending').length, color: 'var(--text-muted)' },
            ].map(({ label, count, color }) => {
              const total = data.orders.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500 }}>{label}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '7px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quotes & Responsiveness */}
        <section className="sv-panel" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} /> Efficacité commerciale
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#faf9f7', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>Délai moyen de réponse</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aux messages & devis acheteurs</div>
              </div>
              <span className="sv-badge sv-badge--green">{producer.response_time || '< 2 heures'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#faf9f7', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>Taux de réponse global</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Messages traités sous 24h</div>
              </div>
              <span className="sv-badge sv-badge--green">{producer.response_rate || '100%'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#faf9f7', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>Catalogue actif</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Offres publiées en ligne</div>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{activeProducts} / {data.products.length}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Pro Tips Panel */}
      <div className="sv-panel" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, rgba(46,125,50,0.05), rgba(212,163,115,0.1))', border: '1px solid rgba(46,125,50,0.2)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Award size={20} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 600 }}>Optimisez vos ventes sur l'axe Madagascar ↔ Maurice</h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-dark)', lineHeight: 1.5 }}>
              Les acheteurs professionnels privilégient les fiches produits détaillées avec photos réelles, origines régionales certifiées (SAVA, Sambirano, etc.) et des réponses aux demandes de devis formulées en moins de 4 heures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerStats;
