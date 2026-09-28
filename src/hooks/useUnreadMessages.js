import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMyConversations } from '../services/messages';
import { useRealtimeConversations } from './useRealtimeMessages';

const BADGE_POLL_MS = 45000;
const MIN_REFRESH_MS = 1500;

const totalUnread = (convos) =>
  (convos || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0);

/**
 * Compteur de messages non lus, partagé par la Navbar, Mon compte et
 * l'espace vendeur.
 *
 * Se recompute à l'authentification, à chaque message entrant (Realtime) et,
 * en repli, toutes les BADGE_POLL_MS millisecondes : un compteur figé est
 * le symptôme le plus visible d'une messagerie prétendument morte.
 */
export const useUnreadMessages = (userId) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const lastRefreshRef = useRef(0);
  const inFlightRef = useRef(false);

  const refresh = useCallback(async ({ force = false } = {}) => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    // Un rafale de messages ne doit pas déclencher une requête par message.
    const now = Date.now();
    if (!force && (inFlightRef.current || now - lastRefreshRef.current < MIN_REFRESH_MS)) return;
    inFlightRef.current = true;
    lastRefreshRef.current = now;
    try {
      const convos = await fetchMyConversations();
      setUnreadCount(totalUnread(convos));
    } finally {
      inFlightRef.current = false;
    }
  }, [userId]);

  useEffect(() => { refresh({ force: true }); }, [refresh]);

  useRealtimeConversations(
    useCallback((newMsg) => {
      if (!newMsg || newMsg.is_read) return;
      refresh();
    }, [refresh]),
    userId,
  );

  useEffect(() => {
    if (!userId) return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh({ force: true });
    }, BADGE_POLL_MS);
    return () => clearInterval(timer);
  }, [userId, refresh]);

  return { unreadCount, refreshUnread: refresh };
};

export default useUnreadMessages;
