/**
 * Configuration commerciale centralisée de Jerossa.
 *
 * Module pur : aucune dépendance React, Supabase, ni import de contexte ou de page.
 * Devise de référence des règles : EUR (les prix produits sont stockés en price_eur,
 * cf. services/catalog.js et le schéma du panier localStorage).
 */

export const STANDARD_SHIPPING_FEE_EUR = 15;
export const EXPRESS_SHIPPING_FEE_EUR = 35;
export const FREE_SHIPPING_THRESHOLD_EUR = 200;
