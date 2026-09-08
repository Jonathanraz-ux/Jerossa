import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store, CheckCircle2, Clock, XCircle, Ban, Upload, ChevronDown,
  FileText, X, LogIn, Loader2, ShieldCheck, Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './SellerOnboarding.css';

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ACCEPTED_EXT = '.jpg,.jpeg,.png,.pdf';

const PAYMENT_METHODS = [
  'MVola',
  'Orange Money',
  'Airtel Money',
  'Virement bancaire (MCB / SBM)',
  'Juice / MauCas (Maurice)',
  'Autre'
];

const SELLER_TYPES = [
  { value: 'individual', label: 'Particulier / artisan / producteur individuel' },
  { value: 'company',    label: 'Entreprise / société' },
  { value: 'cooperative', label: 'Coopérative / association' }
];

const Field = ({ label, required, children, hint }) => (
  <div className="sl-field">
    <label className="sl-label">
      {label} {required && <span className="sl-required">*</span>}
    </label>
    {children}
    {hint && <span className="sl-hint">{hint}</span>}
  </div>
);

const formatSize = (bytes) => {
  if (!bytes) return '';
  const kb = bytes / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} Mo` : `${Math.round(kb)} Ko`;
};

const DOCUMENT_SLOTS = {
  individual: [
    { key: 'identity',        labelKey: 'onboarding.docIdentity',        required: true,  descriptionKey: 'onboarding.docIdentityDesc' },
    { key: 'payment_proof',   labelKey: 'onboarding.docPaymentProof',    required: true,  descriptionKey: 'onboarding.docPaymentProofDesc' },
    { key: 'activity_proof',  labelKey: 'onboarding.docActivityProof',   required: false, descriptionKey: 'onboarding.docActivityProofDesc' }
  ],
  company: [
    { key: 'registration',      labelKey: 'onboarding.docRegistration',       required: true,  descriptionKey: 'onboarding.docRegistrationDesc' },
    { key: 'tax_id',            labelKey: 'onboarding.docTaxId',               required: true,  descriptionKey: 'onboarding.docTaxIdDesc' },
    { key: 'representative_id', labelKey: 'onboarding.docRepresentativeId',   required: true,  descriptionKey: 'onboarding.docRepresentativeIdDesc' },
    { key: 'company_docs',      labelKey: 'onboarding.docCompanyDocs',        required: false, descriptionKey: 'onboarding.docCompanyDocsDesc' },
    { key: 'activity_auth',     labelKey: 'onboarding.docActivityAuth',       required: false, conditional: true, descriptionKey: 'onboarding.docActivityAuthDesc' },
    { key: 'payment_proof',     labelKey: 'onboarding.docPaymentProof',       required: true,  descriptionKey: 'onboarding.docPaymentProofDesc' }
  ],
  cooperative: [
    { key: 'registration',      labelKey: 'onboarding.docEnrollment',        required: true,  descriptionKey: 'onboarding.docEnrollmentDesc' },
    { key: 'representative_id', labelKey: 'onboarding.docResponsibleId',     required: true,  descriptionKey: 'onboarding.docResponsibleIdDesc' },
    { key: 'mandate',           labelKey: 'onboarding.docMandate',            required: false, descriptionKey: 'onboarding.docMandateDesc' },
    { key: 'activity_auth',     labelKey: 'onboarding.docActivityAuth',       required: false, conditional: true, descriptionKey: 'onboarding.docActivityAuthDesc' },
    { key: 'payment_proof',     labelKey: 'onboarding.docPaymentProof',       required: true,  descriptionKey: 'onboarding.docPaymentProofDesc' }
  ]
};

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const { t } = useLang();

  const [checking, setChecking] = useState(true);
  const [existing, setExisting] = useState(null);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [established, setEstablished] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [payMethod, setPayMethod] = useState(PAYMENT_METHODS[0]);
  const [payDetail, setPayDetail] = useState('');

  const [sellerType, setSellerType] = useState('');
  const [docSlots, setDocSlots] = useState({});
  const [slotErrors, setSlotErrors] = useState({});
  const [consentGiven, setConsentGiven] = useState(false);

  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setChecking(false);
      return;
    }
    let alive = true;
    (async () => {
      const { data, error: err } = await supabase
        .from('producers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!alive) return;
      setExisting(err ? null : data);
      if (data?.status === 'rejected') {
        setName(data.name || '');
        setLocation(data.location || '');
        setEstablished(data.established ? String(data.established) : '');
        setDescription(data.description || '');
        setEmail(data.contact_email || '');
        setPhone(data.phone || '');
        setPayMethod(data.payment_info?.method || PAYMENT_METHODS[0]);
        setPayDetail(data.payment_info?.detail || '');
        setSellerType(data.seller_type || '');
        const prevDocs = Array.isArray(data.documents) ? data.documents : [];
        if (prevDocs.length && data.seller_type) {
          const slots = {};
          const slotsDef = DOCUMENT_SLOTS[data.seller_type] || [];
          prevDocs.forEach((doc, i) => {
            if (slotsDef[i]) {
              slots[slotsDef[i].key] = { file: null, existing: doc };
            }
          });
          setDocSlots(slots);
        }
      } else if (!data) {
        setEmail(user.email || '');
        if (profile) {
          setPhone(profile.phone || '');
          setLocation(
            [profile.city, profile.country].filter(Boolean).join(', ') || ''
          );
        }
      }
      setChecking(false);
    })();
    return () => { alive = false; };
  }, [isAuthenticated, user, profile]);

  const handleSellerTypeChange = (e) => {
    const newType = e.target.value;
    setSellerType(newType);
    setDocSlots({});
    setSlotErrors({});
  };

  const handleSlotFile = (slotKey, fileList) => {
    setSlotErrors(prev => ({ ...prev, [slotKey]: '' }));
    const file = fileList?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setSlotErrors(prev => ({ ...prev, [slotKey]: t('onboarding.docFormatError') }));
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setSlotErrors(prev => ({ ...prev, [slotKey]: t('onboarding.docSizeError', { max: MAX_SIZE_MB }) }));
      return;
    }
    setDocSlots(prev => ({ ...prev, [slotKey]: { file, existing: null } }));
  };

  const removeSlotFile = (slotKey) => {
    setDocSlots(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
    setSlotErrors(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  };

  const clearSlotError = (slotKey) => {
    setSlotErrors(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  };

  const uploadNewDocuments = async () => {
    const entries = Object.entries(docSlots).filter(([, v]) => v.file);
    if (!entries.length) return [];
    setUploading(true);
    try {
      const uploaded = [];
      for (const [slotKey, { file }] of entries) {
        const ext = file.name.split('.').pop().toLowerCase() || 'dat';
        const rand = Math.random().toString(36).slice(2, 10);
        const path = `${user.id}/${slotKey}/${Date.now()}-${rand}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('seller-documents')
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        uploaded.push({
          slot: slotKey,
          path,
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
      return uploaded;
    } finally {
      setUploading(false);
    }
  };

  const allRequiredUploaded = DOCUMENT_SLOTS[sellerType]?.every(slot => {
    if (!slot.required) return true;
    const val = docSlots[slot.key];
    return val && (val.file || val.existing);
  }) ?? false;

  const canSubmit = allRequiredUploaded && consentGiven && !saving && !uploading;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isAuthenticated) return;
    if (!sellerType) {
      setError(t('onboarding.errorSellerType'));
      return;
    }
    if (!allRequiredUploaded) {
      setError(t('onboarding.errorDocs'));
      return;
    }
    if (!consentGiven) {
      setError(t('onboarding.errorConsent'));
      return;
    }
    setSaving(true);
    try {
      const newDocs = await uploadNewDocuments();
      const previousDocs = existing && Array.isArray(existing.documents) ? existing.documents : [];
      const payload = {
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        established: established ? Number(established) : null,
        contact_email: email.trim(),
        phone: phone.trim() || null,
        payment_info: { method: payMethod, detail: payDetail.trim() },
        seller_type: sellerType,
        documents: [...previousDocs, ...newDocs],
        status: 'pending',
        submitted_at: new Date().toISOString()
      };
      if (existing) {
        const { error: upErr } = await supabase
          .from('producers')
          .update(payload)
          .eq('user_id', user.id);
        if (upErr) throw upErr;
      } else {
        let lastError = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          const { error: insErr } = await supabase.from('producers').insert({
            ...payload,
            user_id: user.id,
            slug: `${(name || 'boutique').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48) || 'boutique'}-${Math.random().toString(36).slice(2, 6)}`
          });
          if (!insErr) { lastError = null; break; }
          lastError = insErr;
          if (insErr.code !== '23505') break;
        }
        if (lastError) throw lastError;
      }
      navigate('/vendeur/statut');
    } catch (err) {
      setError(t('onboarding.errorUpload', { error: err.message }));
    } finally {
      setSaving(false);
    }
  };

  const renderDocSlot = (slot) => {
    const val = docSlots[slot.key];
    const uploaded = val && (val.file || val.existing);
    const isExisting = val?.existing;
    const slotError = slotErrors[slot.key];
    const badgeClass = slot.required
      ? 'sl-doc-badge sl-doc-badge--required'
      : 'sl-doc-badge sl-doc-badge--optional';

    return (
      <div key={slot.key} className={`sl-doc-slot${uploaded ? ' sl-doc-slot--filled' : ''}${slotError ? ' sl-doc-slot--error' : ''}`}>
        <div className="sl-doc-slot-header">
          <span className={badgeClass}>
            {slot.required ? t('onboarding.docRequired') : slot.conditional ? t('onboarding.docConditional') : t('onboarding.docOptional')}
          </span>
          <span className="sl-doc-slot-label">{t(slot.labelKey)}</span>
        </div>
        <p className="sl-doc-slot-desc">{t(slot.descriptionKey)}</p>

        {uploaded ? (
          <div className="sl-doc-slot-file">
            <FileText size={16} />
            <span className="sl-doc-slot-filename">
              {isExisting ? existing?.name || t('onboarding.docTransmitted') : val.file.name}
            </span>
            {!isExisting && <span className="sl-doc-slot-size">{formatSize(val.file.size)}</span>}
            {isExisting && <span className="sl-doc-slot-existing">{t('onboarding.docAlreadyTransmitted')}</span>}
            <button type="button" className="sl-doc-slot-remove" aria-label={t('onboarding.docRemove')} onClick={() => removeSlotFile(slot.key)}>
              <X size={13} />
            </button>
          </div>
        ) : (
          <>
            <label className="sl-doc-slot-upload">
              <Upload size={16} />
              <span>{t('onboarding.docChooseFile')}</span>
              <input
                type="file"
                accept={ACCEPTED_EXT}
                hidden
                onChange={(e) => { handleSlotFile(slot.key, e.target.files); e.target.value = ''; }}
              />
            </label>
          </>
        )}

        {slotError && (
          <span className="sl-doc-slot-error" onClick={() => clearSlotError(slot.key)}>
            {slotError}
          </span>
        )}
      </div>
    );
  };

  if (checking) {
    return (
      <div className="sl-page">
        <div className="sl-center"><Loader2 size={28} className="sl-spin" /></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="sl-page">
        <div className="container sl-body">
          <div className="sl-notice">
            <div className="sl-notice-ico sl-notice-ico--info"><LogIn size={26} /></div>
            <span className="sl-notice-eyebrow">{t('seller.space')}</span>
            <h1>{t('onboarding.loginTitle')}</h1>
            <p>{t('onboarding.loginText')}</p>
            <div className="sl-notice-actions">
              <Link to="/login" className="j-pill-btn j-pill-btn--green">{t('onboarding.login')}</Link>
              <Link to="/inscription-vendeur" className="j-pill-btn j-pill-btn--outline-dark">{t('onboarding.register')}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (existing && existing.status === 'approved') {
    return (
      <div className="sl-page">
        <div className="container sl-body">
          <div className="sl-notice">
            <div className="sl-notice-ico"><CheckCircle2 size={26} /></div>
            <span className="sl-notice-eyebrow">{t('onboarding.approvedEyebrow')}</span>
            <h1>{t('onboarding.approvedTitle', { name: existing.name })}</h1>
            <p>{t('onboarding.approvedText')}</p>
            <div className="sl-notice-actions">
              <Link to="/publier" className="j-pill-btn j-pill-btn--green">{t('onboarding.publishOffer')}</Link>
              {existing.slug && (
                <Link to={`/producteur/${existing.slug}`} className="j-pill-btn j-pill-btn--outline-dark">{t('onboarding.viewShop')}</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (existing && existing.status === 'pending') {
    return (
      <div className="sl-page">
        <div className="container sl-body">
          <div className="sl-notice">
            <div className="sl-notice-ico sl-notice-ico--info"><Clock size={26} /></div>
            <span className="sl-notice-eyebrow">{t('onboarding.pendingEyebrow')}</span>
            <h1>{t('onboarding.pendingTitle')}</h1>
            <p>{t('onboarding.pendingText', { name: existing.name })}</p>
            <div className="sl-notice-actions">
              <Link to="/vendeur/statut" className="j-pill-btn j-pill-btn--green">{t('onboarding.viewStatus')}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (existing && existing.status === 'suspended') {
    return (
      <div className="sl-page">
        <div className="container sl-body">
          <div className="sl-notice">
            <div className="sl-notice-ico sl-notice-ico--danger"><Ban size={26} /></div>
            <span className="sl-notice-eyebrow">{t('onboarding.suspendedEyebrow')}</span>
            <h1>{t('onboarding.suspendedTitle')}</h1>
            <p>
              {existing.review_note
                ? t('onboarding.suspendedReason', { reason: existing.review_note })
                : t('onboarding.suspendedText')}
              {' '}{t('onboarding.suspendedHint')}
            </p>
            <div className="sl-notice-actions">
              <Link to="/contact" className="j-pill-btn j-pill-btn--green">{t('onboarding.contactSupport')}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isResubmission = existing && existing.status === 'rejected';
  const currentSlots = sellerType ? DOCUMENT_SLOTS[sellerType] : [];

  return (
    <div className="sl-page">
      <section className="sl-hero">
        <div className="container">
          <nav className="sl-breadcrumb">
            <Link to="/">{t('onboarding.breadcrumbHome')}</Link>
            <span>/</span>
            <span>{t('onboarding.breadcrumbBecome')}</span>
          </nav>
          <span className="sl-hero-tag">{t('onboarding.heroTag')}</span>
          <h1>{t('onboarding.heroTitle')}</h1>
          <p>
            {t('onboarding.heroText')}
          </p>
        </div>
      </section>

      <div className="container sl-body">
        {isResubmission && (
          <div className="sl-rejection-banner">
            <XCircle size={18} />
            <div>
              <strong>{t('onboarding.rejectionBanner')}</strong>
              {existing.review_note && <p>{t('onboarding.rejectionReason', { reason: existing.review_note })}</p>}
              <p>{t('onboarding.rejectionHint')}</p>
            </div>
          </div>
        )}

        <form className="sl-layout" onSubmit={onSubmit}>
          <div className="sl-form">
            <div className="sl-section">
              <h2 className="sl-section-title">{t('onboarding.sectionShop')}</h2>
              <Field label={t('onboarding.fieldShopName')} required hint={t('onboarding.shopNameHint')}>
                <input className="sl-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('onboarding.shopNamePlaceholder')} required />
              </Field>
              <Field label={t('onboarding.fieldLocation')} required hint={t('onboarding.locationHint')}>
                <input className="sl-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('seller.productEdit.originPlaceholder')} required />
              </Field>
              <div className="sl-grid-2">
                <Field label={t('onboarding.fieldYear')}>
                  <input className="sl-input" type="number" min="1900" max={new Date().getFullYear()} value={established} onChange={(e) => setEstablished(e.target.value)} placeholder={t('onboarding.placeholderYear')} />
                </Field>
                <Field label={t('onboarding.fieldPhone')}>
                  <input className="sl-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+261 …" />
                </Field>
              </div>
              <Field label={t('onboarding.fieldDescription')} required hint={t('onboarding.descriptionHint')}>
                <textarea className="sl-input sl-textarea" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('onboarding.descriptionPlaceholder')} required />
              </Field>
            </div>

            <div className="sl-section">
              <h2 className="sl-section-title">{t('onboarding.sectionContact')}</h2>
              <Field label={t('onboarding.fieldEmail')} required>
                <input className="sl-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@votreboutique.mg" required />
              </Field>
              <div className="sl-grid-2">
                <Field label={t('onboarding.fieldPayMethod')} required>
                  <div className="sl-select-wrap">
                    <select className="sl-input sl-select" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                      {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </Field>
                <Field label={t('onboarding.fieldPayDetail')} required hint={t('onboarding.payDetailHint')}>
                  <input className="sl-input" value={payDetail} onChange={(e) => setPayDetail(e.target.value)} placeholder="034 00 000 00 / IBAN…" required />
                </Field>
              </div>
            </div>

            <div className="sl-section">
              <Field label={t('onboarding.fieldSellerType')} required>
                <div className="sl-select-wrap">
                  <select className="sl-input sl-select" value={sellerType} onChange={handleSellerTypeChange} required>
                    <option value="">{t('onboarding.selectProfile')}</option>
                    {SELLER_TYPES.map((type) => <option key={type.value} value={type.value}>{t('onboarding.sellerType' + type.value.charAt(0).toUpperCase() + type.value.slice(1))}</option>)}
                  </select>
                  <ChevronDown size={15} />
                </div>
              </Field>
            </div>

            <div className="sl-section">
              <h2 className="sl-section-title">{t('onboarding.sectionVerification')}</h2>

              <p className="sl-doc-intro">
                {t('onboarding.docIntro')}
              </p>

              <div className="sl-doc-privacy">
                <ShieldCheck size={18} />
                <div>
                  <strong>{t('onboarding.confidentiality')}</strong>
                  <p>
                    {t('onboarding.confidentialityText')}
                  </p>
                </div>
              </div>

              <div className="sl-doc-info">
                <Info size={15} />
                <p>
                  {t('onboarding.additionalDocsInfo')}
                </p>
              </div>

              {!sellerType && (
                <p className="sl-doc-placeholder">
                  {t('onboarding.selectTypeHint')}
                </p>
              )}

              {currentSlots.map(slot => renderDocSlot(slot))}
            </div>

            <div className="sl-section sl-consent-section">
              <label className="sl-consent">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="sl-consent-checkbox"
                />
                <span className="sl-consent-text">
                  {t('onboarding.consentText')}
                </span>
              </label>
              <p className="sl-consent-legal">
                {t('onboarding.consentLegal')}
                {' '}
                <Link to="/privacy">{t('onboarding.privacyPolicy')}</Link>
              </p>
            </div>
          </div>

          <aside className="sl-side">
            <div className="sl-side-card">
              <Store size={22} />
              <h3>{t('onboarding.howItWorks')}</h3>
              <ol>
                <li>{t('onboarding.step1')}</li>
                <li>{t('onboarding.step2')}</li>
                <li>{t('onboarding.step3')}</li>
              </ol>
              {error && <p className="sl-error">{error}</p>}
              <button
                type="submit"
                className="j-pill-btn j-pill-btn--green sl-submit"
                disabled={!canSubmit}
              >
                {saving ? (
                  <><Loader2 size={15} className="sl-spin" /> {t('onboarding.submitting')}</>
                ) : uploading ? (
                  <><Loader2 size={15} className="sl-spin" /> {t('onboarding.uploading')}</>
                ) : (
                  <>{t('onboarding.submitApplication')}</>
                )}
              </button>
              <p className="sl-side-note">
                {t('onboarding.sideNotePrefix')} <Link to="/cgv">{t('onboarding.cgv')}</Link> {t('onboarding.sideNoteMid')} <Link to="/privacy">{t('onboarding.privacyPolicy')}</Link> {t('onboarding.sideNoteSuffix')}
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default BecomeSeller;
