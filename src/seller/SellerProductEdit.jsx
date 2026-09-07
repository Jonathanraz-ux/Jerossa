import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  fetchMyProductById, updateMyProduct, fetchCategoriesForSelect,
} from '../services/seller';
import { useLang } from '../context/LangContext';

const Field = ({ label, required, children, hint }) => (
  <div className="sl-field">
    <label className="sl-label">{label} {required && <span className="sl-required">*</span>}</label>
    {children}
    {hint && <span className="sl-hint">{hint}</span>}
  </div>
);

const SellerProductEdit = () => {
  const { t } = useLang();
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [availability, setAvailability] = useState('En stock');
  const [origin, setOrigin] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [p, cats] = await Promise.all([
        fetchMyProductById(id),
        fetchCategoriesForSelect(),
      ]);
      if (!alive) return;
      if (p) {
        setTitle(p.title || '');
        setDescription(p.description || '');
        setPrice(String(p.priceEur));
        setUnit(p.unit || 'kg');
        setAvailability(p.availability || 'En stock');
        setOrigin(p.origin || '');
      }
      setProduct(p);
      setCategories(cats);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    if (product && categories.length && !categoryId) {
      setCategoryId(product.categoryId || categories[0].id);
    }
  }, [product, categories, categoryId]);

  if (loading) {
    return <div className="sv-loader"><div className="sv-loader-spinner" /><p>{t('common.loading')}</p></div>;
  }

  if (!product) {
    return (
      <div className="sv-panel">
        <div className="sv-error-banner">
          <AlertTriangle size={16} />
          <span>{t('seller.productEdit.notFound')}</span>
        </div>
        <Link to="/espace-vendeur/produits" className="sv-btn sv-btn--ghost">{t('seller.productEdit.backToProducts')}</Link>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);
    const res = await updateMyProduct(product.id, {
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId || null,
      price_eur: Number(price),
      unit,
      availability,
      origin: origin.trim() || null,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error?.message || t('seller.productEdit.save'));
      return;
    }
    setSaved(true);
    setTimeout(() => navigate('/espace-vendeur/produits'), 900);
  };

  const UNITS = [
    { value: 'kg', label: t('seller.productEdit.unitKg') },
    { value: 'g', label: t('seller.productEdit.unitG') },
    { value: 'L', label: t('seller.productEdit.unitL') },
    { value: 'Pièce', label: t('seller.productEdit.unitPiece') },
    { value: 'Unitaire', label: t('seller.productEdit.unitIndividual') },
    { value: 'Tonnes', label: t('seller.productEdit.unitTons') },
  ];

  const AVAILABILITIES = [
    { value: 'En stock', label: t('seller.productEdit.availInStock') },
    { value: 'Sur commande', label: t('seller.productEdit.availOnOrder') },
    { value: 'Disponible en gros', label: t('seller.productEdit.availBulk') },
    { value: 'Quantité limitée', label: t('seller.productEdit.availLimited') },
  ];

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 className="sv-section-title">{t('seller.productEdit.title')}</h2>

      {product.verified && (
        <div className="sv-error-banner" style={{ background: 'rgba(41, 98, 155, 0.07)', borderColor: 'rgba(41, 98, 155, 0.3)' }}>
          <AlertTriangle size={16} style={{ color: '#29629b' }} />
          <span>{t('seller.productEdit.verifiedBanner')}</span>
        </div>
      )}
      {saved && (
        <div className="sv-success-note"><CheckCircle2 size={15} /> {t('seller.productEdit.saved')}</div>
      )}
      {error && (
        <div className="sv-error-banner"><AlertTriangle size={16} /><span>{error}</span></div>
      )}

      <form className="sv-panel" onSubmit={onSubmit}>
        <Field label={t('seller.productEdit.fieldTitle')} required>
          <input className="sl-input" value={title} onChange={(e) => setTitle(e.target.value)} disabled={product.verified} required />
        </Field>
        <Field label={t('seller.productEdit.fieldCategory')} required>
          <div className="sl-select-wrap">
            <select
              className="sl-input sl-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={product.verified}
            >
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={15} />
          </div>
        </Field>
        <Field label={t('seller.productEdit.fieldDescription')} required>
          <textarea className="sl-input sl-textarea" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} disabled={product.verified} required />
        </Field>
        <div className="sv-form-row">
          <Field label={t('seller.productEdit.fieldPrice')} required hint={t('seller.productEdit.priceHint')}>
            <input className="sl-input" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} disabled={product.verified} required />
          </Field>
          <Field label={t('seller.productEdit.fieldUnit')} required>
            <div className="sl-select-wrap">
              <select className="sl-input sl-select" value={unit} onChange={(e) => setUnit(e.target.value)} disabled={product.verified}>
                {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
              <ChevronDown size={15} />
            </div>
          </Field>
        </div>
        <div className="sv-form-row">
          <Field label={t('seller.productEdit.fieldAvailability')} required>
            <div className="sl-select-wrap">
              <select className="sl-input sl-select" value={availability} onChange={(e) => setAvailability(e.target.value)} disabled={product.verified}>
                {AVAILABILITIES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              <ChevronDown size={15} />
            </div>
          </Field>
          <Field label={t('seller.productEdit.fieldOrigin')}>
            <input className="sl-input" placeholder={t('seller.productEdit.originPlaceholder')} value={origin} onChange={(e) => setOrigin(e.target.value)} disabled={product.verified} />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="submit" className="sv-btn sv-btn--primary" disabled={saving || product.verified}>
            {saving && <Loader2 size={14} style={{ animation: 'sv-rotate 0.9s linear infinite' }} />}
            {t('seller.productEdit.save')}
          </button>
          <Link to="/espace-vendeur/produits" className="sv-btn sv-btn--ghost">{t('seller.productEdit.cancel')}</Link>
        </div>
      </form>

      {!product.verified && product.images.length > 0 && (
        <div className="sv-panel">
          <h3 className="sv-section-title">{t('seller.productEdit.photosTitle')}</h3>
          <div className="sv-images-preview">
            {product.images.map((src, i) => <img key={i} src={src} alt={`${product.title} ${i + 1}`} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductEdit;
