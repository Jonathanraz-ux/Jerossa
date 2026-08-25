import React, { useEffect, useMemo, useState } from 'react';
import { Save, Percent, Truck, CreditCard, RefreshCw } from 'lucide-react';
import { fetchPlatformSettings, updatePlatformSetting } from '../../services/admin';
import { formatDateTime } from '../format';
import { PageHead, EmptyState } from '../ui';

const LABELS = {
  commission_rate: 'Taux de commission (%)',
  shipping_fee: 'Frais de livraison (€)',
  free_shipping_threshold: 'Seuil livraison gratuite (€)',
  default_currency: 'Devise par défaut',
  payment_provider: 'Fournisseur de paiement',
};

const DESCRIPTIONS = {
  commission_rate: 'Part prélevée par la plateforme sur chaque vente réalisée par un vendeur.',
  shipping_fee: 'Montant facturé au client pour une livraison standard.',
  free_shipping_threshold: 'Au-delà de ce panier, la livraison est offerte.',
  default_currency: 'Devise utilisée par défaut dans l’administration et les paiements.',
  payment_provider: 'Passerelle utilisée pour encaisser les paiements clients.',
};

// Regroupement thématique des clés existantes
const GROUPS = [
  {
    id: 'commission',
    label: 'Commission',
    icon: Percent,
    keys: ['commission_rate'],
  },
  {
    id: 'livraison',
    label: 'Livraison',
    icon: Truck,
    keys: ['shipping_fee', 'free_shipping_threshold'],
  },
  {
    id: 'paiement',
    label: 'Paiement',
    icon: CreditCard,
    keys: ['default_currency', 'payment_provider'],
  },
];

const SettingsSection = () => {
  const [settings, setSettings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [activeGroup, setActiveGroup] = useState(GROUPS[0]?.id);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const data = await fetchPlatformSettings();
      if (!mounted) return;
      setSettings(data);
      setLoadingData(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    for (const s of settings) {
      // eslint-disable-next-line no-await-in-loop
      await updatePlatformSetting(s.key, s.value);
    }
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
  };

  // Ne montrer que les groupes ayant au moins un réglage présent
  const visibleGroups = useMemo(
    () =>
      GROUPS.map((g) => ({
        ...g,
        items: g.keys
          .map((k) => settings.find((s) => s.key === k))
          .filter(Boolean),
      })).filter((g) => g.items.length > 0),
    [settings]
  );

  if (loadingData) return <SettingsSkeleton />;

  return (
    <div>
      <PageHead
        eyebrow="Système"
        title="Paramètres"
        subtitle="Configuration générale de la plateforme"
        actions={
          <button className="adm-btn adm-btn--primary" onClick={handleSaveAll} disabled={saving}>
            {saving ? (
              <RefreshCw size={15} strokeWidth={1.75} style={{ animation: 'adm-spin 0.9s linear infinite' }} />
            ) : (
              <Save size={15} strokeWidth={1.75} />
            )}
            {saving ? 'Enregistrement…' : savedFlash ? 'Enregistré ✓' : 'Enregistrer'}
          </button>
        }
      />

      {settings.length === 0 ? (
        <div className="adm-panel">
          <EmptyState
            icon={CreditCard}
            title="Aucun paramètre disponible"
            text="Les réglages de la plateforme seront créés automatiquement à l'initialisation du système."
          />
        </div>
      ) : (
        <div className="adm-settings-layout">
          <nav className="adm-settings-nav" aria-label="Sections des paramètres">
            {visibleGroups.map((g) => {
              const Icon = g.icon;
              return (
                <button
                  key={g.id}
                  className={`adm-settings-nav-btn ${activeGroup === g.id ? 'adm-settings-nav-btn--active' : ''}`}
                  onClick={() => {
                    setActiveGroup(g.id);
                    document.getElementById(`adm-set-${g.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <Icon size={15} strokeWidth={1.75} /> {g.label}
                </button>
              );
            })}
          </nav>

          <div>
            {visibleGroups.map((g) => (
              <section
                key={g.id}
                id={`adm-set-${g.id}`}
                className="adm-settings-group adm-panel"
              >
                <header className="adm-panel-head">
                  <div>
                    <h3 className="adm-panel-title">{g.label}</h3>
                  </div>
                </header>
                {g.items.map((s) => (
                  <div className="adm-setting-row" key={s.key}>
                    <div className="adm-setting-info">
                      <div className="adm-setting-name">{LABELS[s.key] || s.key}</div>
                      <p className="adm-setting-desc">{DESCRIPTIONS[s.key]}</p>
                      <span className="adm-help" style={{ marginTop: 6, display: 'block' }}>
                        Dernière mise à jour : {formatDateTime(s.updated_at)}
                      </span>
                    </div>
                    <div className="adm-setting-control">
                      <input
                        className="adm-input"
                        style={{ textAlign: 'right' }}
                        value={s.value}
                        onChange={(e) => handleChange(s.key, e.target.value)}
                        aria-label={LABELS[s.key] || s.key}
                      />
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsSkeleton = () => (
  <div aria-hidden="true">
    <div style={{ marginBottom: 26 }}>
      <div className="adm-sk" style={{ width: 70, height: 11, marginBottom: 12 }} />
      <div className="adm-sk" style={{ width: 160, height: 24 }} />
    </div>
    <div className="adm-panel" style={{ maxWidth: 640 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ padding: '17px 20px', borderBottom: '1px solid var(--adm-line)' }}>
          <div className="adm-sk" style={{ width: '35%', height: 13, marginBottom: 8 }} />
          <div className="adm-sk" style={{ width: '60%', height: 11 }} />
        </div>
      ))}
    </div>
  </div>
);

export default SettingsSection;
