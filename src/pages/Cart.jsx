import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowLeft, ShoppingBag, Plus, Minus, ShieldCheck, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './animations.css';
import SmartImg from '../components/common/SmartImg';
import EmptyState from '../components/common/EmptyState';

const Cart = () => {
  const { items, subtotal, shipping, total, updateQty, removeItem, notice, dismissNotice } = useCart();

  const cartItems = items;

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {/* Premium Hero */}
        <section className="page-hero" style={{ height: '420px' }}>
          <div className="page-hero-content">
            <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
              <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
                <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
                <li style={{ color: '#fff', fontWeight: 500 }}>Panier</li>
              </ol>
            </nav>
            <span className="page-hero-surtitre anim-fade-up stagger-1">Panier</span>
            <h1 className="page-hero-title anim-fade-up stagger-2">Votre Panier</h1>
            <p className="page-hero-subtitle anim-fade-up stagger-3">Gérez vos articles et finalisez votre commande.</p>
          </div>
        </section>
        <EmptyState
          icon={ShoppingBag}
          title="Votre panier est vide"
          text="Découvrez nos produits d'exception et ajoutez-les à votre panier pour commencer votre commande."
          action={
            <Link to="/boutique" className="btn btn-primary premium-btn" style={{ padding: '14px 28px' }}>Découvrir le catalogue</Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Panier</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Panier</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Votre Panier</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Gérez vos articles et finalisez votre commande.</p>
        </div>
      </section>

      <div className="cart-layout scroll-animate">
        {notice && (
          <div className="cart-notice" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderRadius: '8px', background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid rgba(210,153,34,0.3)', fontSize: '13px', fontWeight: 500 }}>
            <ShieldCheck size={16} />
            <span style={{ flex: 1 }}>{notice}</span>
            <button onClick={dismissNotice} aria-label="Fermer" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}>
              <X size={14} />
            </button>
          </div>
        )}
        <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cartItems.map(item => {
            return (
              <div key={item.productId} className="cart-item premium-card" style={{ display: 'flex', gap: '16px', padding: '20px', borderRadius: '12px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#fdfbf7', border: '1px solid var(--border)' }}>
                  <SmartImg src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="cart-item-details" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 className="cart-item-name" style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, color: 'var(--text-dark)', margin: '0 0 4px' }}>{item.title}</h3>
                  <span className="cart-item-spec" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{item.seller}</span>
                  <span className="cart-item-price" style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>{item.priceEUR.toFixed(2)} € / {item.unit}</span>
                  <div className="cart-item-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px' }}>
                    <div className="qty-control" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <button className="qty-btn" onClick={() => updateQty(item.productId, -1)} style={{ background: 'var(--bg-cream)', border: 'none', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                      <span className="qty-val" style={{ width: '32px', textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.productId, 1)} style={{ background: 'var(--bg-cream)', border: 'none', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{(item.priceEUR * item.qty).toFixed(2)} €</span>
                      <button className="cart-remove-btn" onClick={() => removeItem(item.productId)} aria-label="Supprimer" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', transition: 'color 0.2s' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary scroll-animate" style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Résumé de la commande</h3>
          <div className="cart-summary-line" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <span>Sous-total</span><span>{subtotal.toFixed(2)} €</span>
          </div>
          <div className="cart-summary-line" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <span>Livraison</span><span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>{shipping === 0 ? 'Gratuite' : shipping.toFixed(2) + ' €'}</span>
          </div>
          {shipping === 0 && (
            <div style={{ fontSize: '12px', color: 'var(--success)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Livraison gratuite pour les commandes de plus de 200€
            </div>
          )}
          <div className="cart-summary-total" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)', borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
            <span>Total</span><span>{total.toFixed(2)} €</span>
          </div>
          <Link to="/checkout" className="btn btn-primary cart-checkout-btn" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}>
            Commander
          </Link>
          <Link to="/boutique" className="btn btn-outline" style={{ width: '100%', marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
            <ArrowLeft size={16} /> Continuer vos achats
          </Link>
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
            Paiement sécurisé et garantie qualité inclus
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
