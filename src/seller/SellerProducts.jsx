import React, { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package, Check, X } from 'lucide-react';
import { fetchMyProducts, updateMyProduct, deleteMyProduct } from '../services/seller';
import { formatEUR } from '../admin/format';

const SellerProducts = () => {
  const { producer } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchMyProducts(producer.id);
    setProducts(data);
    setLoading(false);
  }, [producer]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (p) => {
    if (p.verified) return;
    const res = await updateMyProduct(p.id, { active: !p.active });
    if (res.ok) setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !p.active } : x)));
  };

  const remove = async (p) => {
    const res = await deleteMyProduct(p.id);
    if (res.ok) {
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      setConfirmId(null);
    }
  };

  if (loading) {
    return <div className="sv-loader"><div className="sv-loader-spinner" /><p>Chargement…</p></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <h2 className="sv-section-title" style={{ marginBottom: 0 }}>Mes produits ({products.length})</h2>
        <Link to="/publier" className="sv-btn sv-btn--primary">
          <Plus size={15} /> Ajouter un produit
        </Link>
      </div>

      <div className="sv-panel">
        {products.length === 0 ? (
          <div className="sv-empty">
            <Package size={30} />
            <p>Aucun produit pour le moment.<br />Publiez votre première offre pour la voir apparaître dans votre boutique.</p>
            <Link to="/publier" className="sv-btn sv-btn--primary" style={{ marginTop: '0.75rem' }}>
              <Plus size={15} /> Publier une offre
            </Link>
          </div>
        ) : (
          <div className="sv-table-wrap">
            <table className="sv-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>Vérifié</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="sv-prod-cell">
                        {p.images[0] ? (
                          <img src={p.images[0]} alt={p.title} className="sv-prod-thumb" />
                        ) : (
                          <span className="sv-prod-thumb-fallback"><Package size={18} /></span>
                        )}
                        <div>
                          <span className="sv-prod-name">{p.title}</span>
                          <span className="sv-dim">{p.origin || '—'} · ajouté le {new Date(p.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="sv-num">{formatEUR(p.priceEur)} / {p.unit}</td>
                    <td>
                      <button
                        type="button"
                        title={p.verified
                          ? 'Produit contrôlé : gestion du statut bloquée par la plateforme'
                          : (p.active ? 'Mettre en pause' : 'Remettre en ligne')}
                        onClick={() => toggleActive(p)}
                        className={`sv-badge sv-badge--${p.active ? 'green' : 'neutral'}`}
                        style={{ border: 'none', cursor: p.verified ? 'not-allowed' : 'pointer', opacity: p.verified ? 0.65 : 1 }}
                        disabled={p.verified}
                      >
                        {p.active ? <>En ligne</> : <>En pause</>}
                      </button>
                    </td>
                    <td>
                      {p.verified
                        ? <span className="sv-badge sv-badge--blue"><Check size={11} /> Contrôlé</span>
                        : <span className="sv-badge sv-badge--amber"><X size={11} /> En attente</span>}
                    </td>
                    <td>
                      <div className="sv-actions" style={{ justifyContent: 'flex-end' }}>
                        <Link to={`/espace-vendeur/produits/${p.id}`} className="sv-icon-btn" title="Modifier">
                          <Pencil size={14} />
                        </Link>
                        {confirmId === p.id ? (
                          <button
                            type="button"
                            onClick={() => remove(p)}
                            onMouseLeave={() => setConfirmId(null)}
                            className="sv-icon-btn sv-icon-btn--danger"
                            title="Confirmer la suppression"
                            style={{ background: 'var(--danger)', borderColor: 'var(--danger)', color: '#fff' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmId(p.id)}
                            className="sv-icon-btn sv-icon-btn--danger"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="sv-dim" style={{ marginTop: '-0.5rem' }}>
        Les produits « contrôlés » sont vérifiés par l'équipe Jerossa et ne sont plus modifiables directement — contactez le support pour toute correction.
      </p>
    </div>
  );
};

export default SellerProducts;
