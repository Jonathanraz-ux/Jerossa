import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Edit, Check, Star, Loader2 } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { fetchMyAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/addresses';
import './animations.css';

const EMPTY_FORM = { label: '', firstName: '', lastName: '', email: '', phone: '', address: '', city: '', postalCode: '', country: 'MG' };

const MyAddresses = () => {
  const { t } = useLang();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await fetchMyAddresses();
    setAddresses(data);
    setLoading(false);
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setShowForm(true); };
  const openEdit = (addr) => { setEditing(addr); setForm({ label: addr.label || '', firstName: addr.firstName, lastName: addr.lastName, email: addr.email, phone: addr.phone, address: addr.address, city: addr.city, postalCode: addr.postalCode, country: addr.country }); setError(''); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); setError(''); };

  const handleSubmit = async () => {
    if (!form.address || !form.city) { setError(t('checkout.missingFields')); return; }
    setSaving(true);
    setError('');
    const res = editing ? await updateAddress(editing.id, form) : await createAddress(form);
    setSaving(false);
    if (res.ok) { closeForm(); load(); } else { setError(res.error?.message || 'Erreur'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await deleteAddress(id);
    load();
  };

  const handleDefault = async (id) => {
    await setDefaultAddress(id);
    load();
  };

  const countryLabel = (c) => ({ MG: 'Madagascar', MU: 'Île Maurice', FR: 'France', RE: 'La Réunion' }[c] || c);

  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      <section className="page-hero" style={{ height: '300px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('account.myAddresses')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('account.addresses')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('account.myAddressesTitle')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('account.addressesNote')}</p>
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 600, margin: 0 }}>{t('account.myAddressesTitle')}</h2>
        <button className="btn btn-primary" onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', transition: 'all 0.2s' }}>
          <Plus size={16} /> {t('account.newAddress')}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        </div>
      ) : addresses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <MapPin size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
          <p>{t('account.addressesEmpty')}</p>
          <p style={{ fontSize: '13px' }}>{t('account.addressesNote')}</p>
        </div>
      ) : (
        <div className="scroll-animate" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {addresses.map((addr) => (
            <div key={addr.id} className="premium-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', position: 'relative', transition: 'all 0.2s' }}>
              {addr.isDefault && (
                <span className="status-badge" style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--success-bg)', color: 'var(--success)', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> {t('account.defaultBadge')}</span>
              )}
              {addr.label && <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{addr.label}</h4>}
              <h3 style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-dark)' }}>{addr.firstName} {addr.lastName}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {addr.address}<br />
                {addr.postalCode} {addr.city}, {countryLabel(addr.country)}<br />
                {addr.phone && <>{addr.phone}<br /></>}
                {addr.email}
              </p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn btn-outline" onClick={() => openEdit(addr)} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit size={12} /> {t('common.edit')}
                </button>
                {!addr.isDefault && (
                  <button className="btn btn-outline" onClick={() => handleDefault(addr.id)} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                    <Star size={12} /> {t('account.setDefault')}
                  </button>
                )}
                <button className="btn btn-outline" onClick={() => handleDelete(addr.id)} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)' }}>
                  <Trash2 size={12} /> {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,33,26,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }} onClick={closeForm}>
          <div style={{ background: '#fff', borderRadius: '12px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '1.25rem' }}>{editing ? t('common.edit') : t('account.newAddress')}</h3>
            {error && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('account.label')}</label>
                <input name="label" className="form-input" value={form.label} onChange={handleChange} placeholder={t('account.mainAddress')} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.firstName')}</label>
                <input name="firstName" className="form-input" value={form.firstName} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('auth.lastName')}</label>
                <input name="lastName" className="form-input" value={form.lastName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('common.phone')}</label>
                <input name="phone" className="form-input" value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.email')}</label>
              <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('checkout.address')}</label>
              <input name="address" className="form-input" value={form.address} onChange={handleChange} required placeholder="Lot IVT 123, Ambohijatovo" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('account.city')}</label>
                <input name="city" className="form-input" value={form.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('checkout.postalCode')}</label>
                <input name="postalCode" className="form-input" value={form.postalCode} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('checkout.country')}</label>
              <select name="country" className="form-select" value={form.country} onChange={handleChange}>
                <option value="MG">Madagascar</option>
                <option value="MU">Île Maurice</option>
                <option value="FR">France</option>
                <option value="RE">La Réunion</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={closeForm} style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 500 }}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving} style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 size={14} className="spin" /> : null}
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 560px) { .form-row { grid-template-columns: 1fr; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MyAddresses;
