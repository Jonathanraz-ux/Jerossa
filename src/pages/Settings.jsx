import React, { useState, useEffect } from 'react';
import { Save, Bell, Globe, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { supabase } from '../lib/supabase';
import './animations.css';

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState('general');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.full_name || '');
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  const tabs = [
    { id: 'general', label: t('settingsPage.general'), icon: Globe },
    { id: 'notifications', label: t('settingsPage.notifications'), icon: Bell },
    { id: 'security', label: t('settingsPage.security'), icon: Lock },
  ];

  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('account.settings')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('account.settings')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('account.settings')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('settingsPage.heroSubtitle')}</p>
        </div>
      </section>

      <div className="scroll-animate settings-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px',
              background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
            }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-panel scroll-animate premium-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
        {activeTab === 'general' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-dark)' }}>{t('settingsPage.generalTitle')}</h2>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>{t('settingsPage.displayName')}</label>
              <input type="text" className="form-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('settingsPage.yourName')} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>{t('auth.email')}</label>
              <input type="email" className="form-input" value={email} disabled style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)', opacity: 0.6 }} />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>{t('account.language')}</label>
              <select className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }}>
                <option>{t('account.french')}</option>
                <option>{t('account.english')}</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={async () => {
              if (!user) return;
              setSaving(true);
              setSaveError('');
              const { error } = await supabase.from('profiles').update({
                full_name: displayName || null,
              }).eq('id', user.id);
              setSaving(false);
              if (error) {
                console.error('[Settings] save profile', error);
                setSaveError(t('account.saveFailed') + ' : ' + (error.message || t('account.unknownError')));
                return;
              }
              setSaved(true);
              refreshProfile(user.id);
              setTimeout(() => setSaved(false), 3000);
            }} disabled={saving} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> {saving ? t('account.saving') + '…' : saved ? '✓ ' + t('account.saved') : t('account.save')}
            </button>
            {saveError && (
              <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '13px', fontWeight: 500 }}>
                {saveError}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-dark)' }}>{t('settingsPage.notifications')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: t('settingsPage.notifOrders'), desc: t('settingsPage.notifOrdersDesc'), checked: true },
                { label: t('settingsPage.notifShipping'), desc: t('settingsPage.notifShippingDesc'), checked: true },
                { label: t('settingsPage.notifPromo'), desc: t('settingsPage.notifPromoDesc'), checked: false },
                { label: t('settingsPage.notifProducts'), desc: t('settingsPage.notifProductsDesc'), checked: false },
              ].map((notif, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-dark)' }}>{notif.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{notif.desc}</div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={notif.checked} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: notif.checked ? 'var(--primary)' : 'var(--border)', borderRadius: '24px', transition: 'var(--transition)' }}>
                      <span style={{ position: 'absolute', height: '18px', width: '18px', left: notif.checked ? '23px' : '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: 'var(--transition)' }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-dark)' }}>{t('settingsPage.security')}</h2>
            {pwError && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '13px', fontWeight: 500 }}>
                {pwError}
              </div>
            )}
            {pwSaved && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: 'var(--success-bg)', color: 'var(--success)', fontSize: '13px', fontWeight: 500 }}>
                {t('settingsPage.passwordUpdated')}
              </div>
            )}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>{t('settingsPage.currentPassword')}</label>
              <input type="password" className="form-input" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>{t('settingsPage.newPassword')}</label>
              <input type="password" className="form-input" placeholder={t('settingsPage.minLength8')} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>{t('settingsPage.confirmNewPassword')}</label>
              <input type="password" className="form-input" placeholder={t('settingsPage.confirm')} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
            </div>
            <button className="btn btn-primary" onClick={async () => {
              if (!user) return;
              setPwError('');
              setPwSaved(false);
              if (newPassword.length < 8) {
                setPwError(t('settingsPage.passwordTooShort'));
                return;
              }
              if (newPassword !== confirmPassword) {
                setPwError(t('auth.register.passwordMismatch'));
                return;
              }
              if (!currentPassword) {
                setPwError(t('settingsPage.currentPasswordRequired'));
                return;
              }
              setPwLoading(true);
              const { error: reauthError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
              });
              if (reauthError) {
                setPwLoading(false);
                setPwError(t('settingsPage.currentPasswordIncorrect'));
                return;
              }
              const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
              setPwLoading(false);
              if (updateError) {
                setPwError(updateError.message);
                return;
              }
              setPwSaved(true);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setTimeout(() => setPwSaved(false), 3000);
            }} disabled={pwLoading} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: pwLoading ? 'wait' : 'pointer', background: 'var(--primary)', color: '#fff', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} /> {pwLoading ? t('settingsPage.updatingPassword') + '…' : t('settingsPage.updatePassword')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;