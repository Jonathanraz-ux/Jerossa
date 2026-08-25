/**
 * Fonctions pures de conversion et de formatage monétaire Jerossa.
 *
 * Module pur : aucune dépendance React/Supabase, aucun effet de bord, aucun appel réseau.
 * Source de vérité des métadonnées : src/config/currencies.js.
 *
 * SÉMANTIQUE HÉRITÉE (réplique exactement l'ancien CurrencyContext.formatAmount) :
 * - `value || 0` : null, undefined, 0, '', false et **NaN** retombent à 0 ;
 *   une chaîne numérique ('220') est acceptée via la coercion arithmétique ;
 *   une chaîne non numérique truthy ('abc') propage NaN jusqu'au formatage
 *   (rendu « NaN ») — comportement historique conservé, volontairement non masqué ;
 * - les nombres négatifs sont préservés (arrondi Math.round symétrique) ;
 * - code de devise inconnu → fallback DEFAULT_CURRENCY_CODE (MGA), voir
 *   `hasCurrency` pour un contrôle explicite sans fallback.
 */

import { CURRENCIES, DEFAULT_CURRENCY_CODE } from '../config/currencies.js';

/** Résout une devise ; fallback documenté sur la devise par défaut. */
const resolveCurrency = (currencyCode) =>
  CURRENCIES.find((c) => c.code === currencyCode) ||
  CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY_CODE);

/**
 * Indique si le code de devise existe dans les métadonnées.
 * À utiliser quand un fallback silencieux est indésirable.
 */
export const hasCurrency = (currencyCode) =>
  CURRENCIES.some((c) => c.code === currencyCode);

/** Normalisation héritée : `value || 0` (voir sémantique ci-dessus). */
export const normalizeAmount = (value) => value || 0;

const roundTo = (value, step) => (!step ? Math.round(value) : Math.round(value / step) * step);

// Même normalisation que le contexte historique : `value || 0`.
const rawAmount = (value) => value || 0;

/** Convertit un montant EUR vers la devise cible (arrondi propre à la devise). */
export const convertFromEUR = (amountEUR, currencyCode) => {
  const cur = resolveCurrency(currencyCode);
  return roundTo(rawAmount(amountEUR) * cur.rate, cur.roundStep);
};

/** Formate un montant DÉJÀ exprimé dans la devise cible. */
export const formatInCurrency = (amount, currencyCode) => {
  const cur = resolveCurrency(currencyCode);
  const formatted = new Intl.NumberFormat(cur.locale, {
    minimumFractionDigits: cur.decimals,
    maximumFractionDigits: cur.decimals,
  }).format(amount);
  return `${formatted} ${cur.symbol}`;
};

/** Conversion + formatage : équivalent direct de l'ancien `formatAmount`. */
export const formatFromEUR = (amountEUR, currencyCode) =>
  formatInCurrency(convertFromEUR(amountEUR, currencyCode), currencyCode);

/**
 * Rendus « statiques EUR » du tunnel, historiquement divergents :
 * - style 'dot'   (Cart, Checkout)      : `165.00 €`
 * - style 'comma' (pages compte, ×8)    : `165,00 €`
 * Le style par défaut est explicite côté appelant — aucune page ne doit changer
 * de style pendant la migration.
 */
export const FORMAT_EUR_STYLES = { DOT: 'dot', COMMA: 'comma' };

export const formatEURStatic = (value, style = FORMAT_EUR_STYLES.COMMA) => {
  const number = Number(value);
  const body =
    style === FORMAT_EUR_STYLES.DOT ? number.toFixed(2) : number.toFixed(2).replace('.', ',');
  return `${body} €`;
};

/**
 * Prix unitaire produit avec unité, réplique exacte de l'ancien
 * catalog.formatPrice (entier sans décimales, virgule sinon), paramétré par devise :
 * EUR → identique à l'historique (« 220 € / kg », « 4,50 € / kg ») ;
 * MGA/MUR → montants convertis puis arrondis, rendus selon la même règle.
 */
export const formatUnitPriceFromEUR = (amountEUR, unit, currencyCode) => {
  const amount = Number(convertFromEUR(amountEUR, currencyCode));
  const formatted = Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace('.', ',');
  return `${formatted} ${resolveCurrency(currencyCode).symbol} / ${unit}`;
};
