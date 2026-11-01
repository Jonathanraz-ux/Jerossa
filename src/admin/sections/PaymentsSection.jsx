import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, RefreshCcw, Wallet, Loader2, Eye, AlertTriangle, Check, FileText } from 'lucide-react';
import { fetchPaymentSubmissionsAdmin, reviewPaymentSubmission, getProofSignedUrl } from '../../services/payments';
import { formatEUR, formatInt, formatDateTime } from '../format';
import { PageHead, EmptyState, Modal } from '../ui';
import { useLang } from '../../context/LangContext';

const SUBMISSION_TONES = {
  awaiting_payment: 'amber',
  proof_submitted: 'blue',
  under_review: 'amber',
  payment_confirmed: 'green',
  payment_rejected: 'red',
  refunded: 'neutral',
  partially_refunded: 'neutral',
};

const SubmissionBadge = ({ status }) => {
  const { t } = useLang();
  return (
    <span className={`adm-badge adm-badge--${SUBMISSION_TONES[status] || 'neutral'}`}>
      {t('status.' + status) !== ('status.' + status) ? t('status.' + status) : status}
    </span>
  );
};

const amountMismatch = (sub) =>
  sub && Math.abs(sub.declaredAmount - sub.expectedAmount) > 0.01;

const PaymentsSection = () => {
  const { t, lang } = useLang();
  const [submissions, setSubmissions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchPaymentSubmissionsAdmin();
    setSubmissions(data);
    setLoadingData(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const statusCounts = useMemo(() => {
    const counts = {};
    submissions.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return counts;
  }, [submissions]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return submissions.filter((s) => {
      const matchSearch =
        !search ||
        (s.orderNumber || '').toLowerCase().includes(q) ||
        (s.externalReference || '').toLowerCase().includes(q) ||
        (s.buyerName || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [submissions, search, statusFilter]);

  if (loadingData) return <PaymentsSkeleton />;

  const toReview =
    (statusCounts.proof_submitted || 0) + (statusCounts.under_review || 0);

  return (
    <div>
      <PageHead
        eyebrow={t('admin.nav.sales')}
        title={t('admin.payments.title')}
        subtitle={t('admin.payments.subtitle', { count: formatInt(submissions.length), pending: formatInt(toReview) })}
      />

      <div className="adm-toolbar">
        <div className="adm-pills" role="tablist" aria-label={t('admin.payments.filterByStatus')}>
          <button
            className={`adm-pill ${statusFilter === 'all' ? 'adm-pill--active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            {t('common.all')} <span className="adm-pill-count">{submissions.length}</span>
          </button>
          {Object.keys(SUBMISSION_TONES).map((key) => (
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
            placeholder={t('admin.payments.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button
          className="adm-btn adm-btn--ghost"
          onClick={load}
          style={{ marginLeft: 'auto' }}
        >
          <RefreshCcw size={14} strokeWidth={1.75} /> {t('admin.refunds.refresh')}
        </button>
      </div>

      <div className="adm-panel">
        {submissions.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={t('admin.payments.emptyTitle')}
            text={t('admin.payments.emptyText')}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            compact
            title={t('common.noResults')}
            text={t('admin.payments.noResultsText')}
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>{t('admin.payments.colRef')}</th>
                  <th>{t('admin.client')}</th>
                  <th>{t('admin.payments.colAmount')}</th>
                  <th>{t('admin.payments.colMethod')}</th>
                  <th>{t('admin.payments.colSubmitted')}</th>
                  <th>{t('common.status')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const mismatch = amountMismatch(s);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="adm-prod-meta">
                          <span className="adm-prod-name" style={{ fontSize: 13 }}>{s.orderNumber}</span>
                          {mismatch && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, width: 'fit-content', fontSize: 11, fontWeight: 600, color: 'var(--danger, #b42318)' }}>
                              <AlertTriangle size={11} /> {t('admin.payments.mismatch')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="adm-cell-dim" style={{ fontSize: 12.5 }}>
                        {s.buyerName || s.buyerId?.slice(0, 8) || '—'}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{formatEUR(s.declaredAmount)}</span>
                        <br />
                        <span className="adm-cell-dim">{t('admin.payments.expected', { amount: formatEUR(s.expectedAmount) })}</span>
                      </td>
                      <td className="adm-cell-dim" style={{ fontSize: 12.5 }}>
                        {t('payment.method.' + (s.instruction?.paymentMethod || ''))}
                        <br />
                        <span style={{ fontSize: 11 }}>{s.instruction?.bankOrOperator || '—'}</span>
                      </td>
                      <td className="adm-cell-dim" style={{ whiteSpace: 'nowrap' }}>{formatDateTime(s.createdAt, lang)}</td>
                      <td><SubmissionBadge status={s.status} /></td>
                      <td>
                        <div className="adm-row-actions">
                          <ReviewModal submission={s} onUpdated={load} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewModal = ({ submission, onUpdated }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [proofUrl, setProofUrl] = useState(null);
  const { t, lang } = useLang();

  const reviewable = ['proof_submitted', 'under_review'].includes(submission.status);
  const mismatch = amountMismatch(submission);

  const apply = async (nextAction) => {
    setError('');
    setBusy(true);
    const res = await reviewPaymentSubmission({
      submissionId: submission.id,
      action: nextAction,
      reason,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error?.message || t('admin.payments.opFailed'));
      return;
    }
    setOpen(false);
    setReason('');
    setProofUrl(null);
    onUpdated();
  };

  const loadProof = async () => {
    if (!submission.proofPath) return;
    if (!proofUrl) {
      const url = await getProofSignedUrl(submission.proofPath);
      setProofUrl(url);
    }
  };

  const proofIsImage = ['image/jpeg', 'image/png', 'image/webp'].includes(submission.proofMime);
  const statusBadge = <SubmissionBadge status={submission.status} />;

  return (
    <>
      <button className="adm-action" title={t('admin.payments.review')} onClick={() => { setOpen(true); loadProof(); }}>
        <Eye size={15} strokeWidth={1.75} />
      </button>

      {open && (
        <Modal
          title={t('admin.payments.modalTitle', { number: submission.orderNumber })}
          subtitle={t('admin.payments.modalSub', { date: formatDateTime(submission.createdAt, lang) })}
          onClose={() => setOpen(false)}
          maxWidth={680}
          footer={
            reviewable ? (
              <>
                {action === 'reject' || action === 'request_more_info' ? (
                  <button className="adm-btn adm-btn--ghost" onClick={() => { setAction(null); setReason(''); }}>
                    {t('common.back')}
                  </button>
                ) : (
                  <button className="adm-btn adm-btn--ghost" onClick={() => setOpen(false)}>
                    {t('common.close')}
                  </button>
                )}
                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                  {action === null && (
                    <>
                      <button className="adm-btn adm-btn--ghost" onClick={() => setAction('request_more_info')} style={{ color: 'var(--adm-bronze-deep)' }}>
                        <AlertTriangle size={14} /> {t('admin.payments.askDetails')}
                      </button>
                      <button className="adm-btn adm-btn--ghost" onClick={() => setAction('reject')} style={{ color: 'var(--danger, #b42318)' }}>
                        {t('admin.refunds.reject')}
                      </button>
                      <button
                        className="adm-btn adm-btn--primary"
                        disabled={mismatch}
                        title={mismatch ? t('admin.payments.mismatchBlocked') : undefined}
                        onClick={() => apply('approve')}
                      >
                        {busy ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : <Check size={14} />}
                        {t('admin.payments.approve')}
                      </button>
                    </>
                  )}
                  {action === 'reject' && (
                    <button
                      className="adm-btn adm-btn--ghost"
                      style={{ color: 'var(--danger, #b42318)', borderColor: 'var(--danger, #b42318)' }}
                      disabled={!!busy || !reason.trim()}
                      onClick={() => apply('reject')}
                    >
                      {busy ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                      {t('admin.payments.confirmReject')}
                    </button>
                  )}
                  {action === 'request_more_info' && (
                    <button
                      className="adm-btn adm-btn--primary"
                      disabled={!!busy || !reason.trim()}
                      onClick={() => apply('request_more_info')}
                    >
                      {busy ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                      {t('admin.payments.sendRequest')}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <button className="adm-btn adm-btn--ghost" onClick={() => setOpen(false)}>
                  {t('common.close')}
                </button>
              </>
            )
          }
        >
          <div className="adm-meta-grid" style={{ marginBottom: 18 }}>
            <div>
              <div className="adm-meta-label">{t('common.status')}</div>
              <div style={{ marginTop: 2 }}>{statusBadge}</div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.client')}</div>
              <div className="adm-meta-value">{submission.buyerName || submission.buyerId?.slice(0, 8) || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.payments.declared')}</div>
              <div className="adm-meta-value">
                {formatEUR(submission.declaredAmount)} {submission.currency}
              </div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.payments.expected')}</div>
              <div className="adm-meta-value">
                {formatEUR(submission.expectedAmount)} {submission.order?.currency || submission.currency}
              </div>
            </div>
            {submission.reviewedAt && (
              <div>
                <div className="adm-meta-label">{t('admin.payments.reviewedOn')}</div>
                <div className="adm-meta-value">{formatDateTime(submission.reviewedAt, lang)}</div>
              </div>
            )}
          </div>

          {mismatch && (
            <div style={{ marginBottom: 14, display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', border: '1px solid var(--danger, #b42318)', borderRadius: 8, color: 'var(--danger, #b42318)', fontSize: 13, background: 'rgba(180,35,24,0.06)' }}>
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{t('admin.payments.mismatchNotice')}</span>
            </div>
          )}

          <h4 style={sectionTitleStyle}>{t('admin.payments.details')}</h4>
          <div className="adm-meta-grid" style={{ marginBottom: 18 }}>
            {submission.instruction && (
              <>
                <div>
                  <div className="adm-meta-label">{t('payment.method')}</div>
                  <div className="adm-meta-value">
                    {t('payment.method.' + submission.instruction.paymentMethod)}<br />
                    <span style={{ fontSize: 12, fontWeight: 400 }}>{submission.instruction.beneficiary} · {submission.instruction.bankOrOperator}</span>
                  </div>
                </div>
              </>
            )}
            {submission.externalReference && (
              <div>
                <div className="adm-meta-label">{t('payment.externalReference')}</div>
                <div className="adm-meta-value" style={{ fontFamily: 'monospace' }}>{submission.externalReference}</div>
              </div>
            )}
            {submission.payerName && (
              <div>
                <div className="adm-meta-label">{t('payment.payerName')}</div>
                <div className="adm-meta-value">{submission.payerName}</div>
              </div>
            )}
            {submission.paidAt && (
              <div>
                <div className="adm-meta-label">{t('payment.paidOn')}</div>
                <div className="adm-meta-value">{formatDateTime(submission.paidAt, lang)}</div>
              </div>
            )}
          </div>

          <h4 style={sectionTitleStyle}>{t('admin.payments.proof')}</h4>
          {submission.proofPath ? (
            <div>
              {proofIsImage && proofUrl ? (
                <img
                  src={proofUrl}
                  alt={t('admin.payments.proof')}
                  style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 10, border: '1px solid var(--adm-line)' }}
                />
              ) : (
                <a
                  className="adm-btn adm-btn--ghost"
                  href={proofUrl || undefined}
                  onClick={!proofUrl ? (e) => { e.preventDefault(); loadProof(); } : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <FileText size={14} /> {proofUrl ? t('admin.sellers.openDoc') : t('admin.payments.loadProof')}
                </a>
              )}
              {!proofUrl && !proofIsImage && (
                <button className="adm-btn adm-btn--ghost" onClick={loadProof} style={{ marginLeft: 8 }}>
                  {t('admin.payments.loadProof')}
                </button>
              )}
            </div>
          ) : (
            <p className="adm-cell-dim" style={{ fontSize: 13 }}>{t('admin.payments.noProof')}</p>
          )}

          {(submission.rejectionReason || submission.reviewNote) && (
            <>
              <h4 style={sectionTitleStyle}>{t('admin.payments.reason')}</h4>
              <p style={{ fontSize: 13, color: 'var(--adm-muted)', margin: '0 0 8px', lineHeight: 1.5 }}>
                {submission.rejectionReason || submission.reviewNote}
              </p>
            </>
          )}

          {reviewable && (action === 'reject' || action === 'request_more_info') && (
            <div style={{ marginTop: 8 }}>
              <div className="adm-meta-label" style={{ marginBottom: 6 }}>
                {action === 'reject' ? t('admin.payments.rejectReason') : t('admin.payments.askReason')}
              </div>
              <textarea
                className="adm-input"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ width: '100%' }}
                placeholder={action === 'reject' ? t('admin.payments.rejectReasonPh') : t('admin.payments.askReasonPh')}
                autoFocus
              />
            </div>
          )}

          {error && (
            <p style={{ color: 'var(--danger, #b42318)', fontSize: 12.5, margin: '12px 0 0' }}>{error}</p>
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

const PaymentsSkeleton = () => (
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

export default PaymentsSection;