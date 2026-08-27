import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, RefreshCcw, Wallet, Loader2 } from 'lucide-react';
import { fetchAdminRefunds, processRefund } from '../../services/admin';
import { formatEUR, formatInt, formatDateTime } from '../format';
import { PageHead, EmptyState, Modal } from '../ui';

const REFUND_STATUS = {
  requested: { label: 'Demandé', tone: 'amber' },
  under_review: { label: 'À l\'étude', tone: 'blue' },
  approved: { label: 'Approuvé', tone: 'green' },
  rejected: { label: 'Refusé', tone: 'red' },
  processed: { label: 'Traité', tone: 'neutral' },
};

const RefundBadge = ({ status }) => (
  <span className={`adm-badge adm-badge--${REFUND_STATUS[status]?.tone || 'neutral'}`}>
    {REFUND_STATUS[status]?.label || status}
  </span>
);

const REASON_LABELS = {
  wrong_product: 'Produit non conforme',
  not_received: 'Commande non reçue',
  damaged: 'Produit endommagé',
  changed_mind: 'Changement d\'avis',
  other: 'Autre motif',
};

const reasonLabel = (r) => REASON_LABELS[r] || r || '—';

const RefundsSection = () => {
  const [refunds, setRefunds] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadRefunds = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchAdminRefunds();
    setRefunds(data);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

  const statusCounts = useMemo(() => {
    const counts = {};
    refunds.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }, [refunds]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return refunds.filter((r) => {
      const matchSearch =
        !search ||
        (r.refundNumber || '').toLowerCase().includes(q) ||
        (r.orderNumber || '').toLowerCase().includes(q) ||
        (r.customerId || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [refunds, search, statusFilter]);

  if (loadingData) return <RefundsSkeleton />;

  const activeCount = statusCounts.requested + statusCounts.under_review + statusCounts.approved || 0;

  return (
    <div>
      <PageHead
        eyebrow="Ventes"
        title="Remboursements"
        subtitle={`${formatInt(refunds.length)} demande${refunds.length > 1 ? 's' : ''} — ${formatInt(activeCount)} en cours de traitement`}
      />

      <div className="adm-toolbar">
        <div className="adm-pills" role="tablist" aria-label="Filtrer par statut">
          <button
            className={`adm-pill ${statusFilter === 'all' ? 'adm-pill--active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Tous <span className="adm-pill-count">{refunds.length}</span>
          </button>
          {Object.entries(REFUND_STATUS).map(([key, cfg]) => (
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
            placeholder="N° remboursement, commande, client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button
          className="adm-btn adm-btn--ghost"
          onClick={loadRefunds}
          style={{ marginLeft: 'auto' }}
        >
          <RefreshCcw size={14} strokeWidth={1.75} /> Actualiser
        </button>
      </div>

      <div className="adm-panel">
        {refunds.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Aucune demande de remboursement"
            text="Les remboursements demandés par les clients depuis l'espace « Mes remboursements » apparaîtront ici pour traitement."
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
                  <th>Remboursement</th>
                  <th>Montant</th>
                  <th>Motif</th>
                  <th>Demandé le</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="adm-prod-meta">
                        <span className="adm-prod-name" style={{ fontSize: 13 }}>{r.refundNumber}</span>
                        <span className="adm-prod-code">Commande {r.orderNumber || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{formatEUR(r.amountRequested)}</span>
                      {r.amountRefunded > 0 && (
                        <><br /><span className="adm-cell-dim">remboursé {formatEUR(r.amountRefunded)}</span></>
                      )}
                    </td>
                    <td className="adm-cell-dim" style={{ fontSize: 12.5 }}>{reasonLabel(r.reason)}</td>
                    <td className="adm-cell-dim" style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.requestedAt || r.createdAt)}</td>
                    <td><RefundBadge status={r.status} /></td>
                    <td>
                      <div className="adm-row-actions">
                        <RefundReviewModal refund={r} onUpdated={loadRefunds} />
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

const RefundReviewModal = ({ refund, onUpdated }) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(refund.amountRequested ? String(refund.amountRequested) : '');
  const [note, setNote] = useState(refund.adminNote || '');
  const [reference, setReference] = useState(refund.refundReference || '');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const apply = async (status) => {
    setError('');
    setBusy(status);
    const res = await processRefund({
      refundNumber: refund.refundNumber,
      status,
      amountRefunded: status === 'approved' ? Number(amount) : 0,
      adminNote: note.trim(),
      refundReference: reference.trim(),
    });
    setBusy(null);
    if (!res.ok) {
      setError(res.error?.message || 'Échec du traitement de la demande.');
      return;
    }
    setOpen(false);
    onUpdated();
  };

  const canProcess = refund.status === 'approved';

  return (
    <>
      <button className="adm-action" title="Traiter la demande" onClick={() => setOpen(true)}>
        <Wallet size={15} strokeWidth={1.75} />
      </button>

      {open && (
        <Modal
          title={`Remboursement — ${refund.refundNumber}`}
          subtitle={`Commande ${refund.orderNumber || '—'} · demandé le ${formatDateTime(refund.requestedAt || refund.createdAt)}`}
          onClose={() => setOpen(false)}
          maxWidth={640}
          footer={
            <>
              <button className="adm-btn adm-btn--ghost" onClick={() => setOpen(false)}>
                Fermer
              </button>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                {(refund.status === 'requested' || refund.status === 'under_review') && (
                  <>
                    <button
                      className="adm-btn adm-btn--ghost"
                      onClick={() => apply('rejected')}
                      disabled={!!busy}
                    >
                      {busy === 'rejected' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                      Refuser
                    </button>
                    <button
                      className="adm-btn adm-btn--primary"
                      onClick={() => apply('approved')}
                      disabled={!!busy || !(Number(amount) > 0)}
                    >
                      {busy === 'approved' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                      Approuver
                    </button>
                  </>
                )}
                {(refund.status === 'rejected') && (
                  <button
                    className="adm-btn adm-btn--primary"
                    onClick={() => apply('approved')}
                    disabled={!!busy || !(Number(amount) > 0)}
                  >
                    {busy === 'approved' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                    Rouvrir & approuver
                  </button>
                )}
                {canProcess && (
                  <button
                    className="adm-btn adm-btn--primary"
                    onClick={() => apply('processed')}
                    disabled={!!busy}
                  >
                    {busy === 'processed' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                    Marquer comme traité
                  </button>
                )}
              </div>
            </>
          }
        >
          <div className="adm-meta-grid" style={{ marginBottom: 18 }}>
            <div>
              <div className="adm-meta-label">Statut</div>
              <div style={{ marginTop: 2 }}><RefundBadge status={refund.status} /></div>
            </div>
            <div>
              <div className="adm-meta-label">Montant demandé</div>
              <div className="adm-meta-value">{formatEUR(refund.amountRequested)}</div>
            </div>
            <div>
              <div className="adm-meta-label">Devise</div>
              <div className="adm-meta-value">{refund.currency || 'EUR'}</div>
            </div>
            <div>
              <div className="adm-meta-label">Commande</div>
              <div className="adm-meta-value">{refund.orderNumber || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">Client</div>
              <div className="adm-meta-value adm-cell-dim" style={{ fontSize: 12.5 }}>
                {refund.customerId ? refund.customerId.slice(0, 8) : 'Invité'}
              </div>
            </div>
            {refund.processedAt && (
              <div>
                <div className="adm-meta-label">Traité le</div>
                <div className="adm-meta-value">{formatDateTime(refund.processedAt)}</div>
              </div>
            )}
          </div>

          <h4 style={sectionTitleStyle}>Motif</h4>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--adm-text)', margin: '0 0 14px' }}>
            <strong>{reasonLabel(refund.reason)}</strong>
            {refund.description && <><br />{refund.description}</>}
          </p>

          {(refund.status === 'requested' || refund.status === 'under_review' || refund.status === 'rejected') && (
            <div style={{ marginBottom: 14 }}>
              <div className="adm-meta-label" style={{ marginBottom: 6 }}>Montant réellement remboursé</div>
              <input
                className="adm-input"
                type="number"
                step="0.01"
                min="0"
                max={refund.amountRequested}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%' }}
                placeholder={`Jusqu'à ${formatEUR(refund.amountRequested)}`}
              />
            </div>
          )}

          {canProcess && (
            <div style={{ marginBottom: 14 }}>
              <div className="adm-meta-label" style={{ marginBottom: 6 }}>Référence du virement</div>
              <input
                className="adm-input"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                style={{ width: '100%' }}
                placeholder="Ex. : VIREMENT-RMB-2026-01234"
              />
            </div>
          )}

          <div>
            <div className="adm-meta-label" style={{ marginBottom: 6 }}>Note interne</div>
            <textarea
              className="adm-input"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Motif / commentaire visible par l'équipe uniquement"
              style={{ width: '100%' }}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: 12.5, margin: '12px 0 0' }}>{error}</p>
          )}
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

const RefundsSkeleton = () => (
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
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px' }}>
          <div className="adm-sk" style={{ flex: 1, height: 12 }} />
          <div className="adm-sk" style={{ width: 80, height: 12 }} />
          <div className="adm-sk" style={{ width: 70, height: 22, borderRadius: 999 }} />
        </div>
      ))}
    </div>
  </div>
);

export default RefundsSection;
