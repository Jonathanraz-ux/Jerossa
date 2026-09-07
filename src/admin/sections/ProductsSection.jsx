import React, { useCallback, useEffect, useState } from 'react';
import { Search, Eye, EyeOff, Trash2, PackageSearch } from 'lucide-react';
import { fetchAdminProducts, toggleProductActive, deleteProduct } from '../../services/admin';
import { formatEUR, formatInt } from '../format';
import { PageHead, EmptyState, Thumb } from '../ui';
import { useToast, useConfirm } from '../../components/common/Feedback';
import { useLang } from '../../context/LangContext';

const ProductsSection = () => {
  const { t } = useLang();
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const loadProducts = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchAdminProducts();
    setProducts(data);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleToggle = async (id, currentActive) => {
    const res = await toggleProductActive(id, !currentActive);
    if (res.ok) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !currentActive } : p)));
      toast(
        !currentActive ? t('admin.products.activated') : t('admin.products.deactivated'),
        { type: 'success' }
      );
    } else {
      toast(t('admin.products.opFailed'), { type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: t('admin.products.deleteTitle'),
      message: t('admin.products.deleteMessage'),
      confirmLabel: t('common.delete'),
      danger: true,
    });
    if (!ok) return;
    const res = await deleteProduct(id);
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast(t('admin.products.deleted'), { type: 'success' });
    } else {
      toast(t('admin.products.deleteFailed'), { type: 'error' });
    }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.active) ||
      (statusFilter === 'inactive' && !p.active);
    return matchSearch && matchStatus;
  });

  if (loadingData) return <LoadingSkeleton />;

  const activeCount = products.filter((p) => p.active).length;

  return (
    <div>
      <PageHead
        eyebrow={t('admin.nav.catalog')}
        title={t('admin.products.title')}
        subtitle={t('admin.products.subtitle', { total: formatInt(products.length), active: formatInt(activeCount) })}
      />

      <div className="adm-toolbar">
        <label className="adm-field" style={{ flex: 1, maxWidth: 340 }}>
          <Search size={15} strokeWidth={1.75} />
          <input
            type="text"
            placeholder={t('admin.products.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="adm-field adm-field--select">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label={t('admin.products.filterByStatus')}>
            <option value="all">{t('admin.products.allStatuses')}</option>
            <option value="active">{t('status.active')}</option>
            <option value="inactive">{t('status.inactive')}</option>
          </select>
        </label>
        <span className="adm-cell-dim" style={{ marginLeft: 'auto' }}>
          {t('admin.products.shown', { count: filtered.length })}
        </span>
      </div>

      <div className="adm-panel">
        {products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title={t('admin.products.emptyTitle')}
            text={t('admin.products.emptyText')}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t('admin.products.noMatchTitle')}
            text={t('admin.products.noMatchText')}
            compact
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>{t('admin.product')}</th>
                  <th>{t('admin.category')}</th>
                  <th>{t('admin.seller')}</th>
                  <th>{t('common.price')}</th>
                  <th>{t('admin.stock')}</th>
                  <th>{t('common.status')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="adm-prod-cell">
                        <Thumb src={p.images?.[0]} alt={p.title} />
                        <div className="adm-prod-meta">
                          <span className="adm-prod-name">{p.title}</span>
                          <span className="adm-prod-code">{p.code}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="adm-chip">{p.category}</span></td>
                    <td style={{ fontSize: 12.5 }}>{p.seller}</td>
                    <td>
                      <span className="num adm-cell-strong" style={{ display: 'block' }}>
                        {formatEUR(p.price)}
                      </span>
                      {p.unit && <span className="adm-cell-dim" style={{ fontSize: 11 }}>/ {p.unit}</span>}
                    </td>
                    <td>
                      {p.stock === null || p.stock === undefined || p.stock === '' ? (
                        <span className="adm-cell-dim">—</span>
                      ) : Number(p.stock) === 0 ? (
                        <span className="adm-badge adm-badge--red">{t('admin.products.outOfStock')}</span>
                      ) : Number(p.stock) <= 5 ? (
                        <span className="num" style={{ color: 'var(--adm-amber)', fontWeight: 600 }}>
                          {p.stock}
                        </span>
                      ) : (
                        <span className="num">{p.stock}</span>
                      )}
                    </td>
                    <td>
                      <span className={`adm-badge ${p.active ? 'adm-badge--green' : 'adm-badge--neutral'}`}>
                        {p.active ? t('status.active') : t('status.inactive')}
                      </span>
                    </td>
                    <td>
                      <div className="adm-row-actions">
                        <button
                          className="adm-action"
                          title={p.active ? t('admin.products.deactivate') : t('admin.products.activate')}
                          onClick={() => handleToggle(p.id, p.active)}
                        >
                          {p.active ? <EyeOff size={15} strokeWidth={1.75} /> : <Eye size={15} strokeWidth={1.75} />}
                        </button>
                        <button
                          className="adm-action adm-action--danger"
                          title={t('common.delete')}
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 size={15} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div aria-hidden="true">
    <div style={{ marginBottom: 26 }}>
      <div className="adm-sk" style={{ width: 90, height: 11, marginBottom: 12 }} />
      <div className="adm-sk" style={{ width: 200, height: 24 }} />
    </div>
    <div className="adm-panel">
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 20px' }}>
          <div className="adm-sk" style={{ width: 42, height: 42, borderRadius: 9 }} />
          <div className="adm-sk" style={{ flex: 1, height: 12 }} />
          <div className="adm-sk" style={{ width: 70, height: 12 }} />
          <div className="adm-sk" style={{ width: 64, height: 20, borderRadius: 999 }} />
        </div>
      ))}
    </div>
  </div>
);

export default ProductsSection;
