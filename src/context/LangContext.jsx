import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations, DEFAULT_LANG, SUPPORTED_LANGS } from '../i18n';

const STORAGE_KEY = 'jr_lang';

const readStoredLang = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGS.includes(stored) ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
};

const LangContext = createContext(null);

export const LangProvider = ({ children }) => {
  const [lang, setLangState] = useState(readStoredLang);

  // L'attribut `lang` de <html> suit toujours la langue active afin que les
  // composants d'accessibilité et le navigateur adoptent la bonne locale.
  useEffect(() => {
    try { document.documentElement.lang = lang; } catch { /* noop */ }
  }, [lang]);

  const setLang = useCallback((next) => {
    const value = SUPPORTED_LANGS.includes(next) ? next : DEFAULT_LANG;
    setLangState(value);
    try { localStorage.setItem(STORAGE_KEY, value); } catch { /* noop */ }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === 'fr' ? 'en' : 'fr');
  }, [lang, setLang]);

  // Interpolation : t('key', { nom: 'Vanille' }) remplace {{nom}}.
  const t = useCallback((key, vars) => {
    let str = translations[lang]?.[key] ?? translations[DEFAULT_LANG][key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.split(`{{${k}}}`).join(v);
      });
    }
    return str;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within a LangProvider');
  return ctx;
};

export default LangContext;