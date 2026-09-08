import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useCurrency } from '../context/CurrencyContext';
import { fetchMyRefunds } from '../services/refunds';
import { formatDate } from '../i18n';
import './animations.css';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { RowsSkeleton } from '../components/common/Skeletons';

const MyRefunds = () => {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { convert } = useCurrency();
  const [refunds, setRefunds] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!user) {
      setRefunds(null);
      setLoading(false);
      return;
    }
    fetchMyRefunds(user.id).then((data) => {
      if (!active) return;
      setRefunds(data);
      setLoading(false);
    });
    return () => { active = false; };
  }, [user]);

  const notConnected = !user;

  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('refund.myRefunds')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('refund.refunds')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('refund.myRefundsTitle')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('refund.myRefundsSubtitle')}</p>
        </div>
      </section>

      <div className="scroll-animate" style={{ marginBottom: '32px' }}>
        {loading ? (
          <RowsSkeleton rows={4} />
        ) : notConnected ? (
          <EmptyState
            icon={Lock}
            title={t('refund.loginTitle')}
            text={t('refund.loginText')}
            action={
              <Link to="/login" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>{t('auth.login')}</Link>
            }
          />
        ) : refunds.length === 0 ? (
          <EmptyState
            icon={RotateCcw}
            title={t('refund.emptyTitle')}
            text={t('refund.emptyText')}
            action={
              <Link to="/my-orders" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>{t('account.myOrders')}</Link>
            }
          />
        ) : (
          <div className="data-table-wrapper scroll-animate" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px', background: '#fff' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>{t('quotePage.reference')}</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>{t('refund.order')}</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>{t('common.date')}</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>{t('refund.amount')}</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>{t('common.status')}</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}></th></tr>
              </thead>
              <tbody>
                {refunds.map(refund => (
                  <tr key={refund.id}>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{refund.id}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>{refund.orderNumber}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>{formatDate(refund.date, lang)}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>{convert(refund.amountRequested)}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}><StatusBadge status={refund.status} /></td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}><Link to={`/refund/${refund.id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>{t('account.details')} <ArrowRight size={12} /></Link></td>
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
export default MyRefunds;
