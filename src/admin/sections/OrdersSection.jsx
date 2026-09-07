import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Eye, ShoppingCart } from 'lucide-react';
import { fetchAdminOrders, updateOrderStatus } from '../../services/admin';
import {
  STATUS_LABELS, formatEUR, formatInt, formatDate, formatDateTime, clientLabel,
} from '../format';
import { PageHead, EmptyState, StatusBadge, PaymentBadge, Thumb, Modal } from '../ui';
import { useLang } from '../../context/LangContext';

const OrdersSection = () => {
  const { t, lang } = useLang();
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadOrders = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchAdminOrders();
    setOrders(data);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    }
  };

  const statusCounts = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(q) ||
      (clientLabel(o) || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalFiltered = filtered.reduce((s, o) => s + (Number(o.total) || 0), 0);

  if (loadingData) return <OrdersSkeleton />;

  return (
    <div>
      <PageHead
        eyebrow={t('admin.nav.sales')}
        title={t('admin.orders.title')}
        subtitle={t('admin.orders.subtitle', { count: formatInt(orders.length) })}
      />

      <div className="adm-toolbar">
        <div className="adm-pills" role="tablist" aria-label={t('admin.orders.filterByStatus')}>
          <button
            className={`adm-pill ${statusFilter === 'all' ? 'adm-pill--active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            {t('common.all')} <span className="adm-pill-count">{orders.length}</span>
          </button>
          {Object.entries(STATUS_LABELS).map(([key]) =>
            key === 'all' || orders.some((o) => o.status === key) || statusFilter === key ? (
              <button
                key={key}
                className={`adm-pill ${statusFilter === key ? 'adm-pill--active' : ''}`}
                onClick={() => setStatusFilter(key)}
              >
                {t('status.' + key)}
                {!!statusCounts[key] && <span className="adm-pill-count">{statusCounts[key]}</span>}
              </button>
            ) : null
          )}
        </div>
      </div>

      <div className="adm-toolbar">
        <label className="adm-field" style={{ flex: 1, maxWidth: 340 }}>
          <Search size={15} strokeWidth={1.75} />
          <input
            type="text"
            placeholder={t('admin.orders.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span className="adm-cell-dim" style={{ marginLeft: 'auto' }}>
          {t('admin.orders.results', { count: filtered.length })}
          {filtered.length > 0 && <> · {formatEUR(totalFiltered)}</>}
        </span>
      </div>

      <div className="adm-panel">
        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title={t('admin.orders.emptyTitle')}
            text={t('admin.orders.emptyText')}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            compact
            title={t('common.noResults')}
            text={t('admin.orders.noResultsText')}
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>{t('admin.orders.colOrder')}</th>
                  <th>{t('admin.client')}</th>
                  <th>{t('common.date')}</th>
                  <th>{t('admin.orders.colItems')}</th>
                  <th>{t('common.total')}</th>
                  <th>{t('admin.payment')}</th>
                  <th>{t('common.status')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <OrderCell order={o} />
                    </td>
                    <td style={{ fontSize: 12.5 }}>{clientLabel(o) || '—'}</td>
                    <td className="adm-cell-dim">{formatDate(o.createdAt, lang)}</td>
                    <td className="num">
                      {o.items.length} <span className="adm-cell-dim">{t('admin.orders.art')}</span>
                    </td>
                    <td className="num adm-cell-strong">{formatEUR(o.total)}</td>
                    <td><PaymentBadge status={o.paymentStatus} /></td>
                    <td>
                      <select
                        className="adm-inline-select"
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        aria-label={t('admin.orders.statusOf', { number: o.orderNumber })}
                      >
                        {Object.entries(STATUS_LABELS).map(([k]) => (
                          <option key={k} value={k}>{t('status.' + k)}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="adm-row-actions">
                        <OrderDetailsModal order={o} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const OrderCell = ({ order }) => (
  <div className="adm-prod-cell">
    <Thumb src={order.items?.[0]?.imageUrl} size={36} radius={8} />
    <div className="adm-prod-meta">
      <span
        className="adm-prod-name"
        style={{ maxWidth: 130, fontFamily: 'var(--adm-font-ui)', fontSize: 13 }}
      >
        {order.orderNumber}
      </span>
      <span className="adm-prod-code" style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {order.items?.[0]?.title || '—'}
      </span>
    </div>
  </div>
);

const OrderDetailsModal = ({ order }) => {
  const [open, setOpen] = useState(false);
  const { t, lang } = useLang();

  return (
    <>
      <button className="adm-action" title={t('admin.orders.viewDetail')} onClick={() => setOpen(true)}>
        <Eye size={15} strokeWidth={1.75} />
      </button>

      {open && (
        <Modal
          title={t('admin.orders.modalTitle', { number: order.orderNumber })}
          subtitle={t('admin.orders.modalSub', { date: formatDateTime(order.createdAt, lang) })}
          onClose={() => setOpen(false)}
          footer={
            <button className="adm-btn adm-btn--ghost" onClick={() => setOpen(false)}>
              {t('common.close')}
            </button>
          }
        >
          <div className="adm-meta-grid" style={{ marginBottom: 18 }}>
            <div>
              <div className="adm-meta-label">{t('admin.client')}</div>
              <div className="adm-meta-value">{clientLabel(order) || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">{t('common.status')}</div>
              <div style={{ marginTop: 2 }}><StatusBadge status={order.status} /></div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.payment')}</div>
              <div style={{ marginTop: 2 }}><PaymentBadge status={order.paymentStatus} /></div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.orders.tracking')}</div>
              <div className="adm-meta-value">{order.tracking || '—'}</div>
            </div>
          </div>

          <h4 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--adm-muted)', marginBottom: 4 }}>
            {t('admin.orders.items')}
          </h4>
          <div style={{ marginBottom: 14 }}>
            {order.items.map((item, i) => (
              <div className="adm-order-item" key={i}>
                <Thumb src={item.imageUrl} size={38} radius={8} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="adm-order-item-title">{item.title}</div>
                  <div className="adm-order-item-spec">
                    {item.seller ? `${item.seller} · ` : ''}
                    {formatEUR(item.price)} / {item.unit} × {item.qty}
                  </div>
                </div>
                <span className="adm-order-item-price num">{formatEUR(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div>
            <div className="adm-total-row"><span>{t('admin.orders.subtotal')}</span><span className="num">{formatEUR(order.subtotal)}</span></div>
            <div className="adm-total-row"><span>{t('admin.orders.shipping')}</span><span className="num">{formatEUR(order.shippingFee)}</span></div>
            <div className="adm-total-row adm-total-row--grand">
              <span>{t('common.total')}</span>
              <span className="num">{formatEUR(order.total)}</span>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

const OrdersSkeleton = () => (
  <div aria-hidden="true">
    <div style={{ marginBottom: 26 }}>
      <div className="adm-sk" style={{ width: 70, height: 11, marginBottom: 12 }} />
      <div className="adm-sk" style={{ width: 210, height: 24 }} />
    </div>
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="adm-sk" style={{ width: 92, height: 32, borderRadius: 999 }} />
      ))}
    </div>
    <div className="adm-panel">
      {[...Array(7)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 20px' }}>
          <div className="adm-sk" style={{ width: 36, height: 36, borderRadius: 8 }} />
          <div className="adm-sk" style={{ width: 120, height: 12 }} />
          <div className="adm-sk" style={{ flex: 1, height: 12 }} />
          <div className="adm-sk" style={{ width: 80, height: 12 }} />
          <div className="adm-sk" style={{ width: 70, height: 22, borderRadius: 999 }} />
        </div>
      ))}
    </div>
  </div>
);

export default OrdersSection;
