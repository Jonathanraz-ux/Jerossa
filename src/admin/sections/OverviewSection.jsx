import React, { useEffect, useMemo, useState } from 'react';
import {
  DollarSign, ShoppingCart, Users, Package, ArrowRight,
  Bell, PackagePlus, UserPlus, Truck, CreditCard,
} from 'lucide-react';
import {
  fetchAdminStats, fetchRecentOrders, fetchRecentNotifications,
  fetchAdminOrders, fetchAdminProducts,
} from '../../services/admin';
import { formatEUR, formatInt, formatDate, timeAgo, clientLabel } from '../format';
import { PageHead, Panel, EmptyState, StatusBadge, Thumb } from '../ui';
import { RevenueAreaChart, Sparkline } from '../charts';
import { useLang } from '../../context/LangContext';
import { localeFor } from '../../i18n';

const DAY_MS = 86400000;

const buildDailySeries = (days, locale) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(start.getTime() - i * DAY_MS);
    buckets.push({
      label: d.toLocaleDateString(locale, { day: '2-digit', month: 'short' }),
      value: 0,
      start: d.getTime(),
      end: d.getTime() + DAY_MS,
    });
  }
  return buckets;
};

const buildMonthlySeries = (locale) => {
  const now = new Date();
  const buckets = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      label: d.toLocaleDateString(locale, { month: 'short' }),
      value: 0,
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return buckets;
};

const STATUS_META = [
  { key: 'pending', color: '#c9a23f' },
  { key: 'confirmed', color: '#46688c' },
  { key: 'paid', color: '#a87945' },
  { key: 'shipped', color: '#7a94b3' },
  { key: 'delivered', color: '#33714f' },
  { key: 'cancelled', color: '#a63d35' },
  { key: 'refunded', color: '#857f72' },
];

// Icônes selon le type réel de notification
const NOTIF_ICONS = {
  order: ShoppingCart,
  order_status: Truck,
  payment: CreditCard,
  refund_status: CreditCard,
  account: UserPlus,
  product: PackagePlus,
};

const KpiTile = ({ icon, tone, name, value, note, delay }) => (
  <div className="adm-kpi-tile" style={{ animationDelay: `${delay}ms` }}>
    <div className="adm-kpi-top">
      <span className="adm-kpi-name">{name}</span>
      <span className={`adm-kpi-ico adm-kpi-ico--${tone}`}>{icon}</span>
    </div>
    <div className="adm-kpi-bottom">
      <span className="adm-kpi-value">{value}</span>
      {note && <span className="adm-kpi-note">{note}</span>}
    </div>
  </div>
);

