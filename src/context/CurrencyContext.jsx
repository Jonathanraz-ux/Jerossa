import React, { createContext, useContext, useState, useMemo } from 'react';

export const CURRENCIES = [
  { code: 'MGA', label: 'Ariary malgache', short: 'Ariary', symbol: 'Ar', rate: 4900, locales: ['mg-MG'] },
  { code: 'MUR', label: 'Roupie mauricienne', short: 'Roupie', symbol: 'Rs', rate: 52, locales: ['en-MU'] },
  { code: 'EUR', label: 'Euro', short: 'Euro', symbol: '€', rate: 1, locales: ['fr-FR'] },
];

export const MARKETS = [
  { code: 'MG', label: 'Madagascar', flag: '🇲🇬', currency: 'MGA' },
  { code: 'MU', label: 'Maurice', flag: '🇲🇺', currency: 'MUR' },
  { code: 'INT', label: 'International', flag: '🌍', currency: 'EUR' },
];

export const CURRENCY_NOTE = 'Montants indicatifs selon le taux de conversion en vigueur.';

const getCurrency = (code) => CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];

const roundTo = (value, step) => {
  if (!step) return Math.round(value);
  return Math.round(value / step) * step;
};

export const formatAmount = (amountEUR, currencyCode) => {
  const cur = getCurrency(currencyCode);
  const raw = (amountEUR || 0) * cur.rate;
  let value = raw;
  if (cur.code === 'MGA') value = roundTo(raw, 100);
  if (cur.code === 'MUR') value = roundTo(raw, 1);
  if (cur.code === 'EUR') value = roundTo(raw, 0.01);
  const digits = cur.code === 'EUR' ? 2 : 0;
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: cur.code === 'EUR' ? 2 : 0,
  }).format(value);
  return `${formatted} ${cur.symbol}`;
};

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
