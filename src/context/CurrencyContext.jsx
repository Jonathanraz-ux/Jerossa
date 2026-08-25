import React, { createContext, useContext, useMemo, useState } from 'react';
import { CURRENCIES, MARKETS } from '../config/currencies.js';
import { formatFromEUR } from '../lib/currency.js';

// Réexports pour compatibilité : les consommateurs (Navbar, Publish, Home,
// ServiceDetails) continuent d'importer ces constantes depuis ce module.
export { CURRENCIES, MARKETS } from '../config/currencies.js';

export const CURRENCY_NOTE = 'Montants indicatifs selon le taux de conversion en vigueur.';

// Fallback hérité : un code inconnu résout vers la première devise (MGA).
const getCurrency = (code) =>
  CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];

// Délégation aux utilitaires purs — sortie identique à l'ancienne
// implémentation locale (prouvée par matrice d'équivalence L4a/L4b).
export const formatAmount = (amountEUR, currencyCode) =>
  formatFromEUR(amountEUR, currencyCode);

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('MGA');
  const [market, setMarket] = useState('MG');

  const currencyInfo = getCurrency(currency);
  const marketInfo = MARKETS.find((m) => m.code === market) || MARKETS[0];

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      currencyInfo,
      market,
      setMarket,
      marketInfo,
      convert: (eur) => formatAmount(eur, currency),
      formatAmount,
    }),
    [currency, currencyInfo, market, marketInfo]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
};

export default CurrencyContext;
