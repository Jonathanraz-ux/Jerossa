import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertTriangle, Upload, X, Image } from 'lucide-react';
import { saveMyShop, uploadShopImage, uploadSellerLogo } from '../services/seller';

const PAYMENT_METHODS = [
  'MVola',
  'Orange Money',
  'Airtel Money',
  'Virement bancaire (MCB / SBM)',
  'Juice / MauCas (Maurice)',
  'Autre'
];

const Field = ({ label, required, children, hint }) => (
  <div className="sl-field">
    <label className="sl-label">{label} {required && <span className="sl-required">*</span>}</label>
    {children}
    {hint && <span className="sl-hint">{hint}</span>}
  </div>
);

const SellerShop = () => {
  const { producer } = useOutletContext();

  const [name, setName] = useState(producer.name || '');
  const [location, setLocation] = useState(producer.location || '');
  const [established, setEstablished] = useState(producer.established ? String(producer.established) : '');
  const [description, setDescription] = useState(producer.description || '');
  const [email, setEmail] = useState(producer.contact_email || '');
  const [phone, setPhone] = useState(producer.phone || '');
  const [payMethod, setPayMethod] = useState(producer.payment_info?.method || PAYMENT_METHODS[0]);
  const [payDetail, setPayDetail] = useState(producer.payment_info?.detail || '');

  const [imageUrl, setImageUrl] = useState(producer.image_url || '');
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const [logoUrl, setLogoUrl] = useState(producer.logo_url || '');
  const logoInputRef = useRef(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(t);
  }, [saved]);

  const pickImage = async (file) => {
    setImageError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Format accepté : JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image trop lourde (max 5 Mo).');
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadShopImage(file);
      setImageUrl(url);
    } catch (err) {
      setImageError(`Échec de l'envoi : ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const pickLogo = async (file) => {
    setLogoError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setLogoError('Format accepté : JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Logo trop lourd (max 2 Mo).');
      return;
    }
    setUploadingLogo(true);
    try {
      const url = await uploadSellerLogo(file);
      setLogoUrl(url);
    } catch (err) {
      setLogoError(`Échec de l'envoi : ${err.message}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);
    const res = await saveMyShop({
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
      established,
      contactEmail: email.trim(),
      phone: phone.trim(),
      paymentInfo: { method: payMethod, detail: payDetail.trim() },
      imageUrl: imageUrl.trim(),
      logoUrl: logoUrl.trim(),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error?.message || 'Échec de la mise à jour.');
      return;
    }
    setSaved(true);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 className="sv-section-title">Profil de ma boutique</h2>
      <p className="sv-dim" style={{ marginBottom: '1.25rem' }}>
        Ces informations sont visibles publiquement sur votre page boutique.
      </p>

      {saved && <div className="sv-success-note"><CheckCircle2 size={15} /> Boutique mise à jour.</div>}
      {error && <div className="sv-error-banner"><AlertTriangle size={16} /><span>{error}</span></div>}

      <form className="sv-panel" onSubmit={onSubmit}>
        <Field label="Nom de la boutique" required>
          <input className="sl-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>

        <Field label="Photo / logo de la boutique">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => { pickImage(e.target.files[0]); e.target.value = ''; }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 14, border: '1px solid var(--border)' }}
              />
            ) : null}
            <button type="button" className="sv-btn sv-btn--ghost" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
              {uploadingImage
                ? <><Loader2 size={14} style={{ animation: 'sv-rotate 0.9s linear infinite' }} /> Envoi…</>
                : <><Upload size={14} /> {imageUrl ? 'Changer' : 'Ajouter une image'}</>}
            </button>
          </div>
          {imageError && <span className="sl-hint" style={{ color: 'var(--danger)' }}>{imageError}</span>}
        </Field>

        <Field label="Logo professionnel" hint="PNG, JPG ou WebP — max 2 Mo. Affiché sur votre page publique.">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => { pickLogo(e.target.files[0]); e.target.value = ''; }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            {logoUrl ? (
              <div style={{
                width: 64, height: 64, borderRadius: 14, border: '1px solid var(--border)',
                overflow: 'hidden', background: '#fafafa', position: 'relative',
              }}>
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                />
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  style={{
                    position: 'absolute', top: 2, right: 2, width: 18, height: 18,
                    borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff',
                    border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: 0,
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: 14, border: '2px dashed var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#faf9f7', color: 'var(--text-muted)',
              }}>
                <Image size={20} />
              </div>
            )}
            <div>
              <button type="button" className="sv-btn sv-btn--ghost" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                {uploadingLogo
                  ? <><Loader2 size={14} style={{ animation: 'sv-rotate 0.9s linear infinite' }} /> Envoi…</>
                  : <><Upload size={14} /> {logoUrl ? 'Remplacer le logo' : 'Ajouter un logo'}</>}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  style={{
                    background: 'none', border: 'none', color: 'var(--danger)',
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    padding: '4px 8px', marginTop: '2px', display: 'block',
                  }}
                >
                  Supprimer le logo
                </button>
              )}
            </div>
          </div>
          {logoError && <span className="sl-hint" style={{ color: 'var(--danger)' }}>{logoError}</span>}
        </Field>

        <div className="sv-form-row">
          <Field label="Localisation" required>
            <input className="sl-input" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </Field>
          <Field label="Année de création">
            <input className="sl-input" type="number" min="1900" max={new Date().getFullYear()} value={established} onChange={(e) => setEstablished(e.target.value)} />
          </Field>
        </div>

        <Field label="Description publique" required hint="Présentez votre activité, vos spécialités et vos certifications.">
          <textarea className="sl-input sl-textarea" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </Field>

        <div className="sv-form-row">
          <Field label="Email de contact" required>
            <input className="sl-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Téléphone">
            <input className="sl-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>

        <div className="sv-form-row">
          <Field label="Moyen de paiement" required>
            <select className="sl-input" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Numéro / compte de réception" required>
            <input className="sl-input" value={payDetail} onChange={(e) => setPayDetail(e.target.value)} required />
          </Field>
        </div>

        <p className="sv-hint" style={{ display: 'block', marginTop: '-0.5rem' }}>
          Vos informations bancaires ne sont jamais affichées publiquement — elles servent uniquement au versement de vos ventes.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="sv-btn sv-btn--primary" disabled={saving}>
            {saving && <Loader2 size={14} style={{ animation: 'sv-rotate 0.9s linear infinite' }} />}
            Enregistrer
          </button>
          <Link to={`/producteur/${producer.slug}`} className="sv-btn sv-btn--ghost">Voir ma page publique</Link>
        </div>
      </form>
    </div>
  );
};

export default SellerShop;
