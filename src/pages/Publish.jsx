import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Package, Briefcase, CheckCircle2, ArrowRight, Upload, MapPin,
  ChevronDown, Lock, Info, PlusCircle, X, Store, Clock, XCircle, Ban
} from 'lucide-react';
import { fetchCategoriesForSelect } from '../services/seller';
import { serviceCategories } from '../data/services';
import { useCurrency, CURRENCIES, CURRENCY_NOTE } from '../context/CurrencyContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
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

const slugifyProduct = (value) =>
  (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48) || 'produit';

const Publish = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'service' ? 'service' : 'produit';
  const { t } = useLang();
  const [type, setType] = useState(initialType);
  const [submitted, setSubmitted] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const { user, isAuthenticated } = useAuth();

  const fileInputRef = useRef(null);
  const [photos, setPhotos] = useState([]); // { file, previewUrl }
  const [photoError, setPhotoError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [producer, setProducer] = useState(null);
  const [producerChecked, setProducerChecked] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [publishedProduct, setPublishedProduct] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);

  const [pTitle, setPTitle] = useState('');
  const [pCategoryName, setPCategoryName] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pUnit, setPUnit] = useState('kg');
  const [pAvailability, setPAvailability] = useState('En stock');
  const [pOrigin, setPOrigin] = useState('Madagascar');

  useEffect(() => {
    if (!isAuthenticated) {
      setProducer(null);
      setProducerChecked(true);
      return;
    }
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from('producers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (alive) {
        setProducer(data || null);
        setProducerChecked(true);
      }
    })();
    return () => { alive = false; };
  }, [isAuthenticated, user]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const cats = await fetchCategoriesForSelect();
      if (alive) {
        setCategoriesData(cats);
        if (cats.length && !pCategoryName) {
          setPCategoryName(cats[0].name);
        }
      }
    })();
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isApprovedSeller = !!(producer && producer.status === 'approved');

  const addFiles = (fileList) => {
    setPhotoError('');
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    const rejected = [];
    const accepted = [];
    for (const f of incoming) {
      if (!ACCEPTED_TYPES.includes(f.type)) { rejected.push(`${f.name}${t('publish.photoFormat')}`); continue; }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) { rejected.push(`${f.name} (> ${MAX_SIZE_MB} Mo)`); continue; }
      accepted.push(f);
    }
    setPhotos(prev => {
      const room = MAX_PHOTOS - prev.length;
      const toAdd = accepted.slice(0, Math.max(0, room));
      if (toAdd.length < accepted.length) rejected.push(t('publish.photoLimit'));
      return [...prev, ...toAdd.map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))];
    });
    if (rejected.length) setPhotoError(`${t('publish.photoErrorPrefix')}${rejected.join(', ')}.`);
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

  const createProduct = async (imageUrls) => {
    const catEntry = categoriesData.find((c) => c.name === pCategoryName);
    let categoryId = null;
    if (catEntry?.slug) {
      const { data: catRow } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', catEntry.slug)
        .maybeSingle();
      categoryId = catRow?.id || null;
    }
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          product_code: `PROD-${Date.now().toString(36).toUpperCase()}`,
          slug: `${slugifyProduct(pTitle)}-${Math.random().toString(36).slice(2, 6)}`,
          title: pTitle.trim(),
          description: pDescription.trim(),
          seller_id: producer.id,
          category_id: categoryId,
          price_eur: Number(pPrice),
          unit: pUnit,
          origin: pOrigin,
          market: currency === 'MUR' ? 'MU' : 'MG',
          availability: pAvailability,
          images: imageUrls,
          active: true,
          verified: false
        })
        .select()
        .single();
      if (!error) return data;
      lastError = error;
      if (error.code !== '23505') break;
    }
    throw lastError;
  };

  if (submitted) {
    const isLive = !!publishedProduct;
    return (
      <div className="pub-page">
        <div className="pub-success">
          <div className="pub-success-ico"><CheckCircle2 size={40} /></div>
          <span className="pub-success-eyebrow">{isLive ? t('publish.success.liveEyebrow') : t('publish.success.prepEyebrow')}</span>
          <h1>{isLive ? t('publish.success.liveTitle') : t('publish.success.prepTitle')}</h1>
          <p>
            {isLive ? (
              <>
                {t('publish.success.liveText', { title: publishedProduct.title })}
              </>
            ) : (
              <>
                {photos.length > 0 && isAuthenticated ? (
                  <>{t('publish.success.photoUploaded', { count: photos.length })} </>
                ) : null}
                {t('publish.success.pendingNote')}
              </>
            )}
          </p>
          <div className="pub-success-actions">
            {isLive ? (
              <>
                <Link to={`/product/${publishedProduct.slug}`} className="j-pill-btn j-pill-btn--green">{t('publish.success.viewProduct')}</Link>
                <Link to={`/producteur/${producer.slug}`} className="j-pill-btn j-pill-btn--outline-dark">{t('publish.success.myShop')}</Link>
              </>
            ) : (
              <>
                <Link to="/" className="j-pill-btn j-pill-btn--green">{t('publish.success.backHome')}</Link>
                <Link to={type === 'service' ? '/services' : '/boutique'} className="j-pill-btn j-pill-btn--outline-dark">
                  {t(type === 'service' ? 'publish.success.viewServices' : 'publish.success.viewProducts')}
                </Link>
              </>
            )}
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
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <span>{t('publish.breadcrumb')}</span>
          </nav>
          <span className="pub-hero-tag">{t('publish.tag')}</span>
          <h1>{t('publish.title')}</h1>
          <p>
            {t('publish.desc')}
          </p>
          <div className="pub-type-toggle">
            <button
              className={`pub-type-btn${type === 'produit' ? ' is-active' : ''}`}
              onClick={() => setType('produit')}
            >
              <Package size={17} /> {t('publish.typeProduit')}
            </button>
          </div>
        </div>
      </section>

      <div className="container pub-body">
        <div className="pub-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {type === 'produit' && isAuthenticated && producerChecked && !isApprovedSeller && (
              <div className="pub-seller-status">
                {(!producer || producer.status === 'pending') && (
                  <>
                    <Clock size={17} />
                    <span>
                      {!producer ? (
                        <>{t('publish.sellerStatus.createShop')}<Link to="/vendeur/devenir">{t('publish.link.becomeSeller')}</Link>.</>
                      ) : (
                        <>{t('publish.sellerStatus.pending', { name: producer.name })}<Link to="/vendeur/statut">{t('publish.link.follow')}</Link>{t('publish.sellerStatus.pendingEnd')}</>
                      )}
                    </span>
                  </>
                )}
                {producer && producer.status === 'rejected' && (
                  <>
                    <XCircle size={17} />
                    <span>{t('publish.sellerStatus.rejected', { note: producer.review_note ? ` (${producer.review_note})` : '' })}<Link to="/vendeur/devenir">{t('publish.link.correct')}</Link>.</span>
                  </>
                )}
                {producer && producer.status === 'suspended' && (
                  <>
                    <Ban size={17} />
                    <span>{t('publish.sellerStatus.suspended')}</span>
                  </>
                )}
              </div>
            )}
            {isApprovedSeller && type === 'produit' && (
              <div className="pub-seller-status pub-seller-status--ok">
                <Store size={17} />
                <span>{t('publish.sellerStatus.approved', { name: producer.name })}</span>
              </div>
            )}

            <form className="pub-form" onSubmit={async (e) => {
            e.preventDefault();
            setPublishError('');
            let imageUrls = [];
            if (isAuthenticated && photos.length) {
              try {
                imageUrls = await uploadPhotos();
              } catch (err) {
                setPhotoError(`${t('publish.uploadErrorPrefix')}${err.message}`);
                return;
              }
            }
            if (type === 'produit' && isAuthenticated && isApprovedSeller) {
              try {
                const created = await createProduct(imageUrls);
                setPublishedProduct(created);
              } catch (err) {
                setPublishError(`${t('publish.publishErrorPrefix')}${err.message}`);
                return;
              }
            }
            setSubmitted(true);
          }}>
            {/* Produit */}
            {type === 'produit' && (
              <>
                <div className="pub-section">
                  <h2 className="pub-section-title">{t('publish.section.product')}</h2>
                  <Field label={t('publish.label.productTitle')} required hint={t('publish.hint.productTitle')}>
                    <input className="pub-input" placeholder={t('publish.placeholder.productTitle')} value={pTitle} onChange={(e) => setPTitle(e.target.value)} required />
                  </Field>
                  <Field label={t('publish.label.category')} required>
                    <div className="pub-select-wrap">
                      <select className="pub-input pub-select" value={pCategoryName} onChange={(e) => setPCategoryName(e.target.value)}>
                        {categoriesData.map((c) => <option key={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={15} />
                    </div>
                  </Field>
                  <Field label={t('publish.label.description')} required hint={t('publish.hint.description')}>
                    <textarea className="pub-input pub-textarea" rows={4} placeholder={t('publish.placeholder.description')} value={pDescription} onChange={(e) => setPDescription(e.target.value)} required />
                  </Field>
                </div>

                <div className="pub-section">
                  <h2 className="pub-section-title">{t('publish.section.price')}</h2>
                  <div className="pub-grid-2">
                    <Field label={t('publish.label.price')} required>
                      <input className="pub-input" type="number" step="0.01" min="0" placeholder="0,00" value={pPrice} onChange={(e) => setPPrice(e.target.value)} required />
                    </Field>
                    <Field label={t('publish.label.unitSale')} required>
                      <div className="pub-select-wrap">
                        <select className="pub-input pub-select" value={pUnit} onChange={(e) => setPUnit(e.target.value)}>
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
                  <Field label={t('publish.label.currency')} required>
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
                  <Field label={t('publish.label.availability')} required>
                    <div className="pub-select-wrap">
                      <select className="pub-input pub-select" value={pAvailability} onChange={(e) => setPAvailability(e.target.value)}>
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
                  <h2 className="pub-section-title">{t('publish.section.photos')}</h2>
                  <Field label={t('publish.label.photos')}>
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
                      <span><strong>{t('publish.addPhotos')}</strong></span>
                      <span className="pub-upload-hint">{t('publish.uploadHint', { max: MAX_SIZE_MB, count: MAX_PHOTOS })}</span>
                    </button>
                    {!isAuthenticated && (
                      <span className="pub-hint">
                        <Link to="/login">{t('nav.login')}</Link> {t('publish.loginToUpload')}
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
                              alt={t('publish.previewAlt', { n: i + 1 })}
                              style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border, #e5e5e5)', display: 'block' }}
                            />
                            <button
                              type="button"
                              aria-label={t('publish.removePhoto')}
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
                  <Field label={t('publish.label.origin')} required hint={t('publish.hint.origin')}>
                    <div className="pub-select-wrap">
                      <select className="pub-input pub-select" value={pOrigin} onChange={(e) => setPOrigin(e.target.value)}>
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
                  <h2 className="pub-section-title">{t('publish.section.service')}</h2>
                  <Field label={t('publish.label.serviceTitle')} required hint={t('publish.hint.serviceTitle')}>
                    <input className="pub-input" placeholder={t('publish.placeholder.serviceTitle')} required />
                  </Field>
                  <Field label={t('publish.label.category')} required>
                    <div className="pub-select-wrap">
                      <select className="pub-input pub-select">
                        {serviceCategories.map((c) => <option key={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={15} />
                    </div>
                  </Field>
                  <Field label={t('publish.label.serviceDesc')} required hint={t('publish.hint.serviceDesc')}>
                    <textarea className="pub-input pub-textarea" rows={4} placeholder={t('publish.placeholder.serviceDesc')} required />
                  </Field>
                </div>

                <div className="pub-section">
                  <h2 className="pub-section-title">{t('publish.section.zone')}</h2>
                  <div className="pub-grid-2">
                    <Field label={t('publish.label.zoneGeo')} required hint={t('publish.hint.zoneGeo')}>
                      <div className="pub-input-ico">
                        <MapPin size={15} />
                        <input className="pub-input" placeholder={t('publish.placeholder.zoneGeo')} required />
                      </div>
                    </Field>
                    <Field label={t('publish.label.availability')} required>
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
                  <Field label={t('publish.label.exp')}>
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
                  <h2 className="pub-section-title">{t('publish.section.rate')}</h2>
                  <div className="pub-grid-2">
                    <Field label={t('publish.label.startPrice')} required>
                      <input className="pub-input" type="number" step="0.01" min="0" placeholder="0,00" required />
                    </Field>
                    <Field label={t('publish.label.unit')} required>
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
                  <Field label={t('publish.label.currency')} required>
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
                  <h2 className="pub-section-title">{t('publish.section.photosService')}</h2>
                  <Field label={t('publish.showWorks')}>
                    <button
                      type="button"
                      className="pub-upload"
                      disabled={photos.length >= MAX_PHOTOS}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={20} />
                      <span><strong>{t('publish.addWorks')}</strong></span>
                      <span className="pub-upload-hint">{t('publish.uploadHint', { max: MAX_SIZE_MB, count: MAX_PHOTOS })}</span>
                    </button>
                  </Field>
                  <Field label={t('publish.label.coords')} hint={t('publish.hint.coords')}>
                    <div className="pub-input-ico">
                      <Briefcase size={15} />
                      <input className="pub-input" placeholder={t('publish.placeholder.coords')} />
                    </div>
                  </Field>
                </div>
              </>
            )}

            <div className="pub-submit-row">
              <button type="submit" className="pub-submit" disabled={uploading}>
                <PlusCircle size={17} />
                {uploading ? t('publish.submitUploading') : type === 'service' ? t('publish.submitService') : t('publish.submitProduct')}
                {!uploading && <ArrowRight size={16} />}
              </button>
              {publishError && (
                <p className="pub-submit-note" style={{ color: 'var(--danger)' }}>{publishError}</p>
              )}
              <p className="pub-submit-note">
                <Lock size={13} /> {t('publish.acceptTerms')}
              </p>
            </div>
          </form>
          </div>

          <aside className="pub-aside">
            <div className="pub-aside-card">
              <h3>{t('publish.asideVisibleTitle')}</h3>
              <ul className="pub-aside-list">
                <li><CheckCircle2 size={15} /> <span>{t('publish.asideVisible1')}</span></li>
                <li><CheckCircle2 size={15} /> <span>{t('publish.asideVisible2')}</span></li>
                <li><CheckCircle2 size={15} /> <span>{t('publish.asideVisible3')}</span></li>
              </ul>
            </div>

            <div className="pub-aside-card">
              <h3>{t('publish.asideTipsTitle')}</h3>
              <ul className="pub-aside-list">
                <li><Info size={15} /> <span>{t('publish.asideTip1')}</span></li>
                <li><Info size={15} /> <span>{t('publish.asideTip2')}</span></li>
                <li><Info size={15} /> <span>{t('publish.asideTip3')}</span></li>
              </ul>
            </div>

            <div className="pub-aside-note">
              <Lock size={15} />
              {t('publish.asideBadges')}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Publish;
