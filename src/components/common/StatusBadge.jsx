import React from 'react';
import { useLang } from '../../context/LangContext';

/**
 * Famille unique de badges de statut pour toute la boutique.
 * `status`  : clé technique (pending, paid, approved…) — détermine la couleur
 * `label`   : libellé affiché (sinon traduit via i18n depuis les statuts)
 */
const TONES = {
  pending: 'amber',
  confirmed: 'blue',
  paid: 'green',
  shipped: 'blue',
  delivered: 'green',
  cancelled: 'red',
  refunded: 'neutral',
  responded: 'blue',
  accepted: 'green',
  declined: 'red',
  requested: 'amber',
  under_review: 'blue',
  approved: 'green',
  rejected: 'red',
  processed: 'green',
};

const StatusBadge = ({ status, label }) => {
  const { t } = useLang();
  const tone = TONES[status] || 'neutral';
  let text = label;
  if (!text) {
    const key = `status.${status}`;
    const translated = t(key);
    text = translated !== key ? translated : status;
  }
  return <span className={`jr-status-badge jr-status-badge--${tone}`}>{text}</span>;
};

export default StatusBadge;
