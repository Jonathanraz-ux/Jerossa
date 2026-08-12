import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Lock, Truck, MapPin, Check, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orders';
import './animations.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items: cartItems, subtotal, currency } = useCart();
  const [step, setStep] = useState(1);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postalCode: '', country: 'MG'
  });
  const [formError, setFormError] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderError, setOrderError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('payment') === 'failed') {
      setPaymentFailed(true);
    }
  }, [searchParams]);

  const shippingRates = { standard: 15, express: 35, free: 0 };
  const shippingCost = subtotal > 200 ? shippingRates.free : shippingRates[shippingMethod];
  const total = subtotal + shippingCost;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const goToShipping = () => {
    const missing = !formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.city;
    if (missing) {
      setFormError('Merci de renseigner votre prénom, nom, email, adresse et ville.');
      return;
    }
    setFormError('');
    setStep(2);
  };

  const handleConfirm = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    setOrderError('');

    const orderItems = cartItems.map(i => ({
      product_code: i.productId,
      title: i.title,
      seller: i.seller,
      unit: i.unit,
      price_eur: i.priceEUR,
      quantity: i.qty,
      image_url: i.image,
      currency,
    }));

    const { ok, data, error } = await createOrder({
      items: orderItems,
      subtotal,
      shippingFee: shippingCost,
      total,
      currency,
      paymentMethod,
      address: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      },
    });

    setSubmitting(false);

    if (!ok) {
      console.error('[checkout]', error);
      setOrderError("La commande n'a pas pu être enregistrée. Vérifiez la configuration Supabase puis réessayez.");
      return;
    }

    // Phase 7 : la commande est créée en PENDING, le paiement s'effectue sur
    // la page provider simulé (/payment). Le panier n'est vidé qu'après succès.
    navigate(`/payment?order=${data.order_number}&method=${paymentMethod}`);
  };

  const steps = [
    { num: 1, label: 'Adresse', icon: MapPin },
    { num: 2, label: 'Livraison', icon: Truck },
    { num: 3, label: 'Paiement', icon: CreditCard },
  ];

  return (
    <div className="checkout-page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <nav className="checkout-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <Link to="/cart" style={{ color: 'var(--text-muted)' }}>Panier</Link>
            <span style={{ color: 'var(--border)' }}>/</span>
            <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>Commande</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600 }}>Finaliser la commande</h1>
        </div>

        {/* Steps Progress */}
        <div className="checkout-steps">
          {steps.map((s, i) => {
            const isActive = step >= s.num;
            const isPast = step > s.num;
            return (
              <div key={s.num} className={`checkout-step ${isActive ? 'checkout-step--active' : ''}`}>
                <div className="checkout-step-indicator">
                  {isPast ? <Check size={14} /> : s.num}
                </div>
                <div className="checkout-step-info">
                  <span className="checkout-step-label">{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`checkout-step-line ${step > s.num ? 'checkout-step-line--filled' : ''}`} />}
              </div>
            );
          })}
        </div>

        {paymentFailed && (
          <div className="checkout-pay-failed">
            <AlertTriangle size={18} />
            <div>
              <strong>Le paiement a échoué.</strong>
              <span>Votre panier est conservé — vous pouvez réessayer le paiement ou changer de mode de paiement.</span>
            </div>
            <button className="checkout-pay-failed-close" onClick={() => setPaymentFailed(false)} aria-label="Fermer">×</button>
          </div>
        )}

        <div className="checkout-content">
          {/* Form Panel */}
          <div className="checkout-form">
            {step === 1 && (
              <div>
                <h2 className="checkout-section-title">
                  <MapPin size={18} />
                  Adresse de livraison
                </h2>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prénom</label>
                    <input type="text" name="firstName" className="form-input" value={formData.firstName} onChange={handleChange} placeholder="Jean" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom</label>
                    <input type="text" name="lastName" className="form-input" value={formData.lastName} onChange={handleChange} placeholder="Dupont" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="jean@exemple.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} placeholder="+261 32 123 4567" />
                </div>
                <div className="form-group">
                  <label className="form-label">Adresse</label>
                  <input type="text" name="address" className="form-input" value={formData.address} onChange={handleChange} placeholder="Lot IVT 123, Ambohijatovo" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ville</label>
                    <input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} placeholder="Antananarivo" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Code postal</label>
                    <input type="text" name="postalCode" className="form-input" value={formData.postalCode} onChange={handleChange} placeholder="101" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Pays</label>
                  <select name="country" className="form-select" value={formData.country} onChange={handleChange}>
                    <option value="MG">Madagascar</option>
                    <option value="MU">Île Maurice</option>
                    <option value="FR">France</option>
                    <option value="RE">La Réunion</option>
                  </select>
                </div>
                {formError && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.8125rem' }}>
                    {formError}
                  </div>
                )}
                <button className="checkout-next-btn" onClick={goToShipping}>
                  Continuer <ArrowRight size={16} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="checkout-section-title">
                  <Truck size={18} />
                  Mode de livraison
                </h2>
                <div className="shipping-options">
                  <label className={`shipping-option ${shippingMethod === 'standard' ? 'shipping-option--active' : ''}`}>
                    <input type="radio" name="shipping" value="standard" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} />
                    <div className="shipping-option-content">
                      <div>
                        <strong>Standard</strong>
                        <span>Livraison sous 5-7 jours ouvrés</span>
                      </div>
                      <span className="shipping-option-price">15,00 €</span>
                    </div>
                  </label>
                  <label className={`shipping-option ${shippingMethod === 'express' ? 'shipping-option--active' : ''}`}>
                    <input type="radio" name="shipping" value="express" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} />
                    <div className="shipping-option-content">
                      <div>
                        <strong>Express</strong>
                        <span>Livraison sous 2-3 jours ouvrés</span>
                      </div>
                      <span className="shipping-option-price">35,00 €</span>
                    </div>
                  </label>
                  {subtotal > 200 && (
                    <div className="shipping-free-badge">Livraison offerte !</div>
                  )}
                </div>

                <div className="checkout-nav">
                  <button className="checkout-back-btn" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} /> Retour
                  </button>
                  <button className="checkout-next-btn" onClick={() => setStep(3)}>
                    Continuer <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="checkout-section-title">
                  <CreditCard size={18} />
                  Paiement sécurisé
                </h2>
                <div className="payment-methods">
                  <button className={`payment-method ${paymentMethod === 'card' ? 'payment-method--active' : ''}`} onClick={() => setPaymentMethod('card')}>
                    <CreditCard size={22} />
                    <span>Carte bancaire</span>
                  </button>
                  <button className={`payment-method ${paymentMethod === 'mobile' ? 'payment-method--active' : ''}`} onClick={() => setPaymentMethod('mobile')}>
                    <span style={{ fontSize: '1.25rem' }}>📱</span>
                    <span>Mobile Money</span>
                  </button>
                  <button className={`payment-method ${paymentMethod === 'transfer' ? 'payment-method--active' : ''}`} onClick={() => setPaymentMethod('transfer')}>
                    <span style={{ fontSize: '1.25rem' }}>🏦</span>
                    <span>Virement</span>
                  </button>
                </div>

                <div className="payment-sim">
                  <div className="payment-sim-header">
                    <Lock size={14} />
                    Paiement simulé — environnement de démonstration
                  </div>
                  <div className="payment-sim-body">
                    <div className="payment-sim-card">
                      <div className="payment-sim-card-brand">VISA</div>
                      <div className="payment-sim-card-number">•••• •••• •••• 4242</div>
                      <div className="payment-sim-card-details">
                        <span>VALID THRU 12/28</span>
                        <span>CVV •••</span>
                      </div>
                    </div>
                    <p className="payment-sim-note">Aucune transaction réelle ne sera effectuée. Interface de simulation.</p>
                  </div>
                </div>

                {orderError && (
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.8125rem' }}>
                    {orderError}
                  </div>
                )}

                <div className="checkout-nav">
                  <button className="checkout-back-btn" onClick={() => setStep(2)}>
                    <ArrowLeft size={16} /> Retour
                  </button>
                  <button className="checkout-confirm-btn" onClick={handleConfirm} disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }}>
                    <Lock size={16} /> {submitting ? 'Enregistrement…' : 'Confirmer et payer'}
                  </button>
                </div>

                <div className="checkout-security">
                  <Lock size={14} />
                  <span>Paiement 100% sécurisé — Vos données sont protégées par le chiffrement SSL</span>
                </div>
              </div>
            )}
          </div>

          {/* Summary Panel */}
          <div className="checkout-summary">
            <h3 className="checkout-summary-title">Récapitulatif</h3>
            {cartItems.map(item => (
              <div key={item.productId} className="checkout-summary-item">
                <img src={item.image} alt={item.title} />
                <div>
                  <div className="checkout-summary-item-name">{item.title}</div>
                  <div className="checkout-summary-item-qty">Qté: {item.qty}</div>
                  <div className="checkout-summary-item-price">{(item.priceEUR * item.qty).toFixed(2)} €</div>
                </div>
              </div>
            ))}
            <div className="checkout-summary-divider" />
            <div className="checkout-summary-line">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="checkout-summary-line">
              <span>Livraison</span>
              <span style={{ color: shippingCost === 0 ? 'var(--success)' : 'inherit' }}>
                {shippingCost === 0 ? 'Gratuite' : shippingCost.toFixed(2) + ' €'}
              </span>
            </div>
            <div className="checkout-summary-total">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-page { background: var(--bg-cream); min-height: 100vh; }
        .checkout-steps { display: flex; align-items: center; margin-bottom: 2rem; padding: 1.5rem; background: var(--bg-white); border-radius: var(--radius-lg); border: 1px solid var(--border); }
        .checkout-step { display: flex; align-items: center; gap: 0.75rem; flex: 1; }
        .checkout-step-indicator { width: 32px; height: 32px; border-radius: 50%; background: var(--border); color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 600; flex-shrink: 0; transition: all 0.3s; }
        .checkout-step--active .checkout-step-indicator { background: var(--primary); color: #fff; }
        .checkout-step-label { font-size: 0.8125rem; font-weight: 500; color: var(--text-muted); }
        .checkout-step--active .checkout-step-label { color: var(--text-dark); font-weight: 600; }
        .checkout-step-line { flex: 1; height: 2px; background: var(--border); margin: 0 0.75rem; }
        .checkout-step-line--filled { background: var(--primary); }
        .checkout-content { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start; }
        .checkout-form { background: var(--bg-white); border-radius: var(--radius-lg); border: 1px solid var(--border); padding: 2rem; }
        .checkout-section-title { font-family: var(--font-serif); font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-dark); }
        .checkout-section-title svg { color: var(--primary); }
        .checkout-next-btn { width: 100%; padding: 0.875rem; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; margin-top: 1.5rem; transition: all 0.2s; }
        .checkout-next-btn:hover { background: var(--primary-hover); transform: translateY(-1px); }
        .shipping-options { display: flex; flex-direction: column; gap: 0.75rem; }
        .shipping-option { display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid var(--border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; background: var(--bg-white); }
        .shipping-option:hover { border-color: var(--primary); }
        .shipping-option--active { border-color: var(--primary); background: var(--primary-light); }
        .shipping-option input { accent-color: var(--primary); }
        .shipping-option-content { flex: 1; display: flex; justify-content: space-between; align-items: center; }
        .shipping-option-content strong { font-size: 0.875rem; display: block; color: var(--text-dark); }
        .shipping-option-content span { font-size: 0.75rem; color: var(--text-muted); }
        .shipping-option-price { font-weight: 600; color: var(--text-dark); font-size: 0.875rem; }
        .shipping-free-badge { text-align: center; padding: 0.5rem; background: var(--success-bg); color: var(--success); border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 600; }
        .checkout-nav { display: flex; gap: 1rem; margin-top: 1.5rem; }
        .checkout-back-btn { flex: 1; padding: 0.875rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.875rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: var(--bg-white); color: var(--text-dark); transition: all 0.2s; }
        .checkout-back-btn:hover { border-color: var(--primary); }
        .checkout-confirm-btn { flex: 1; padding: 0.875rem; background: var(--success); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; }
        .checkout-confirm-btn:hover { background: #23663f; transform: translateY(-1px); }
        .payment-methods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
        .payment-method { padding: 1rem; border: 1px solid var(--border); border-radius: var(--radius-md); display: flex; flex-direction: column; align-items: center; gap: 0.5rem; cursor: pointer; background: var(--bg-white); transition: all 0.2s; font-size: 0.8125rem; font-weight: 500; color: var(--text-dark); }
        .payment-method:hover { border-color: var(--primary); }
        .payment-method--active { border-color: var(--primary); background: var(--primary-light); }
        .payment-sim { border: 1px dashed var(--accent); border-radius: var(--radius-md); padding: 1.25rem; background: #fcf9f5; margin-bottom: 1rem; }
        .payment-sim-header { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 600; color: var(--primary); margin-bottom: 1rem; }
        .payment-sim-body { display: flex; flex-direction: column; align-items: center; }
        .payment-sim-card { width: 280px; padding: 1.25rem; background: linear-gradient(135deg, #1a241e 0%, #2a3a30 100%); border-radius: 12px; color: #fff; }
        .payment-sim-card-brand { text-align: right; font-size: 1.25rem; font-weight: 700; letter-spacing: 1px; margin-bottom: 1.5rem; }
        .payment-sim-card-number { font-family: monospace; font-size: 1.1rem; letter-spacing: 3px; margin-bottom: 1rem; }
        .payment-sim-card-details { display: flex; justify-content: space-between; font-size: 0.65rem; opacity: 0.7; }
        .payment-sim-note { margin-top: 0.75rem; font-size: 0.7rem; color: var(--text-muted); text-align: center; }
        .checkout-security { display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; padding: 0.75rem; background: rgba(43,122,75,0.05); border-radius: var(--radius-sm); font-size: 0.7rem; color: var(--text-muted); }
        .checkout-security svg { color: var(--success); flex-shrink: 0; }
        .checkout-summary { background: var(--bg-white); border-radius: var(--radius-lg); border: 1px solid var(--border); padding: 1.5rem; position: sticky; top: 100px; }
        .checkout-summary-title { font-family: var(--font-serif); font-size: 1.125rem; font-weight: 600; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
        .checkout-summary-item { display: flex; gap: 0.75rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
        .checkout-summary-item img { width: 56px; height: 56px; border-radius: var(--radius-sm); object-fit: cover; background: #fdfbf7; border: 1px solid var(--border); }
        .checkout-summary-item-name { font-weight: 600; font-size: 0.8125rem; line-height: 1.4; margin-bottom: 2px; }
        .checkout-summary-item-qty { font-size: 0.75rem; color: var(--text-muted); }
        .checkout-summary-item-price { font-weight: 600; color: var(--primary); font-size: 0.8125rem; }
        .checkout-summary-divider { height: 1px; background: var(--border); margin: 0.75rem 0; }
        .checkout-summary-line { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.8125rem; color: var(--text-muted); }
        .checkout-summary-total { display: flex; justify-content: space-between; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--border); font-weight: 700; font-size: 1rem; color: var(--text-dark); }
        .checkout-summary-total span:last-child { color: var(--primary); }
        .checkout-pay-failed { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding: 1rem 1.25rem; background: var(--danger-bg); color: var(--danger); border: 1px solid var(--danger); border-radius: var(--radius-md); font-size: 0.8125rem; }
        .checkout-pay-failed strong { display: block; }
        .checkout-pay-failed svg { flex-shrink: 0; }
        .checkout-pay-failed-close { margin-left: auto; width: 28px; height: 28px; border: none; background: transparent; color: var(--danger); font-size: 1.25rem; line-height: 1; cursor: pointer; }

        @media (max-width: 1024px) {
          .checkout-content { grid-template-columns: 1fr; }
          .checkout-summary { position: static; }
        }
        @media (max-width: 768px) {
          .checkout-steps { flex-direction: column; gap: 1rem; }
          .checkout-step { width: 100%; }
          .checkout-step-line { display: none; }
          .payment-methods { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
