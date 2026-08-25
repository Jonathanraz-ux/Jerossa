import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { STANDARD_SHIPPING_FEE_EUR, FREE_SHIPPING_THRESHOLD_EUR } from '../config/commerce';

const CART_STORAGE_KEY = 'jerossa_cart_v1';

export const CURRENCY_LABELS = {
  MG: 'MGA',
  MU: 'MUR',
  INT: 'EUR',
};

export const CART_RULE_MESSAGE =
  'Les produits de ce panier doivent être dans la même devise pour poursuivre la commande.';

const currencyForMarket = (market) => CURRENCY_LABELS[market] || 'EUR';

const readStoredCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readStoredCart);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // stockage indisponible : le panier reste en mémoire pour la session
    }
  }, [items]);

  const dismissNotice = useCallback(() => setNotice(null), []);

  const addItem = useCallback((product, qty = 1) => {
    if (!product?.id) return { ok: false, message: 'Produit introuvable.' };
    const quantity = Math.max(1, Number(qty) || 1);
    const nextMarket = product.market || 'MG';

    if (items.length > 0 && items[0].market !== nextMarket) {
      setNotice(CART_RULE_MESSAGE);
      return { ok: false, message: CART_RULE_MESSAGE };
    }

    setNotice(null);
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      setItems(items.map((i) => (i.productId === product.id ? { ...i, qty: i.qty + quantity } : i)));
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          title: product.title,
          seller: product.seller || '',
          priceEUR: Number(product.priceEUR) || 0,
          unit: product.unit || 'kg',
          image: product.images?.[0] || '',
          market: nextMarket,
          qty: quantity,
        },
      ]);
    }
    return { ok: true };
  }, [items]);

  const updateQty = useCallback((productId, delta) => {
    setItems((prev) => {
      const item = prev.find((i) => i.productId === productId);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => (i.productId === productId ? { ...i, qty: newQty } : i));
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setNotice(null);
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.priceEUR * i.qty, 0);
    const shipping = items.length === 0 || subtotal > FREE_SHIPPING_THRESHOLD_EUR ? 0 : STANDARD_SHIPPING_FEE_EUR;
    const total = subtotal + shipping;
    const market = items[0]?.market || null;
    const currency = currencyForMarket(market);
    return {
      items,
      count,
      subtotal,
      shipping,
      total,
      market,
      currency,
      notice,
      addItem,
      updateQty,
      removeItem,
      clearCart,
      dismissNotice,
    };
  }, [items, notice, addItem, updateQty, removeItem, clearCart, dismissNotice]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

export default CartContext;
