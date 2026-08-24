import React, { useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Package, Briefcase, CheckCircle2, ArrowRight, Upload, MapPin,
  ChevronDown, Lock, Info, PlusCircle, X
} from 'lucide-react';
import { categoriesData } from '../data/categories';
import { serviceCategories } from '../data/services';
import { useCurrency, CURRENCIES, CURRENCY_NOTE } from '../context/CurrencyContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './Publish.css';

const MAX_PHOTOS = 6;
const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const Field = ({ label, required, children, hint }) => (
  <div className="pub-field">
    <label className="pub-label">
      {label} {required && <span className="pub-required">*</span>}
    </label>
    {children}
    {hint && <span className="pub-hint">{hint}</span>}
  </div>
);

const Publish = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'service' ? 'service' : 'produit';
  const [type, setType] = useState(initialType);
  const [submitted, setSubmitted] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const { user, isAuthenticated } = useAuth();

  const fileInputRef = useRef(null);
  const [photos, setPhotos] = useState([]); // { file, previewUrl }
  const [photoError, setPhotoError] = useState('');
  const [uploading, setUploading] = useState(false);

  const addFiles = (fileList) => {
    setPhotoError('');
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    const rejected = [];
    const accepted = [];
    for (const f of incoming) {
      if (!ACCEPTED_TYPES.includes(f.type)) { rejected.push(`${f.name} (format)`); continue; }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) { rejected.push(`${f.name} (> ${MAX_SIZE_MB} Mo)`); continue; }
      accepted.push(f);
    }
    setPhotos(prev => {
      const room = MAX_PHOTOS - prev.length;
      const toAdd = accepted.slice(0, Math.max(0, room));
      if (toAdd.length < accepted.length) rejected.push('limite de 6 photos atteinte');
      return [...prev, ...toAdd.map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))];
    });
    if (rejected.length) setPhotoError(`Fichiers ignorés : ${rejected.join(', ')}.`);
  };

  const removePhoto = (index) => {
    setPhotoError('');
    setPhotos(prev => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadPhotos = async () => {
    if (!photos.length) return [];
    setUploading(true);
    try {
      const uid = user.id;
      const uploaded = [];
      for (const { file } of photos) {
        const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
        const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from('product-images')
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      return uploaded;
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pub-page">
        <div className="pub-success">
          <div className="pub-success-ico"><CheckCircle2 size={40} /></div>
          <span className="pub-success-eyebrow">Offre préparée</span>
          <h1>Votre offre est prête à être publiée !</h1>
          <p>
            {photos.length > 0 && isAuthenticated ? (
              <>Vos {photos.length} photo{photos.length > 1 ? 's ont' : ' a'} été téléversée{photos.length > 1 ? 's' : ''} sur Jerossa. </>
            ) : null}
            La mise en ligne complète des offres sera disponible une fois votre profil vendeur validé.
          </p>
          <div className="pub-success-actions">
            <Link to="/" className="j-pill-btn j-pill-btn--green">Retour à l'accueil</Link>
            <Link to={type === 'service' ? '/services' : '/boutique'} className="j-pill-btn j-pill-btn--outline-dark">
              Voir {type === 'service' ? 'les services' : 'les produits'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pub-page">
      {/* Hero */}
      <section className="pub-hero">
        <div className="container">
          <nav className="pub-breadcrumb">
            <Link to="/">Accueil</Link>
            <span>/</span>
            <span>Publier une offre</span>
          </nav>
          <span className="pub-hero-tag">Espace vendeur</span>
          <h1>Publier une offre</h1>
          <p>
            Que souhaitez-vous publier ? Complétez le formulaire, ajoutez vos photos
            et présentez votre activité aux acheteurs de Madagascar et de Maurice.
          </p>
          <div className="pub-type-toggle">
            <button
              className={`pub-type-btn${type === 'produit' ? ' is-active' : ''}`}
              onClick={() => setType('produit')}
            >
              <Package size={17} /> Un produit
            </button>
          </div>
        </div>
      </section>

      <div className="container pub-body">
        <div className="pub-layout">
          <form className="pub-form" onSubmit={async (e) => {
            e.preventDefault();
            if (isAuthenticated && photos.length) {
              try {
                await uploadPhotos();
              } catch (err) {
                setPhotoError(`Échec de l'envoi des photos : ${err.message}`);
                return;
              }
            }
            setSubmitted(true);
          }}>
            {/* Produit */}
            {type === 'produit' && (
              <>
                <div className="pub-section">
                  <h2 className="pub-section-title">Informations sur le produit</h2>
                  <Field label="Titre du produit" required hint="Ex. : Gousses de vanille Bourbon Grade A — 18 cm">
                    <input className="pub-input" placeholder="Nom de votre produit" required />
                  </Field>
                  <Field label="Catégorie" required>
                    <div className="pub-select-wrap">
                      <select className="pub-input pub-select">
                        {categoriesData.map((c) => <option key={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={15} />
                    </div>
                  </Field>
                  <Field label="Description" required hint="Décrivez l'origine, la qualité et les caractéristiques de votre produit.">
                    <textarea className="pub-input pub-textarea" rows={4} placeholder="Description détaillée de votre produit…" required />
                  </Field>
                </div>

                <div className="pub-section">
                  <h2 className="pub-section-title">Prix & disponibilité</h2>
                  <div className="pub-grid-2">
                    <Field label="Prix" required>
                      <input className="pub-input" type="number" step="0.01" min="0" placeholder="0,00" required />
                    </Field>
                    <Field label="Unité de vente" required>
                      <div className="pub-select-wrap">
                        <select className="pub-input pub-select">
                          <option>kg</option>
                          <option>g</option>
                          <option>L</option>
                          <option>Pièce</option>
                          <option>Unitaire</option>
                          <option>Tonnes</option>
                        </select>
                        <ChevronDown size={15} />
                      </div>
                    </Field>
                  </div>
                  <Field label="Devise" required>
                    <div className="pub-select-wrap">
                      <select className="pub-input pub-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.label}</option>)}
                      </select>
                      <ChevronDown size={15} />
                    </div>
                    <p className="j-currency-note" style={{ marginTop: 8 }}>
                      <Lock size={13} /> {CURRENCY_NOTE}
                    </p>
                  </Field>
                  <Field label="Disponibilité" required>
                    <div className="pub-select-wrap">
                      <select className="pub-input pub-select">
                        <option>En stock</option>
                        <option>Sur commande</option>
                        <option>Disponible en gros</option>
                        <option>Quantité limitée</option>
                      </select>
                      <ChevronDown size={15} />
                    </div>
                  </Field>
                </div>

                <div className="pub-section">
                  <h2 className="pub-section-title">Photos & localisation</h2>
                  <Field label="Photos du produit">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_TYPES.join(',')}
                      multiple
                      hidden
                      onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
                    />
                    <button
                      type="button"
                      className="pub-upload"
                      disabled={photos.length >= MAX_PHOTOS}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={20} />
                      <span><strong>Ajouter des photos</strong></span>
                      <span className="pub-upload-hint">JPG, PNG, WebP — max {MAX_SIZE_MB} Mo — jusqu'à {MAX_PHOTOS} photos</span>
                    </button>
                    {!isAuthenticated && (
                      <span className="pub-hint">
                        <Link to="/login">Connectez-vous</Link> pour téléverser vos photos lors de la publication.
                      </span>
                    )}
                    {photoError && (
                      <span className="pub-hint" style={{ color: 'var(--danger)' }}>{photoError}</span>
                    )}
                    {photos.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                        {photos.map((p, i) => (
                          <div key={p.previewUrl} style={{ position: 'relative' }}>
                            <img
                              src={p.previewUrl}
                              alt={`Aperçu ${i + 1}`}
                              style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border, #e5e5e5)', display: 'block' }}
                            />
                            <button
                              type="button"
                              aria-label="Retirer cette photo"
                              onClick={() => removePhoto(i)}
                              style={{
                                position: 'absolute', top: -6, right: -6,
                                width: 22, height: 22, borderRadius: '50%',
                                background: '#111', color: '#fff',
                                border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                              }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Field>
                  <Field label="Origine" required hint="Madagascar, Maurice, région…">
                    <div className="pub-select-wrap">
                      <select className="pub-input pub-select">
                        <option>Madagascar</option>
                        <option>Maurice</option>
                        <option>Autre</option>
                      </select>
                      <ChevronDown size={15} />
                    </div>
                  </Field>
                </div>
              </>
            )}

            {/* Service */}
            {type === 'service' && (
              <>
                <div className="pub-section">
                  <h2 className="pub-section-title">Informations sur le service</h2>
                  <Field label="Titre du service" required hint="Ex. : Plomberie résidentielle & commerciale">
                    <input className="pub-input" placeholder="Nom de votre service" required />
                  </Field>
                  <Field label="Catégorie" required>
                    <div className="pub-select-wrap">
                      <select className="pub-input pub-select">
                        {serviceCategories.map((c) => <option key={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={15} />
                    </div>
                  </Field>
                  <Field label="Description du service" required hint="Décrivez vos prestations, votre méthode et vos points forts.">
                    <textarea className="pub-input pub-textarea" rows={4} placeholder="Description détaillée de votre service…" required />
                  </Field>
                </div>

                <div className="pub-section">
                  <h2 className="pub-section-title">Zone & disponibilité</h2>
                  <div className="pub-grid-2">
                    <Field label="Zone géographique" required hint="Ex. : Curepipe, Maurice">
                      <div className="pub-input-ico">
                        <MapPin size={15} />
                        <input className="pub-input" placeholder="Ville, région" required />
                      </div>
                    </Field>
                    <Field label="Disponibilité" required>
                      <div className="pub-select-wrap">
                        <select className="pub-input pub-select">
                          <option>Disponible</option>
                          <option>Intervention rapide</option>
                          <option>Sur demande</option>
                          <option>Sur rendez-vous</option>
                        </select>
                        <ChevronDown size={15} />
                      </div>
                    </Field>
                  </div>
                  <Field label="Expérience">
                    <div className="pub-select-wrap">
                      <select className="pub-input pub-select">
                        <option>Moins de 2 ans</option>
                        <option>2 à 5 ans</option>
                        <option>5 à 10 ans</option>
                        <option>10 à 20 ans</option>
                        <option>Plus de 20 ans</option>
                      </select>
                      <ChevronDown size={15} />
                    </div>
                  </Field>
                </div>

                <div className="pub-section">
                  <h2 className="pub-section-title">Tarif</h2>
                  <div className="pub-grid-2">
                    <Field label="Prix de départ" required>
                      <input className="pub-input" type="number" step="0.01" min="0" placeholder="0,00" required />
                    </Field>
                    <Field label="Unité" required>
                      <div className="pub-select-wrap">
                        <select className="pub-input pub-select">
                          <option>Par heure</option>
                          <option>Par intervention</option>
                          <option>Par projet</option>
                          <option>Par mois</option>
                          <option>Sur devis</option>
                        </select>
                        <ChevronDown size={15} />
                      </div>
                    </Field>
                  </div>
                  <Field label="Devise" required>
                    <div className="pub-select-wrap">
                      <select className="pub-input pub-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.label}</option>)}
                      </select>
                      <ChevronDown size={15} />
                    </div>
                    <p className="j-currency-note" style={{ marginTop: 8 }}>
                      <Lock size={13} /> {CURRENCY_NOTE}
                    </p>
                  </Field>
                </div>

                <div className="pub-section">
                  <h2 className="pub-section-title">Photos ou réalisations</h2>
                  <Field label="Présentez vos réalisations">
                    <button
                      type="button"
                      className="pub-upload"
                      disabled={photos.length >= MAX_PHOTOS}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={20} />
                      <span><strong>Ajouter des photos ou réalisations</strong></span>
                      <span className="pub-upload-hint">JPG, PNG, WebP — max {MAX_SIZE_MB} Mo — jusqu'à {MAX_PHOTOS} photos</span>
                    </button>
                  </Field>
                  <Field label="Coordonnées ou contact" hint="Vos échanges passent par la messagerie Jerossa : vous n'exposez vos coordonnées que si vous le souhaitez.">
                    <div className="pub-input-ico">
                      <Briefcase size={15} />
                      <input className="pub-input" placeholder="Nom de l'entreprise, téléphone (optionnel)" />
                    </div>
                  </Field>
                </div>
              </>
            )}

            <div className="pub-submit-row">
              <button type="submit" className="pub-submit" disabled={uploading}>
                <PlusCircle size={17} />
                {uploading ? 'Envoi des photos…' : type === 'service' ? 'Publier mon service' : 'Publier mon produit'}
                {!uploading && <ArrowRight size={16} />}
              </button>
              <p className="pub-submit-note">
                <Lock size={13} /> En publiant, vous acceptez les conditions d'utilisation de Jerossa.
              </p>
            </div>
          </form>

          <aside className="pub-aside">
            <div className="pub-aside-card">
              <h3>Votre offre sera visible par</h3>
              <ul className="pub-aside-list">
                <li><CheckCircle2 size={15} /> <span>Les acheteurs de Madagascar et de Maurice</span></li>
                <li><CheckCircle2 size={15} /> <span>Les entreprises et professionnels en recherche de fournisseurs</span></li>
                <li><CheckCircle2 size={15} /> <span>Les importateurs et négociants des deux territoires</span></li>
              </ul>
            </div>

            <div className="pub-aside-card">
              <h3>Bonnes pratiques</h3>
              <ul className="pub-aside-list">
                <li><Info size={15} /> <span>Photos de qualité : vos chances de contact augmentent fortement.</span></li>
                <li><Info size={15} /> <span>Renseignez un prix clair et précis pour générer plus de demandes.</span></li>
                <li><Info size={15} /> <span>Répondez rapidement : la réactivité est un gage de confiance.</span></li>
              </ul>
            </div>

            <div className="pub-aside-note">
              <Lock size={15} />
              Badges « Fournisseur vérifié » et « Produit contrôlé »
              seront attribués après vérification de votre profil.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Publish;
