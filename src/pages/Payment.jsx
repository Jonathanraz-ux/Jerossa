import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CreditCard, Smartphone, Landmark, ShieldCheck, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { fetchOrderByNumber, confirmPayment } from '../services/orders';
import { useCart } from '../context/CartContext';
import './animations.css';

const METHOD_META = {
  card: { label: 'Carte bancaire', icon: CreditCard },
  mobile: { label: 'Mobile Money', icon: Smartphone },
  transfer: { label: 'Virement', icon: Landmark },
};

const formatEUR = (value) => `${Number(value).toFixed(2).replace('.', ',')} €`;

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const orderNumber = searchParams.get('order') || '';
  const method = METHOD_META[searchParams.get('method')] ? searchParams.get('method') : 'card';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    if (!orderNumber) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    fetchOrderByNumber(orderNumber).then((fetched) => {
      if (!active) return;
      setOrder(fetched);
      setNotFound(!fetched);
      setLoading(false);
    });
    return () => { active = false; };
  }, [orderNumber]);

  const handlePay = async (success) => {
    if (!order) return;
    setPaying(true);
    setPayError('');
    const res = await confirmPayment(orderNumber, success, 'simulate');
    setPaying(false);

    if (!res.ok) {
      setPayError(res.error?.message || "Le paiement n'a pas pu être traité. Réessayez.");
      return;
    }

    if (success) {
      clearCart();
      navigate(`/order-confirmation?ref=${orderNumber}`);
    } else {
      navigate('/checkout?payment=failed');
    }
  };

  const alreadyPaid = order && order.paymentStatus === 'paid';

  return (
    <div className="container page-container">
      {/* Hero */}
      <section className="page-hero" style={{ height: '300px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Paiement sécurisé</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Paiement</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Paiement sécurisé</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Mode de paiement : {METHOD_META[method].label} — simulation de démonstration</p>
        </div>
      </section>

      <div style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '3rem' }}>
        {loading ? (
          <div className="scroll-animate" style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Chargement de la commande…</p>
          </div>
        ) : notFound ? (
          <div className="scroll-animate empty-state" style={{ textAlign: 'center', padding: '60px 0', background: 'var(--bg-cream)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <AlertTriangle size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>Commande introuvable</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Aucune commande en attente de paiement n'a été trouvée pour cette référence.</p>
            <Link to="/checkout" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Retour au paiement</Link>
          </div>
        ) : alreadyPaid ? (
          <div className="scroll-animate empty-state" style={{ textAlign: 'center', padding: '60px 0', background: 'var(--success-bg)', borderRadius: '12px', border: '1px solid var(--success)' }}>
            <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>Paiement déjà confirmé</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>La commande {orderNumber} a déjà été payée.</p>
            <Link to={`/order-confirmation?ref=${orderNumber}`} className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Voir la confirmation</Link>
          </div>
        ) : (
          <>
            {/* Récapitulatif */}
            <div className="scroll-animate" style={{ background: 'var(--bg-cream)', borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'left' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Résumé de la commande {orderNumber}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span>Sous-total</span><span>{formatEUR(order.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span>Livraison</span><span>{order.shippingFee === 0 ? 'Gratuite' : formatEUR(order.shippingFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border)', fontWeight: 700 }}>
                <span>Total</span><span>{formatEUR(order.total)}</span>
              </div>
            </div>

            {/* Provider simulé */}
            <div className="scroll-animate pay-provider" style={{ marginBottom: '24px' }}>
              <div className="pay-provider-header">
                <div className="pay-provider-brand">
                  {method === 'card' && <CreditCard size={20} />}
                  {method === 'mobile' && <Smartphone size={20} />}
                  {method === 'transfer' && <Landmark size={20} />}
                  {METHOD_META[method].label}
                </div>
                <span className="pay-provider-sim"><Lock size={12} /> SIMULATION</span>
              </div>

              <div className="pay-provider-body">
                {method === 'card' && (
                  <>
                    <div className="pay-card">
                      <div className="pay-card-brand">VISA</div>
                      <div className="pay-card-number">4242 4242 4242 4242</div>
                      <div className="pay-card-details">
                        <span>VALID THRU 12/28</span>
                        <span>CVV •••</span>
                      </div>
                    </div>
                    <p className="pay-note">Carte de test fictive — aucun débit réel ne sera effectué.</p>
                  </>
                )}

                {method === 'mobile' && (
                  <>
                    <div className="pay-mobile">
                      <div className="pay-mobile-top">
                        <span>Mobile Money</span>
                        <span>MADAGASCAR · MAURICE</span>
                      </div>
                      <div className="pay-mobile-phone">
                        <span className="pay-mobile-label">Numéro de téléphone</span>
                        <span className="pay-mobile-number">+261 32 000 0000</span>
                      </div>
                      <div className="pay-mobile-pin">
                        <span className="pay-mobile-label">Code secret</span>
                        <span className="pay-mobile-dots">••••</span>
                      </div>
                    </div>
                    <p className="pay-note">Confirmation simulée — aucune transaction réelle (Orange Money / MVola / MCB).</p>
                  </>
                )}

                {method === 'transfer' && (
                  <>
                    <div className="pay-bank">
                      <div className="pay-bank-row">
                        <span className="pay-bank-label">Bénéficiaire</span>
                        <span>Jerossa SAS</span>
                      </div>
                      <div className="pay-bank-row">
                        <span className="pay-bank-label">IBAN</span>
                        <span>FR76 0000 0000 0000 0000 0000 000</span>
                      </div>
                      <div className="pay-bank-row">
                        <span className="pay-bank-label">Référence à rappeler</span>
                        <span>{orderNumber}</span>
                      </div>
                    </div>
                    <p className="pay-note">Virement simulé — la commande sera considérée payée immédiatement.</p>
                  </>
                )}
              </div>
            </div>

            {payError && (
              <div className="scroll-animate" style={{ marginBottom: '24px', padding: '14px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} /> {payError}
              </div>
            )}

            <div className="scroll-animate pay-actions">
              <button className="btn btn-primary premium-btn" onClick={() => handlePay(true)} disabled={paying} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '8px', fontWeight: 600, color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', opacity: paying ? 0.7 : 1 }}>
                {paying ? <><Loader2 size={16} className="spin" /> Traitement…</> : <><Lock size={16} /> Confirmer le paiement (simulation)</>}
              </button>
              <button className="btn btn-outline premium-btn" onClick={() => handlePay(false)} disabled={paying} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', fontWeight: 600, border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                <XCircle size={16} /> Simuler un échec de paiement
              </button>
            </div>

            <div className="scroll-animate" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
              Paiement 100% sécurisé — vos données sont protégées par le chiffrement SSL
            </div>
          </>
        )}
      </div>

      <style>{`
        .pay-provider { border: 1px dashed var(--accent); border-radius: 12px; overflow: hidden; background: #fcf9f5; }
        .pay-provider-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--bg-cream); border-bottom: 1px solid var(--border); }
        .pay-provider-brand { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; color: var(--text-dark); }
        .pay-provider-brand svg { color: var(--primary); }
        .pay-provider-sim { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; color: var(--primary); background: var(--primary-light); padding: 3px 8px; border-radius: 20px; }
        .pay-provider-body { padding: 24px; display: flex; flex-direction: column; align-items: center; }
        .pay-card { width: 280px; padding: 20px; background: linear-gradient(135deg, #1a241e 0%, #2a3a30 100%); border-radius: 14px; color: #fff; }
        .pay-card-brand { text-align: right; font-size: 20px; font-weight: 700; letter-spacing: 1px; margin-bottom: 24px; }
        .pay-card-number { font-family: monospace; font-size: 16px; letter-spacing: 3px; margin-bottom: 16px; }
        .pay-card-details { display: flex; justify-content: space-between; font-size: 10px; opacity: 0.7; }
        .pay-mobile { width: 280px; background: var(--bg-white); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
        .pay-mobile-top { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 20px; }
        .pay-mobile-phone, .pay-mobile-pin { margin-bottom: 16px; }
        .pay-mobile-phone { border-bottom: 1px dashed var(--border); padding-bottom: 16px; }
        .pay-mobile-label { display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
        .pay-mobile-number { font-size: 15px; font-weight: 600; color: var(--text-dark); letter-spacing: 0.5px; }
        .pay-mobile-dots { font-size: 18px; letter-spacing: 4px; color: var(--primary); }
        .pay-bank { width: 280px; background: var(--bg-white); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
        .pay-bank-row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px dashed var(--border); font-size: 13px; }
        .pay-bank-row:last-child { border-bottom: none; }
        .pay-bank-label { color: var(--text-muted); }
        .pay-note { margin-top: 12px; font-size: 12px; color: var(--text-muted); text-align: center; }
        .pay-actions { display: flex; flex-direction: column; gap: 10px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Payment;
