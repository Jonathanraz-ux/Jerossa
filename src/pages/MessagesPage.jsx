import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, MessageSquare, Loader2, AlertCircle, WifiOff, X } from 'lucide-react';
import { fetchMyConversations } from '../services/messages';
import { useConversationChat } from '../hooks/useConversationChat';
import useStickyScroll from '../hooks/useStickyScroll';
import { useLang } from '../context/LangContext';
import { localeFor } from '../i18n';

const MessagesPage = () => {
  const { id: conversationId } = useParams();
  const { t, lang } = useLang();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState(conversationId || null);
  const [newMessage, setNewMessage] = useState('');

  const loadConversations = useCallback(async ({ showSpinner = false } = {}) => {
    if (showSpinner) setLoading(true);
    const data = await fetchMyConversations();
    setConversations(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadConversations({ showSpinner: true }); }, [loadConversations]);

  useEffect(() => {
    if (conversationId) setSelectedConvo(conversationId);
  }, [conversationId]);

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
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString(localeFor(lang), { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString(localeFor(lang), { day: 'numeric', month: 'short' });
  };

  return (
    <div className="msg-page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <Link to="/" style={{ color: 'var(--text-muted)' }}>{t('nav.home')}</Link>
            <span style={{ color: 'var(--border)' }}>/</span>
            <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>{t('messages.title')}</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600 }}>{t('account.messages')}</h1>
        </div>

        <div className={`msg-layout ${selectedConvo ? 'msg-layout--convo-active' : ''}`}>
          {/* Conversation list */}
          <div className="msg-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                <MessageSquare size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{t('messages.no_conversations')}</p>
                <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  {t('messages.no_conversations_text')}
                </p>
                <Link to="/boutique" className="btn btn-outline" style={{ marginTop: '1rem', display: 'inline-block' }}>
                  {t('myMessages.exploreCatalog')}
                </Link>
              </div>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.id}
                  className={`msg-item ${selectedConvo === convo.id ? 'msg-item--active' : ''}`}
                  onClick={() => setSelectedConvo(convo.id)}
                >
                  <div className="msg-item-avatar">
                    {convo.sellerLogo ? (
                      <img src={convo.sellerLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 10, padding: '2px' }} />
                    ) : (
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {(convo.sellerName || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="msg-item-content">
                    <div className="msg-item-header">
                      <span className="msg-item-name">{convo.sellerName || t('role.seller')}</span>
                      <span className="msg-item-time">{formatTime(convo.lastMessageAt)}</span>
                    </div>
                    {convo.productTitle && (
                      <div className="msg-item-product">{convo.productTitle}</div>
                    )}
                    <div className="msg-item-preview">
                      {convo.lastMessage || convo.subject || t('myMessages.newMessage')}
                    </div>
                  </div>
                  {convo.unreadCount > 0 && (
                    <span className="msg-item-unread">{convo.unreadCount}</span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Messages area */}
          <div className="msg-chat">
            {!selectedConvo ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem',
              }}>
                <MessageSquare size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{t('myMessages.selectConversation')}</p>
                <p style={{ fontSize: '0.85rem' }}>{t('myMessages.selectConversationText')}</p>
              </div>
            ) : loadingMessages ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="msg-chat-header">
                  <button type="button" className="msg-back-btn" onClick={() => setSelectedConvo(null)} title={t('myMessages.back')}>
                    <ArrowLeft size={18} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-dark)' }}>
                      {selectedConvoData?.sellerName || t('role.seller')}
                    </div>
                    {selectedConvoData?.productTitle && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t('myMessages.product')} : {selectedConvoData.productTitle}
                      </div>
                    )}
                    {!realtimeOk && (
                      <span className="msg-conn-warn" title={t('messages.realtimeFallback')}>
                        <WifiOff size={12} /> {t('messages.realtimeFallbackShort')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Send error */}
                {sendError !== null && (
                  <div className="msg-error" role="alert">
                    <AlertCircle size={15} />
                    <span>{t('messages.sendError')}{sendError ? ` — ${sendError}` : ''}</span>
                    <button type="button" onClick={() => setSendError(null)} aria-label={t('common.close')}>
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Messages */}
                <div className="msg-chat-body" ref={scrollerRef}>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`msg-bubble ${msg.isOwn ? 'msg-bubble--own' : ''} ${msg.pending ? 'msg-bubble--pending' : ''}`}>
                      <p>{msg.content}</p>
                      <span className="msg-time">
                        {msg.pending
                          ? t('messages.sending')
                          : new Date(msg.createdAt).toLocaleTimeString(localeFor(lang), { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="msg-chat-footer">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('messages.placeholder')}
                    rows={1}
                    className="msg-input"
                  />
                  <button
                    type="button"
                    className="msg-send-btn"
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .msg-page { background: var(--bg-cream); min-height: 100vh; }
        .msg-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          height: calc(100vh - 220px);
          min-height: 520px;
        }
        .msg-list {
          border-right: 1px solid var(--border);
          overflow-y: auto;
          background: #fff;
        }
        .msg-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.85rem 1rem;
          border: none;
          background: transparent;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: background 0.15s;
          position: relative;
        }
        .msg-item:hover { background: var(--bg-cream); }
        .msg-item--active { background: var(--primary-light) !important; }
        .msg-item-avatar {
          width: 42px; height: 42px; border-radius: 10px;
          background: var(--bg-cream); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; overflow: hidden;
        }
        .msg-item-content { flex: 1; min-width: 0; }
        .msg-item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .msg-item-name { font-weight: 600; font-size: 0.85rem; color: var(--text-dark); }
        .msg-item-time { font-size: 0.68rem; color: var(--text-muted); white-space: nowrap; margin-left: 8px; }
        .msg-item-product { font-size: 0.72rem; color: var(--primary); font-weight: 500; margin: 1px 0; }
        .msg-item-preview {
          font-size: 0.78rem; color: var(--text-muted); white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis; max-width: 230px;
        }
        .msg-item-unread {
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--primary); color: #fff;
          font-size: 0.65rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .msg-chat { display: flex; flex-direction: column; background: #fff; }
        .msg-chat-header {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.85rem 1rem; border-bottom: 1px solid var(--border);
          background: #fff;
        }
        .msg-back-btn {
          display: none; width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid var(--border); background: transparent;
          color: var(--text-muted); cursor: pointer; align-items: center;
          justify-content: center; flex-shrink: 0;
        }
        .msg-chat-body {
          flex: 1; overflow-y: auto; padding: 1rem;
          display: flex; flex-direction: column; gap: 0.5rem;
          background: #faf9f7;
        }
        .msg-bubble {
          max-width: 75%; padding: 0.65rem 0.85rem;
          border-radius: 14px; font-size: 0.85rem; line-height: 1.5;
          background: #fff; border: 1px solid var(--border);
          align-self: flex-start;
        }
        .msg-bubble--own {
          background: var(--primary); color: #fff;
          border-color: var(--primary); align-self: flex-end;
        }
        .msg-bubble p { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
        .msg-bubble--pending { opacity: 0.65; }
        .msg-time {
          display: block; font-size: 0.65rem; margin-top: 4px;
          opacity: 0.7; text-align: right;
        }
        .msg-bubble--own .msg-time { color: rgba(255,255,255,0.85); }
        .msg-conn-warn {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.68rem; color: #8a6d1f; background: #fdf5e2;
          border: 1px solid #ecd9a8; border-radius: 20px;
          padding: 2px 8px; flex-shrink: 0;
        }
        .msg-error {
          display: flex; align-items: center; gap: 8px;
          padding: 0.6rem 1rem; font-size: 0.8rem;
          color: #8c2f2f; background: #fdf0f0;
          border-bottom: 1px solid #f2d3d3;
        }
        .msg-error span { flex: 1; min-width: 0; }
        .msg-error button {
          border: none; background: transparent; color: inherit;
          cursor: pointer; display: flex; padding: 2px;
        }
        .msg-chat-footer {
          display: flex; align-items: flex-end; gap: 0.5rem;
          padding: 0.75rem 1rem; border-top: 1px solid var(--border);
          background: #fff;
        }
        .msg-input {
          flex: 1; padding: 0.6rem 0.85rem; border: 1px solid var(--border);
          border-radius: 10px; font-size: 0.85rem; font-family: inherit;
          resize: none; min-height: 38px; max-height: 120px;
          color: var(--text-dark); outline: none;
        }
        .msg-input:focus { border-color: var(--primary); }
        .msg-send-btn {
          width: 38px; height: 38px; border-radius: 10px;
          background: var(--primary); color: #fff; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0; transition: background 0.2s;
        }
        .msg-send-btn:hover { background: var(--primary-hover, #1b4d3e); }
        .msg-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 768px) {
          .msg-layout { grid-template-columns: 1fr; height: calc(100vh - 160px); }
          .msg-layout .msg-list { display: block; }
          .msg-layout .msg-chat { display: none; }
          .msg-layout--convo-active .msg-list { display: none !important; }
          .msg-layout--convo-active .msg-chat { display: flex !important; }
          .msg-back-btn { display: flex; }
        }
      `}</style>
    </div>
  );
};

export default MessagesPage;
