import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Send, ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import {
  fetchMyConversations, fetchConversationMessages,
  sendMessage, markConversationRead,
} from '../services/messages';

const SellerMessages = () => {
  useOutletContext();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    const data = await fetchMyConversations();
    setConversations(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const loadMessages = useCallback(async (convoId) => {
    if (!convoId) return;
    setLoadingMessages(true);
    const data = await fetchConversationMessages(convoId);
    setMessages(data);
    setLoadingMessages(false);
    await markConversationRead(convoId);
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedConvo) loadMessages(selectedConvo);
  }, [selectedConvo, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvo) return;
    setSending(true);
    const res = await sendMessage({ conversationId: selectedConvo, content: newMessage.trim() });
    if (res.ok) {
      setNewMessage('');
      await loadMessages(selectedConvo);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedConvoData = conversations.find((c) => c.id === selectedConvo);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div>
      <h2 className="sv-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={18} /> Messages
      </h2>
      <p className="sv-dim" style={{ marginBottom: '1.25rem' }}>
        Conversations avec vos acheteurs. Répondez pour améliorer votre taux de réponse.
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: selectedConvo ? '1fr' : '320px 1fr',
        background: '#fff', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        minHeight: 450,
      }}>
        {/* Conversation list */}
        <div style={{
          borderRight: selectedConvo ? 'none' : '1px solid var(--border)',
          overflowY: 'auto',
          display: selectedConvo ? 'none' : 'block',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <Loader2 size={20} style={{ animation: 'sv-rotate 0.8s linear infinite' }} />
            </div>
          ) : conversations.length === 0 ? (
            <div className="sv-empty">
              <MessageSquare size={28} />
              <p>Aucune conversation</p>
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConvo(convo.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  width: '100%', padding: '0.85rem 1rem',
                  border: 'none', borderBottom: '1px solid var(--border)',
                  background: selectedConvo === convo.id ? 'var(--primary-light)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'var(--bg-cream)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0,
                }}>
                  {(convo.productTitle || '?').charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                      {convo.productTitle || convo.subject || 'Conversation'}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {formatTime(convo.lastMessageAt)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {convo.lastMessage?.slice(0, 50) || 'Pas de message'}
                  </div>
                </div>
                {convo.unreadCount > 0 && (
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--brand-green)', color: '#fff',
                    fontSize: '0.6rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {convo.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Chat area */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {!selectedConvo ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', color: 'var(--text-muted)',
              textAlign: 'center', padding: '2rem',
            }}>
              <MessageSquare size={36} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 600 }}>Sélectionnez une conversation</p>
              <p style={{ fontSize: '0.8rem' }}>Choisissez un échange dans la liste pour y répondre.</p>
            </div>
          ) : loadingMessages ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Loader2 size={24} style={{ animation: 'sv-rotate 0.8s linear infinite', color: 'var(--accent)' }} />
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)',
              }}>
                <button
                  onClick={() => setSelectedConvo(null)}
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ArrowLeft size={15} />
                </button>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    {selectedConvoData?.productTitle || 'Conversation'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedConvoData?.subject}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '1rem',
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
                background: '#faf9f7',
              }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{
                    maxWidth: '75%', padding: '0.6rem 0.85rem',
                    borderRadius: 14, fontSize: '0.83rem', lineHeight: 1.5,
                    background: msg.isOwn ? 'var(--brand-green)' : '#fff',
                    color: msg.isOwn ? '#fff' : 'var(--text-dark)',
                    border: msg.isOwn ? '1px solid var(--brand-green)' : '1px solid var(--border)',
                    alignSelf: msg.isOwn ? 'flex-end' : 'flex-start',
                  }}>
                    <p style={{ margin: 0 }}>{msg.content}</p>
                    <span style={{
                      display: 'block', fontSize: '0.63rem', marginTop: 4,
                      opacity: 0.6, textAlign: 'right',
                      color: msg.isOwn ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                    }}>
                      {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: '0.5rem',
                padding: '0.75rem 1rem', borderTop: '1px solid var(--border)',
              }}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Répondre…"
                  rows={1}
                  style={{
                    flex: 1, padding: '0.6rem 0.85rem', border: '1px solid var(--border)',
                    borderRadius: 10, fontSize: '0.83rem', fontFamily: 'inherit',
                    resize: 'none', minHeight: 36, color: 'var(--text-dark)', outline: 'none',
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="sv-btn sv-btn--primary"
                  style={{ flexShrink: 0, padding: '0.55rem 0.85rem' }}
                >
                  {sending ? <Loader2 size={15} style={{ animation: 'sv-rotate 0.8s linear infinite' }} /> : <Send size={15} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          [style*="grid-template-columns: 320px 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SellerMessages;
