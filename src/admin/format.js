// Helpers de formatage partagés — Administration Jerossa

export const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export const formatEUR = (n) =>
  Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

export const formatInt = (n) => Number(n || 0).toLocaleString('fr-FR');

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

export const timeAgo = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 31) return `Il y a ${days}j`;
  return formatDate(d);
};

export const initials = (name) =>
  (name || '')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

export const clientLabel = (order) => {
  const a = order?.address || {};
  const name = [a.firstName, a.lastName].filter(Boolean).join(' ').trim();
  return name || a.email || null;
};

// Couleur d'avatar déterministe à partir d'une chaîne
const AVATAR_TONES = [
  ['#8c6239', 'rgba(140, 98, 57, 0.1)'],
  ['#33714f', 'rgba(51, 113, 79, 0.1)'],
  ['#46688c', 'rgba(70, 104, 140, 0.1)'],
  ['#a07b28', 'rgba(160, 123, 40, 0.12)'],
  ['#7c5a8c', 'rgba(124, 90, 140, 0.1)'],
  ['#a63d35', 'rgba(166, 61, 53, 0.08)'],
];

export const avatarTone = (seedStr = '') => {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(h) % AVATAR_TONES.length];
};

export const ROLE_LABELS = {
  admin: 'Administrateur',
  seller: 'Vendeur',
  customer: 'Client',
};
