import React from 'react';
import { Link } from 'react-router-dom';
import { ordersData } from '../data/orders';
import { Package, ArrowRight } from 'lucide-react';
import './animations.css';

const MyOrders = () => {
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
        {ordersData.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px 0', background: 'var(--bg-cream)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>Aucune commande</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Vous n\'avez pas encore de commande.</p>
            <Link to="/boutique" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Découvrir le catalogue</Link>
          </div>
        ) : (
          <div className="data-table-wrapper scroll-animate" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px', background: '#fff' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Commande</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Date</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Total</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Statut</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}></th></tr>
              </thead>
              <tbody>
                {ordersData.map(order => (
                  <tr key={order.id}>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{order.id}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>{order.date}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>{order.total}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}><span className="status-badge" style={{ display: 'inline-flex', padding: '4px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '20px', textTransform: 'uppercase', background: order.status === 'delivered' ? 'var(--success-bg)' : order.status === 'shipped' ? '#eff6ff' : order.status === 'pending' ? 'var(--warning-bg)' : 'var(--danger-bg)', color: order.status === 'delivered' ? 'var(--success)' : order.status === 'shipped' ? '#1d4ed8' : order.status === 'pending' ? 'var(--warning)' : 'var(--danger)' }}>{order.status}</span></td>
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