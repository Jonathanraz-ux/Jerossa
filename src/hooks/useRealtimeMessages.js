import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook pour s'abonner aux nouveaux messages d'une conversation
 * via Supabase Realtime (postgres_changes).
 *
 * @param {string|null} conversationId - ID de la conversation à écouter
 * @param {Function} onNewMessage - Callback appelé avec le message reçu
 * @param {Object} [options]
 * @param {Function} [options.onReadUpdate] - Callback quand is_read change
 */
export const useRealtimeMessages = (conversationId, onNewMessage, options = {}) => {
  const channelRef = useRef(null);
  const callbackRef = useRef(onNewMessage);
  const readCallbackRef = useRef(options.onReadUpdate);

  // Garder les callbacks à jour sans recréer l'abonnement
  useEffect(() => {
    callbackRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    readCallbackRef.current = options.onReadUpdate;
  }, [options.onReadUpdate]);

  useEffect(() => {
    if (!conversationId) {
      // Nettoyer l'ancien channel si conversationId devient null
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Supprimer l'ancien channel avant d'en créer un nouveau
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channelName = `messages:${conversationId}`;

    const channel = supabase
      .channel(channelName)
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
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId]);

  return channelRef;
};

/**
 * Hook pour s'abonner aux conversations non lues (compteur badge).
 * Écoute les INSERT sur messages pour n'importe quelle conversation
 * où l'utilisateur est participant.
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
    if (!currentUserId) return;

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
