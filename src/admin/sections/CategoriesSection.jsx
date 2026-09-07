import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Tags, Save } from 'lucide-react';
import {
  fetchAdminCategories, createCategory, updateCategory, deleteCategory,
} from '../../services/admin';
import { formatInt } from '../format';
import { PageHead, EmptyState, Modal } from '../ui';
import { useToast, useConfirm } from '../../components/common/Feedback';
import { useLang } from '../../context/LangContext';

const EMPTY_FORM = { name: '', slug: '', short: '', description: '', imageUrl: '' };

const CategoriesSection = () => {
  const { t } = useLang();
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const loadCategories = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchAdminCategories();
    setCategories(data);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      short: cat.short || '',
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      const res = await updateCategory(editing.id, {
        name: form.name,
        slug: form.slug,
        short: form.short,
        description: form.description,
        image_url: form.imageUrl,
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editing.id ? { ...c, ...form, imageUrl: form.imageUrl } : c))
        );
        toast(t('admin.categories.updated'), { type: 'success' });
      } else {
        toast(t('admin.categories.updateFailed'), { type: 'error' });
      }
    } else {
      const res = await createCategory(form);
      if (res.ok && res.data) {
        setCategories((prev) => [
          ...prev,
          {
            id: res.data.id,
            code: res.data.category_code,
            ...form,
            productCount: 0,
            createdAt: res.data.created_at,
          },
        ]);
        toast(t('admin.categories.created'), { type: 'success' });
      } else {
        toast(t('admin.categories.createFailed'), { type: 'error' });
      }
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: t('admin.categories.deleteTitle'),
      message: t('admin.categories.deleteMessage'),
      confirmLabel: t('common.delete'),
      danger: true,
    });
    if (!ok) return;
    const res = await deleteCategory(id);
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast(t('admin.categories.deleted'), { type: 'success' });
    } else {
      toast(t('admin.categories.deleteFailed'), { type: 'error' });
    }
  };

  if (loadingData) return <CatSkeleton />;

  return (
    <div>
      <PageHead
        eyebrow={t('admin.nav.catalog')}
        title={t('admin.categories.title')}
        subtitle={t('admin.categories.subtitle', { count: formatInt(categories.length) })}
        actions={
          <button className="adm-btn adm-btn--primary" onClick={openCreate}>
            <Plus size={15} strokeWidth={2} /> {t('admin.categories.add')}
          </button>
        }
      />

      {categories.length === 0 ? (
        <div className="adm-panel">
          <EmptyState
            icon={Tags}
            title={t('admin.categories.emptyTitle')}
            text={t('admin.categories.emptyText')}
          />
        </div>
      ) : (
        <div className="adm-cat-grid">
          {categories.map((cat, i) => (
            <article className="adm-cat-card" key={cat.id} style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}>
              <div className="adm-cat-cover">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} loading="lazy" />
                ) : (
                  <span className="adm-cat-cover-fallback">
                    <Tags size={26} strokeWidth={1.4} />
                  </span>
                )}
              </div>
              <div className="adm-cat-body">
                <h3 className="adm-cat-name">{cat.name}</h3>
                {(cat.short || cat.description) && (
                  <p className="adm-cat-desc">{cat.short || cat.description}</p>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 11, flexWrap: 'wrap' }}>
                  <span className="adm-chip">{cat.code}</span>
                  {cat.slug && <span className="adm-chip">/{cat.slug}</span>}
                </div>
                <div className="adm-cat-foot">
                  <span className="adm-cell-dim">
                    <strong style={{ color: 'var(--adm-ink)', fontSize: 13 }}>
                      {formatInt(cat.productCount)}
                    </strong>{' '}
                    {cat.productCount > 1 ? t('admin.categories.productsPlural') : t('admin.categories.productsSingular')}
                  </span>
                  <div className="adm-row-actions">
                    <button className="adm-action" title={t('common.edit')} onClick={() => openEdit(cat)}>
                      <Edit3 size={14} strokeWidth={1.75} />
                    </button>
                    <button
                      className="adm-action adm-action--danger"
                      title={t('common.delete')}
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 size={14} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? t('admin.categories.editTitle', { name: editing.name }) : t('admin.categories.newTitle')}
          subtitle={t('admin.categories.modalSub')}
          onClose={() => setShowModal(false)}
          maxWidth={520}
          footer={
            <>
              <button className="adm-btn adm-btn--ghost" onClick={() => setShowModal(false)}>
                {t('common.cancel')}
              </button>
              <button className="adm-btn adm-btn--primary" onClick={handleSave}>
                <Save size={15} strokeWidth={1.75} /> {editing ? t('admin.categories.update') : t('admin.categories.create')}
              </button>
            </>
          }
        >
          <div className="adm-form-grid">
            <div className="adm-form-row">
              <label className="adm-label" htmlFor="cat-name">{t('admin.categories.nameLabel')} *</label>
              <input
                id="cat-name"
                className="adm-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('admin.categories.namePh')}
              />
            </div>
            <div className="adm-form-row">
              <label className="adm-label" htmlFor="cat-slug">{t('admin.categories.slugLabel')}</label>
              <input
                id="cat-slug"
                className="adm-input"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="vanille"
              />
            </div>
            <div className="adm-form-row adm-form-row--full">
              <label className="adm-label" htmlFor="cat-short">{t('admin.categories.shortLabel')}</label>
              <input
                id="cat-short"
                className="adm-input"
                value={form.short}
                onChange={(e) => setForm({ ...form, short: e.target.value })}
                placeholder={t('admin.categories.shortPh')}
              />
            </div>
            <div className="adm-form-row adm-form-row--full">
              <label className="adm-label" htmlFor="cat-desc">{t('admin.categories.descLabel')}</label>
              <textarea
                id="cat-desc"
                className="adm-input"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('admin.categories.descPh')}
              />
            </div>
            <div className="adm-form-row adm-form-row--full">
              <label className="adm-label" htmlFor="cat-img">{t('admin.categories.imageLabel')}</label>
              <input
                id="cat-img"
                className="adm-input"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const CatSkeleton = () => (
  <div aria-hidden="true">
    <div style={{ marginBottom: 26 }}>
      <div className="adm-sk" style={{ width: 90, height: 11, marginBottom: 12 }} />
      <div className="adm-sk" style={{ width: 220, height: 24 }} />
    </div>
    <div className="adm-cat-grid">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="adm-panel" style={{ overflow: 'hidden' }}>
          <div className="adm-sk" style={{ width: '100%', height: 118, borderRadius: 0 }} />
          <div style={{ padding: 17 }}>
            <div className="adm-sk" style={{ width: '60%', height: 16, marginBottom: 10 }} />
            <div className="adm-sk" style={{ width: '40%', height: 12 }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CategoriesSection;
