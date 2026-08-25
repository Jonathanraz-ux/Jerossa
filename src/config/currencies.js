/**
 * Métadonnées statiques des devises Jerossa et des marchés associés.
 *
 * Module pur : aucune dépendance React, Supabase, aucun effet de bord au chargement,
 * aucun appel réseau. Les taux sont indicatifs et proviennent du frontend existant
 * (ancien CurrencyContext) — NE PAS les modifier sans décision produit.
 *
 * `decimals`   : nombre de décimales affichées (exige min = max dans Intl).
 * `roundStep`  : pas d'arrondi appliqué après conversion (héritage exact :
 *                MGA → 100, MUR → 1, EUR → 0.01).
 */

export const CURRENCIES = [
  {
    code: 'MGA',
    label: 'Ariary malgache',
    short: 'Ariary',
    symbol: 'Ar',
    rate: 4900,
    locale: 'fr-FR',
    decimals: 0,
    roundStep: 100,
  },
  {
    code: 'MUR',
    label: 'Roupie mauricienne',
    short: 'Roupie',
    symbol: 'Rs',
    rate: 52,
    locale: 'fr-FR',
    decimals: 0,
    roundStep: 1,
  },
  {
    code: 'EUR',
    label: 'Euro',
    short: 'Euro',
    symbol: '€',
    rate: 1,
    locale: 'fr-FR',
    decimals: 2,
    roundStep: 0.01,
  },
];

export const MARKETS = [
  { code: 'MG', label: 'Madagascar', flag: '🇲🇬', currency: 'MGA' },
  { code: 'MU', label: 'Maurice', flag: '🇲🇺', currency: 'MUR' },
  { code: 'INT', label: 'International', flag: '🌍', currency: 'EUR' },
];

/**
 * Devise par défaut = première entrée de CURRENCIES (MGA).
 * Fallback DOCUMENTÉ : un code inconnu résout vers cette devise, reproduisant
 * exactement l'ancien comportement de CurrencyContext (`CURRENCIES.find() || CURRENCIES[0]`).
 * Pour éviter ce fallback silencieux, tester au préalable avec `hasCurrency(code)`.
 */
export const DEFAULT_CURRENCY_CODE = 'MGA';
