import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowLeft, Loader2 } from 'lucide-react';
import { fetchOrderByNumber } from '../services/orders';
import './animations.css';

const formatEUR = (value) => `${Number(value).toFixed(2).replace('.', ',')} €`;

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!ref);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ref) { setLoading(false); return; }
    let active = true;
    fetchOrderByNumber(ref).then((fetched) => {
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
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Confirmation</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Confirmation</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Merci pour votre commande !</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Votre commande a été confirmée avec succès.</p>
        </div>
      </section>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Chargement de la commande…</p>
          </div>
        ) : error || !order ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Commande introuvable</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {ref ? `Aucune commande trouvée pour la référence ${ref}.` : 'Aucune référence de commande fournie.'}
            </p>
            <Link to="/my-orders" className="btn btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: '8px' }}>
              Voir mes commandes
            </Link>
          </div>
        ) : (
          <>
        <div className="scroll-animate" style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={48} style={{ color: 'var(--success)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 600, marginBottom: '8px' }}>Merci pour votre commande !</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Votre commande a été confirmée. Vous recevrez un email de confirmation sous peu.</p>
        </div>

        <div className="scroll-animate" style={{ background: 'var(--bg-cream)', borderRadius: '12px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Numéro de commande</span>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>{order?.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Date</span>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>{order?.date}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Statut</span>
            <span className="status-badge" style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{order?.statusLabel}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total</span>
            <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary)' }}>{order ? formatEUR(order.total) : '—'}</span>
          </div>
        </div>

        {order && order.items && order.items.length > 0 && (
          <div className="scroll-animate" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Vos articles</h3>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none', fontSize: '14px' }}>
                <span style={{ flex: 1 }}>{item.qty} × {item.name}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.price || formatEUR(item.priceEUR * item.qty)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="scroll-animate" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/my-orders" className="btn btn-primary premium-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Package size={16} /> Mes commandes
          </Link>
          <Link to="/" className="btn btn-outline premium-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;
