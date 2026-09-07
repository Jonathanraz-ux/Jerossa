import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShoppingCart, MapPin } from 'lucide-react';
import { fetchMyOrders } from '../services/seller';
import { formatEUR, formatDateTime } from '../admin/format';
import { useLang } from '../context/LangContext';

const statusTone = (s) => ({
  pending: 'amber', confirmed: 'blue', paid: 'green', shipped: 'blue',
  delivered: 'green', cancelled: 'red', refunded: 'neutral',
}[s] || 'neutral');

const SellerOrders = () => {
  useOutletContext();
  const { t, lang } = useLang();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await fetchMyOrders();
      if (alive) {
        setOrders(data);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return <div className="sv-loader"><div className="sv-loader-spinner" /><p>{t('common.loading')}</p></div>;
  }

  return (
    <div>
      <h2 className="sv-section-title">{t('seller.orders.title', { count: orders.length })}</h2>
      <p className="sv-dim" style={{ marginBottom: '1.25rem' }}>
        {t('seller.orders.subtitle')}
      </p>

      <div className="sv-panel">
        {orders.length === 0 ? (
          <div className="sv-empty">
            <ShoppingCart size={30} />
            <p>{t('seller.orders.empty')}</p>
          </div>
        ) : (
          <div className="sv-table-wrap">
            <table className="sv-table">
              <thead>
                <tr>
                  <th>{t('seller.orders.colOrder')}</th>
                  <th>{t('seller.orders.colDate')}</th>
                  <th>{t('seller.orders.colMyItems')}</th>
                  <th>{t('seller.orders.colMyShare')}</th>
                  <th>{t('seller.orders.colPayment')}</th>
                  <th>{t('seller.orders.colStatus')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <React.Fragment key={o.id}>
                    <tr>
                      <td><strong>{o.orderNumber}</strong></td>
                      <td className="sv-dim">{formatDateTime(o.createdAt, lang)}</td>
                      <td className="sv-num">{o.items.length}</td>
                      <td className="sv-num" style={{ fontWeight: 700 }}>{formatEUR(o.itemsTotal)}</td>
                      <td>
                        <span className={`sv-badge sv-badge--${o.paymentStatus === 'paid' ? 'green' : o.paymentStatus === 'failed' ? 'red' : 'amber'}`}>
                          {t('status.' + o.paymentStatus) || o.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`sv-badge sv-badge--${statusTone(o.status)}`}>
                          {t('status.' + o.status) || o.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="sv-btn sv-btn--ghost"
                          style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                          onClick={() => setOpenId(openId === o.id ? null : o.id)}
                        >
                          {openId === o.id ? t('seller.orders.hide') : t('seller.orders.detail')}
                        </button>
                      </td>
                    </tr>
                    {openId === o.id && (
                      <tr>
                        <td colSpan={7} style={{ background: '#faf9f7' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="sv-order-detail">
                            <div>
                              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 6 }}>{t('seller.orders.myItems')}</div>
                              {o.items.map((it, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', padding: '0.3rem 0' }}>
                                  <span>{it.title} — {formatEUR(it.priceEur)} / {it.unit} × {it.quantity}</span>
                                  <span className="sv-num" style={{ fontWeight: 600 }}>{formatEUR(it.lineTotal)}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 6 }}>
                                <MapPin size={11} style={{ verticalAlign: '-2px' }} /> {t('seller.orders.shipping')}
                              </div>
                              <div className="sv-dim" style={{ lineHeight: 1.7, fontSize: '0.82rem' }}>
                                {[o.address.firstName, o.address.lastName].filter(Boolean).join(' ') || '—'}<br />
                                {o.address.street && <>{o.address.street}<br /></>}
                                {[o.address.postalCode, o.address.city].filter(Boolean).join(' ')}<br />
                                {o.address.country}<br />
                                {o.address.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
