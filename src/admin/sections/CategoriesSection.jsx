import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Tags, Save } from 'lucide-react';
import {
  fetchAdminCategories, createCategory, updateCategory, deleteCategory,
} from '../../services/admin';
import { formatInt } from '../format';
import { PageHead, EmptyState, Modal } from '../ui';

const EMPTY_FORM = { name: '', slug: '', short: '', description: '', imageUrl: '' };

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

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
      }
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    const res = await deleteCategory(id);
    if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  if (loadingData) return <CatSkeleton />;

  return (
    <div>
      <PageHead
        eyebrow="Catalogue"
        title="Catégories"
        subtitle={`${formatInt(categories.length)} univers${categories.length > 1 ? 's' : ''} de produits`}
        actions={
          <button className="adm-btn adm-btn--primary" onClick={openCreate}>
            <Plus size={15} strokeWidth={2} /> Ajouter
          </button>
        }
      />

      {categories.length === 0 ? (
        <div className="adm-panel">
          <EmptyState
            icon={Tags}
            title="Aucune catégorie pour l'instant"
            text="Structurez votre catalogue en créant votre première catégorie — elle apparaîtra aussitôt sur la boutique."
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
                    produit{cat.productCount > 1 ? 's' : ''}
                  </span>
                  <div className="adm-row-actions">
                    <button className="adm-action" title="Modifier" onClick={() => openEdit(cat)}>
                      <Edit3 size={14} strokeWidth={1.75} />
                    </button>
                    <button
                      className="adm-action adm-action--danger"
                      title="Supprimer"
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
          title={editing ? `Modifier « ${editing.name} »` : 'Nouvelle catégorie'}
          subtitle="Les catégories structurent la navigation de la boutique."
          onClose={() => setShowModal(false)}
          maxWidth={520}
          footer={
            <>
              <button className="adm-btn adm-btn--ghost" onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button className="adm-btn adm-btn--primary" onClick={handleSave}>
                <Save size={15} strokeWidth={1.75} /> {editing ? 'Mettre à jour' : 'Créer'}
              </button>
            </>
          }
        >
          <div className="adm-form-grid">
            <div className="adm-form-row">
              <label className="adm-label" htmlFor="cat-name">Nom *</label>
              <input
                id="cat-name"
                className="adm-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex : Vanille"
              />
            </div>
            <div className="adm-form-row">
              <label className="adm-label" htmlFor="cat-slug">Slug</label>
              <input
                id="cat-slug"
                className="adm-input"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="vanille"
              />
            </div>
            <div className="adm-form-row adm-form-row--full">
              <label className="adm-label" htmlFor="cat-short">Description courte</label>
              <input
                id="cat-short"
                className="adm-input"
                value={form.short}
                onChange={(e) => setForm({ ...form, short: e.target.value })}
                placeholder="Une accroche élégante en quelques mots"
              />
            </div>
            <div className="adm-form-row adm-form-row--full">
              <label className="adm-label" htmlFor="cat-desc">Description</label>
              <textarea
                id="cat-desc"
                className="adm-input"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description complète de la catégorie"
              />
            </div>
            <div className="adm-form-row adm-form-row--full">
              <label className="adm-label" htmlFor="cat-img">URL de l'image</label>
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
