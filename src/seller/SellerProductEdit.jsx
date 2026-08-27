import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  fetchMyProductById, updateMyProduct, fetchCategoriesForSelect,
} from '../services/seller';

const UNITS = ['kg', 'g', 'L', 'Pièce', 'Unitaire', 'Tonnes'];
const AVAILABILITIES = ['En stock', 'Sur commande', 'Disponible en gros', 'Quantité limitée'];

const Field = ({ label, required, children, hint }) => (
  <div className="sl-field">
    <label className="sl-label">{label} {required && <span className="sl-required">*</span>}</label>
    {children}
    {hint && <span className="sl-hint">{hint}</span>}
  </div>
);

const SellerProductEdit = () => {
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
    return <div className="sv-loader"><div className="sv-loader-spinner" /><p>Chargement…</p></div>;
  }

  if (!product) {
    return (
      <div className="sv-panel">
        <div className="sv-error-banner">
          <AlertTriangle size={16} />
          <span>Produit introuvable ou n'appartenant pas à votre boutique.</span>
        </div>
        <Link to="/espace-vendeur/produits" className="sv-btn sv-btn--ghost">Retour à mes produits</Link>
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
      setError(res.error?.message || 'Échec de la mise à jour.');
      return;
    }
    setSaved(true);
    setTimeout(() => navigate('/espace-vendeur/produits'), 900);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 className="sv-section-title">Modifier le produit</h2>

      {product.verified && (
        <div className="sv-error-banner" style={{ background: 'rgba(41, 98, 155, 0.07)', borderColor: 'rgba(41, 98, 155, 0.3)' }}>
          <AlertTriangle size={16} style={{ color: '#29629b' }} />
          <span>Ce produit est vérifié par Jerossa : les modifications sont bloquées par la plateforme. Contactez le support pour toute correction.</span>
        </div>
      )}
      {saved && (
        <div className="sv-success-note"><CheckCircle2 size={15} /> Produit mis à jour — retour à la liste…</div>
      )}
      {error && (
        <div className="sv-error-banner"><AlertTriangle size={16} /><span>{error}</span></div>
      )}

      <form className="sv-panel" onSubmit={onSubmit}>
        <Field label="Titre du produit" required>
          <input className="sl-input" value={title} onChange={(e) => setTitle(e.target.value)} disabled={product.verified} required />
        </Field>
        <Field label="Catégorie" required>
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
        <Field label="Description" required>
          <textarea className="sl-input sl-textarea" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} disabled={product.verified} required />
        </Field>
        <div className="sv-form-row">
          <Field label="Prix (€)" required hint="Les prix sont affichés en euros sur la marketplace.">
            <input className="sl-input" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} disabled={product.verified} required />
          </Field>
          <Field label="Unité de vente" required>
            <div className="sl-select-wrap">
              <select className="sl-input sl-select" value={unit} onChange={(e) => setUnit(e.target.value)} disabled={product.verified}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
              <ChevronDown size={15} />
            </div>
          </Field>
        </div>
        <div className="sv-form-row">
          <Field label="Disponibilité" required>
            <div className="sl-select-wrap">
              <select className="sl-input sl-select" value={availability} onChange={(e) => setAvailability(e.target.value)} disabled={product.verified}>
                {AVAILABILITIES.map((a) => <option key={a}>{a}</option>)}
              </select>
              <ChevronDown size={15} />
            </div>
          </Field>
          <Field label="Origine">
            <input className="sl-input" placeholder="Ex. : Sava, Madagascar" value={origin} onChange={(e) => setOrigin(e.target.value)} disabled={product.verified} />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="submit" className="sv-btn sv-btn--primary" disabled={saving || product.verified}>
            {saving && <Loader2 size={14} style={{ animation: 'sv-rotate 0.9s linear infinite' }} />}
            Enregistrer les modifications
          </button>
          <Link to="/espace-vendeur/produits" className="sv-btn sv-btn--ghost">Annuler</Link>
        </div>
      </form>

      {!product.verified && product.images.length > 0 && (
        <div className="sv-panel">
          <h3 className="sv-section-title">Photos actuelles</h3>
          <div className="sv-images-preview">
            {product.images.map((src, i) => <img key={i} src={src} alt={`${product.title} ${i + 1}`} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductEdit;
