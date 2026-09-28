import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Send, ArrowLeft, MessageSquare, Loader2, AlertCircle, WifiOff, X } from 'lucide-react';
import { fetchMyConversations } from '../services/messages';
import { useConversationChat } from '../hooks/useConversationChat';
import useStickyScroll from '../hooks/useStickyScroll';
import { useLang } from '../context/LangContext';
import { localeFor } from '../i18n';

const SellerMessages = () => {
  const { onConversationUpdated } = useOutletContext() || {};
  const { t, lang } = useLang();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const loadConversations = useCallback(async ({ showSpinner = false } = {}) => {
    if (showSpinner) setLoading(true);
    const data = await fetchMyConversations();
    setConversations(data || []);
    setLoading(false);
    if (onConversationUpdated) onConversationUpdated();
  }, [onConversationUpdated]);

  useEffect(() => { loadConversations({ showSpinner: true }); }, [loadConversations]);

  const {
    messages, loading: loadingMessages, sending, sendError, realtimeOk, send, setSendError,
  } = useConversationChat({
    conversationId: selectedConvo,
    onInboxChanged: loadConversations,
  });

  // Défilement confiné à la zone de messages : la page ne bouge plus, et le
  // polling 8 s ne peut plus relancer une descente pendant la relecture.
  const { scrollerRef, scrollToBottom } = useStickyScroll({
    conversationId: selectedConvo,
    lastMessageId: messages[messages.length - 1]?.id ?? null,
  });

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvo) return;
    const sent = await send(newMessage);
    if (sent) {
      setNewMessage('');
      scrollToBottom();
    }
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
    const loc = localeFor(lang);
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString(loc, { day: 'numeric', month: 'short' });
  };

  return (
    <div>
      <h2 className="sv-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={18} /> {t('seller.messages.title')}
      </h2>
      <p className="sv-dim" style={{ marginBottom: '1.25rem' }}>
        {t('seller.messages.subtitle')}
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
              <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>{t('seller.messages.noConversations')}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {t('seller.messages.noConversationsHint')}
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
                      {convo.buyerName || t('seller.messages.buyerFallback')}
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
                    {convo.lastMessage || convo.subject || t('seller.messages.newMessage')}
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
              <p style={{ fontWeight: 600 }}>{t('seller.messages.selectConversation')}</p>
              <p style={{ fontSize: '0.8rem' }}>{t('seller.messages.selectHint')}</p>
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
                  title={t('seller.messages.backToList')}
                >
                  <ArrowLeft size={16} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                    {selectedConvoData?.buyerName || t('seller.messages.buyerFallback')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedConvoData?.productTitle ? t('seller.messages.productLabel', { title: selectedConvoData.productTitle }) : selectedConvoData?.subject}
                  </div>
                </div>
                {!realtimeOk && (
                  <span className="sv-msg-conn-warn" title={t('messages.realtimeFallback')}>
                    <WifiOff size={12} /> {t('messages.realtimeFallbackShort')}
                  </span>
                )}
              </div>

              {/* Send error */}
              {sendError !== null && (
                <div className="sv-msg-error" role="alert">
                  <AlertCircle size={15} />
                  <span>{t('messages.sendError')}{sendError ? ` — ${sendError}` : ''}</span>
                  <button type="button" onClick={() => setSendError(null)} aria-label={t('common.close')}>
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Messages */}
              <div
                ref={scrollerRef}
                style={{
                  flex: 1, overflowY: 'auto', padding: '1rem',
                  display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  background: '#faf9f7', minHeight: 280, maxHeight: 420,
                }}
              >
                {messages.map((msg) => (
                  <div key={msg.id} style={{
                    maxWidth: '75%', padding: '0.65rem 0.85rem',
                    borderRadius: 14, fontSize: '0.84rem', lineHeight: 1.5,
                    background: msg.isOwn ? 'var(--primary)' : '#fff',
                    color: msg.isOwn ? '#fff' : 'var(--text-dark)',
                    border: msg.isOwn ? '1px solid var(--primary)' : '1px solid var(--border)',
                    alignSelf: msg.isOwn ? 'flex-end' : 'flex-start',
                    opacity: msg.pending ? 0.65 : 1,
                  }}>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{msg.content}</p>
                    <span style={{
                      display: 'block', fontSize: '0.63rem', marginTop: 4,
                      opacity: 0.7, textAlign: 'right',
                      color: msg.isOwn ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)',
                    }}>
                      {msg.pending
                        ? t('messages.sending')
                        : new Date(msg.createdAt).toLocaleTimeString(localeFor(lang), { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
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
                  placeholder={t('seller.messages.inputPlaceholder')}
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
        .sv-msg-conn-warn {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.68rem; color: #8a6d1f; background: #fdf5e2;
          border: 1px solid #ecd9a8; border-radius: 20px;
          padding: 2px 8px; flex-shrink: 0;
        }
        .sv-msg-error {
          display: flex; align-items: center; gap: 8px;
          padding: 0.6rem 1rem; font-size: 0.8rem;
          color: #8c2f2f; background: #fdf0f0;
          border-bottom: 1px solid #f2d3d3;
        }
        .sv-msg-error span { flex: 1; min-width: 0; }
        .sv-msg-error button {
          border: none; background: transparent; color: inherit;
          cursor: pointer; display: flex; padding: 2px;
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
