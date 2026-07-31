import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowLeft, ShoppingBag, Plus, Minus, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { productsData } from '../data/products';
import './animations.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    { productId: 'prod-001', qty: 2 },
    { productId: 'prod-003', qty: 1 }
  ]);

  const updateQty = (productId, delta) => {
    setCartItems(prev => {
      const item = prev.find(i => i.productId === productId);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) return prev.filter(i => i.productId !== productId);
      return prev.map(i => i.productId === productId ? { ...i, qty: newQty } : i);
    });
  };

  const removeItem = (productId) => {
    setCartItems(prev => prev.filter(i => i.productId !== productId));
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const product = productsData.find(p => p.id === item.productId);
    if (!product) return sum;
    const price = parseFloat(product.price.replace(' € / kg', '').replace(',', '.'));
    return sum + price * item.qty;
  }, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

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
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <ShoppingBag size={36} style={{ color: 'var(--primary)' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Votre panier est vide</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '400px' }}>Découvrez nos produits et ajoutez-les à votre panier pour commencer votre commande.</p>
        <Link to="/boutique" className="btn btn-primary premium-btn" style={{ padding: '14px 28px' }}>Découvrir le catalogue</Link>
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

      <div className="cart-layout scroll-animate" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
        <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cartItems.map(item => {
            const product = productsData.find(p => p.id === item.productId);
            if (!product) return null;
            const price = parseFloat(product.price.replace(' € / kg', '').replace(',', '.'));
            return (
              <div key={item.productId} className="cart-item premium-card" style={{ display: 'flex', gap: '16px', padding: '20px', borderRadius: '12px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#fdfbf7', border: '1px solid var(--border)' }}>
                  <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="cart-item-details" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 className="cart-item-name" style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, color: 'var(--text-dark)', margin: '0 0 4px' }}>{product.title}</h3>
                  <span className="cart-item-spec" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{product.seller}</span>
                  <span className="cart-item-price" style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>{price.toFixed(2)} € / kg</span>
                  <div className="cart-item-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px' }}>
                    <div className="qty-control" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <button className="qty-btn" onClick={() => updateQty(product.id, -1)} style={{ background: 'var(--bg-cream)', border: 'none', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                      <span className="qty-val" style={{ width: '32px', textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(product.id, 1)} style={{ background: 'var(--bg-cream)', border: 'none', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{(price * item.qty).toFixed(2)} €</span>
                      <button className="cart-remove-btn" onClick={() => removeItem(product.id)} aria-label="Supprimer" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', transition: 'color 0.2s' }}>
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
