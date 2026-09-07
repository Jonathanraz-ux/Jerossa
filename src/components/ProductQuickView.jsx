import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, Star, Truck, Package, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { fetchProductByIdentifier } from '../services/catalog';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import './ProductQuickView.css';
import SmartImg from './common/SmartImg';
import { formatUnitPriceFromEUR } from '../lib/currency.js';

const ProductQuickView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const productId = searchParams.get('product');
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { t } = useLang();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductByIdentifier(productId).then(setProduct);
    } else {
      setProduct(null);
    }
  }, [productId]);

  // Close modal handler
  const closeQuickView = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('product');
    setSearchParams(newParams);
  };

  const handleAddToCart = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(product, 1);
    closeQuickView();
    navigate('/checkout');
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeQuickView();
      }
    };
    if (product) {
      window.addEventListener('keydown', handleEsc);
      // Prevent body scrolling when open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [product]);

  if (!product) return null;

  return (
    <div className="quickview-backdrop" onClick={closeQuickView}>
      <div 
        className="quickview-panel" 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickview-title"
      >
        <button className="quickview-close" onClick={closeQuickView} aria-label={t('common.close')}>
          <X size={24} />
        </button>

        <div className="quickview-content">
          <div className="quickview-image-container">
            <SmartImg src={product.images[0]} alt={product.title} className="quickview-main-image" />
            <div className="quickview-tag">{product.tag}</div>
          </div>
          
          <div className="quickview-details">
            <div className="quickview-seller">{product.seller}</div>
            <h2 id="quickview-title" className="quickview-title">{product.title}</h2>
            
            <div className="quickview-rating">
              <div className="stars">
                {[...Array(5)].map((_, j) => (
                  <Star 
                    key={j} 
                    size={16} 
                    fill={j < Math.floor(product.rating) ? "#e9c46a" : "transparent"} 
                    color="#e9c46a" 
                  />
                ))}
              </div>
              <span className="reviews-count">{product.rating} ({product.reviews} {t('product.reviews')})</span>
            </div>

            <div className="quickview-price">{formatUnitPriceFromEUR(product.priceEUR, product.unit, 'EUR')}</div>

            <p className="quickview-description">{product.description}</p>

            {product.variants && product.variants.length > 0 && (
              <div className="quickview-variants">
                <h4>{t('product.optionsAvailable')} :</h4>
                <div className="variants-list">
                  {product.variants.map((variant, idx) => (
                    <button key={idx} className={`variant-btn ${idx === 0 ? 'active' : ''}`}>
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="quickview-logistics">
              <div className="logistic-item">
                <Package size={20} className="logistic-icon" />
                <span><strong>{t('product.stock')} :</strong> {product.stock}</span>
              </div>
              <div className="logistic-item">
                <Truck size={20} className="logistic-icon" />
                <span><strong>{t('product.delivery')} :</strong> {product.delivery}</span>
              </div>
              <div className="logistic-item">
                <ShieldCheck size={20} className="logistic-icon" />
                <span>{t('product.qualityGuarantee')}</span>
              </div>
            </div>

            <div className="quickview-actions">
              <button className="btn btn-primary quickview-btn-buy" onClick={handleBuyNow}>
                {t('cart.buyNow')}
              </button>
              <button className="btn btn-outline quickview-btn-cart" onClick={handleAddToCart}>
                {added ? <><Check size={14} /> {t('cart.added')}</> : t('cart.addToCart')}
              </button>
            </div>
            
            <button 
              className="quickview-view-full"
              onClick={() => {
                closeQuickView();
                navigate(`/product/${product.id}`);
              }}
            >
              {t('product.viewFullPage')} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;
