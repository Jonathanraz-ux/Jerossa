import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertTriangle, Upload, X, Image } from 'lucide-react';
import { saveMyShop, uploadShopImage, uploadSellerLogo } from '../services/seller';
import { useLang } from '../context/LangContext';

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
  const { t } = useLang();

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
      setImageError(t('seller.shop.imageFormat'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError(t('seller.shop.imageTooLarge'));
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadShopImage(file);
      setImageUrl(url);
    } catch (err) {
      setImageError(t('seller.shop.imageUploadError', { error: err.message }));
    } finally {
      setUploadingImage(false);
    }
  };

  const pickLogo = async (file) => {
    setLogoError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setLogoError(t('seller.shop.logoFormat'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError(t('seller.shop.logoTooLarge'));
      return;
    }
    setUploadingLogo(true);
    try {
      const url = await uploadSellerLogo(file);
      setLogoUrl(url);
    } catch (err) {
      setLogoError(t('seller.shop.logoUploadError', { error: err.message }));
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
      setError(res.error?.message || t('seller.shop.saved'));
      return;
    }
    setSaved(true);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 className="sv-section-title">{t('seller.shop.title')}</h2>
      <p className="sv-dim" style={{ marginBottom: '1.25rem' }}>
        {t('seller.shop.subtitle')}
      </p>

      {saved && <div className="sv-success-note"><CheckCircle2 size={15} /> {t('seller.shop.saved')}</div>}
      {error && <div className="sv-error-banner"><AlertTriangle size={16} /><span>{error}</span></div>}

      <form className="sv-panel" onSubmit={onSubmit}>
        <Field label={t('seller.shop.fieldName')} required>
          <input className="sl-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>

        <Field label={t('seller.shop.fieldImage')}>
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
                ? <><Loader2 size={14} style={{ animation: 'sv-rotate 0.9s linear infinite' }} /> {t('seller.shop.imageSending')}</>
                : <><Upload size={14} /> {imageUrl ? t('seller.shop.imageChange') : t('seller.shop.imageAdd')}</>}
            </button>
          </div>
          {imageError && <span className="sl-hint" style={{ color: 'var(--danger)' }}>{imageError}</span>}
        </Field>

        <Field label={t('seller.shop.fieldLogo')} hint={t('seller.shop.logoHint')}>
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
                  alt={t('seller.shop.fieldLogo')}
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
                  ? <><Loader2 size={14} style={{ animation: 'sv-rotate 0.9s linear infinite' }} /> {t('seller.shop.imageSending')}</>
                  : <><Upload size={14} /> {logoUrl ? t('seller.shop.logoReplace') : t('seller.shop.logoAdd')}</>}
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
                  {t('seller.shop.logoDelete')}
                </button>
              )}
            </div>
          </div>
          {logoError && <span className="sl-hint" style={{ color: 'var(--danger)' }}>{logoError}</span>}
        </Field>

        <div className="sv-form-row">
          <Field label={t('seller.shop.fieldLocation')} required>
            <input className="sl-input" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </Field>
          <Field label={t('seller.shop.fieldYear')}>
            <input className="sl-input" type="number" min="1900" max={new Date().getFullYear()} value={established} onChange={(e) => setEstablished(e.target.value)} />
          </Field>
        </div>

        <Field label={t('seller.shop.fieldDescription')} required hint={t('seller.shop.descriptionHint')}>
          <textarea className="sl-input sl-textarea" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </Field>

        <div className="sv-form-row">
          <Field label={t('seller.shop.fieldEmail')} required>
            <input className="sl-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label={t('seller.shop.fieldPhone')}>
            <input className="sl-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>

        <div className="sv-form-row">
          <Field label={t('seller.shop.fieldPayMethod')} required>
            <select className="sl-input" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label={t('seller.shop.fieldPayDetail')} required>
            <input className="sl-input" value={payDetail} onChange={(e) => setPayDetail(e.target.value)} required />
          </Field>
        </div>

        <p className="sv-hint" style={{ display: 'block', marginTop: '-0.5rem' }}>
          {t('seller.shop.bankPrivacy')}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="sv-btn sv-btn--primary" disabled={saving}>
            {saving && <Loader2 size={14} style={{ animation: 'sv-rotate 0.9s linear infinite' }} />}
            {t('seller.shop.save')}
          </button>
          <Link to={`/producteur/${producer.slug}`} className="sv-btn sv-btn--ghost">{t('seller.shop.viewPublicPage')}</Link>
        </div>
      </form>
    </div>
  );
};

export default SellerShop;
