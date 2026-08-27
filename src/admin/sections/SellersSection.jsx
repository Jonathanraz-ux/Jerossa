import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Eye, Store, FileText, ExternalLink, Loader2 } from 'lucide-react';
import {
  fetchSellerApplications, updateProducerStatus, getDocumentSignedUrl,
} from '../../services/admin';
import { formatInt, formatDateTime } from '../format';
import { PageHead, EmptyState, Avatar, Modal } from '../ui';

const SELLER_STATUS = {
  pending: { label: 'En attente', tone: 'amber' },
  approved: { label: 'Validée', tone: 'green' },
  rejected: { label: 'Refusée', tone: 'red' },
  suspended: { label: 'Suspendue', tone: 'neutral' },
};

const SellerBadge = ({ status }) => (
  <span className={`adm-badge adm-badge--${SELLER_STATUS[status]?.tone || 'neutral'}`}>
    {SELLER_STATUS[status]?.label || status}
  </span>
);

const SellersSection = () => {
  const [sellers, setSellers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadSellers = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchSellerApplications();
    setSellers(data);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    loadSellers();
  }, [loadSellers]);

  const statusCounts = useMemo(() => {
    const counts = {};
    sellers.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return counts;
  }, [sellers]);

  const filtered = sellers.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(q) ||
      (s.contactEmail || '').toLowerCase().includes(q) ||
      (s.ownerName || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loadingData) return <SellersSkeleton />;

  return (
    <div>
      <PageHead
        eyebrow="Communauté"
        title="Vendeurs"
        subtitle={`${formatInt(sellers.length)} boutique${sellers.length > 1 ? 's' : ''} liée${sellers.length > 1 ? 's' : ''} à des comptes — candidatures et boutiques actives`}
      />

      <div className="adm-toolbar">
        <div className="adm-pills" role="tablist" aria-label="Filtrer par statut">
          <button
            className={`adm-pill ${statusFilter === 'all' ? 'adm-pill--active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Tous <span className="adm-pill-count">{sellers.length}</span>
          </button>
          {Object.entries(SELLER_STATUS).map(([key, cfg]) => (
            <button
              key={key}
              className={`adm-pill ${statusFilter === key ? 'adm-pill--active' : ''}`}
              onClick={() => setStatusFilter(key)}
            >
              {cfg.label} {!!statusCounts[key] && <span className="adm-pill-count">{statusCounts[key]}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-toolbar">
        <label className="adm-field" style={{ flex: 1, maxWidth: 340 }}>
          <Search size={15} strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Rechercher une boutique, un contact…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span className="adm-cell-dim" style={{ marginLeft: 'auto' }}>
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="adm-panel">
        {sellers.length === 0 ? (
          <EmptyState
            icon={Store}
            title="Aucune candidature vendeur"
            text="Les demandes « Devenir vendeur » déposées depuis le site apparaîtront ici pour examen."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            compact
            title="Aucun résultat"
            text="Ajustez la recherche ou le filtre de statut."
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Boutique</th>
                  <th>Contact</th>
                  <th>Localisation</th>
                  <th>Pièces</th>
                  <th>Déposée</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="adm-prod-cell">
                        <Avatar name={s.name} seed={s.slug || s.id} />
                        <div className="adm-prod-meta">
                          <span className="adm-prod-name" style={{ fontSize: 13 }}>{s.name}</span>
                          <span className="adm-prod-code">{s.ownerName || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12.5 }}>
                      {s.contactEmail || '—'}
                      {s.phone && <><br /><span className="adm-cell-dim">{s.phone}</span></>}
                    </td>
                    <td className="adm-cell-dim" style={{ fontSize: 12.5 }}>{s.location || '—'}</td>
                    <td className="num">{s.documents.length}</td>
                    <td className="adm-cell-dim" style={{ whiteSpace: 'nowrap' }}>{formatDateTime(s.submittedAt)}</td>
                    <td><SellerBadge status={s.status} /></td>
                    <td>
                      <div className="adm-row-actions">
                        <SellerReviewModal seller={s} onUpdated={loadSellers} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const SellerReviewModal = ({ seller, onUpdated }) => {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(seller.reviewNote || '');
  const [busy, setBusy] = useState(null);

  const applyStatus = async (status) => {
    setBusy(status);
    const res = await updateProducerStatus(seller.id, status, note.trim());
    setBusy(null);
    if (res.ok) {
      setOpen(false);
      onUpdated();
    }
  };

  return (
    <>
      <button className="adm-action" title="Examiner le dossier" onClick={() => setOpen(true)}>
        <Eye size={15} strokeWidth={1.75} />
      </button>

      {open && (
        <Modal
          title={`Dossier — ${seller.name}`}
          subtitle={`Déposé le ${formatDateTime(seller.submittedAt)}`}
          onClose={() => setOpen(false)}
          maxWidth={680}
          footer={
            <>
              <button className="adm-btn adm-btn--ghost" onClick={() => setOpen(false)}>
                Fermer
              </button>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                {(seller.status === 'pending' || seller.status === 'approved') && (
                  <button
                    className="adm-btn adm-btn--ghost"
                    onClick={() => applyStatus('rejected')}
                    disabled={!!busy}
                  >
                    {busy === 'rejected' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                    Refuser
                  </button>
                )}
                {(seller.status === 'pending' || seller.status === 'rejected') && (
                  <button
                    className="adm-btn adm-btn--primary"
                    onClick={() => applyStatus('approved')}
                    disabled={!!busy}
                  >
                    {busy === 'approved' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                    Valider la boutique
                  </button>
                )}
                {seller.status === 'approved' && (
                  <button
                    className="adm-btn adm-btn--ghost"
                    onClick={() => applyStatus('suspended')}
                    disabled={!!busy}
                  >
                    {busy === 'suspended' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                    Suspendre
                  </button>
                )}
                {seller.status === 'suspended' && (
                  <button
                    className="adm-btn adm-btn--primary"
                    onClick={() => applyStatus('approved', '')}
                    disabled={!!busy}
                  >
                    {busy === 'approved' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                    Réactiver
                  </button>
                )}
              </div>
            </>
          }
        >
          <div className="adm-meta-grid" style={{ marginBottom: 18 }}>
            <div>
              <div className="adm-meta-label">Statut</div>
              <div style={{ marginTop: 2 }}><SellerBadge status={seller.status} /></div>
            </div>
            <div>
              <div className="adm-meta-label">Titulaire du compte</div>
              <div className="adm-meta-value">{seller.ownerName || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">Email de contact</div>
              <div className="adm-meta-value">{seller.contactEmail || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">Téléphone</div>
              <div className="adm-meta-value">{seller.phone || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">Localisation</div>
              <div className="adm-meta-value">{seller.location || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">Année de création</div>
              <div className="adm-meta-value">{seller.established || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">Paiement souhaité</div>
              <div className="adm-meta-value">
                {seller.paymentInfo?.method || '—'}
                {seller.paymentInfo?.detail && <span className="adm-cell-dim"> · {seller.paymentInfo.detail}</span>}
              </div>
            </div>
            {seller.reviewedAt && (
              <div>
                <div className="adm-meta-label">Examinée le</div>
                <div className="adm-meta-value">{formatDateTime(seller.reviewedAt)}</div>
              </div>
            )}
          </div>

          {seller.description && (
            <>
              <h4 style={sectionTitleStyle}>Description de l&apos;activité</h4>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--adm-text)', margin: '0 0 16px' }}>
                {seller.description}
              </p>
            </>
          )}

          <h4 style={sectionTitleStyle}>Pièces justificatives ({seller.documents.length})</h4>
          {seller.documents.length === 0 ? (
            <p className="adm-cell-dim" style={{ fontSize: 12.5, margin: '4px 0 16px' }}>Aucune pièce transmise.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {seller.documents.map((doc, i) => (
                <DocumentRow key={doc.path || i} doc={doc} index={i + 1} />
              ))}
            </div>
          )}

          <h4 style={sectionTitleStyle}>Motif / note interne</h4>
          <textarea
            className="adm-input"
            rows={2}
            placeholder={
              seller.status === 'approved'
                ? 'Visible par l\'équipe uniquement'
                : 'Motif communiqué au vendeur en cas de refus ou suspension'
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%', marginBottom: 4 }}
          />
        </Modal>
      )}
    </>
  );
};

const sectionTitleStyle = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--adm-muted)',
  marginBottom: 8,
};

const DocumentRow = ({ doc, index }) => {
  const [loadingUrl, setLoadingUrl] = useState(false);

  const openDoc = async () => {
    setLoadingUrl(true);
    const url = await getDocumentSignedUrl(doc.path);
    setLoadingUrl(false);
    if (url) window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="adm-order-item" key={index}>
      <span className="adm-thumb-fallback" style={{ width: 38, height: 38, borderRadius: 8 }}>
        <FileText size={16} strokeWidth={1.5} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="adm-order-item-title" style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 320,
        }}>
          {doc.name || `Pièce ${index}`}
        </div>
        <div className="adm-order-item-spec">{doc.type || 'fichier'}{doc.size ? ` · ${Math.round(doc.size / 1024)} Ko` : ''}</div>
      </div>
      <button className="adm-action" title="Ouvrir le document" onClick={openDoc} disabled={loadingUrl}>
        {loadingUrl ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : <ExternalLink size={14} strokeWidth={1.75} />}
      </button>
    </div>
  );
};

const SellersSkeleton = () => (
  <div aria-hidden="true">
    <div style={{ marginBottom: 26 }}>
      <div className="adm-sk" style={{ width: 90, height: 11, marginBottom: 12 }} />
      <div className="adm-sk" style={{ width: 160, height: 24 }} />
    </div>
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="adm-sk" style={{ width: 92, height: 32, borderRadius: 999 }} />
      ))}
    </div>
    <div className="adm-panel">
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px' }}>
          <div className="adm-sk" style={{ width: 36, height: 36, borderRadius: '50%' }} />
          <div className="adm-sk" style={{ flex: 1, height: 12 }} />
          <div className="adm-sk" style={{ width: 70, height: 22, borderRadius: 999 }} />
        </div>
      ))}
    </div>
  </div>
);

export default SellersSection;
