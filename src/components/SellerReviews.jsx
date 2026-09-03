import React, { useEffect, useState } from 'react';
import { Star, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { fetchPublicReviews, submitSellerReview, fetchCompletedOrdersForSeller } from '../services/reviews';

const SellerReviews = ({ sellerId }) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLang();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  useEffect(() => {
    if (!sellerId) return;
    setLoading(true);
    fetchPublicReviews(sellerId).then((data) => {
      setReviews(data);
      setLoading(false);
    });
  }, [sellerId]);

  const existingReview = user
    ? reviews.find((r) => r.buyer_id === user.id)
    : null;

  const canReview = isAuthenticated && !existingReview;

  const loadOrders = async () => {
    if (!sellerId || !user) return;
    const orders = await fetchCompletedOrdersForSeller(sellerId);
    setMyOrders(orders);
  };

  const handleShowForm = async () => {
    if (!isAuthenticated) return;
    await loadOrders();
    setShowForm(true);
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!selectedOrder || !rating) {
      setError('Veuillez sélectionner une commande et attribuer une note.');
      return;
    }
    setSubmitting(true);
    setError('');
    const res = await submitSellerReview({
      sellerId,
      orderId: selectedOrder,
      rating,
      comment,
    });
    setSubmitting(false);
    if (res.ok) {
      setSuccess(true);
      setShowForm(false);
      // Refresh reviews
      const updated = await fetchPublicReviews(sellerId);
      setReviews(updated);
    } else {
      setError(res.error?.message || t('reviews.error'));
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div>
      {/* Summary */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem',
        flexWrap: 'wrap',
      }}>
        {avgRating && (
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700,
              color: 'var(--primary)', lineHeight: 1,
            }}>
              {avgRating}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              / 5 · {reviews.length} avis
            </div>
          </div>
        )}
        {reviews.length > 0 && (
          <div style={{ flex: 1, minWidth: 200, maxWidth: 300 }}>
            {ratingDistribution.map(({ star, count }) => (
              <div key={star} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 12 }}>{star}</span>
                <Star size={12} fill="#fbbf24" color="#fbbf24" />
                <div style={{
                  flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${reviews.length ? (count / reviews.length) * 100 : 0}%`,
                    height: '100%', background: '#fbbf24', borderRadius: 3,
                    transition: 'width 0.3s',
                  }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: 16, textAlign: 'right' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Write review CTA */}
      {canReview && !showForm && !success && (
        <button
          className="btn btn-outline"
          onClick={handleShowForm}
          style={{ marginBottom: '1.5rem' }}
        >
          <Star size={15} /> {t('reviews.write')}
        </button>
      )}

      {success && (
        <div style={{
          padding: '0.85rem 1rem', background: 'var(--success-bg)', color: 'var(--success)',
          border: '1px solid rgba(43,122,75,0.2)', borderRadius: 10, fontSize: '0.85rem',
          fontWeight: 600, marginBottom: '1.5rem',
        }}>
          {t('reviews.success')}
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <div style={{
          background: 'var(--bg-cream)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem',
        }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginBottom: '1rem' }}>
            {existingReview ? t('reviews.edit') : t('reviews.write')}
          </h4>

          {/* Order selection */}
          {myOrders.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                {t('reviews.select_order')}
              </label>
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem 0.85rem', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit',
                }}
              >
                <option value="">{t('reviews.select_order')}</option>
                {myOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} — {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {myOrders.length === 0 && !loading && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {t('reviews.need_order')}
            </p>
          )}

          {/* Star rating */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              {t('reviews.your_rating')}
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                  }}
                >
                  <Star
                    size={24}
                    fill={(hoverStar || rating) >= star ? '#fbbf24' : 'rgba(251,191,36,0.25)'}
                    color="#fbbf24"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              {t('reviews.your_comment')}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience…"
              style={{
                width: '100%', padding: '0.6rem 0.85rem', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical',
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '0.6rem 0.85rem', background: 'var(--danger-bg)', color: 'var(--danger)',
              border: '1px solid rgba(192,57,43,0.2)', borderRadius: 8, fontSize: '0.8rem',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-outline"
              onClick={() => { setShowForm(false); setError(''); }}
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting || !selectedOrder}
            >
              {submitting
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {t('reviews.submitting')}</>
                : t('reviews.submit')
              }
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
          <Star size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{t('reviews.no_reviews')}</p>
          <p style={{ fontSize: '0.85rem' }}>{t('reviews.no_reviews_text')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                padding: '1rem 1.25rem', background: '#fff',
                border: '1px solid var(--border)', borderRadius: 12,
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {review.buyer_name || 'Client'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          fill={s <= review.rating ? '#fbbf24' : 'rgba(251,191,36,0.25)'}
                          color="#fbbf24"
                        />
                      ))}
                    </div>
                    {review.has_order && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                        fontSize: '0.65rem', fontWeight: 600, color: 'var(--success)',
                        background: 'var(--success-bg)', padding: '2px 8px', borderRadius: 20,
                      }}>
                        <ShieldCheck size={10} /> {t('reviews.verified_purchase')}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(review.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
              {review.comment && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SellerReviews;
