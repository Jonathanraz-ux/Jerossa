import React, { useState } from 'react';
import { Save, Bell, Globe, Lock } from 'lucide-react';
import './animations.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Général', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Lock },
  ];

  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Paramètres</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Paramètres</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Paramètres</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Personnalisez votre expérience Jerossa</p>
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
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-dark)' }}>Paramètres généraux</h2>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Nom d\'affichage</label>
              <input type="text" className="form-input" defaultValue="Jean Dupont" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Email</label>
              <input type="email" className="form-input" defaultValue="jean.dupont@email.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Langue</label>
              <select className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }}>
                <option>Français</option>
                <option>English</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> Enregistrer
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-dark)' }}>Notifications</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Confirmations de commande', desc: 'Recevoir un email lors de la confirmation d\'une commande', checked: true },
                { label: 'Mises à jour de livraison', desc: 'Être informé du statut de vos expéditions', checked: true },
                { label: 'Offres promotionnelles', desc: 'Recevoir les dernières offres et nouveautés', checked: false },
                { label: 'Nouveaux produits', desc: 'Être alerté quand de nouveaux produits sont disponibles', checked: false },
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
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-dark)' }}>Sécurité</h2>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Mot de passe actuel</label>
              <input type="password" className="form-input" placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Nouveau mot de passe</label>
              <input type="password" className="form-input" placeholder="Min. 8 caractères" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Confirmer le nouveau mot de passe</label>
              <input type="password" className="form-input" placeholder="Confirmer" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
            </div>
            <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} /> Mettre à jour le mot de passe
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;