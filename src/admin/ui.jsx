import React from 'react';
import { PackageOpen, Package, X } from 'lucide-react';
import { STATUS_LABELS, ROLE_LABELS, initials } from './format';

// ── Badge de statut (point + libellé) ──────────────────────

const STATUS_TONES = {
  pending: 'amber',
  confirmed: 'blue',
  paid: 'green',
  shipped: 'bronze',
  delivered: 'green',
  cancelled: 'red',
  refunded: 'neutral',
};

export const StatusBadge = ({ status }) => (
  <span className={`adm-badge adm-badge--${STATUS_TONES[status] || 'neutral'}`}>
    {STATUS_LABELS[status] || status}
  </span>
);

const PAYMENT_LABELS = { paid: 'Payée', pending: 'En attente', refunded: 'Remboursée', failed: 'Échec' };
const PAYMENT_TONES = { paid: 'green', pending: 'amber', refunded: 'neutral', failed: 'red' };

export const PaymentBadge = ({ status }) => (
  <span className={`adm-badge adm-badge--${PAYMENT_TONES[status] || 'neutral'}`}>
    {PAYMENT_LABELS[status] || status}
  </span>
);

export const RoleBadge = ({ role }) => {
  const tone = role === 'admin' ? 'ink' : role === 'seller' ? 'bronze' : 'neutral';
  return (
    <span className={`adm-badge adm-badge--${tone}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
};

// ── En-tête de page ────────────────────────────────────────

export const PageHead = ({ eyebrow, title, subtitle, actions, meta }) => (
  <div className="adm-page-head">
    <div>
      {eyebrow && <div className="adm-eyebrow">{eyebrow}</div>}
      <h2 className="adm-page-title">{title}</h2>
      {subtitle && <p className="adm-page-sub">{subtitle}</p>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {meta}
      {actions}
    </div>
  </div>
);

// ── Panneau avec en-tête ───────────────────────────────────

export const Panel = ({ title, subtitle, action, children, style }) => (
  <section className="adm-panel" style={style}>
    {(title || action) && (
      <header className="adm-panel-head">
        <div>
          {title && <h3 className="adm-panel-title">{title}</h3>}
          {subtitle && <p className="adm-panel-sub">{subtitle}</p>}
        </div>
        {action}
      </header>
    )}
    {children}
  </section>
);

// ── État vide premium ──────────────────────────────────────

export const EmptyState = ({ icon: Icon = PackageOpen, title, text, compact }) => (
  <div className="adm-empty" style={compact ? { padding: '30px 18px' } : undefined}>
    <div className="adm-empty-icon">
      <Icon size={22} strokeWidth={1.6} />
    </div>
    <div className="adm-empty-title">{title}</div>
    {text && <p className="adm-empty-text">{text}</p>}
  </div>
);

// ── Vignette produit (vraie image ou fallback) ────────────

export const Thumb = ({ src, alt = '', size = 42, radius = 9 }) => {
  const [failed, setFailed] = React.useState(false);
  if (!src || failed) {
    return (
      <span
        className="adm-thumb-fallback"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <Package size={Math.round(size * 0.42)} strokeWidth={1.5} />
      </span>
    );
  }
  return (
    <img
      className="adm-thumb"
      src={src}
      alt={alt}
      loading="lazy"
      style={{ width: size, height: size, borderRadius: radius }}
      onError={() => setFailed(true)}
    />
  );
};

// ── Avatars initiales ──────────────────────────────────────

export const Avatar = ({ name, seed, size = 34 }) => (
  <span
    className="adm-avatar"
    style={{
      width: size,
      height: size,
      fontSize: Math.max(10, size * 0.35),
    }}
  >
    {initials(seed || name)}
  </span>
);

// ── Modale générique ───────────────────────────────────────

export const Modal = ({ title, subtitle, onClose, children, footer, maxWidth = 620 }) => (
  <div
    className="adm-modal-overlay"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div className="adm-modal" style={{ maxWidth }} role="dialog" aria-modal="true">
      <header className="adm-modal-head">
        <div>
          <h3 className="adm-modal-title">{title}</h3>
          {subtitle && <p className="adm-modal-sub">{subtitle}</p>}
        </div>
        <button className="adm-action" onClick={onClose} aria-label="Fermer">
          <X size={15} strokeWidth={2} />
        </button>
      </header>
      <div className="adm-modal-body">{children}</div>
      {footer && <footer className="adm-modal-foot">{footer}</footer>}
    </div>
  </div>
);
