import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const RETRY_DELAY_MS = 3000;

/**
 * Hook pour s'abonner aux nouveaux messages d'une conversation
 * via Supabase Realtime (postgres_changes).
 *
 * Signale l'état de l'abonnement à l'appelant (options.onStatus) afin que
 * l'interface puisse basculer sur un repli polling quand le Realtime est
 * indisponible, et ré-abonne automatiquement après une coupure.
 *
 * @param {string|null} conversationId - ID de la conversation à écouter
 * @param {Function} onNewMessage - Callback appelé avec le message reçu
 * @param {Object} [options]
 * @param {Function} [options.onReadUpdate] - Callback quand is_read change
 * @param {Function} [options.onStatus] - Callback 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED'
 */
export const useRealtimeMessages = (conversationId, onNewMessage, options = {}) => {
  const channelRef = useRef(null);
  const callbackRef = useRef(onNewMessage);
  const readCallbackRef = useRef(options.onReadUpdate);
  const statusCallbackRef = useRef(options.onStatus);

  // Garder les callbacks à jour sans recréer l'abonnement
  useEffect(() => {
    callbackRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    readCallbackRef.current = options.onReadUpdate;
  }, [options.onReadUpdate]);

  useEffect(() => {
    statusCallbackRef.current = options.onStatus;
  }, [options.onStatus]);

  useEffect(() => {
    if (!conversationId) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return undefined;
    }

    let cancelled = false;
    let retryTimer = null;

    const emitStatus = (status) => {
      if (!cancelled && statusCallbackRef.current) statusCallbackRef.current(status);
    };

    const attach = () => {
      if (cancelled) return;

      const channel = supabase
        .channel(`messages:${conversationId}:${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            if (callbackRef.current) {
              callbackRef.current(payload.new);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            if (payload.new.is_read && readCallbackRef.current) {
              readCallbackRef.current(payload.new);
            }
          }
        )
        .subscribe((status) => {
          emitStatus(status);
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            supabase.removeChannel(channel);
            if (channelRef.current === channel) channelRef.current = null;
            if (!cancelled) {
              retryTimer = setTimeout(attach, RETRY_DELAY_MS);
            }
          }
        });

      channelRef.current = channel;
    };

    attach();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId]);

  return channelRef;
};

/**
 * Hook pour rafraîchir la boîte de réception (badges de non-lus) quand un
 * message arrive dans n'importe laquelle des conversations de l'utilisateur.
 *
 * RLS filtre la diffusion : chaque abonné ne reçoit que les événements des
 * conversations auxquelles il participe.
 *
 * @param {Function} onNewConversationMessage - Callback appelé quand un message arrive dans une conversation
 * @param {string|null} currentUserId - ID de l'utilisateur courant
 */
export const useRealtimeConversations = (onNewConversationMessage, currentUserId) => {
  const channelRef = useRef(null);
  const callbackRef = useRef(onNewConversationMessage);

  useEffect(() => {
    callbackRef.current = onNewConversationMessage;
  }, [onNewConversationMessage]);

  useEffect(() => {
    if (!currentUserId) return undefined;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel('conversations-unread')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          if (callbackRef.current) {
            callbackRef.current(payload.new);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentUserId]);
};
