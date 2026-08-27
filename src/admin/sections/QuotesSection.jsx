import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, FileText, RefreshCcw } from 'lucide-react';
import { fetchAdminQuotes } from '../../services/admin';
import { formatEUR, formatInt, formatDateTime } from '../format';
import { PageHead, EmptyState, Modal } from '../ui';

const QUOTE_STATUS = {
  pending: { label: 'En attente', tone: 'amber' },
  responded: { label: 'Réponse reçue', tone: 'green' },
  accepted: { label: 'Acceptée', tone: 'blue' },
  declined: { label: 'Refusée', tone: 'red' },
};

const QuoteBadge = ({ status }) => (
  <span className={`adm-badge adm-badge--${QUOTE_STATUS[status]?.tone || 'neutral'}`}>
    {QUOTE_STATUS[status]?.label || status}
  </span>
);

const QuotesSection = () => {
  const [quotes, setQuotes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadQuotes = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchAdminQuotes();
    setQuotes(data);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const statusCounts = useMemo(() => {
    const counts = {};
    quotes.forEach((q) => { counts[q.status] = (counts[q.status] || 0) + 1; });
    return counts;
  }, [quotes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return quotes.filter((quote) => {
      const matchSearch =
        !search ||
        (quote.quoteNumber || '').toLowerCase().includes(q) ||
        (quote.productTitle || '').toLowerCase().includes(q) ||
        (quote.sellerName || '').toLowerCase().includes(q) ||
        (quote.userId || '').toLowerCase().includes(q) ||
        (quote.orderNumber || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || quote.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [quotes, search, statusFilter]);

  if (loadingData) return <QuotesSkeleton />;

  const pendingCount = statusCounts.pending || 0;

  return (
    <div>
      <PageHead
        eyebrow="Ventes"
        title="Devis"
        subtitle={`${formatInt(quotes.length)} demande${quotes.length > 1 ? 's' : ''} de devis — ${formatInt(pendingCount)} en attente de réponse`}
      />

      <div className="adm-toolbar">
        <div className="adm-pills" role="tablist" aria-label="Filtrer par statut">
          <button
            className={`adm-pill ${statusFilter === 'all' ? 'adm-pill--active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Tous <span className="adm-pill-count">{quotes.length}</span>
          </button>
          {Object.entries(QUOTE_STATUS).map(([key, cfg]) => (
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
            placeholder="N° devis, produit, vendeur, commande…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button
          className="adm-btn adm-btn--ghost"
          onClick={loadQuotes}
          style={{ marginLeft: 'auto' }}
        >
          <RefreshCcw size={14} strokeWidth={1.75} /> Actualiser
        </button>
      </div>

      <div className="adm-panel">
        {quotes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucune demande de devis"
            text="Les devis demandés par les clients depuis les fiches produit apparaîtront ici."
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
                  <th>Devis</th>
                  <th>Produit</th>
                  <th>Vendeur</th>
                  <th>Qté</th>
                  <th>Créé le</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <div className="adm-prod-meta">
                        <span className="adm-prod-name" style={{ fontSize: 13 }}>{q.quoteNumber}</span>
                        <span className="adm-prod-code">{q.orderNumber ? `Commande ${q.orderNumber}` : '—'}</span>
                      </div>
                    </td>
                    <td className="adm-cell-dim" style={{ fontSize: 12.5, maxWidth: 220 }}>{q.productTitle || '—'}</td>
                    <td className="adm-cell-dim" style={{ fontSize: 12.5 }}>{q.sellerName || '—'}</td>
                    <td className="num">{q.quantity ? `${q.quantity} ${q.unit || ''}`.trim() : '—'}</td>
                    <td className="adm-cell-dim" style={{ whiteSpace: 'nowrap' }}>{formatDateTime(q.createdAt)}</td>
                    <td><QuoteBadge status={q.status} /></td>
                    <td>
                      <div className="adm-row-actions">
                        <QuoteDetailModal quote={q} />
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

const QuoteDetailModal = ({ quote }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="adm-action" title="Voir le détail" onClick={() => setOpen(true)}>
        <FileText size={15} strokeWidth={1.75} />
      </button>

      {open && (
        <Modal
          title={`Devis ${quote.quoteNumber}`}
          subtitle={`Demandé le ${formatDateTime(quote.createdAt)}`}
          onClose={() => setOpen(false)}
          maxWidth={640}
          footer={
            <button className="adm-btn adm-btn--ghost" onClick={() => setOpen(false)}>
              Fermer
            </button>
          }
        >
          <div className="adm-meta-grid" style={{ marginBottom: 18 }}>
            <div>
              <div className="adm-meta-label">Statut</div>
              <div style={{ marginTop: 2 }}><QuoteBadge status={quote.status} /></div>
            </div>
            <div>
              <div className="adm-meta-label">Client</div>
              <div className="adm-meta-value adm-cell-dim" style={{ fontSize: 12.5 }}>
                {quote.userId ? quote.userId.slice(0, 8) : '—'}
              </div>
            </div>
            <div>
              <div className="adm-meta-label">Vendeur</div>
              <div className="adm-meta-value">{quote.sellerName || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">Produit</div>
              <div className="adm-meta-value">{quote.productTitle || '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">Quantité</div>
              <div className="adm-meta-value">{quote.quantity ? `${quote.quantity} ${quote.unit || ''}`.trim() : '—'}</div>
            </div>
            <div>
              <div className="adm-meta-label">Commande liée</div>
              <div className="adm-meta-value">{quote.orderNumber || '—'}</div>
            </div>
          </div>

          {quote.message && (
            <>
              <h4 style={sectionTitleStyle}>Message du client</h4>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--adm-text)', margin: '0 0 18px' }}>{quote.message}</p>
            </>
          )}

          <h4 style={sectionTitleStyle}>Réponse du vendeur</h4>
          {quote.response ? (
            <div className="adm-quote-response">
              <div style={{ fontSize: 22, fontWeight: 700 }}>{formatEUR(quote.response.priceEur)}</div>
              {quote.response.unit && (
                <div className="adm-cell-dim" style={{ fontSize: 12.5 }}>
                  par {quote.response.unit}{quote.response.delay ? ` · délai : ${quote.response.delay}` : ''}
                </div>
              )}
              {quote.response.message && (
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--adm-text)', margin: '10px 0 0' }}>
                  {quote.response.message}
                </p>
              )}
            </div>
          ) : (
            <p className="adm-cell-dim" style={{ fontSize: 12.5, margin: '4px 0 0' }}>
              Aucune réponse du vendeur pour l&apos;instant.
            </p>
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

const QuotesSkeleton = () => (
  <div aria-hidden="true">
    <div style={{ marginBottom: 26 }}>
      <div className="adm-sk" style={{ width: 90, height: 11, marginBottom: 12 }} />
      <div className="adm-sk" style={{ width: 160, height: 24 }} />
    </div>
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="adm-sk" style={{ width: 92, height: 32, borderRadius: 999 }} />
      ))}
    </div>
    <div className="adm-panel">
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px' }}>
          <div className="adm-sk" style={{ flex: 1, height: 12 }} />
          <div className="adm-sk" style={{ width: 140, height: 12 }} />
          <div className="adm-sk" style={{ width: 70, height: 22, borderRadius: 999 }} />
        </div>
      ))}
    </div>
  </div>
);

export default QuotesSection;
