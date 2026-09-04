import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Star, MessageSquare, CheckCircle2, ThumbsUp, Sparkles } from 'lucide-react';
import { fetchSellerStats, fetchPublicReviews } from '../services/reviews';

const SellerReviews = () => {
  const { producer } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [statsData, reviewsData] = await Promise.all([
        fetchSellerStats(producer.id),
        fetchPublicReviews(producer.id),
      ]);
      if (alive) {
        setStats(statsData);
        setReviews(reviewsData || []);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [producer]);

  const totalReviews = stats?.reviews_count ?? reviews.length;
  const avgRating = totalReviews > 0
    ? Number(stats?.avg_rating || (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)).toFixed(1)
    : null;

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true;
    return r.rating === Number(filterRating);
  });

  // Calculate real rating breakdown
  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, pct };
  });

  const positiveRate = totalReviews > 0
    ? Math.round((reviews.filter((r) => r.rating >= 4).length / totalReviews) * 100)
    : null;

  if (loading) {
    return (
      <div className="sv-loader">
        <div className="sv-loader-spinner" />
        <p>Chargement des avis…</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="sv-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={20} color="var(--accent)" fill="var(--accent)" /> Avis et évaluations
          </h2>
          <p className="sv-dim">
            Retours d'expérience et notes certifiées laissés par vos acheteurs après commande.
          </p>
        </div>
        {producer.slug && (
          <Link to={`/producteur/${producer.slug}`} className="sv-btn sv-btn--ghost">
            Voir ma boutique publique
          </Link>
        )}
      </div>

      {/* KPI Overview */}
      <div className="sv-kpis" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="sv-kpi">
          <span className="sv-kpi-label"><Star size={13} /> Note moyenne</span>
          <div className="sv-kpi-value" style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            {avgRating ? (
              <>
                {avgRating} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 5</span>
              </>
            ) : (
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Aucun avis</span>
            )}
          </div>
          {avgRating && (
            <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  fill={s <= Math.round(Number(avgRating)) ? 'var(--accent)' : 'none'}
                  color={s <= Math.round(Number(avgRating)) ? 'var(--accent)' : 'var(--border)'}
                />
              ))}
            </div>
          )}
        </div>

        <div className="sv-kpi">
          <span className="sv-kpi-label"><MessageSquare size={13} /> Total des avis</span>
          <div className="sv-kpi-value">{totalReviews}</div>
          <div className="sv-kpi-sub">Achats 100% vérifiés</div>
        </div>

        <div className="sv-kpi">
          <span className="sv-kpi-label"><ThumbsUp size={13} /> Taux de satisfaction</span>
          <div className="sv-kpi-value">
            {positiveRate !== null ? `${positiveRate}%` : '—'}
          </div>
          <div className="sv-kpi-sub">Évaluations positives (4★ & 5★)</div>
        </div>

        <div className="sv-kpi">
          <span className="sv-kpi-label"><Sparkles size={13} /> Taux de réponse</span>
          <div className="sv-kpi-value">{producer.response_rate || '—'}</div>
          <div className="sv-kpi-sub">{producer.response_time ? `Délai moyen : ${producer.response_time}` : 'Non calculé'}</div>
        </div>
      </div>

      {/* Rating Breakdown & List */}
      <div className="sv-grid-2" style={{ gridTemplateColumns: '320px 1fr', alignItems: 'start' }}>
        {/* Left: Star distribution */}
        <div className="sv-panel" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Répartition des notes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {breakdown.map(({ stars, count, pct }) => (
              <button
                key={stars}
                type="button"
                onClick={() => setFilterRating(filterRating === String(stars) ? 'all' : String(stars))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  background: filterRating === String(stars) ? 'var(--primary-light)' : 'transparent',
                  border: 'none', padding: '4px 6px', borderRadius: '6px', cursor: 'pointer',
                  width: '100%', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '24px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {stars} <Star size={11} fill="var(--accent)" color="var(--accent)" />
                </span>
                <div style={{ flex: 1, height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: '4px' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '32px', textAlign: 'right' }}>
                  {count || `${pct}%`}
                </span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <CheckCircle2 size={14} color="var(--brand-green)" />
              Seuls les clients ayant reçu une commande peuvent déposer un avis.
            </p>
          </div>
        </div>

        {/* Right: Reviews List */}
        <div className="sv-panel" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
              Derniers avis reçus {filterRating !== 'all' && `(${filterRating}★)`}
            </h3>
            {filterRating !== 'all' && (
              <button
                type="button"
                className="sv-btn sv-btn--ghost"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                onClick={() => setFilterRating('all')}
              >
                Afficher tous les avis
              </button>
            )}
          </div>

          {filteredReviews.length === 0 ? (
            <div className="sv-empty" style={{ padding: '2.5rem 1rem' }}>
              <MessageSquare size={32} />
              <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>Aucun avis pour ce filtre</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Les évaluations et commentaires de vos clients apparaîtront ici.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id || Math.random()}
                  style={{
                    padding: '1rem', borderRadius: 'var(--radius-md)',
                    background: '#faf9f7', border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem' }}>{rev.buyer_name || rev.buyerName || 'Client vérifié'}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span className="sv-badge sv-badge--green" style={{ fontSize: '0.65rem' }}>
                          <CheckCircle2 size={10} /> Achat certifié
                        </span>
                        {rev.created_at && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            · {new Date(rev.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          fill={s <= (rev.rating || 5) ? 'var(--accent)' : 'none'}
                          color={s <= (rev.rating || 5) ? 'var(--accent)' : 'var(--border)'}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.comment ? (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.84rem', color: 'var(--text-dark)', lineHeight: 1.5 }}>
                      "{rev.comment}"
                    </p>
                  ) : (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Évaluation sans commentaire textuel.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerReviews;
