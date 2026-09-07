import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, Settings as SettingsIcon, LogOut, MapPin, ChevronRight, FileText, RotateCcw, MessageSquare, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { fetchMyOrders } from '../services/orders';
import { fetchMyConversations } from '../services/messages';
import { useLang } from '../context/LangContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import './animations.css';

const MyAccount = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { t } = useLang();
  const [activeSection, setActiveSection] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    if (profile) {
      const name = profile.full_name || '';
      const parts = name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setCountry(profile.country || '');
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchMyOrders(user.id).then((data) => {
        if (data) setOrders(data);
      });
      fetchMyConversations().then((convos) => {
        const total = (convos || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setUnreadCount(total);
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { id: 'profile', label: t('account.myProfile'), icon: User },
    { id: 'messages', label: t('account.messages'), icon: MessageSquare, href: '/my-messages', badge: unreadCount },
    { id: 'orders', label: t('account.myOrders'), icon: Package },
    { id: 'quotes', label: t('account.myQuotes'), icon: FileText },
    { id: 'refunds', label: t('account.myRefunds'), icon: RotateCcw },
    { id: 'addresses', label: t('account.myAddresses'), icon: MapPin },
    { id: 'favorites', label: t('account.myFavorites'), icon: Heart },
    { id: 'settings', label: t('account.settings'), icon: SettingsIcon },
  ];

  const displayName = profile?.full_name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || '') || user?.email || t('account.defaultName');

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div>
            <div className="account-section-header">
              <User size={20} />
              <h2>{t('account.myProfile')}</h2>
            </div>
            <div className="account-avatar-section">
              <div className="account-avatar">{(displayName.charAt(0) || 'U').toUpperCase()}</div>
              <div>
                <div className="account-name">{displayName}</div>
                <div className="account-email">{user?.email || ''}</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.firstName')}</label>
              <input type="text" className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.lastName')}</label>
              <input type="text" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.email')}</label>
              <input type="email" className="form-input" defaultValue={user?.email || ''} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">{t('account.phone')}</label>
              <input type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('account.notProvided')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('account.city')}</label>
              <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('account.notProvidedF')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('account.country')}</label>
              <input type="text" className="form-input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder={t('account.notProvided')} />
            </div>
            <button className="btn btn-primary" onClick={async () => {
              if (!user) return;
              setSaving(true);
              setSaveError('');
              const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;
              const { error } = await supabase.from('profiles').update({
                full_name: fullName,
                phone: phone || null,
                city: city || null,
                country: country || null,
              }).eq('id', user.id);
              setSaving(false);
              if (error) {
                console.error('[MyAccount] save profile', error);
                setSaveError(t('account.saveFailed') + " " + (error.message || t('account.unknownError')));
                return;
              }
              setSaved(true);
              refreshProfile(user.id);
              setTimeout(() => setSaved(false), 3000);
            }} disabled={saving}>
              {saving ? t('account.saving') : saved ? t('account.saved') : t('account.save')}
            </button>
            {saveError && (
              <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '13px', fontWeight: 500 }}>
                {saveError}
              </div>
            )}
          </div>
        );
      case 'orders':
        return (
          <div>
            <div className="account-section-header">
              <Package size={20} />
              <h2>{t('account.myOrders')}</h2>
            </div>
            {orders.length === 0 ? (
              <div className="account-empty">
                <Package size={32} />
                <p>{t('account.noOrders')}</p>
                <Link to="/boutique" className="btn btn-outline">{t('account.discoverCatalog')}</Link>
              </div>
            ) : (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('account.order')}</th>
                      <th>{t('common.date')}</th>
                      <th>{t('common.total')}</th>
                      <th>{t('common.status')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600 }}>{order.id}</td>
                        <td>{order.date}</td>
                        <td>{order.total}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>{t('status.' + order.status)}</span>
                        </td>
                        <td>
                          <Link to={`/order/${order.id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {t('account.details')} <ChevronRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'quotes':
        return (
          <div>
            <div className="account-section-header">
              <FileText size={20} />
              <h2>{t('account.myQuotes')}</h2>
            </div>
            <div className="account-empty">
              <FileText size={32} />
              <p>{t('account.quotesEmpty')}</p>
              <Link to="/my-quotes" className="btn btn-primary" style={{ textDecoration: 'none' }}>{t('account.seeQuotes')}</Link>
            </div>
          </div>
        );
      case 'refunds':
        return (
          <div>
            <div className="account-section-header">
              <RotateCcw size={20} />
              <h2>{t('account.myRefunds')}</h2>
            </div>
            <div className="account-empty">
              <RotateCcw size={32} />
              <p>{t('account.refundsEmpty')}</p>
              <Link to="/my-refunds" className="btn btn-primary" style={{ textDecoration: 'none' }}>{t('account.seeRefunds')}</Link>
            </div>
          </div>
        );
      case 'addresses':
        return (
          <div>
            <div className="account-section-header">
              <MapPin size={20} />
              <h2>{t('account.myAddresses')}</h2>
            </div>
            <div className="account-empty">
              <MapPin size={32} />
              <p>{t('account.addressesEmpty')}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('account.addressesNote')}</p>
            </div>
          </div>
        );
      case 'favorites':
        return (
          <div>
            <div className="account-section-header">
              <Heart size={20} />
              <h2>{t('account.myFavorites')}</h2>
            </div>
            <div className="account-empty">
              <Heart size={32} />
              <p>{t('account.favoritesEmpty')}</p>
              <Link to="/boutique" className="btn btn-outline">{t('account.exploreCatalog')}</Link>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div>
            <div className="account-section-header">
              <SettingsIcon size={20} />
              <h2>{t('account.settings')}</h2>
            </div>
            <div className="form-group">
              <label className="form-label">{t('account.language')}</label>
              <select className="form-select">
                <option>{t('account.french')}</option>
                <option>{t('account.english')}</option>
              </select>
            </div>
            <div className="settings-toggle">
              <span>{t('account.notifEmail')}</span>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-toggle">
              <span>{t('account.notifShipping')}</span>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }}>{t('account.save')}</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="my-account-page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              <Link to="/" style={{ color: 'var(--text-muted)' }}>{t('nav.home')}</Link>
              <span style={{ color: 'var(--border)' }}>/</span>
              <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>{t('account.myAccount')}</span>
            </nav>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600 }}>{t('account.myAccount')}</h1>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="client-layout">
          <div className="dashboard-sidebar">
            {profile?.role === 'seller' && (
              <Link
                to="/espace-vendeur"
                className="db-side-btn"
                style={{
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600,
                  marginBottom: '0.5rem', borderRadius: '8px',
                }}
              >
                <Store size={18} />
                {t('account.accessSellerSpace')}
              </Link>
            )}
            {menuItems.map(item => (
              item.href ? (
                <Link
                  key={item.id}
                  to={item.href}
                  className="db-side-btn"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <item.icon size={18} />
                    {item.label}
                  </span>
                  {item.badge > 0 && (
                    <span style={{
                      background: 'var(--primary)', color: '#fff', fontSize: '0.65rem',
                      fontWeight: 700, borderRadius: '50%', minWidth: 18, height: 18,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  key={item.id}
                  className={`db-side-btn ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              )
            ))}
            <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0', paddingTop: '0.5rem' }}>
              <button className="db-side-btn" style={{ color: 'var(--danger)' }} onClick={handleLogout}>
                <LogOut size={18} />
                {t('nav.logout')}
              </button>
            </div>
          </div>

          <div className="dashboard-panel">
            {renderContent()}
          </div>
        </div>
      </div>

      <style>{`
        .my-account-page { background: var(--bg-cream); min-height: 100vh; }
        .account-section-header { display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-serif); font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
        .account-section-header svg { color: var(--primary); }
        .account-avatar-section { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-cream); border-radius: var(--radius-md); }
        .account-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; }
        .account-name { font-weight: 600; color: var(--text-dark); }
        .account-email { font-size: 0.8rem; color: var(--text-muted); }
        .account-empty { text-align: center; padding: 3rem 0; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .account-empty svg { opacity: 0.3; }
        .address-card { padding: 1.25rem; background: var(--bg-cream); border: 1px solid var(--border); border-radius: var(--radius-md); margin-bottom: 1rem; }
        .address-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
        .address-card-name { font-weight: 600; margin-bottom: 4px; }
        .address-card-details { font-size: 0.8rem; color: var(--text-muted); }
        .address-card-actions { display: flex; gap: 0.5rem; }
        .settings-toggle { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border); font-size: 0.875rem; }
        .toggle { position: relative; display: inline-block; width: 44px; height: 24px; }
        .toggle input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: var(--border); border-radius: 24px; transition: var(--transition); }
        .toggle-slider:before { content: ''; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: var(--transition); }
        .toggle input:checked + .toggle-slider { background: var(--primary); }
        .toggle input:checked + .toggle-slider:before { transform: translateX(20px); }

        @media (max-width: 768px) {
          .client-layout { grid-template-columns: 1fr; }
          .dashboard-sidebar { position: static; }
        }
      `}</style>
    </div>
  );
};

export default MyAccount;
