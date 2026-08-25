import React, { useEffect, useState } from 'react';
import { Bell, Mail, CheckCheck, Inbox } from 'lucide-react';
import {
  fetchAllNotifications, markNotificationRead, fetchEmailLogs,
} from '../../services/admin';
import { timeAgo, formatDateTime } from '../format';
import { PageHead, EmptyState } from '../ui';

const EMAIL_STATUS_TONE = { sent: 'green', failed: 'red', pending: 'amber', queued: 'blue' };

const MessagesSection = () => {
  const [tab, setTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [n, e] = await Promise.all([fetchAllNotifications(), fetchEmailLogs()]);
      if (!mounted) return;
      setNotifications(n);
      setEmailLogs(e);
      setLoadingData(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleMarkRead = async (id) => {
    const res = await markNotificationRead(id);
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loadingData) return <MessagesSkeleton />;

  return (
    <div>
      <PageHead
        eyebrow="Communauté"
        title="Messages & Notifications"
        subtitle={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non ${unreadCount > 1 ? 'lues' : 'lue'} · ${emailLogs.length} email${emailLogs.length > 1 ? 's' : ''} journalisé${emailLogs.length > 1 ? 's' : ''}`}
      />

      <div className="adm-toolbar">
        <div className="adm-seg" role="tablist" aria-label="Type de communication">
          <button
            role="tab"
            aria-selected={tab === 'notifications'}
            className={`adm-seg-btn ${tab === 'notifications' ? 'adm-seg-btn--active' : ''}`}
            onClick={() => setTab('notifications')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            <Bell size={13} strokeWidth={1.75} />
            Notifications ({notifications.length})
          </button>
          <button
            role="tab"
            aria-selected={tab === 'emails'}
            className={`adm-seg-btn ${tab === 'emails' ? 'adm-seg-btn--active' : ''}`}
            onClick={() => setTab('emails')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            <Mail size={13} strokeWidth={1.75} />
            Emails ({emailLogs.length})
          </button>
        </div>
      </div>

      {tab === 'notifications' && (
        <div className="adm-panel">
          {notifications.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Aucune notification"
              text="Commandes, inscriptions, remboursements — toutes les alertes de la plateforme atterriront ici."
            />
          ) : (
            <div className="adm-msg-list">
              {notifications.map((n) => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div
                    className="adm-msg-row"
                    style={{ opacity: n.read ? 0.62 : 1, flex: 1 }}
                  >
                    {!n.read && <span className="adm-unread-dot" />}
                    <div className="adm-msg-body">
                      <div className="adm-msg-title">{n.title}</div>
                      <div className="adm-msg-preview">{n.body || '—'}</div>
                    </div>
                    <div className="adm-msg-side">
                      <span className="adm-chip">{n.type}</span>
                      <span className="adm-cell-dim" style={{ fontSize: 11 }}>{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                  {!n.read && (
                    <button
                      className="adm-action"
                      title="Marquer comme lue"
                      onClick={() => handleMarkRead(n.id)}
                      style={{ marginRight: 14 }}
                    >
                      <CheckCheck size={15} strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'emails' && (
        <div className="adm-panel">
          {emailLogs.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="Aucun email envoyé"
              text="Les confirmations de commande et autres emails transactionnels seront journalisés ici."
            />
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Destinataire</th>
                    <th>Sujet</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontSize: 12.5 }} className="adm-cell-strong">{e.recipient}</td>
                      <td
                        className="adm-cell-dim"
                        style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {e.subject}
                      </td>
                      <td><span className="adm-chip">{e.type}</span></td>
                      <td>
                        <span className={`adm-badge adm-badge--${EMAIL_STATUS_TONE[e.status] || 'neutral'}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="adm-cell-dim">{formatDateTime(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MessagesSkeleton = () => (
  <div aria-hidden="true">
    <div style={{ marginBottom: 26 }}>
      <div className="adm-sk" style={{ width: 100, height: 11, marginBottom: 12 }} />
      <div className="adm-sk" style={{ width: 230, height: 24 }} />
    </div>
    <div className="adm-panel">
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ padding: '15px 20px', borderBottom: '1px solid var(--adm-line)' }}>
          <div className="adm-sk" style={{ width: '40%', height: 13, marginBottom: 8 }} />
          <div className="adm-sk" style={{ width: '70%', height: 11 }} />
        </div>
      ))}
    </div>
  </div>
);

export default MessagesSection;
