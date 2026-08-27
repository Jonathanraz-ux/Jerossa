import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store, CheckCircle2, Clock, XCircle, Ban, Upload, ChevronDown,
  FileText, X, LogIn, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './SellerOnboarding.css';

const MAX_DOCS = 3;
const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

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
    <label className="sl-label">
      {label} {required && <span className="sl-required">*</span>}
    </label>
    {children}
    {hint && <span className="sl-hint">{hint}</span>}
  </div>
);

const slugify = (value) =>
  (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48) || 'boutique';

const formatSize = (bytes) => {
  if (!bytes) return '';
  const kb = bytes / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} Mo` : `${Math.round(kb)} Ko`;
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

  const fileInputRef = useRef(null);
  const [docs, setDocs] = useState([]);
  const [docError, setDocError] = useState('');
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
      } else if (!data) {
        setEmail(user.email || '');
      }
      setChecking(false);
    })();
    return () => { alive = false; };
  }, [isAuthenticated, user]);

  const addFiles = (fileList) => {
    setDocError('');
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    const rejected = [];
    const accepted = [];
    for (const f of incoming) {
      if (!ACCEPTED_TYPES.includes(f.type)) { rejected.push(`${f.name} (format)`); continue; }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) { rejected.push(`${f.name} (> ${MAX_SIZE_MB} Mo)`); continue; }
      accepted.push(f);
    }
    setDocs(prev => {
      const room = MAX_DOCS - prev.length;
      const toAdd = accepted.slice(0, Math.max(0, room));
      if (toAdd.length < accepted.length) rejected.push(`limite de ${MAX_DOCS} fichiers atteinte`);
      return [...prev, ...toAdd];
    });
    if (rejected.length) setDocError(`Fichiers ignorés : ${rejected.join(', ')}.`);
  };

  const removeDoc = (index) => {
    setDocError('');
    setDocs(prev => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = async () => {
    if (!docs.length) return [];
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of docs) {
        const ext = file.name.split('.').pop().toLowerCase() || 'dat';
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('seller-documents')
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        uploaded.push({ path, name: file.name, size: file.size, type: file.type });
      }
      return uploaded;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isAuthenticated) return;
    if (!docs.length && !(existing && Array.isArray(existing.documents) && existing.documents.length)) {
      setDocError('Ajoutez au moins une pièce justificative (CNI / passeport ou registre de commerce).');
      return;
    }
    setSaving(true);
    try {
      const newDocs = await uploadDocuments();
      const previousDocs = existing && Array.isArray(existing.documents) ? existing.documents : [];
      const payload = {
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        established: established ? Number(established) : null,
        contact_email: email.trim(),
        phone: phone.trim() || null,
        payment_info: { method: payMethod, detail: payDetail.trim() },
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
            slug: `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`
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
  const previousDocsCount = isResubmission && Array.isArray(existing.documents) ? existing.documents.length : 0;

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
              <h2 className="sl-section-title">Pièces justificatives</h2>
              <Field hint="Ces documents ne sont consultables que par l'équipe Jerossa.">
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
                  className="sl-upload"
                  disabled={docs.length >= MAX_DOCS}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={20} />
                  <span><strong>Ajouter des pièces</strong></span>
                  <span className="sl-upload-hint">JPG, PNG, PDF — max {MAX_SIZE_MB} Mo — jusqu'à {MAX_DOCS} fichiers</span>
                </button>
                {docError && (
                  <span className="sl-hint" style={{ color: 'var(--danger)' }}>{docError}</span>
                )}
                {(docs.length > 0 || previousDocsCount > 0) && (
                  <ul className="sl-doc-list">
                    {Array.from({ length: previousDocsCount }).map((_, i) => (
                      <li key={`prev-${i}`} className="sl-doc-item sl-doc-item--readonly">
                        <FileText size={16} />
                        <span>Pièce déjà transmise #{i + 1}</span>
                      </li>
                    ))}
                    {docs.map((f, i) => (
                      <li key={`${f.name}-${i}`} className="sl-doc-item">
                        <FileText size={16} />
                        <span>{f.name}</span>
                        <em>{formatSize(f.size)}</em>
                        <button type="button" aria-label="Retirer ce fichier" onClick={() => removeDoc(i)}>
                          <X size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Field>
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
              <button type="submit" className="j-pill-btn j-pill-btn--green sl-submit" disabled={saving}>
                {saving ? (<><Loader2 size={15} className="sl-spin" /> Envoi en cours…</>) : (<>Envoyer ma candidature{uploading ? ' (téléversement…)' : ''}</>)}
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
