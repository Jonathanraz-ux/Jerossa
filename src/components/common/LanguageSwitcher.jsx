import React from 'react';
import { useLang } from '../../context/LangContext';
import './LanguageSwitcher.css';

/**
 * Sélecteur de langue FR / EN.
 * Compact, réutilisable dans la navbar publique, l'espace client,
 * l'espace vendeur et l'espace administrateur.
 */
const LanguageSwitcher = ({ className = '', compact = false }) => {
  const { lang, setLang } = useLang();

  return (
    <div className={`lr-switcher${compact ? ' lr-switcher--compact' : ''} ${className}`.trim()} role="group" aria-label="Langue / Language">
      <button
        type="button"
        className={`lr-switcher-btn${lang === 'fr' ? ' is-active' : ''}`}
        onClick={() => setLang('fr')}
        aria-pressed={lang === 'fr'}
        title="Français"
      >
        FR
      </button>
      <span className="lr-switcher-sep" aria-hidden="true" />
      <button
        type="button"
        className={`lr-switcher-btn${lang === 'en' ? ' is-active' : ''}`}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        title="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;