import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  TrendingUp, Euro, ShoppingCart, FileText, CheckCircle2,
  Clock, Award, BarChart3,
} from 'lucide-react';
import { fetchMyProducts, fetchMyOrders, fetchMyQuotes } from '../services/seller';
import { formatEUR } from '../admin/format';
import { useLang } from '../context/LangContext';

const formatEURFull = (n) => `${Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const SellerStats = () => {
  const { producer } = useOutletContext();
  const { t } = useLang();
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
        <p>{t('seller.stats.loading')}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 className="sv-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} color="var(--primary)" /> {t('seller.stats.title')}
        </h2>
        <p className="sv-dim">
          {t('seller.stats.subtitle')}
        </p>
      </div>

      {/* Main KPIs */}
      <div className="sv-kpis" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="sv-kpi">
          <span className="sv-kpi-label"><Euro size={13} /> {t('seller.stats.paidRevenue')}</span>
          <div className="sv-kpi-value">{formatEURFull(totalRevenue)}</div>
          <div className="sv-kpi-sub">{t('seller.stats.totalCollected')}</div>
        </div>

        <div className="sv-kpi">
          <span className="sv-kpi-label"><ShoppingCart size={13} /> {t('seller.stats.avgCart')}</span>
          <div className="sv-kpi-value">{formatEUR(avgOrderValue)}</div>
          <div className="sv-kpi-sub">{t('seller.stats.perPaidOrder')}</div>
        </div>

        <div className="sv-kpi">
          <span className="sv-kpi-label"><FileText size={13} /> {t('seller.stats.quoteConversion')}</span>
          <div className="sv-kpi-value">{quoteConversion}%</div>
          <div className="sv-kpi-sub">{t('seller.stats.quotesAccepted', { count: data.quotes.filter(q => q.status === 'accepted').length })}</div>
        </div>

        <div className="sv-kpi">
          <span className="sv-kpi-label"><CheckCircle2 size={13} /> {t('seller.stats.fulfilledOrders')}</span>
          <div className="sv-kpi-value">{deliveredOrders}</div>
          <div className="sv-kpi-sub">{t('seller.stats.totalOrders', { count: data.orders.length })}</div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="sv-grid-2">
        {/* Status Breakdown */}
        <section className="sv-panel" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart3 size={16} /> {t('seller.stats.orderBreakdown')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: t('seller.stats.deliveredSuccess'), count: data.orders.filter(o => o.status === 'delivered').length, color: 'var(--brand-green)' },
              { label: t('seller.stats.shippedTransit'), count: data.orders.filter(o => o.status === 'shipped').length, color: '#3b82f6' },
              { label: t('seller.stats.paidPreparing'), count: data.orders.filter(o => o.status === 'paid' || o.status === 'confirmed').length, color: 'var(--accent)' },
              { label: t('seller.stats.pendingPayment'), count: data.orders.filter(o => o.status === 'pending').length, color: 'var(--text-muted)' },
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
            <Clock size={16} /> {t('seller.stats.commercialEfficiency')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#faf9f7', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>{t('seller.stats.avgResponseTime')}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('seller.stats.avgResponseTimeHint')}</div>
              </div>
              <span className="sv-badge sv-badge--green">{producer.response_time || '< 2 heures'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#faf9f7', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>{t('seller.stats.globalResponseRate')}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('seller.stats.messages24h')}</div>
              </div>
              <span className="sv-badge sv-badge--green">{producer.response_rate || '100%'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#faf9f7', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>{t('seller.stats.activeCatalog')}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('seller.stats.offersOnline')}</div>
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
            <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 600 }}>{t('seller.stats.tipTitle')}</h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-dark)', lineHeight: 1.5 }}>
              {t('seller.stats.tipText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerStats;