const OverviewSection = ({ setActiveSection }) => {
  const { t, lang } = useLang();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [s, o, n, allO, p] = await Promise.all([
        fetchAdminStats(),
        fetchRecentOrders(6),
        fetchRecentNotifications(6),
        fetchAdminOrders(),
        fetchAdminProducts(),
      ]);
      if (!mounted) return;
      setStats(s);
      setRecentOrders(o);
      setNotifications(n);
      setAllOrders(allO);
      setProducts(p);
      setLoadingData(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Analytics 100 % dérivées des données réelles chargées
  const analytics = useMemo(() => {
    const paid = allOrders.filter((o) => o.paymentStatus === 'paid');

    const daily30 = buildDailySeries(30, localeFor(lang));
    paid.forEach((o) => {
      const t = new Date(o.createdAt).getTime();
      const b = daily30.find((x) => t >= x.start && t < x.end);
      if (b) b.value += Number(o.total) || 0;
    });

    const monthly = buildMonthlySeries(localeFor(lang));
    paid.forEach((o) => {
      const d = new Date(o.createdAt);
      const b = monthly.find((x) => x.year === d.getFullYear() && x.month === d.getMonth());
      if (b) b.value += Number(o.total) || 0;
    });

    // Tendance : période courante vs précédente — affichée seulement si comparable
    const nowT = Date.now();
    const sumBetween = (from, to) =>
      paid
        .filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return t >= from && t < to;
        })
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const win = period === '7d' ? 7 * DAY_MS : 30 * DAY_MS;
    const prevRev = sumBetween(nowT - 2 * win, nowT - win);
    const curRev = sumBetween(nowT - win, nowT + DAY_MS);
    const trendPct = prevRev > 0 ? ((curRev - prevRev) / prevRev) * 100 : null;

    const statusCounts = {};
    allOrders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    return {
      spark: daily30.map(({ label, value }) => ({ label, value })),
      series:
        period === '12m'
          ? monthly
          : period === '7d'
            ? daily30.slice(-7)
            : daily30,
      hasRevenue: paid.length > 0,
      trendPct,
      pendingCount: statusCounts.pending || 0,
      statusCounts,
    };
  }, [allOrders, period, lang]);

  if (loadingData || !stats) {
    return (
      <div aria-hidden="true">
        <div style={{ marginBottom: 26 }}>
          <div className="adm-sk" style={{ width: 110, height: 11, marginBottom: 12 }} />
          <div className="adm-sk" style={{ width: 260, height: 24 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="adm-panel" style={{ padding: 20 }}>
              <div className="adm-sk" style={{ width: '55%', height: 11, marginBottom: 14 }} />
              <div className="adm-sk" style={{ width: '70%', height: 22 }} />
            </div>
          ))}
        </div>
        <div className="adm-panel" style={{ padding: 20 }}>
          <div className="adm-sk" style={{ width: 180, height: 15, marginBottom: 18 }} />
          <div className="adm-sk" style={{ width: '100%', height: 200 }} />
        </div>
      </div>
    );
  }

  const todayLabel = new Date().toLocaleDateString(localeFor(lang), {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const activeProducts = products.filter((p) => p.active).length;

  return (
    <div>
      <PageHead
        eyebrow={t('admin.nav.overview')}
        title={t('admin.overview.dashboard')}
        subtitle={t('admin.overview.dashboardSub')}
        meta={
          <span className="adm-head-meta">
            {todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}
          </span>
        }
      />

      <div className="adm-kpi-band">
        <div className="adm-kpi-hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <span className="adm-kpi-hero-label">{t('admin.overview.revenue')}</span>
            <DollarSign size={16} strokeWidth={1.75} style={{ color: 'rgba(212,163,115,0.8)' }} />
          </div>
          <div className="adm-kpi-hero-value">{formatEUR(stats.totalRevenue)}</div>
          <div className="adm-kpi-hero-sub">
            {analytics.hasRevenue ? (
              <>
                {t('admin.overview.paidOrders')}
                {analytics.trendPct !== null && (
                  <span
                    style={{
                      color: analytics.trendPct >= 0 ? '#9dc7ab' : '#e0a49d',
                      fontWeight: 600,
                      marginLeft: 8,
                    }}
                  >
                    {analytics.trendPct >= 0 ? '↑' : '↓'} {Math.abs(analytics.trendPct).toFixed(1)} % {t('admin.overview.vsPrev')}
                  </span>
                )}
              </>
            ) : (
              t('admin.overview.noRevenue')
            )}
          </div>
          {analytics.hasRevenue && (
            <div className="adm-kpi-hero-spark">
              <Sparkline points={analytics.spark} />
            </div>
          )}
        </div>

        <KpiTile
          delay={60}
          icon={<ShoppingCart size={17} strokeWidth={1.75} />}
          tone="bronze"
          name={t('admin.overview.orders')}
          value={formatInt(stats.totalOrders)}
          note={stats.totalOrders > 0 ? t('admin.overview.pending', { count: formatInt(analytics.pendingCount) }) : undefined}
        />
        <KpiTile
          delay={120}
          icon={<Users size={17} strokeWidth={1.75} />}
          tone="blue"
          name={t('admin.overview.users')}
          value={formatInt(stats.totalUsers)}
          note={stats.totalUsers > 0 ? t('admin.overview.registered') : undefined}
        />
        <KpiTile
          delay={180}
          icon={<Package size={17} strokeWidth={1.75} />}
          tone="amber"
          name={t('admin.overview.products')}
          value={formatInt(stats.totalProducts)}
          note={stats.totalProducts > 0 ? t('admin.overview.active', { count: formatInt(activeProducts) }) : undefined}
        />
      </div>

      <div className="adm-grid-main">
        <Panel
          title={t('admin.overview.revenueEvolution')}
          subtitle={t('admin.overview.revenueSub')}
          action={
            <div className="adm-seg" role="tablist" aria-label={t('admin.overview.period')}>
              {[['7d', t('admin.overview.period7d')], ['30d', t('admin.overview.period30d')], ['12m', t('admin.overview.period12m')]].map(([key, lbl]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={period === key}
                  className={`adm-seg-btn ${period === key ? 'adm-seg-btn--active' : ''}`}
                  onClick={() => setPeriod(key)}
                >
                  {lbl}
                </button>
              ))}
            </div>
          }
        >
          {analytics.series.some((p) => p.value > 0) ? (
            <RevenueAreaChart points={analytics.series} />
          ) : (
            <EmptyState
              icon={DollarSign}
              title={t('admin.overview.activityHere')}
              text={t('admin.overview.activityHereText')}
            />
          )}
        </Panel>

        <Panel
          title={t('admin.overview.orderBreakdown')}
          subtitle={t('admin.overview.orderBreakdownSub', { count: formatInt(allOrders.length) })}
        >
          {allOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              compact
              title={t('admin.overview.noOrders')}
              text={t('admin.overview.noOrdersText')}
            />
          ) : (
            <div className="adm-bars">
              {STATUS_META.filter((s) => analytics.statusCounts[s.key]).map((s) => {
                const count = analytics.statusCounts[s.key] || 0;
                const pct = Math.round((count / allOrders.length) * 100);
                return (
                  <div className="adm-bar-row" key={s.key}>
                    <span className="adm-bar-label">{t('status.' + s.key)}</span>
                    <span className="adm-bar-track">
                      <span
                        className="adm-bar-fill"
                        style={{ width: `${Math.max(pct, 3)}%`, background: s.color }}
                      />
                    </span>
                    <span className="num adm-cell-strong" style={{ textAlign: 'right', fontSize: 12.5 }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      <div className="adm-grid-duo">
        <Panel
          title={t('admin.overview.recentOrders')}
          subtitle={t('admin.overview.recentOrdersSub')}
          action={
            <button className="adm-panel-link" onClick={() => setActiveSection('orders')}>
              {t('common.seeAll')} <ArrowRight size={13} />
            </button>
          }
        >
          {recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title={t('admin.overview.noOrders')}
              text={t('admin.overview.noOrdersText')}
            />
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>{t('admin.overview.colOrder')}</th>
                    <th>{t('admin.client')}</th>
                    <th>{t('common.date')}</th>
                    <th>{t('common.total')}</th>
                    <th>{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div className="adm-prod-cell">
                          <Thumb src={order.items?.[0]?.imageUrl} size={36} radius={8} />
                          <div className="adm-prod-meta">
                            <span
                              className="adm-prod-name"
                              style={{ maxWidth: 140, fontFamily: 'var(--adm-font-ui)', fontSize: 13 }}
                            >
                              {order.orderNumber}
                            </span>
                            <span className="adm-prod-code">
                              {t('admin.articles', { count: order.items?.length })}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12.5 }}>{clientLabel(order) || '—'}</td>
                      <td className="adm-cell-dim">{formatDate(order.createdAt, lang)}</td>
                      <td className="num adm-cell-strong">{formatEUR(order.total)}</td>
                      <td><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel
          title={t('admin.overview.recentActivity')}
          subtitle={t('admin.overview.recentActivitySub')}
          action={
            notifications.length > 0 ? (
              <button className="adm-panel-link" onClick={() => setActiveSection('messages')}>
                {t('common.seeAll')} <ArrowRight size={13} />
              </button>
            ) : null
          }
        >
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={t('admin.overview.nothingToReport')}
              text={t('admin.overview.nothingToReportText')}
            />
          ) : (
            <div className="adm-timeline">
              {notifications.map((n) => {
                const Icon = NOTIF_ICONS[n.type] || Bell;
                return (
                  <div className="adm-tl-item" key={n.id}>
                    <span
                      className="adm-tl-dot"
                      style={{
                        color: n.read ? 'var(--adm-faint)' : 'var(--adm-bronze-deep)',
                        background: n.read ? 'var(--adm-surface-subtle)' : 'var(--adm-bronze-soft)',
                        borderColor: n.read ? 'var(--adm-line)' : 'rgba(168,121,69,0.25)',
                      }}
                    >
                      <Icon size={13} strokeWidth={1.75} />
                    </span>
                    <div className="adm-tl-body">
                      <div className="adm-tl-title">{n.title}</div>
                      <div className="adm-tl-desc">{n.body || '—'}</div>
                    </div>
                    <span className="adm-tl-time">{timeAgo(n.created_at, lang)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default OverviewSection;
