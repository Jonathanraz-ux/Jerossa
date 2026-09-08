import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowLeft, Loader2 } from 'lucide-react';
import { fetchOrderByUser } from '../services/orders';
import { useLang } from '../context/LangContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../i18n';
import './animations.css';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const { t, lang } = useLang();
  const { convert } = useCurrency();
  const ref = searchParams.get('ref');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!ref);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ref) { setLoading(false); return; }
    let active = true;
    fetchOrderByUser(ref).then((fetched) => {
      if (!active) return;
      if (fetched) {
        setOrder(fetched);
      } else {
        setError(true);
      }
      setLoading(false);
    }).catch(() => {
      if (active) { setError(true); setLoading(false); }
    });
    return () => { active = false; };
  }, [ref]);

  return (
    <div className="container page-container">
      {/* Hero */}
      <section className="page-hero" style={{ height: '300px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('order.confirmation')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('order.confirmation')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('order.thanks')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('order.confirmedHero')}</p>
        </div>
      </section>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>{t('common.loading')}</p>
          </div>
        ) : error || !order ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>{t('order.notFound')}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {ref ? t('order.notFoundWithRef', { ref }) : t('order.noRef')}
            </p>
            <Link to="/my-orders" className="btn btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: '8px' }}>
              {t('account.myOrders')}
            </Link>
          </div>
        ) : (
          <>
        <div className="scroll-animate" style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={48} style={{ color: 'var(--success)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 600, marginBottom: '8px' }}>{t('order.thanks')}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{t('order.confirmedText')}</p>
        </div>

        <div className="scroll-animate" style={{ background: 'var(--bg-cream)', borderRadius: '12px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('order.orderNumber')}</span>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>{order?.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('common.date')}</span>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>{formatDate(order?.date, lang)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('common.status')}</span>
            <span className="status-badge" style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{t('status.' + order.status)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('common.total')}</span>
            <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary)' }}>{order ? convert(order.total) : '—'}</span>
          </div>
        </div>

        {order && order.items && order.items.length > 0 && (
          <div className="scroll-animate" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>{t('order.yourItems')}</h3>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none', fontSize: '14px' }}>
                <span style={{ flex: 1 }}>{item.qty} × {item.name}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{convert(item.priceEUR * item.qty)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="scroll-animate" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/my-orders" className="btn btn-primary premium-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Package size={16} /> {t('account.myOrders')}
          </Link>
          <Link to="/" className="btn btn-outline premium-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
            <ArrowLeft size={16} /> {t('order.backHome')}
          </Link>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;
