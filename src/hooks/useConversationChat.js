import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchConversationMessages, sendMessage, markConversationRead,
} from '../services/messages';
import { useRealtimeMessages } from './useRealtimeMessages';
import { useAuth } from '../context/AuthContext';

const MESSAGE_POLL_MS = 8000;
const INBOX_POLL_MS = 30000;

let optimisticSeq = 0;

const normalize = (msg) => ({
  id: msg.id,
  senderId: msg.senderId,
  isOwn: msg.isOwn,
  content: msg.content,
  isRead: msg.isRead,
  createdAt: msg.createdAt,
  seq: msg.seq ?? null,
  pending: !!msg.pending,
});

/**
 * Ordre chronologique total et stable.
 *
 * `createdAt` seul ne suffit pas : deux messages insérés dans la même
 * transaction partagent le même `created_at` (now() est figé au début de la
 * transaction), et deux envois rapprochés peuvent retomber sur la même
 * milliseconde. `seq` (colonne identity côté base) départage ces ex æquo.
 * Les bulles optimistes n'ont pas encore de `seq` : elles restent donc en
 * dernière position, ce qui est leur place (dernier envoi en cours).
 */
const byChronology = (a, b) => {
  const delta = new Date(a.createdAt) - new Date(b.createdAt);
  if (delta !== 0) return delta;
  if (a.seq === b.seq) return 0;
  if (a.seq == null) return 1;
  if (b.seq == null) return -1;
  return a.seq - b.seq;
};

/**
 * État de la conversation ouverte, partagé par l'écran client et l'écran
 * vendeur.
 *
 * Garanties :
 * - un message envoyé apparaît immédiatement (ajout optimiste) puis est
 *   réconcilié avec l'ID réel renvoyé par la base ;
 * - le Realtime ne fait qu'ajouter les messages entrants, jamais écarter
 *   ceux que l'utilisateur vient d'envoyer ;
 * - un repli polling prend le relais si le Realtime est indisponible, de
 *   sorte qu'aucun message ne reste invisible même hors WebSocket.
 */
export const useConversationChat = ({ conversationId, onInboxChanged, onStatusChange }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [realtimeOk, setRealtimeOk] = useState(true);

  const convoRef = useRef(conversationId);
  const sendingRef = useRef(false);
  const inboxCallbackRef = useRef(onInboxChanged);
  const statusCallbackRef = useRef(onStatusChange);

  convoRef.current = conversationId;

  useEffect(() => { inboxCallbackRef.current = onInboxChanged; }, [onInboxChanged]);
  useEffect(() => { statusCallbackRef.current = onStatusChange; }, [onStatusChange]);

  const notifyInbox = useCallback(() => {
    if (inboxCallbackRef.current) inboxCallbackRef.current();
  }, []);

  const refreshMessages = useCallback(async (convoId, { silent = true } = {}) => {
    if (!convoId) return false;
    if (!silent) setLoading(true);
    const res = await fetchConversationMessages(convoId);
    if (res.ok && convoRef.current === convoId) {
      const fromServer = res.messages.map(normalize);
      if (silent) {
        // Un rafraîchissement silencieux ne doit pas faire clignoter un envoi
        // en cours : on conserve les bulles optimistes pas encore confirmées.
        setMessages((prev) => {
          const stillPending = prev.filter(
            (m) => m.pending && !fromServer.some((s) => s.id === m.id),
          );
          if (!stillPending.length) return fromServer;
          return [...fromServer, ...stillPending].sort(byChronology);
        });
      } else {
        setMessages(fromServer);
      }
    }
    if (!silent) setLoading(false);
    return res.ok;
  }, []);

  const loadMessages = useCallback(async (convoId) => {
    if (!convoId) return;
    setSendError(null);
    const ok = await refreshMessages(convoId, { silent: false });
    if (!ok) return;
    await markConversationRead(convoId);
    notifyInbox();
  }, [refreshMessages, notifyInbox]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      setSendError(null);
      return;
    }
    setMessages([]);
    loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  useRealtimeMessages(
    conversationId,
    useCallback((newMsg) => {
      if (!newMsg || newMsg.conversation_id !== convoRef.current) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        const entry = normalize({
          id: newMsg.id,
          senderId: newMsg.sender_id,
          isOwn: newMsg.sender_id === userId,
          content: newMsg.content,
          isRead: newMsg.is_read,
          createdAt: newMsg.created_at,
          seq: newMsg.seq ?? null,
        });
        return [...prev, entry].sort(byChronology);
      });
    }, [userId]),
    {
      onStatus: (status) => {
        const ok = status === 'SUBSCRIBED';
        setRealtimeOk(ok);
        if (statusCallbackRef.current) statusCallbackRef.current(ok);
      },
      onReadUpdate: () => { notifyInbox(); },
    },
  );

  useEffect(() => {
    if (!conversationId) return undefined;
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      refreshMessages(convoRef.current);
    };
    const timer = setInterval(tick, MESSAGE_POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [conversationId, refreshMessages]);

  useEffect(() => {
    if (!conversationId) return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') notifyInbox();
    }, INBOX_POLL_MS);
    return () => clearInterval(timer);
  }, [conversationId, notifyInbox]);

  const send = useCallback(async (rawContent) => {
    const content = (rawContent || '').trim();
    const convoId = convoRef.current;
    if (!content || !convoId || sendingRef.current) return false;

    sendingRef.current = true;
    setSending(true);
    setSendError(null);

    const tempId = `optimistic-${Date.now()}-${++optimisticSeq}`;
    setMessages((prev) => [...prev, normalize({
      id: tempId,
      isOwn: true,
      content,
      isRead: true,
      createdAt: new Date().toISOString(),
      pending: true,
    })]);

    const res = await sendMessage({ conversationId: convoId, content });

    if (res.ok) {
      await markConversationRead(convoId);
      const reconciled = await refreshMessages(convoId);
      if (!reconciled) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false } : m)));
      }
      notifyInbox();
      sendingRef.current = false;
      setSending(false);
      return true;
    }

    setMessages((prev) => prev.filter((m) => m.id !== tempId));
    setSendError(res.error?.message || '');
    sendingRef.current = false;
    setSending(false);
    return false;
  }, [refreshMessages, notifyInbox]);
  return { messages, loading, sending, sendError, realtimeOk, send, setSendError };
};

export default useConversationChat;
