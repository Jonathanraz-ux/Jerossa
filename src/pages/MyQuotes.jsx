import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchMyQuoteRequests } from '../services/quotes';
import './animations.css';

const statusStyles = {
  pending: { background: 'var(--warning-bg)', color: 'var(--warning)' },
  responded: { background: '#eff6ff', color: '#1d4ed8' },
  accepted: { background: 'var(--success-bg)', color: 'var(--success)' },
  declined: { background: 'var(--danger-bg)', color: 'var(--danger)' },
};

const MyQuotes = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!user) {
      setQuotes(null);
      setLoading(false);
      return;
    }
    fetchMyQuoteRequests(user.id).then((data) => {
      if (!active) return;
      setQuotes(data);
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
              <li style={{ color: '#fff', fontWeight: 500 }}>Mes devis</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Devis</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Mes Devis</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Suivez vos demandes de devis et leurs réponses</p>
        </div>
      </section>

      <div className="scroll-animate" style={{ marginBottom: '32px' }}>
        {loading ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px 0', background: 'var(--bg-cream)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>Chargement…</h3>
            <p style={{ color: 'var(--text-muted)' }}>Récupération de vos demandes de devis.</p>
          </div>
        ) : notConnected ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px 0', background: 'var(--bg-cream)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Lock size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>Connectez-vous pour voir vos devis</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Retrouvez vos demandes de devis et les réponses des vendeurs après connexion.</p>
            <Link to="/login" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Se connecter</Link>
          </div>
        ) : quotes.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px 0', background: 'var(--bg-cream)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>Aucune demande de devis</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Vous n'avez pas encore demandé de devis. Sur chaque fiche produit, cliquez sur « Demander un devis ».</p>
            <Link to="/boutique" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Découvrir le catalogue</Link>
          </div>
        ) : (
          <div className="data-table-wrapper scroll-animate" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px', background: '#fff' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Référence</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Date</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Produit</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Quantité</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>Statut</th><th style={{ background: 'var(--bg-cream)', padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}></th></tr>
              </thead>
              <tbody>
                {quotes.map(quote => (
                  <tr key={quote.id}>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{quote.id}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>{quote.date}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>{quote.productTitle}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>{quote.quantity} {quote.unit}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}><span className="status-badge" style={{ display: 'inline-flex', padding: '4px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '20px', textTransform: 'uppercase', ...(statusStyles[quote.status] || {}) }}>{quote.statusLabel}</span></td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}><Link to={`/quote/${quote.id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>Détails <ArrowRight size={12} /></Link></td>
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
export default MyQuotes;
