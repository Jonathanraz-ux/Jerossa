import React, { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package, Check, X } from 'lucide-react';
import { fetchMyProducts, updateMyProduct, deleteMyProduct } from '../services/seller';
import { formatEUR } from '../admin/format';
import { formatDate } from '../i18n';
import { useLang } from '../context/LangContext';

const SellerProducts = () => {
  const { t, lang } = useLang();
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
    return <div className="sv-loader"><div className="sv-loader-spinner" /><p>{t('common.loading')}</p></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <h2 className="sv-section-title" style={{ marginBottom: 0 }}>{t('seller.products.title', { count: products.length })}</h2>
        <Link to="/publier" className="sv-btn sv-btn--primary">
          <Plus size={15} /> {t('seller.products.add')}
        </Link>
      </div>

      <div className="sv-panel">
        {products.length === 0 ? (
          <div className="sv-empty">
            <Package size={30} />
            <p>{t('seller.products.empty')}<br />{t('seller.products.emptyHint')}</p>
            <Link to="/publier" className="sv-btn sv-btn--primary" style={{ marginTop: '0.75rem' }}>
              <Plus size={15} /> {t('seller.products.publishOffer')}
            </Link>
          </div>
        ) : (
          <div className="sv-table-wrap">
            <table className="sv-table">
              <thead>
                <tr>
                  <th>{t('seller.products.colProduct')}</th>
                  <th>{t('seller.products.colPrice')}</th>
                  <th>{t('seller.products.colStatus')}</th>
                  <th>{t('seller.products.colVerified')}</th>
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
                          <span className="sv-dim">{p.origin || '—'} · {t('seller.products.addedOn', { date: formatDate(p.createdAt, lang) })}</span>
                        </div>
                      </div>
                    </td>
                    <td className="sv-num">{formatEUR(p.priceEur)} / {p.unit}</td>
                    <td>
                      <button
                        type="button"
                        title={p.verified
                          ? t('seller.products.titleVerified')
                          : (p.active ? t('seller.products.titleOnline') : t('seller.products.titlePaused'))}
                        onClick={() => toggleActive(p)}
                        className={`sv-badge sv-badge--${p.active ? 'green' : 'neutral'}`}
                        style={{ border: 'none', cursor: p.verified ? 'not-allowed' : 'pointer', opacity: p.verified ? 0.65 : 1 }}
                        disabled={p.verified}
                      >
                        {p.active ? <>{t('seller.products.statusOnline')}</> : <>{t('seller.products.statusPaused')}</>}
                      </button>
                    </td>
                    <td>
                      {p.verified
                        ? <span className="sv-badge sv-badge--blue"><Check size={11} /> {t('seller.products.verified')}</span>
                        : <span className="sv-badge sv-badge--amber"><X size={11} /> {t('seller.products.pending')}</span>}
                    </td>
                    <td>
                      <div className="sv-actions" style={{ justifyContent: 'flex-end' }}>
                        <Link to={`/espace-vendeur/produits/${p.id}`} className="sv-icon-btn" title={t('seller.products.edit')}>
                          <Pencil size={14} />
                        </Link>
                        {confirmId === p.id ? (
                          <button
                            type="button"
                            onClick={() => remove(p)}
                            onMouseLeave={() => setConfirmId(null)}
                            className="sv-icon-btn sv-icon-btn--danger"
                            title={t('seller.products.confirmDelete')}
                            style={{ background: 'var(--danger)', borderColor: 'var(--danger)', color: '#fff' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmId(p.id)}
                            className="sv-icon-btn sv-icon-btn--danger"
                            title={t('seller.products.delete')}
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
        {t('seller.products.noteVerified')}
      </p>
    </div>
  );
};

export default SellerProducts;
