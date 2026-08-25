import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductByIdentifier, fetchRelatedProducts, fetchProducts } from '../services/catalog';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createQuoteRequest } from '../services/quotes';
import { Star, Truck, Package, ShieldCheck, Heart, Minus, Plus, Check, MapPin, Clock, CreditCard, FileText, Loader2, X } from 'lucide-react';
import './animations.css';
import SmartImg from '../components/common/SmartImg';
import { formatUnitPriceFromEUR } from '../lib/currency.js';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteQuantity, setQuoteQuantity] = useState(1);
  const [quoteDelay, setQuoteDelay] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [quoteDone, setQuoteDone] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchProductByIdentifier(id).then((p) => {
      if (!active) return;
      setProduct(p);
      setLoading(false);
      if (p) {
        fetchRelatedProducts(p, 4).then((related) => {
          if (!active) return;
          if (related.length >= 4) {
            setRelatedProducts(related);
          } else {
            fetchProducts().then((all) => {
              if (!active) return;
              setRelatedProducts(all.filter((x) => x.id !== p.id).slice(0, 4));
            });
          }
        });
      }
    });
    return () => { active = false; };
  }, [id]);

  const handleQuoteSubmit = async () => {
    if (!product) return;
    setQuoteSubmitting(true);
    setQuoteError('');
    const res = await createQuoteRequest({
      productCode: product.id,
      productTitle: product.title,
      sellerId: product.sellerId,
      sellerName: product.seller,
      quantity: quoteQuantity,
      unit: product.unit,
      message: quoteMessage,
      delayRequested: quoteDelay,
      currency: 'EUR',
    });
    setQuoteSubmitting(false);
    if (res.ok) {
      setQuoteDone(res.data);
    } else {
      setQuoteError(res.error?.message || "Une erreur est survenue. Réessayez.");
    }
  };

  if (loading) {
    return (
      <div className="pd-page">
        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)' }}>Chargement…</h2>
          <p style={{ color: 'var(--text-muted)' }}>Récupération du produit.</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-page">
        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)' }}>Produit introuvable</h2>
          <p style={{ color: 'var(--text-muted)' }}>Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link to="/boutique" className="btn btn-primary">Retour au catalogue</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-page">
      {/* Breadcrumb */}
      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: 0 }}>
        <nav className="pd-breadcrumb">
          <Link to="/">Accueil</Link>
          <span className="pd-breadcrumb-sep">/</span>
          <Link to="/boutique">Boutique</Link>
          <span className="pd-breadcrumb-sep">/</span>
          <span>{product.title}</span>
        </nav>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="pd-layout">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-image">
              <SmartImg src={product.images[selectedImage]} alt={product.title} />
              {product.tag && <span className="pd-badge">{product.tag}</span>}
            </div>
            {product.images.length > 1 && (
              <div className="pd-thumbnails">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-thumb ${i === selectedImage ? 'pd-thumb--active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <SmartImg src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <div className="pd-seller">{product.seller}</div>
            <h1 className="pd-title">{product.title}</h1>

            <div className="pd-rating">
              <div className="stars">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} fill={j < Math.floor(product.rating) ? "#d4a373" : "rgba(212,163,115,0.25)"} color="#d4a373" />
                ))}
              </div>
              <span className="pd-rating-text">{product.rating} ({product.reviews} avis)</span>
            </div>

            <div className="pd-divider" />

            <div className="pd-price-row">
              <span className="pd-price">{formatUnitPriceFromEUR(product.priceEUR, product.unit, 'EUR')}</span>
              <span className="pd-stock">
                <Check size={14} /> {product.stock}
              </span>
            </div>

            <p className="pd-desc">{product.description}</p>

            {product.variants && product.variants.length > 0 && (
              <div className="pd-variants">
                <label className="pd-var-label">Options disponibles</label>
                <div className="pd-var-options">
                  {product.variants.map((v, i) => (
                    <button
                      key={i}
                      className={`pd-var-opt ${i === selectedVariant ? 'pd-var-opt--active' : ''}`}
                      onClick={() => setSelectedVariant(i)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pd-logistics">
              <div className="pd-log-item">
                <Package size={15} />
                <span><strong>Stock :</strong> {product.stock}</span>
              </div>
              <div className="pd-log-item">
                <Truck size={15} />
                <span><strong>Livraison :</strong> {product.delivery}</span>
              </div>
              <div className="pd-log-item">
                <ShieldCheck size={15} />
                <span><strong>Paiement sécurisé</strong> — Garantie Qualité Jerossa</span>
              </div>
              <div className="pd-log-item">
                <MapPin size={15} />
                <span><strong>Origine :</strong> {product.origin}</span>
              </div>
            </div>

            <div className="pd-qty-row">
              <span className="pd-qty-label">Quantité</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={13} /></button>
                <span className="qty-val">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}><Plus size={13} /></button>
              </div>
            </div>

            <div className="pd-actions">
              <button
                className="pd-add-cart"
                onClick={() => { addItem(product, quantity); setAddedToCart(true); setTimeout(() => setAddedToCart(false), 2000); }}
              >
                {addedToCart ? <><Check size={16} /> Ajouté au panier</> : <>Ajouter au panier</>}
              </button>
              <button className="pd-buy-now" onClick={() => { addItem(product, quantity); navigate('/checkout'); }}>
                Acheter maintenant
              </button>
              <button
                className="pd-wishlist-btn"
                onClick={() => setAddedToWishlist(!addedToWishlist)}
                aria-label="Ajouter aux favoris"
              >
                <Heart size={18} fill={addedToWishlist ? '#c0392b' : 'none'} color={addedToWishlist ? '#c0392b' : 'var(--text-muted)'} />
              </button>
            </div>

            <button className="pd-quote-btn" onClick={() => { setQuoteQuantity(1); setQuoteDelay(''); setQuoteMessage(''); setQuoteError(''); setQuoteDone(null); setQuoteOpen(true); }}>
              <FileText size={16} /> Demander un devis
            </button>

            <div className="pd-trust">
              <div className="pd-trust-item">
                <CreditCard size={14} />
                <span>Paiement 100% sécurisé</span>
              </div>
              <div className="pd-trust-item">
                <Clock size={14} />
                <span>Livraison rapide & traçable</span>
              </div>
              <div className="pd-trust-item">
                <ShieldCheck size={14} />
                <span>Produits authentiques certifiés</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pd-related">
            <h2 className="pd-related-title">Produits similaires</h2>
            <div className="pd-related-grid">
              {relatedProducts.map((prod) => (
                <Link key={prod.id} to={`/product/${prod.id}`} className="catalog-product-card">
                  <div className="catalog-product-image">
                    <SmartImg src={prod.images[0]} alt={prod.title} />
                    {prod.tag && <span className="catalog-product-badge">{prod.tag}</span>}
                  </div>
                  <div className="catalog-product-body">
                    <span className="catalog-product-seller">{prod.seller}</span>
                    <h3 className="catalog-product-name">{prod.title}</h3>
                    <div className="catalog-product-footer">
                      <span className="catalog-product-price">{formatUnitPriceFromEUR(prod.priceEUR, prod.unit, 'EUR')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {quoteOpen && (
        <div className="j-modal-backdrop" onClick={() => setQuoteOpen(false)}>
          <div className="j-modal-panel quote-modal" onClick={(e) => e.stopPropagation()}>
            <div className="quote-modal-header">
              <div>
                <h3>Demander un devis</h3>
                <p>{product.title} — {product.seller}</p>
              </div>
              <button className="quote-modal-close" onClick={() => setQuoteOpen(false)} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            {quoteDone ? (
              <div className="quote-modal-body">
                <div className="quote-modal-success">
                  <div className="quote-modal-success-icon"><Check size={22} /></div>
                  <h4>Demande envoyée</h4>
                  <p>Votre référence de demande :</p>
                  <div className="quote-modal-ref">{quoteDone.quote_number}</div>
                  <p className="quote-modal-note">
                    {user ? 'Vous pouvez suivre la réponse du vendeur dans « Mes devis ».'
                      : 'Connectez-vous à votre compte pour retrouver cette demande dans « Mes devis », ou conservez votre référence.'}
                  </p>
                </div>
                <div className="quote-modal-actions">
                  <Link to={`/quote/${quoteDone.quote_number}`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    Suivre ma demande
                  </Link>
                  <button className="btn btn-outline" onClick={() => setQuoteOpen(false)}>Fermer</button>
                </div>
              </div>
            ) : (
              <div className="quote-modal-body">
                <div className="quote-modal-field">
                  <label>Quantité souhaitée</label>
                  <div className="quote-modal-qty">
                    <button type="button" className="qty-btn" onClick={() => setQuoteQuantity(q => Math.max(1, q - 1))}><Minus size={13} /></button>
                    <span className="qty-val">{quoteQuantity}</span>
                    <button type="button" className="qty-btn" onClick={() => setQuoteQuantity(q => q + 1)}><Plus size={13} /></button>
                    <span className="quote-modal-unit">/ {product.unit}</span>
                  </div>
                </div>
                <div className="quote-modal-field">
                  <label>Délai souhaité</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex. : sous 2 semaines"
                    value={quoteDelay}
                    onChange={(e) => setQuoteDelay(e.target.value)}
                  />
                </div>
                <div className="quote-modal-field">
                  <label>Détails de votre demande</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Précisez vos besoins (quantité exacte, conditionnement, destination…)"
                    value={quoteMessage}
                    onChange={(e) => setQuoteMessage(e.target.value)}
                  />
                </div>

                {quoteError && <div className="quote-modal-error">{quoteError}</div>}

                <div className="quote-modal-actions">
                  <button className="btn btn-primary" onClick={handleQuoteSubmit} disabled={quoteSubmitting}>
                    {quoteSubmitting ? <><Loader2 size={16} className="spin" /> Envoi…</> : 'Envoyer ma demande'}
                  </button>
                  <button className="btn btn-outline" onClick={() => setQuoteOpen(false)}>Annuler</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .pd-page { background: var(--bg-white); min-height: 100vh; }
        .pd-breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-muted); }
        .pd-breadcrumb a { color: var(--text-muted); }
        .pd-breadcrumb a:hover { color: var(--primary); }
        .pd-breadcrumb-sep { color: var(--border); }
        .pd-layout { display: grid; grid-template-columns: 1fr 1.1fr; gap: 3rem; align-items: start; }
        .pd-gallery { position: sticky; top: 100px; }
        .pd-main-image { position: relative; border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 1; background: #faf8f5; border: 1px solid var(--border); }
        .pd-main-image img { width: 100%; height: 100%; object-fit: cover; }
        .pd-badge { position: absolute; top: 1rem; left: 1rem; background: var(--primary); color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; z-index: 2; }
        .pd-thumbnails { display: flex; gap: 0.625rem; margin-top: 0.75rem; }
        .pd-thumb { width: 70px; height: 70px; border-radius: var(--radius-sm); overflow: hidden; border: 2px solid var(--border); cursor: pointer; padding: 0; background: none; transition: border-color 0.2s; }
        .pd-thumb--active { border-color: var(--primary); }
        .pd-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .pd-seller { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--primary); letter-spacing: 0.5px; margin-bottom: 0.5rem; }
        .pd-title { font-family: var(--font-serif); font-size: 2rem; font-weight: 600; color: var(--text-dark); line-height: 1.3; margin-bottom: 0.75rem; }
        .pd-rating { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
        .pd-rating-text { font-size: 0.85rem; color: var(--text-muted); }
        .pd-divider { height: 1px; background: var(--border); margin-bottom: 1.25rem; }
        .pd-price-row { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1.25rem; }
        .pd-price { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; color: var(--primary); }
        .pd-stock { font-size: 0.8125rem; color: var(--success); font-weight: 600; display: flex; align-items: center; gap: 4px; }
        .pd-desc { font-size: 0.9rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 1.5rem; }
        .pd-variants { margin-bottom: 1.5rem; }
        .pd-var-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-dark); margin-bottom: 0.5rem; display: block; letter-spacing: 0.5px; }
        .pd-var-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .pd-var-opt { padding: 0.5rem 1rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 500; cursor: pointer; background: transparent; color: var(--text-dark); transition: var(--transition); }
        .pd-var-opt:hover { border-color: var(--primary); }
        .pd-var-opt--active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); font-weight: 600; }
        .pd-logistics { display: flex; flex-direction: column; gap: 0.625rem; margin-bottom: 1.5rem; padding: 1.25rem; background: var(--bg-cream); border-radius: var(--radius-md); border: 1px solid var(--border); }
        .pd-log-item { display: flex; align-items: center; gap: 0.625rem; font-size: 0.8125rem; color: var(--text-dark); }
        .pd-log-item svg { color: var(--primary); flex-shrink: 0; }
        .pd-qty-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .pd-qty-label { font-size: 0.8125rem; font-weight: 600; color: var(--text-dark); }
        .pd-actions { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
        .pd-add-cart { flex: 1; padding: 0.875rem 1.5rem; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.875rem; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s; }
        .pd-add-cart:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(140,98,57,0.25); }
        .pd-buy-now { flex: 1; padding: 0.875rem 1.5rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-weight: 600; font-size: 0.875rem; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: transparent; color: var(--text-dark); text-decoration: none; transition: all 0.2s; }
        .pd-buy-now:hover { border-color: var(--primary); color: var(--primary); }
        .pd-wishlist-btn { width: 48px; height: 48px; border-radius: var(--radius-sm); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; background: transparent; color: var(--text-muted); transition: all 0.2s; flex-shrink: 0; font-family: inherit; }
        .pd-wishlist-btn:hover { border-color: var(--danger); background: var(--danger-bg); }
        .pd-quote-btn { width: 100%; padding: 0.75rem 1.5rem; border: 1px dashed var(--primary); background: var(--primary-light); color: var(--primary); border-radius: var(--radius-sm); font-weight: 600; font-size: 0.875rem; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1.5rem; transition: all 0.2s; }
        .pd-quote-btn:hover { background: var(--primary); color: #fff; border-style: solid; }
        .quote-modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.5rem 1.5rem 1rem; border-bottom: 1px solid var(--border); }
        .quote-modal-header h3 { font-family: var(--font-serif); font-size: 1.25rem; font-weight: 600; margin-bottom: 2px; }
        .quote-modal-header p { font-size: 0.8rem; color: var(--text-muted); }
        .quote-modal-close { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .quote-modal-close:hover { border-color: var(--danger); color: var(--danger); }
        .quote-modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .quote-modal-field { display: flex; flex-direction: column; gap: 0.5rem; }
        .quote-modal-field label { font-size: 0.8125rem; font-weight: 600; color: var(--text-dark); }
        .quote-modal-qty { display: flex; align-items: center; gap: 0.75rem; }
        .quote-modal-unit { font-size: 0.8125rem; color: var(--text-muted); }
        .form-textarea { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-family: inherit; font-size: 0.875rem; color: var(--text-dark); background: var(--bg-white); resize: vertical; }
        .form-textarea:focus { outline: none; border-color: var(--primary); }
        .quote-modal-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .quote-modal-actions .btn { text-decoration: none; }
        .quote-modal-error { padding: 0.75rem 1rem; background: var(--danger-bg); color: var(--danger); border: 1px solid var(--danger); border-radius: var(--radius-sm); font-size: 0.8125rem; }
        .quote-modal-success { text-align: center; padding: 1rem 0 0.5rem; }
        .quote-modal-success-icon { width: 52px; height: 52px; margin: 0 auto 0.75rem; border-radius: 50%; background: var(--success-bg); color: var(--success); display: flex; align-items: center; justify-content: center; }
        .quote-modal-success h4 { font-family: var(--font-serif); font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; }
        .quote-modal-success p { font-size: 0.85rem; color: var(--text-muted); }
        .quote-modal-ref { display: inline-block; margin: 0.5rem 0; padding: 0.5rem 1rem; background: var(--bg-cream); border: 1px dashed var(--border); border-radius: var(--radius-sm); font-family: var(--font-display); font-weight: 700; color: var(--primary); letter-spacing: 0.5px; }
        .quote-modal-note { font-size: 0.75rem; color: var(--text-muted); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .pd-trust { display: flex; gap: 1.5rem; flex-wrap: wrap; padding: 1rem 0; }
        .pd-trust-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-muted); }
        .pd-trust-item svg { color: var(--success); }
        .pd-related { margin-top: 4rem; padding-top: 3rem; border-top: 1px solid var(--border); }
        .pd-related-title { font-family: var(--font-serif); font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; }
        .pd-related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
        .catalog-product-card {
          background: var(--bg-white); border-radius: var(--radius-lg); border: 1px solid var(--border);
          overflow: hidden; transition: all 0.3s; display: flex; flex-direction: column; text-decoration: none; color: inherit;
        }
        .catalog-product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--accent); }
        .catalog-product-image { position: relative; aspect-ratio: 1; background: #faf8f5; overflow: hidden; }
        .catalog-product-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .catalog-product-card:hover .catalog-product-image img { transform: scale(1.05); }
        .catalog-product-badge { position: absolute; top: 0.75rem; left: 0.75rem; background: rgba(26,36,30,0.85); color: #fff; padding: 3px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 600; z-index: 2; }
        .catalog-product-body { padding: 1rem; display: flex; flex-direction: column; flex: 1; }
        .catalog-product-seller { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; color: var(--primary); letter-spacing: 0.5px; margin-bottom: 4px; }
        .catalog-product-name { font-family: var(--font-serif); font-size: 0.9rem; font-weight: 600; color: var(--text-dark); line-height: 1.4; margin-bottom: 0.5rem; }
        .catalog-product-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.5rem; border-top: 1px solid var(--border); }
        .catalog-product-price { font-family: var(--font-display); font-size: 0.95rem; font-weight: 700; color: var(--primary); }

        @media (max-width: 1024px) {
          .pd-layout { grid-template-columns: 1fr; gap: 2rem; }
          .pd-gallery { position: static; }
          .pd-related-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .pd-title { font-size: 1.5rem; }
          .pd-actions { flex-wrap: wrap; }
          .pd-related-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        }
        @media (max-width: 480px) {
          .pd-related-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
