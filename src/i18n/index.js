import fr from './fr.json';
import en from './en.json';

export const translations = { fr, en };

export const DEFAULT_LANG = 'fr';

export const SUPPORTED_LANGS = ['fr', 'en'];

export const LANG_NAMES = {
  fr: 'Français',
  en: 'English',
};

// Locale Intl associée à chaque langue (dates, nombres…)
export const LANG_LOCALES = {
  fr: 'fr-FR',
  en: 'en-GB',
};

export const localeFor = (lang) => LANG_LOCALES[lang] || LANG_LOCALES[DEFAULT_LANG];

const parse = (d) => (d ? new Date(d) : null);
const isInvalid = (dt) => !dt || Number.isNaN(dt.getTime());

export const formatDate = (d, lang = DEFAULT_LANG) => {
  const dt = parse(d);
  if (isInvalid(dt)) return '—';
  return dt.toLocaleDateString(localeFor(lang), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (d, lang = DEFAULT_LANG) => {
  const dt = parse(d);
  if (isInvalid(dt)) return '—';
  return dt.toLocaleString(localeFor(lang), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const timeAgo = (d, lang = DEFAULT_LANG) => {
  const dt = parse(d);
  if (isInvalid(dt)) return '';
  const diff = Date.now() - dt.getTime();
  const mins = Math.floor(diff / 60000);
  const abs = Math.abs(mins);
  if (abs < 1) return lang === 'en' ? 'Just now' : "À l'instant";
  if (abs < 60) {
    return lang === 'en' ? `${mins} min ago` : `Il y a ${mins} min`;
  }
  const hrs = Math.floor(abs / 60);
  if (hrs < 24) {
    return lang === 'en' ? `${hrs}h ago` : `Il y a ${hrs}h`;
  }
  const days = Math.floor(abs / 1440);
  if (days < 31) {
    return lang === 'en' ? `${days}d ago` : `Il y a ${days}j`;
  }
  return formatDate(d, lang);
};