import React from 'react';

const Skel = ({ style }) => <span className="jr-skel" style={style} aria-hidden="true" />;

/** Grille de cartes produit fantômes (catalogue, recherche, catégorie…) */
export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="jr-skel-grid" aria-hidden="true">
    {[...Array(count)].map((_, i) => (
      <div className="jr-skel-card" key={i}>
        <Skel style={{ width: '100%', aspectRatio: '1', borderRadius: 0 }} />
        <div className="jr-skel-card-body">
          <Skel style={{ width: '40%', height: 10 }} />
          <Skel style={{ width: '80%', height: 14 }} />
          <Skel style={{ width: '55%', height: 11, marginBottom: 0 }} />
        </div>
      </div>
    ))}
  </div>
);

/** Lignes de tableau / liste fantômes (commandes, devis, remboursements…) */
export const RowsSkeleton = ({ rows = 5, withImage = false }) => (
  <div className="jr-skel-rows" aria-hidden="true">
    {[...Array(rows)].map((_, i) => (
      <div className="jr-skel-row" key={i}>
        {withImage && <Skel style={{ width: 56, height: 56, borderRadius: 8, flexShrink: 0 }} />}
        <Skel style={{ width: '28%', height: 12 }} />
        <Skel style={{ flex: 1, height: 12 }} />
        <Skel style={{ width: 70, height: 22, borderRadius: 999 }} />
      </div>
    ))}
  </div>
);

/** Bloc générique (résumé, encart paiement…) */
export const BlockSkeleton = ({ height = 220 }) => (
  <div
    aria-hidden="true"
    style={{
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
      background: 'var(--bg-white)',
    }}
  >
    <Skel style={{ width: '100%', height, borderRadius: 0 }} />
  </div>
);
