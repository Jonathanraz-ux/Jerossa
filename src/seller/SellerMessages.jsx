import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Send, ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import {
  fetchMyConversations, fetchConversationMessages,
  sendMessage, markConversationRead,
} from '../services/messages';

const SellerMessages = () => {
  const { onConversationUpdated } = useOutletContext() || {};
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
    setConversations(data || []);
    setLoading(false);
    if (onConversationUpdated) onConversationUpdated();
  }, [onConversationUpdated]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const loadMessages = useCallback(async (convoId) => {
    if (!convoId) return;
    setLoadingMessages(true);
    const data = await fetchConversationMessages(convoId);
    setMessages(data || []);
    setLoadingMessages(false);
    await markConversationRead(convoId);
    // Refresh conversation unread counter
    const updated = await fetchMyConversations();
    setConversations(updated || []);
    if (onConversationUpdated) onConversationUpdated();
  }, [onConversationUpdated]);

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

      <div className={`sv-msg-container ${selectedConvo ? 'sv-msg--convo-active' : ''}`}>
        {/* Conversation list */}
        <div className="sv-msg-sidebar">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <Loader2 size={20} style={{ animation: 'sv-rotate 0.8s linear infinite' }} />
            </div>
          ) : conversations.length === 0 ? (
            <div className="sv-empty" style={{ padding: '3rem 1rem' }}>
              <MessageSquare size={28} />
              <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>Aucune conversation</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Les messages de vos clients apparaîtront ici.
              </p>
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConvo(convo.id)}
                className={`sv-msg-item ${selectedConvo === convo.id ? 'sv-msg-item--active' : ''}`}
              >
                <div className="sv-msg-avatar">
                  {(convo.buyerName || convo.productTitle || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-dark)' }}>
                      {convo.buyerName || 'Client'}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {formatTime(convo.lastMessageAt)}
                    </span>
                  </div>
                  {convo.productTitle && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {convo.productTitle}
                    </div>
                  )}
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {convo.lastMessage || convo.subject || 'Nouveau message'}
                  </div>
                </div>
                {convo.unreadCount > 0 && (
                  <span className="sv-msg-unread-badge">
                    {convo.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Chat area */}
        <div className="sv-msg-chat-pane">
          {!selectedConvo ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', minHeight: 350, color: 'var(--text-muted)',
              textAlign: 'center', padding: '2rem',
            }}>
              <MessageSquare size={36} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 600 }}>Sélectionnez une conversation</p>
              <p style={{ fontSize: '0.8rem' }}>Choisissez un échange dans la liste pour y répondre.</p>
            </div>
          ) : loadingMessages ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 350 }}>
              <Loader2 size={24} style={{ animation: 'sv-rotate 0.8s linear infinite', color: 'var(--primary)' }} />
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)',
                background: '#fff',
              }}>
                <button
                  type="button"
                  onClick={() => setSelectedConvo(null)}
                  className="sv-msg-back-btn"
                  title="Retour à la liste"
                >
                  <ArrowLeft size={16} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                    {selectedConvoData?.buyerName || 'Client'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedConvoData?.productTitle ? `Produit : ${selectedConvoData.productTitle}` : selectedConvoData?.subject}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '1rem',
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
                background: '#faf9f7', minHeight: 280, maxHeight: 420,
              }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{
                    maxWidth: '75%', padding: '0.65rem 0.85rem',
                    borderRadius: 14, fontSize: '0.84rem', lineHeight: 1.5,
                    background: msg.isOwn ? 'var(--primary)' : '#fff',
                    color: msg.isOwn ? '#fff' : 'var(--text-dark)',
                    border: msg.isOwn ? '1px solid var(--primary)' : '1px solid var(--border)',
                    alignSelf: msg.isOwn ? 'flex-end' : 'flex-start',
                  }}>
                    <p style={{ margin: 0 }}>{msg.content}</p>
                    <span style={{
                      display: 'block', fontSize: '0.63rem', marginTop: 4,
                      opacity: 0.7, textAlign: 'right',
                      color: msg.isOwn ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)',
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
                background: '#fff',
              }}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrivez votre réponse au client…"
                  rows={1}
                  style={{
                    flex: 1, padding: '0.6rem 0.85rem', border: '1px solid var(--border)',
                    borderRadius: 10, fontSize: '0.83rem', fontFamily: 'inherit',
                    resize: 'none', minHeight: 38, maxHeight: 100, color: 'var(--text-dark)', outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="sv-btn sv-btn--primary"
                  style={{ flexShrink: 0, padding: '0.55rem 0.9rem', height: 38 }}
                >
                  {sending ? <Loader2 size={15} style={{ animation: 'sv-rotate 0.8s linear infinite' }} /> : <Send size={15} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .sv-msg-container {
          display: grid;
          grid-template-columns: 320px 1fr;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          min-height: 480px;
        }
        .sv-msg-sidebar {
          border-right: 1px solid var(--border);
          overflow-y: auto;
          max-height: 520px;
        }
        .sv-msg-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.85rem 1rem;
          border: none;
          border-bottom: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: background 0.15s;
        }
        .sv-msg-item:hover { background: #faf9f7; }
        .sv-msg-item--active { background: var(--primary-light) !important; }
        .sv-msg-avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--bg-cream);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--primary);
          flex-shrink: 0;
        }
        .sv-msg-unread-badge {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--primary);
          color: #fff;
          font-size: 0.62rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sv-msg-chat-pane {
          display: flex;
          flex-direction: column;
          background: #fff;
        }
        .sv-msg-back-btn {
          display: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .sv-msg-container {
            grid-template-columns: 1fr;
          }
          .sv-msg-container .sv-msg-sidebar {
            display: block;
          }
          .sv-msg-container .sv-msg-chat-pane {
            display: none;
          }
          .sv-msg--convo-active .sv-msg-sidebar {
            display: none !important;
          }
          .sv-msg--convo-active .sv-msg-chat-pane {
            display: flex !important;
          }
          .sv-msg-back-btn {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
};

export default SellerMessages;
