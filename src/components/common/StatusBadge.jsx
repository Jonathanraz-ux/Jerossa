import React from 'react';

/**
 * Famille unique de badges de statut pour toute la boutique.
 * `status`  : clé technique (pending, paid, approved…) — détermine la couleur
 * `label`   : libellé affiché (sinon traduit depuis la carte ci-dessous)
 */
const LABELS = {
  // Commandes
  pending: 'En attente',
  confirmed: 'Confirmée',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
  // Devis
  responded: 'Réponse reçue',
  accepted: 'Accepté',
  declined: 'Refusé',
  // Remboursements
  requested: 'Demandée',
  under_review: 'En analyse',
  approved: 'Approuvée',
  rejected: 'Refusée',
  processed: 'Traitée',
};

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
  const tone = TONES[status] || 'neutral';
  const text = label || LABELS[status] || status;
  return <span className={`jr-status-badge jr-status-badge--${tone}`}>{text}</span>;
};

export default StatusBadge;
