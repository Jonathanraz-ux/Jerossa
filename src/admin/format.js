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

const LANG_LOCALE_MAP = { fr: 'fr-FR', en: 'en-GB' };

const resolveLocale = (localeOrLang) => {
  if (!localeOrLang) return 'fr-FR';
  return LANG_LOCALE_MAP[localeOrLang] || localeOrLang;
};

export const formatDate = (d, localeOrLang) =>
  d ? new Date(d).toLocaleDateString(resolveLocale(localeOrLang), { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (d, localeOrLang) =>
  d
    ? new Date(d).toLocaleDateString(resolveLocale(localeOrLang), {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

export const timeAgo = (d, localeOrLang) => {
  if (!d) return '';
  const locale = resolveLocale(localeOrLang);
  const isEn = locale === 'en-GB';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return isEn ? 'Just now' : "À l'instant";
  if (mins < 60) return isEn ? `${mins} min ago` : `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return isEn ? `${hrs}h ago` : `Il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 31) return isEn ? `${days}d ago` : `Il y a ${days}j`;
  return formatDate(d, localeOrLang);
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

export const ROLE_LABELS = {
  admin: 'Administrateur',
  seller: 'Vendeur',
  customer: 'Client',
};
