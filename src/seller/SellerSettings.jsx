import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Settings as SettingsIcon, Bell, Truck, CreditCard, CheckCircle2, PauseCircle, Loader2, AlertTriangle } from 'lucide-react';
import { fetchSellerPreferences, saveSellerPreferences } from '../services/seller';
import { useLang } from '../context/LangContext';

const SellerSettings = () => {
  const { producer } = useOutletContext();
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyQuotes, setNotifyQuotes] = useState(true);
  const [vacationMode, setVacationMode] = useState(false);
  const [defaultLeadTime, setDefaultLeadTime] = useState('2-5 jours');

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    setError('');
    const prefs = await fetchSellerPreferences();
    if (prefs) {
      setNotifyOrders(prefs.notify_new_orders ?? true);
      setNotifyMessages(prefs.notify_new_messages ?? true);
      setNotifyQuotes(prefs.notify_new_quotes ?? true);
      setDefaultLeadTime(prefs.default_lead_time || '2-5 jours');
      setVacationMode(prefs.is_paused ?? false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (producer?.id) loadPreferences();
  }, [producer?.id, loadPreferences]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    const res = await saveSellerPreferences({
      notifyNewOrders: notifyOrders,
      notifyNewMessages: notifyMessages,
      notifyNewQuotes: notifyQuotes,
      defaultLeadTime,
      isPaused: vacationMode,
    });

    setSaving(false);

    if (!res.ok) {
      setError(res.error?.message || t('seller.settings.errorSave'));
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
          <span style={{ marginLeft: '0.75rem', color: 'var(--text-muted)' }}>{t('seller.settings.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 className="sv-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SettingsIcon size={20} /> {t('seller.settings.title')}
        </h2>
        <p className="sv-dim">
          {t('seller.settings.subtitle')}
        </p>
      </div>

      {saved && (
        <div className="sv-success-note" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={15} /> {t('seller.settings.saved')}
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {vacationMode && (
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#fff3cd', color: '#856404', border: '1px solid #ffc107', borderRadius: '8px', fontSize: '0.8125rem' }}>
          <strong>{t('seller.settings.vacationBanner')}</strong> {t('seller.settings.vacationBannerHint')}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Notifications */}
        <section className="sv-panel" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={16} color="var(--primary)" /> {t('seller.settings.notifications')}
          </h3>
          <p className="sv-dim" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
            {t('seller.settings.notificationsDesc')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem' }}>
              <div>
                <strong>{t('seller.settings.notifyOrders')}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('seller.settings.notifyOrdersDesc')}</div>
              </div>
              <input
                type="checkbox"
                checked={notifyOrders}
                onChange={(e) => setNotifyOrders(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </label>

            <div style={{ borderTop: '1px solid var(--border)' }} />

            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem' }}>
              <div>
                <strong>{t('seller.settings.notifyMessages')}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('seller.settings.notifyMessagesDesc')}</div>
              </div>
              <input
                type="checkbox"
                checked={notifyMessages}
                onChange={(e) => setNotifyMessages(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </label>

            <div style={{ borderTop: '1px solid var(--border)' }} />

            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem' }}>
              <div>
                <strong>{t('seller.settings.notifyQuotes')}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('seller.settings.notifyQuotesDesc')}</div>
              </div>
              <input
                type="checkbox"
                checked={notifyQuotes}
                onChange={(e) => setNotifyQuotes(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </label>
          </div>
        </section>

        {/* Shipping & Delivery Defaults */}
        <section className="sv-panel" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={16} color="var(--primary)" /> {t('seller.settings.logistics')}
          </h3>

          <div className="sl-field">
            <label className="sl-label">{t('seller.settings.leadTimeLabel')}</label>
            <select
              className="sl-input"
              value={defaultLeadTime}
              onChange={(e) => setDefaultLeadTime(e.target.value)}
            >
              <option value="24-48h">{t('seller.settings.leadTime24')}</option>
              <option value="2-5 jours">{t('seller.settings.leadTime25')}</option>
              <option value="5-10 jours">{t('seller.settings.leadTime510')}</option>
              <option value="sur-mesure">{t('seller.settings.leadTimeCustom')}</option>
            </select>
            <span className="sl-hint">{t('seller.settings.leadTimeHint')}</span>
          </div>
        </section>

        {/* Shop Status & Payouts */}
        <section className="sv-panel" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PauseCircle size={16} color="var(--primary)" /> {t('seller.settings.availability')}
          </h3>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem' }}>
            <div>
              <strong>{t('seller.settings.vacationMode')}</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('seller.settings.vacationModeDesc')}
              </div>
            </div>
            <input
              type="checkbox"
              checked={vacationMode}
              onChange={(e) => setVacationMode(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
          </label>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-dark)' }}>{t('seller.settings.bankInfo')}</span>
            </div>
            <Link to="/espace-vendeur/boutique" className="sv-btn sv-btn--ghost" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
              {t('seller.settings.editInShop')}
            </Link>
          </div>
        </section>

        <div>
          <button type="submit" className="sv-btn sv-btn--primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}>
            {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {t('seller.settings.saving')}</> : t('seller.settings.save')}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SellerSettings;
