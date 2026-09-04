import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Settings as SettingsIcon, Bell, Truck, CreditCard, CheckCircle2, PauseCircle, Loader2, AlertTriangle } from 'lucide-react';
import { fetchSellerPreferences, saveSellerPreferences } from '../services/seller';

const SellerSettings = () => {
  const { producer } = useOutletContext();
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
      setError(res.error?.message || "Une erreur est survenue lors de l'enregistrement. Réessayez.");
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
          <span style={{ marginLeft: '0.75rem', color: 'var(--text-muted)' }}>Chargement des paramètres…</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 className="sv-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SettingsIcon size={20} /> Paramètres de votre compte vendeur
        </h2>
        <p className="sv-dim">
          Gérez vos préférences de notifications, vos délais logistiques et le statut de votre activité.
        </p>
      </div>

      {saved && (
        <div className="sv-success-note" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={15} /> Préférences enregistrées avec succès.
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {vacationMode && (
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#fff3cd', color: '#856404', border: '1px solid #ffc107', borderRadius: '8px', fontSize: '0.8125rem' }}>
          <strong>Mode pause actif.</strong> Votre boutique est visible mais les clients ne peuvent plus passer de commandes. Désactivez cette option pour reprendre les ventes.
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Notifications */}
        <section className="sv-panel" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={16} color="var(--primary)" /> Alertes & Notifications
          </h3>
          <p className="sv-dim" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
            Choisissez les événements pour lesquels vous souhaitez recevoir une notification immédiate par email.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem' }}>
              <div>
                <strong>Nouvelles commandes reçues</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Notification instantanée lorsqu'un client commande vos articles</div>
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
                <strong>Nouveaux messages acheteurs</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Notification quand un client pose une question sur vos produits</div>
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
                <strong>Nouvelles demandes de devis</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Alerte immédiate pour les commandes en volume / B2B</div>
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
            <Truck size={16} color="var(--primary)" /> Préférences logistiques
          </h3>

          <div className="sl-field">
            <label className="sl-label">Délai standard de préparation / expédition</label>
            <select
              className="sl-input"
              value={defaultLeadTime}
              onChange={(e) => setDefaultLeadTime(e.target.value)}
            >
              <option value="24-48h">24 à 48 heures ouvrées</option>
              <option value="2-5 jours">2 à 5 jours ouvrés</option>
              <option value="5-10 jours">5 à 10 jours ouvrés (produits sur commande)</option>
              <option value="sur-mesure">Sur mesure / Selon devis</option>
            </select>
            <span className="sl-hint">Ce délai sera suggéré automatiquement lors de la création de nouveaux produits.</span>
          </div>
        </section>

        {/* Shop Status & Payouts */}
        <section className="sv-panel" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PauseCircle size={16} color="var(--primary)" /> Disponibilité de la boutique
          </h3>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem' }}>
            <div>
              <strong>Mode Pause / Congés</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Désactive temporairement le passage de commandes tout en conservant vos fiches produits en consultation.
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
              <span style={{ fontSize: '0.82rem', color: 'var(--text-dark)' }}>Coordonnées de versement bancaire</span>
            </div>
            <Link to="/espace-vendeur/boutique" className="sv-btn sv-btn--ghost" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
              Modifier dans Ma boutique
            </Link>
          </div>
        </section>

        <div>
          <button type="submit" className="sv-btn sv-btn--primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}>
            {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Enregistrement…</> : 'Enregistrer les paramètres'}
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
