import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Loader2, Mail, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { createOrGetConversation } from '../services/messages';

const ContactSellerModal = ({ seller, product, mode, onClose }) => {
  const { isAuthenticated } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const isQuote = mode === 'quote';

  const [subject, setSubject] = useState(
    isQuote
      ? product ? `Devis pour ${product.title}` : ''
      : product ? `Question sur ${product.title}` : ''
  );
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(product?.moq || 1);
  const [unit, setUnit] = useState(product?.unit || 'kg');
  const [location, setLocation] = useState('');
  const [delay, setDelay] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSend = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (!message.trim()) {
      setError(t('contact.error'));
      return;
    }

    setSubmitting(true);
    setError('');

    const fullMessage = isQuote
      ? [
          product && `Produit : ${product.title}`,
          quantity && `Quantité : ${quantity} ${unit}`,
          location && `Livraison : ${location}`,
          delay && `Délai : ${delay}`,
          message,
        ].filter(Boolean).join('\n')
      : message;

    const subjectText = isQuote
      ? (subject || `Devis pour ${product?.title || seller.name}`)
      : (subject || `Question pour ${seller.name}`);

    const res = await createOrGetConversation({
      sellerId: seller.rawId,
      productCode: product?.id || null,
      productTitle: product?.title || null,
      subject: subjectText,
      message: fullMessage,
    });

    setSubmitting(false);
    if (res.ok) {
      setDone(true);
    } else {
      setError(res.error?.message || t('contact.error'));
    }
  };

  const sellerName = seller?.name || '';

  return (
    <div className="j-modal-backdrop" onClick={onClose}>
      <div className="j-modal-panel" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isQuote ? <FileText size={18} color="var(--primary)" /> : <Mail size={18} color="var(--primary)" />}
              {isQuote ? t('quote.title') : t('contact.title')}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{sellerName}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {done ? (
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: 'var(--success-bg)',
              color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <Send size={20} />
            </div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              {isQuote ? t('quote.success') : t('contact.success')}
            </p>
            <button
              className="btn btn-outline"
              onClick={onClose}
              style={{ marginTop: '1rem' }}
            >
              Fermer
            </button>
          </div>
        ) : (
          <div style={{ padding: '1.25rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Product info */}
            {product && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem', background: 'var(--bg-cream)', borderRadius: '10px',
                border: '1px solid var(--border)',
              }}>
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
                  />
                )}
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                    {t('contact.product')}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{product.title}</div>
                </div>
              </div>
            )}

            {/* Subject */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                {t('contact.subject')}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isQuote ? t('quote.title') : t('contact.title')}
                style={{
                  width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit', color: 'var(--text-dark)',
                }}
              />
            </div>

            {/* Quote-specific fields */}
            {isQuote && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      {t('quote.quantity')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      style={{
                        width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--border)',
                        borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit', color: 'var(--text-dark)',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      {t('quote.unit')}
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      style={{
                        width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--border)',
                        borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit', color: 'var(--text-dark)',
                      }}
                    >
                      <option value="kg">kg</option>
                      <option value="tonne">tonne</option>
                      <option value="pièce">pièce</option>
                      <option value="lot">lot</option>
                      <option value="sac">sac</option>
                      <option value="fût">fût</option>
                      <option value="carton">carton</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    {t('quote.location')}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t('quote.location_ph')}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--border)',
                      borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit', color: 'var(--text-dark)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    {t('quote.delay')}
                  </label>
                  <input
                    type="text"
                    value={delay}
                    onChange={(e) => setDelay(e.target.value)}
                    placeholder={t('quote.delay_ph')}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--border)',
                      borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit', color: 'var(--text-dark)',
                    }}
                  />
                </div>
              </>
            )}

            {/* Message */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                {t('contact.message')}
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('contact.message_ph')}
                style={{
                  width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit', color: 'var(--text-dark)',
                  resize: 'vertical', minHeight: 100,
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '0.65rem 0.85rem', background: 'var(--danger-bg)', color: 'var(--danger)',
                border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, fontSize: '0.8rem',
              }}>
                {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button
                className="btn btn-outline"
                onClick={onClose}
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSend}
                disabled={submitting || !message.trim()}
              >
                {submitting
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {isQuote ? t('quote.sending') : t('contact.sending')}</>
                  : <><Send size={15} /> {isQuote ? t('quote.send') : t('contact.send')}</>
                }
              </button>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
};

export default ContactSellerModal;
