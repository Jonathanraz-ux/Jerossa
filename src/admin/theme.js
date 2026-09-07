// Thème d'affichage de l'espace administrateur (Clair / Night).
// Persistance localStorage + attribut sur <html> pour éviter le flash
// et conserver l'isolation au périmètre admin (voir admin.css).

const STORAGE_KEY = 'jr_admin_theme';

export const THEMES = ['light', 'night'];

const readStored = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : 'light';
  } catch {
    return 'light';
  }
};

// Restaure l'attribut sur <html> avant le rendu admin le cas échéant.
export const readHtmlTheme = () =>
  (typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-jerossa-admin-theme')
    : null) || readStored();

export const getAdminTheme = () => readStored();

export const setAdminTheme = (theme) => {
  const value = THEMES.includes(theme) ? theme : 'light';
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* noop */
  }
  if (typeof document !== 'undefined') {
    if (value === 'night') {
      document.documentElement.setAttribute('data-jerossa-admin-theme', 'night');
    } else {
      document.documentElement.removeAttribute('data-jerossa-admin-theme');
    }
  }
  return value;
};