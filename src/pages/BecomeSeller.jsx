import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store, CheckCircle2, Clock, XCircle, Ban, Upload, ChevronDown,
  FileText, X, LogIn, Loader2, ShieldCheck, Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
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
    { key: 'identity',        label: 'Pièce d\'identité en cours de validité',      required: true,  description: 'Carte nationale d\'identité ou passeport. Le nom doit correspondre aux informations renseignées dans votre dossier.' },
    { key: 'payment_proof',   label: 'Justificatif du compte de paiement',          required: true,  description: 'Capture ou document récent indiquant votre nom et le numéro Mobile Money ou le compte bancaire choisi. Masquez le solde et les transactions : seuls le nom du titulaire et le numéro du compte sont nécessaires.' },
    { key: 'activity_proof',  label: 'Justificatif d\'activité',                    required: false, description: 'Carte fiscale, carte professionnelle, attestation de producteur, document d\'enregistrement ou autre preuve officielle de votre activité, si vous en disposez.' }
  ],
  company: [
    { key: 'registration',    label: 'Document d\'immatriculation',                 required: true,  description: 'Extrait RCS ou document officiel équivalent attestant l\'existence de l\'entreprise.' },
    { key: 'tax_id',          label: 'Identification fiscale',                      required: true,  description: 'NIF, carte fiscale ou document fiscal officiel équivalent.' },
    { key: 'representative_id', label: 'Pièce d\'identité du représentant légal',   required: true,  description: 'Carte nationale d\'identité ou passeport en cours de validité du représentant déclaré.' },
    { key: 'company_docs',    label: 'Document complémentaire de l\'entreprise',     required: false, description: 'Carte STAT, statuts, mandat du représentant ou autre justificatif officiel utile à la vérification.' },
    { key: 'activity_auth',   label: 'Autorisation d\'activité',                    required: false, conditional: true, description: 'Licence, agrément, certificat ou autorisation administrative lorsque les produits vendus appartiennent à une activité réglementée.' },
    { key: 'payment_proof',   label: 'Justificatif du compte de paiement',          required: true,  description: 'Le compte de paiement doit appartenir à l\'entreprise ou à un représentant autorisé. Masquez le solde et les transactions.' }
  ],
  cooperative: [
    { key: 'registration',    label: 'Document d\'enregistrement',                  required: true,  description: 'Récépissé, agrément, certificat ou autre document officiel attestant l\'existence de l\'organisation.' },
    { key: 'representative_id', label: 'Pièce d\'identité du responsable',           required: true,  description: 'Carte nationale d\'identité ou passeport en cours de validité du responsable déclaré.' },
    { key: 'mandate',         label: 'Statuts ou mandat du responsable',            required: false, description: 'Document permettant de confirmer que la personne inscrite peut représenter l\'organisation.' },
    { key: 'activity_auth',   label: 'Autorisation d\'activité',                    required: false, conditional: true, description: 'Licence, agrément ou certificat lorsque l\'activité ou les produits proposés sont réglementés.' },
    { key: 'payment_proof',   label: 'Justificatif du compte de paiement',          required: true,  description: 'Le compte de paiement doit appartenir à l\'organisation ou au responsable autorisé. Masquez le solde et les transactions.' }
  ]
};

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

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
      }
      setChecking(false);
    })();
    return () => { alive = false; };
  }, [isAuthenticated, user]);

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
      setSlotErrors(prev => ({ ...prev, [slotKey]: 'Format non accepté. Utilisez JPG, PNG ou PDF.' }));
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setSlotErrors(prev => ({ ...prev, [slotKey]: `Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).` }));
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
      setError('Veuillez sélectionner votre type de vendeur.');
      return;
    }
    if (!allRequiredUploaded) {
      setError('Veuillez fournir tous les documents obligatoires pour votre profil.');
      return;
    }
    if (!consentGiven) {
      setError('Vous devez accepter les conditions d\'utilisation de vos documents.');
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
      setError(`Échec de l'envoi : ${err.message}`);
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
            {slot.required ? 'Obligatoire' : slot.conditional ? 'Selon votre activité' : 'Facultatif'}
          </span>
          <span className="sl-doc-slot-label">{slot.label}</span>
        </div>
        <p className="sl-doc-slot-desc">{slot.description}</p>

        {uploaded ? (
          <div className="sl-doc-slot-file">
            <FileText size={16} />
            <span className="sl-doc-slot-filename">
              {isExisting ? existing?.name || 'Document transmis' : val.file.name}
            </span>
            {!isExisting && <span className="sl-doc-slot-size">{formatSize(val.file.size)}</span>}
            {isExisting && <span className="sl-doc-slot-existing">Déjà transmis</span>}
            <button type="button" className="sl-doc-slot-remove" aria-label="Retirer ce fichier" onClick={() => removeSlotFile(slot.key)}>
              <X size={13} />
            </button>
          </div>
        ) : (
          <>
            <label className="sl-doc-slot-upload">
              <Upload size={16} />
              <span>Choisir un fichier</span>
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
            <span className="sl-notice-eyebrow">Espace vendeur</span>
            <h1>Connectez-vous pour déposer votre candidature</h1>
            <p>La création d'une boutique sur Jerossa nécessite un compte acheteur. L'inscription est gratuite.</p>
            <div className="sl-notice-actions">
              <Link to="/login" className="j-pill-btn j-pill-btn--green">Se connecter</Link>
              <Link to="/register" className="j-pill-btn j-pill-btn--outline-dark">Créer un compte</Link>
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
            <span className="sl-notice-eyebrow">Boutique validée</span>
            <h1>Votre boutique « {existing.name} » est active</h1>
            <p>Vous pouvez dès à présent publier des offres qui seront visibles dans votre boutique.</p>
            <div className="sl-notice-actions">
              <Link to="/publier" className="j-pill-btn j-pill-btn--green">Publier une offre</Link>
              {existing.slug && (
                <Link to={`/producteur/${existing.slug}`} className="j-pill-btn j-pill-btn--outline-dark">Voir ma boutique</Link>
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
            <span className="sl-notice-eyebrow">Candidature en cours</span>
            <h1>Votre dossier est en cours d'examen</h1>
            <p>Notre équipe vérifie les informations et pièces justificatives de « {existing.name} ». Vous serez notifié dès la validation.</p>
            <div className="sl-notice-actions">
              <Link to="/vendeur/statut" className="j-pill-btn j-pill-btn--green">Voir le statut de ma demande</Link>
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
            <span className="sl-notice-eyebrow">Compte suspendu</span>
            <h1>Votre boutique est suspendue</h1>
            <p>
              {existing.review_note
                ? `Motif : ${existing.review_note}`
                : 'Votre boutique a été suspendue par notre équipe.'}
              {' '}Contactez le support pour régulariser votre situation.
            </p>
            <div className="sl-notice-actions">
              <Link to="/contact" className="j-pill-btn j-pill-btn--green">Contacter le support</Link>
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
            <Link to="/">Accueil</Link>
            <span>/</span>
            <span>Devenir vendeur</span>
          </nav>
          <span className="sl-hero-tag">Espace vendeur</span>
          <h1>Devenir vendeur sur Jerossa</h1>
          <p>
            Rejoignez la marketplace des producteurs de Madagascar et de l'île Maurice.
            Complétez votre dossier : il sera examiné par notre équipe sous 48 h ouvrées.
          </p>
        </div>
      </section>

      <div className="container sl-body">
        {isResubmission && (
          <div className="sl-rejection-banner">
            <XCircle size={18} />
            <div>
              <strong>Votre candidature précédente a été refusée.</strong>
              {existing.review_note && <p>Motif : {existing.review_note}</p>}
              <p>Corrigez votre dossier ci-dessous puis renvoyez-le : vos pièces déjà transmises sont conservées.</p>
            </div>
          </div>
        )}

        <form className="sl-layout" onSubmit={onSubmit}>
          <div className="sl-form">
            <div className="sl-section">
              <h2 className="sl-section-title">Informations sur la boutique</h2>
              <Field label="Nom de la boutique" required hint="Ex. : Coopérative SAVA Vanilla">
                <input className="sl-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom commercial de votre activité" required />
              </Field>
              <Field label="Localisation" required hint="Région, pays">
                <input className="sl-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex. : Sava, Madagascar" required />
              </Field>
              <div className="sl-grid-2">
                <Field label="Année de création">
                  <input className="sl-input" type="number" min="1900" max={new Date().getFullYear()} value={established} onChange={(e) => setEstablished(e.target.value)} placeholder="Ex. : 1998" />
                </Field>
                <Field label="Téléphone">
                  <input className="sl-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+261 …" />
                </Field>
              </div>
              <Field label="Description de l'activité" required hint="Production, spécialités, méthodes, certifications…">
                <textarea className="sl-input sl-textarea" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Présentez votre activité aux acheteurs…" required />
              </Field>
            </div>

            <div className="sl-section">
              <h2 className="sl-section-title">Contact & paiement</h2>
              <Field label="Email de contact" required>
                <input className="sl-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@votreboutique.mg" required />
              </Field>
              <div className="sl-grid-2">
                <Field label="Moyen de paiement souhaité" required>
                  <div className="sl-select-wrap">
                    <select className="sl-input sl-select" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                      {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </Field>
                <Field label="Numéro / compte de réception" required hint="Numéro Mobile Money ou IBAN du compte">
                  <input className="sl-input" value={payDetail} onChange={(e) => setPayDetail(e.target.value)} placeholder="034 00 000 00 / IBAN…" required />
                </Field>
              </div>
            </div>

            <div className="sl-section">
              <Field label="Type de vendeur" required>
                <div className="sl-select-wrap">
                  <select className="sl-input sl-select" value={sellerType} onChange={handleSellerTypeChange} required>
                    <option value="">— Sélectionnez votre profil —</option>
                    {SELLER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <ChevronDown size={15} />
                </div>
              </Field>
            </div>

            <div className="sl-section">
              <h2 className="sl-section-title">Vérification de votre identité et de votre activité</h2>

              <p className="sl-doc-intro">
                Ces documents permettent à Jerossa de confirmer votre identité, l'existence de votre activité
                et la correspondance de vos informations de paiement. Ils contribuent à protéger les acheteurs
                et les vendeurs contre les comptes frauduleux.
              </p>

              <div className="sl-doc-privacy">
                <ShieldCheck size={18} />
                <div>
                  <strong>Confidentialité</strong>
                  <p>
                    Vos documents restent confidentiels. Ils sont uniquement accessibles aux administrateurs
                    autorisés de Jerossa et ne sont jamais affichés sur votre profil public.
                  </p>
                </div>
              </div>

              <div className="sl-doc-info">
                <Info size={15} />
                <p>
                  Jerossa demande uniquement les documents nécessaires à l'examen de votre dossier.
                  Des justificatifs complémentaires peuvent être demandés si votre activité ou vos produits
                  sont soumis à une autorisation particulière.
                </p>
              </div>

              {!sellerType && (
                <p className="sl-doc-placeholder">
                  Sélectionnez votre type de vendeur ci-dessus pour afficher les justificatifs correspondants.
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
                  Je confirme que les informations et documents transmis sont exacts et j'accepte qu'ils
                  soient utilisés par Jerossa pour vérifier mon identité, mon activité et mes informations
                  de paiement.
                </span>
              </label>
              <p className="sl-consent-legal">
                Vous pouvez demander la rectification ou la suppression de vos données, sous réserve des
                obligations légales applicables.
                {' '}
                <Link to="/privacy">Politique de confidentialité</Link>
              </p>
            </div>
          </div>

          <aside className="sl-side">
            <div className="sl-side-card">
              <Store size={22} />
              <h3>Comment ça marche ?</h3>
              <ol>
                <li>Déposez votre dossier avec vos pièces justificatives.</li>
                <li>Notre équipe vérifie votre identité et votre activité (sous 48 h ouvrées).</li>
                <li>Une fois validé, publiez vos offres et recevez des commandes.</li>
              </ol>
              {error && <p className="sl-error">{error}</p>}
              <button
                type="submit"
                className="j-pill-btn j-pill-btn--green sl-submit"
                disabled={!canSubmit}
              >
                {saving ? (
                  <><Loader2 size={15} className="sl-spin" /> Envoi en cours…</>
                ) : uploading ? (
                  <><Loader2 size={15} className="sl-spin" /> Téléversement…</>
                ) : (
                  <>Envoyer ma candidature</>
                )}
              </button>
              <p className="sl-side-note">
                En envoyant ce formulaire, vous acceptez les <Link to="/cgv">CGV</Link> et la{' '}
                <Link to="/privacy">politique de confidentialité</Link> de Jerossa.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default BecomeSeller;
