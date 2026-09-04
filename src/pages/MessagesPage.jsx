import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import {
  fetchMyConversations, fetchConversationMessages,
  sendMessage, markConversationRead,
} from '../services/messages';

const MessagesPage = () => {
  const { id: conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState(conversationId || null);
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
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (conversationId) setSelectedConvo(conversationId);
  }, [conversationId]);

  const loadMessages = useCallback(async (convoId) => {
    if (!convoId) return;
    setLoadingMessages(true);
    const data = await fetchConversationMessages(convoId);
    setMessages(data || []);
    setLoadingMessages(false);
    await markConversationRead(convoId);
    // Refresh conversation list to update unread counts
    const updated = await fetchMyConversations();
    setConversations(updated || []);
  }, []);

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
    <div className="msg-page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <Link to="/" style={{ color: 'var(--text-muted)' }}>Accueil</Link>
            <span style={{ color: 'var(--border)' }}>/</span>
            <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>Messages</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600 }}>Mes messages</h1>
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
                <p style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Aucune conversation</p>
                <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  Vous n'avez encore aucun échange. Contactez un vendeur depuis la fiche d'un produit.
                </p>
                <Link to="/boutique" className="btn btn-outline" style={{ marginTop: '1rem', display: 'inline-block' }}>
                  Explorer le catalogue
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
                      <span className="msg-item-name">{convo.sellerName || 'Vendeur'}</span>
                      <span className="msg-item-time">{formatTime(convo.lastMessageAt)}</span>
                    </div>
                    {convo.productTitle && (
                      <div className="msg-item-product">{convo.productTitle}</div>
                    )}
                    <div className="msg-item-preview">
                      {convo.lastMessage || convo.subject || 'Nouveau message'}
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
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Sélectionnez une conversation</p>
                <p style={{ fontSize: '0.85rem' }}>Choisissez un échange dans la liste pour afficher les messages.</p>
              </div>
            ) : loadingMessages ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="msg-chat-header">
                  <button type="button" className="msg-back-btn" onClick={() => setSelectedConvo(null)} title="Retour">
                    <ArrowLeft size={18} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-dark)' }}>
                      {selectedConvoData?.sellerName || 'Vendeur'}
                    </div>
                    {selectedConvoData?.productTitle && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Produit : {selectedConvoData.productTitle}
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="msg-chat-body">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`msg-bubble ${msg.isOwn ? 'msg-bubble--own' : ''}`}>
                      <p>{msg.content}</p>
                      <span className="msg-time">
                        {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="msg-chat-footer">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrivez votre message…"
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
        .msg-bubble p { margin: 0; }
        .msg-time {
          display: block; font-size: 0.65rem; margin-top: 4px;
          opacity: 0.7; text-align: right;
        }
        .msg-bubble--own .msg-time { color: rgba(255,255,255,0.85); }
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
