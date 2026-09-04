import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Settings as SettingsIcon, Bell, Truck, CreditCard, CheckCircle2, Shield, PauseCircle } from 'lucide-react';

const SellerSettings = () => {
  const { producer } = useOutletContext();
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyQuotes, setNotifyQuotes] = useState(true);
  const [vacationMode, setVacationMode] = useState(false);
  const [defaultLeadTime, setDefaultLeadTime] = useState('2-5 jours');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
          <button type="submit" className="sv-btn sv-btn--primary">
            Enregistrer les paramètres
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerSettings;
