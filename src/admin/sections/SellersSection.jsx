import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Eye, Store, FileText, ExternalLink, Loader2 } from 'lucide-react';
import {
  fetchSellerApplications, updateProducerStatus, getDocumentSignedUrl,
} from '../../services/admin';
import { formatInt, formatDateTime } from '../format';
import { PageHead, EmptyState, Avatar, Modal } from '../ui';
import { useLang } from '../../context/LangContext';

const SELLER_STATUS = {
  pending: { tone: 'amber' },
  approved: { tone: 'green' },
  rejected: { tone: 'red' },
  suspended: { tone: 'neutral' },
};

const SELLER_TYPE_LABELS = {
  individual: 'admin.sellers.types.individual',
  company: 'admin.sellers.types.company',
  cooperative: 'admin.sellers.types.cooperative',
};

const SellerBadge = ({ status }) => {
  const { t } = useLang();
  return (
    <span className={`adm-badge adm-badge--${SELLER_STATUS[status]?.tone || 'neutral'}`}>
      {t('status.' + status) !== ('status.' + status) ? t('status.' + status) : status}
    </span>
  );
};

const SellersSection = () => {
  const { t, lang } = useLang();
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
        eyebrow={t('admin.nav.community')}
        title={t('admin.sellers.title')}
        subtitle={t('admin.sellers.subtitle', { count: formatInt(sellers.length) })}
      />

      <div className="adm-toolbar">
        <div className="adm-pills" role="tablist" aria-label={t('admin.sellers.filterByStatus')}>
          <button
            className={`adm-pill ${statusFilter === 'all' ? 'adm-pill--active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            {t('common.all')} <span className="adm-pill-count">{sellers.length}</span>
          </button>
          {Object.entries(SELLER_STATUS).map(([key]) => (
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
            placeholder={t('admin.sellers.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span className="adm-cell-dim" style={{ marginLeft: 'auto' }}>
          {t('admin.sellers.results', { count: filtered.length })}
        </span>
      </div>

      <div className="adm-panel">
        {sellers.length === 0 ? (
          <EmptyState
            icon={Store}
            title={t('admin.sellers.emptyTitle')}
            text={t('admin.sellers.emptyText')}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            compact
            title={t('common.noResults')}
            text={t('admin.sellers.noResultsText')}
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>{t('admin.sellers.colStore')}</th>
                  <th>{t('admin.sellers.colContact')}</th>
                  <th>{t('admin.sellers.colLocation')}</th>
                  <th>{t('admin.sellers.colDocs')}</th>
                  <th>{t('admin.sellers.colSubmitted')}</th>
                  <th>{t('common.status')}</th>
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
                    <td className="adm-cell-dim" style={{ whiteSpace: 'nowrap' }}>{formatDateTime(s.submittedAt, lang)}</td>
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
  const { t, lang } = useLang();

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
      <button className="adm-action" title={t('admin.sellers.examine')} onClick={() => setOpen(true)}>
        <Eye size={15} strokeWidth={1.75} />
      </button>

      {open && (
        <Modal
          title={t('admin.sellers.modalTitle', { name: seller.name })}
          subtitle={t('admin.sellers.modalSub', { date: formatDateTime(seller.submittedAt, lang) })}
          onClose={() => setOpen(false)}
          maxWidth={680}
          footer={
            <>
              <button className="adm-btn adm-btn--ghost" onClick={() => setOpen(false)}>
                {t('common.close')}
              </button>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                {(seller.status === 'pending' || seller.status === 'approved') && (
                  <button
                    className="adm-btn adm-btn--ghost"
                    onClick={() => applyStatus('rejected')}
                    disabled={!!busy}
                  >
                    {busy === 'rejected' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                    {t('admin.sellers.reject')}
                  </button>
                )}
                {(seller.status === 'pending' || seller.status === 'rejected') && (
                  <button
                    className="adm-btn adm-btn--primary"
                    onClick={() => applyStatus('approved')}
                    disabled={!!busy}
                  >
                    {busy === 'approved' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                    {t('admin.sellers.approveStore')}
                  </button>
                )}
                {seller.status === 'approved' && (
                  <button
                    className="adm-btn adm-btn--ghost"
                    onClick={() => applyStatus('suspended')}
                    disabled={!!busy}
                  >
                    {busy === 'suspended' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                    {t('admin.sellers.suspend')}
                  </button>
                )}
                {seller.status === 'suspended' && (
                  <button
                    className="adm-btn adm-btn--primary"
                    onClick={() => applyStatus('approved', '')}
                    disabled={!!busy}
                  >
                    {busy === 'approved' ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
                    {t('admin.sellers.reactivate')}
                  </button>
                )}
              </div>
            </>
          }
        >
          <div className="adm-meta-grid" style={{ marginBottom: 18 }}>
            <div>
              <div className="adm-meta-label">{t('common.status')}</div>
              <div style={{ marginTop: 2 }}><SellerBadge status={seller.status} /></div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.sellers.accountHolder')}</div>
              <div className="adm-meta-value">{seller.ownerName || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.sellers.contactEmail')}</div>
              <div className="adm-meta-value">{seller.contactEmail || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">{t('common.phone')}</div>
              <div className="adm-meta-value">{seller.phone || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.sellers.location')}</div>
              <div className="adm-meta-value">{seller.location || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.sellers.estYear')}</div>
              <div className="adm-meta-value">{seller.established || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.sellers.sellerType')}</div>
              <div className="adm-meta-value">{t(SELLER_TYPE_LABELS[seller.sellerType] || 'admin.sellers.types.na')}</div>
            </div>
            <div>
              <div className="adm-meta-label">{t('admin.sellers.paymentMethod')}</div>
              <div className="adm-meta-value">
                {seller.paymentInfo?.method || '—'}
                {seller.paymentInfo?.detail && <span className="adm-cell-dim"> · {seller.paymentInfo.detail}</span>}
              </div>
            </div>
            {seller.reviewedAt && (
              <div>
                <div className="adm-meta-label">{t('admin.sellers.reviewedOn')}</div>
                <div className="adm-meta-value">{formatDateTime(seller.reviewedAt, lang)}</div>
              </div>
            )}
          </div>

          {seller.description && (
            <>
              <h4 style={sectionTitleStyle}>{t('admin.sellers.activityDesc')}</h4>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--adm-text)', margin: '0 0 16px' }}>
                {seller.description}
              </p>
            </>
          )}

          <h4 style={sectionTitleStyle}>{t('admin.sellers.documents', { count: seller.documents.length })}</h4>
          {seller.documents.length === 0 ? (
            <p className="adm-cell-dim" style={{ fontSize: 12.5, margin: '4px 0 16px' }}>{t('admin.sellers.noDoc')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {seller.documents.map((doc, i) => (
                <DocumentRow key={doc.path || i} doc={doc} index={i + 1} />
              ))}
            </div>
          )}

          <h4 style={sectionTitleStyle}>{t('admin.sellers.noteLabel')}</h4>
          <textarea
            className="adm-input"
            rows={2}
            placeholder={
              seller.status === 'approved'
                ? t('admin.sellers.notePhApproved')
                : t('admin.sellers.notePhOther')
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
  const { t } = useLang();

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
          {doc.name || t('admin.sellers.piece', { index })}
        </div>
        <div className="adm-order-item-spec">{doc.type || t('admin.sellers.file')}{doc.size ? ` · ${Math.round(doc.size / 1024)} Ko` : ''}</div>
      </div>
      <button className="adm-action" title={t('admin.sellers.openDoc')} onClick={openDoc} disabled={loadingUrl}>
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
