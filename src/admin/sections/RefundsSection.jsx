import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, RefreshCcw, Wallet, Loader2 } from 'lucide-react';
import { fetchAdminRefunds, processRefund } from '../../services/admin';
import { formatEUR, formatInt, formatDateTime } from '../format';
import { PageHead, EmptyState, Modal } from '../ui';
import { useLang } from '../../context/LangContext';

const REFUND_STATUS = {
  requested: { tone: 'amber' },
  under_review: { tone: 'blue' },
  approved: { tone: 'green' },
  rejected: { tone: 'red' },
  processed: { tone: 'neutral' },
};

const RefundBadge = ({ status }) => {
  const { t } = useLang();
  return (
    <span className={`adm-badge adm-badge--${REFUND_STATUS[status]?.tone || 'neutral'}`}>
      {t('status.' + status) !== ('status.' + status) ? t('status.' + status) : status}
    </span>
  );
};

const REASON_LABELS = {
  wrong_product: 'admin.refunds.reasons.wrong_product',
  not_received: 'admin.refunds.reasons.not_received',
  damaged: 'admin.refunds.reasons.damaged',
  changed_mind: 'admin.refunds.reasons.changed_mind',
  other: 'admin.refunds.reasons.other',
};

const RefundsSection = () => {
  const { t, lang } = useLang();
  const [refunds, setRefunds] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const reasonLabel = (r) => (REASON_LABELS[r] ? t(REASON_LABELS[r]) : r || '—');

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
        eyebrow={t('admin.nav.sales')}
        title={t('admin.refunds.title')}
        subtitle={t('admin.refunds.subtitle', { count: formatInt(refunds.length), active: formatInt(activeCount) })}
      />

      <div className="adm-toolbar">
        <div className="adm-pills" role="tablist" aria-label={t('admin.refunds.filterByStatus')}>
          <button
            className={`adm-pill ${statusFilter === 'all' ? 'adm-pill--active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            {t('common.all')} <span className="adm-pill-count">{refunds.length}</span>
          </button>
          {Object.entries(REFUND_STATUS).map(([key]) => (
            <button
              key={key}
              className={`adm-pill ${statusFilter === key ? 'adm-pill--active' : ''}`}
              onClick={() => setStatusFilter(key)}
            >
              {t('status.' + key)} {!!statusCounts[key] && <span className="adm-pill-count">{statusCounts[key]}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-toolbar">
        <label className="adm-field" style={{ flex: 1, maxWidth: 340 }}>
          <Search size={15} strokeWidth={1.75} />
          <input
            type="text"
            placeholder={t('admin.refunds.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button
          className="adm-btn adm-btn--ghost"
          onClick={loadRefunds}
          style={{ marginLeft: 'auto' }}
        >
          <RefreshCcw size={14} strokeWidth={1.75} /> {t('admin.refunds.refresh')}
        </button>
      </div>

      <div className="adm-panel">
        {refunds.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={t('admin.refunds.emptyTitle')}
            text={t('admin.refunds.emptyText')}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            compact
            title={t('common.noResults')}
            text={t('admin.refunds.noResultsText')}
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>{t('admin.refunds.colRefund')}</th>
                  <th>{t('admin.refunds.colAmount')}</th>
                  <th>{t('admin.refunds.colReason')}</th>
                  <th>{t('admin.refunds.colRequested')}</th>
                  <th>{t('common.status')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="adm-prod-meta">
                        <span className="adm-prod-name" style={{ fontSize: 13 }}>{r.refundNumber}</span>
                        <span className="adm-prod-code">{t('admin.refunds.colOrderNum', { number: r.orderNumber || '—' })}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{formatEUR(r.amountRequested)}</span>
                      {r.amountRefunded > 0 && (
                        <><br /><span className="adm-cell-dim">{t('admin.refunds.refunded', { amount: formatEUR(r.amountRefunded) })}</span></>
                      )}
                    </td>
                    <td className="adm-cell-dim" style={{ fontSize: 12.5 }}>{reasonLabel(r.reason)}</td>
                    <td className="adm-cell-dim" style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.requestedAt || r.createdAt, lang)}</td>
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
  const { t, lang } = useLang();

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
      setError(res.error?.message || t('admin.refunds.processFailed'));
      return;
    }
    setOpen(false);
    onUpdated();
  };

  const canProcess = refund.status === 'approved';

  return (
    <>
      <button className="adm-action" title={t('admin.refunds.process')} onClick={() => setOpen(true)}>
        <Wallet size={15} strokeWidth={1.75} />
      </button>

      {open && (
        <Modal
          title={t('admin.refunds.modalTitle', { number: refund.refundNumber })}
          subtitle={t('admin.refunds.modalSub', { number: refund.orderNumber || '—', date: formatDateTime(refund.requestedAt || refund.createdAt, lang) })}
          onClose={() => setOpen(false)}
          maxWidth={640}
          footer={
            <>
              <button className="adm-btn adm-btn--ghost" onClick={() => setOpen(false)}>
                {t('common.close')}
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
                      {t('admin.refunds.reject')}
                    </button>
                    <button
                      className="adm-btn adm-btn--primary"
                      onClick={() => apply('approved')}
                      disabled={!!busy || !(Number(amount) > 0)}
                    >
                      {busy === 'approved' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                      {t('admin.refunds.approve')}
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
                    {t('admin.refunds.reopenApprove')}
                  </button>
                )}
                {canProcess && (
                  <button
                    className="adm-btn adm-btn--primary"
                    onClick={() => apply('processed')}
                    disabled={!!busy}
                  >
                    {busy === 'processed' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                    {t('admin.refunds.markProcessed')}
                  </button>
                )}
              </div>
            </>
          }
        >
          <div className="adm-meta-grid" style={{ marginBottom: 18 }}>
            <div>
              <div className="adm-meta-label">{t('common.status')}</div>
              <div style={{ marginTop: 2 }}><RefundBadge status={refund.status} /></div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.refunds.amountRequested')}</div>
              <div className="adm-meta-value">{formatEUR(refund.amountRequested)}</div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.refunds.currency')}</div>
              <div className="adm-meta-value">{refund.currency || 'EUR'}</div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.orders.colOrder')}</div>
              <div className="adm-meta-value">{refund.orderNumber || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.client')}</div>
              <div className="adm-meta-value adm-cell-dim" style={{ fontSize: 12.5 }}>
                {refund.customerId ? refund.customerId.slice(0, 8) : t('admin.refunds.guest')}
              </div>
            </div>
            {refund.processedAt && (
              <div>
                <div className="adm-meta-label">{t('admin.refunds.processedOn')}</div>
                <div className="adm-meta-value">{formatDateTime(refund.processedAt, lang)}</div>
              </div>
            )}
          </div>

          <h4 style={sectionTitleStyle}>{t('admin.refunds.reason')}</h4>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--adm-text)', margin: '0 0 14px' }}>
            <strong>{t('admin.refunds.reasons.' + refund.reason)}</strong>
            {refund.description && <><br />{refund.description}</>}
          </p>

          {(refund.status === 'requested' || refund.status === 'under_review' || refund.status === 'rejected') && (
            <div style={{ marginBottom: 14 }}>
              <div className="adm-meta-label" style={{ marginBottom: 6 }}>{t('admin.refunds.amountRefundedLabel')}</div>
              <input
                className="adm-input"
                type="number"
                step="0.01"
                min="0"
                max={refund.amountRequested}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%' }}
                placeholder={t('admin.refunds.amountUpTo', { amount: formatEUR(refund.amountRequested) })}
              />
            </div>
          )}

          {canProcess && (
            <div style={{ marginBottom: 14 }}>
              <div className="adm-meta-label" style={{ marginBottom: 6 }}>{t('admin.refunds.referenceLabel')}</div>
              <input
                className="adm-input"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                style={{ width: '100%' }}
                placeholder={t('admin.refunds.referencePh')}
              />
            </div>
          )}

          <div>
            <div className="adm-meta-label" style={{ marginBottom: 6 }}>{t('admin.refunds.noteLabel')}</div>
            <textarea
              className="adm-input"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('admin.refunds.notePh')}
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
