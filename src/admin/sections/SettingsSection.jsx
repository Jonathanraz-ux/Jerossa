import React, { useEffect, useMemo, useState } from 'react';
import { Save, Percent, Truck, CreditCard, RefreshCw, Palette } from 'lucide-react';
import { fetchPlatformSettings, updatePlatformSetting } from '../../services/admin';
import { formatDateTime } from '../format';
import { PageHead, EmptyState } from '../ui';
import { readHtmlTheme, setAdminTheme } from '../theme';
import { useLang } from '../../context/LangContext';

// Regroupement thématique des clés existantes
const GROUPS = [
  {
    id: 'commission',
    labelKey: 'admin.settings.groups.commission',
    icon: Percent,
    keys: ['commission_rate'],
  },
  {
    id: 'livraison',
    labelKey: 'admin.settings.groups.livraison',
    icon: Truck,
    keys: ['shipping_fee', 'free_shipping_threshold'],
  },
  {
    id: 'paiement',
    labelKey: 'admin.settings.groups.paiement',
    icon: CreditCard,
    keys: ['default_currency', 'payment_provider'],
  },
];

const LABEL_KEYS = {
  commission_rate: 'admin.settings.labels.commission_rate',
  shipping_fee: 'admin.settings.labels.shipping_fee',
  free_shipping_threshold: 'admin.settings.labels.free_shipping_threshold',
  default_currency: 'admin.settings.labels.default_currency',
  payment_provider: 'admin.settings.labels.payment_provider',
};

const DESC_KEYS = {
  commission_rate: 'admin.settings.desc.commission_rate',
  shipping_fee: 'admin.settings.desc.shipping_fee',
  free_shipping_threshold: 'admin.settings.desc.free_shipping_threshold',
  default_currency: 'admin.settings.desc.default_currency',
  payment_provider: 'admin.settings.desc.payment_provider',
};

const SettingsSection = () => {
  const { t, lang } = useLang();
  const [settings, setSettings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [activeGroup, setActiveGroup] = useState(GROUPS[0]?.id);
  const [theme, setTheme] = useState(readHtmlTheme());

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
        label: t(g.labelKey),
        items: g.keys
          .map((k) => settings.find((s) => s.key === k))
          .filter(Boolean),
      })).filter((g) => g.items.length > 0),
    [settings, t]
  );

  if (loadingData) return <SettingsSkeleton />;

  return (
    <div>
      <PageHead
        eyebrow={t('admin.nav.system')}
        title={t('admin.settings.title')}
        subtitle={t('admin.settings.subtitle')}
        actions={
          <button className="adm-btn adm-btn--primary" onClick={handleSaveAll} disabled={saving}>
            {saving ? (
              <RefreshCw size={15} strokeWidth={1.75} style={{ animation: 'adm-spin 0.9s linear infinite' }} />
            ) : (
              <Save size={15} strokeWidth={1.75} />
            )}
            {saving ? t('common.saving') : savedFlash ? t('admin.settings.saved') : t('common.save')}
          </button>
        }
      />

      {settings.length === 0 ? (
        <div className="adm-panel">
          <EmptyState
            icon={CreditCard}
            title={t('admin.settings.emptyTitle')}
            text={t('admin.settings.emptyText')}
          />
        </div>
      ) : (
        <div className="adm-settings-layout">
          <nav className="adm-settings-nav" aria-label={t('admin.settings.navLabel')}>
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
            <button
              className={`adm-settings-nav-btn adm-settings-nav-btn--appearance ${activeGroup === '__appearance' ? 'adm-settings-nav-btn--active' : ''}`}
              onClick={() => {
                setActiveGroup('__appearance');
                document.getElementById('adm-set-appearance')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <Palette size={15} strokeWidth={1.75} /> {t('theme.appearance')}
            </button>
          </nav>

          <div>
            <section id="adm-set-appearance" className="adm-settings-group adm-panel">
              <header className="adm-panel-head">
                <div>
                  <h3 className="adm-panel-title">{t('theme.appearance')}</h3>
                  <p className="adm-panel-sub">{t('theme.appearanceDesc')}</p>
                </div>
              </header>
              <div className="adm-setting-row">
                <div className="adm-setting-info">
                  <div className="adm-setting-name">{t('theme.appearance')}</div>
                  <p className="adm-setting-desc">{t('theme.appearanceDesc')}</p>
                </div>
                <div className="adm-setting-control" style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="adm-theme-option"
                    onClick={() => { setAdminTheme('light'); setTheme('light'); }}
                    style={{
                      flex: 1,
                      background: theme === 'light' ? 'var(--adm-bronze-soft)' : 'transparent',
                      borderColor: theme === 'light' ? 'var(--adm-bronze)' : 'var(--adm-line)',
                      color: theme === 'light' ? 'var(--adm-bronze-ink)' : 'var(--adm-muted)',
                    }}
                    aria-pressed={theme === 'light'}
                  >
                    <span className="adm-theme-swatch adm-theme-swatch--light" />
                    {t('theme.light')}
                  </button>
                  <button
                    type="button"
                    className="adm-theme-option"
                    onClick={() => { setAdminTheme('night'); setTheme('night'); }}
                    style={{
                      flex: 1,
                      background: theme === 'night' ? 'var(--adm-bronze-soft)' : 'transparent',
                      borderColor: theme === 'night' ? 'var(--adm-bronze)' : 'var(--adm-line)',
                      color: theme === 'night' ? 'var(--adm-bronze-ink)' : 'var(--adm-muted)',
                    }}
                    aria-pressed={theme === 'night'}
                  >
                    <span className="adm-theme-swatch adm-theme-swatch--night" />
                    {t('theme.night')}
                  </button>
                </div>
              </div>
            </section>

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
                      <div className="adm-setting-name">{LABEL_KEYS[s.key] ? t(LABEL_KEYS[s.key]) : s.key}</div>
                      <p className="adm-setting-desc">{DESC_KEYS[s.key] ? t(DESC_KEYS[s.key]) : ''}</p>
                      <span className="adm-help" style={{ marginTop: 6, display: 'block' }}>
                        {t('admin.settings.lastUpdated', { date: formatDateTime(s.updated_at, lang) })}
                      </span>
                    </div>
                    <div className="adm-setting-control">
                      <input
                        className="adm-input"
                        style={{ textAlign: 'right' }}
                        value={s.value}
                        onChange={(e) => handleChange(s.key, e.target.value)}
                        aria-label={LABEL_KEYS[s.key] ? t(LABEL_KEYS[s.key]) : s.key}
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
