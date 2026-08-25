import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrders } from '../services/orders';
import './animations.css';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { RowsSkeleton } from '../components/common/Skeletons';

const formatEUR = (value) => `${Number(value).toFixed(2).replace('.', ',')} €`;

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!user) {
      setOrders(null);
      setLoading(false);
      return;
    }
    fetchMyOrders(user.id).then((data) => {
      if (!active) return;
      setOrders(data);
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
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Mes commandes</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Commandes</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Mes Commandes</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Suivez l'historique de vos commandes</p>
        </div>
      </section>

      <div className="scroll-animate" style={{ marginBottom: '32px' }}>
        {loading ? (
          <RowsSkeleton rows={5} />
        ) : notConnected ? (
          <EmptyState
            icon={Lock}
            title="Connectez-vous pour voir vos commandes"
            text="Accédez à l'historique et au suivi de vos commandes après connexion."
            action={
              <Link to="/login" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Se connecter</Link>
            }
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Votre activité commencera ici"
            text="Vos commandes apparaîtront automatiquement dès que vous passerez votre première commande sur la boutique."
            action={
              <Link to="/boutique" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Découvrir le catalogue</Link>
            }
          />
        ) : (
          <div className="data-table-wrapper scroll-animate" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px', background: '#fff' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Commande</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Date</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Total</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Statut</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}></th></tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{order.id}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>{order.date}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>{formatEUR(order.total)}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}><StatusBadge status={order.status} label={order.statusLabel} /></td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}><Link to={`/order/${order.id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>Détails <ArrowRight size={12} /></Link></td>
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
export default MyOrders;
