import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, Store, Phone, MapPin,
  Building2, Loader2, CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './animations.css';

const SELLER_TYPES = [
  { value: 'individual', labelKey: 'sellerRegister.businessTypeIndividual' },
  { value: 'company', labelKey: 'sellerRegister.businessTypeCompany' },
  { value: 'cooperative', labelKey: 'sellerRegister.businessTypeCooperative' },
];

const SellerRegister = () => {
  const navigate = useNavigate();
  const { signUp, user, isAuthenticated, producer } = useAuth();
  const { t } = useLang();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: '',
    city: '',
    businessName: '',
    businessType: '',
    businessDescription: '',
    businessCountry: '',
    businessCity: '',
    professionalPhone: '',
    professionalEmail: '',
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(prev => ({
        ...prev,
        email: user.email || prev.email,
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && producer) {
      if (producer.status === 'approved') {
        navigate('/espace-vendeur', { replace: true });
      } else if (producer.status === 'pending') {
        navigate('/vendeur/statut', { replace: true });
      }
    }
  }, [isAuthenticated, producer, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const canSubmit =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.password &&
    form.confirmPassword &&
    form.country.trim() &&
    form.city.trim() &&
    form.businessName.trim() &&
    form.businessType &&
    form.businessDescription.trim() &&
    form.businessCountry.trim() &&
    form.businessCity.trim() &&
    !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError(t('sellerRegister.passwordMismatch'));
      return;
    }
    if (form.password.length < 8) {
      setError(t('sellerRegister.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

      const { data, error: authError } = await signUp({
        email: form.email.trim(),
        password: form.password,
        fullName,
        role: 'seller',
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        await createProducerRecord(data.user.id);
        setSuccess(true);
      } else {
        const pendingData = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          country: form.country.trim(),
          city: form.city.trim(),
          businessName: form.businessName.trim(),
          businessType: form.businessType,
          businessDescription: form.businessDescription.trim(),
          businessCountry: form.businessCountry.trim(),
          businessCity: form.businessCity.trim(),
          professionalPhone: form.professionalPhone.trim(),
          professionalEmail: form.professionalEmail.trim(),
        };
        localStorage.setItem('jr_pending_seller', JSON.stringify(pendingData));
        setConfirmationEmail(form.email.trim());
        setEmailConfirmation(true);
      }
    } catch (err) {
      setError(err.message || t('sellerRegister.errorSignup', { error: 'Unexpected error' }));
    } finally {
      setLoading(false);
    }
  };

  const createProducerRecord = async (userId) => {
    const slug = `${form.businessName.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48) || 'boutique'
    }-${Math.random().toString(36).slice(2, 6)}`;

    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error: insErr } = await supabase.from('producers').insert({
        user_id: userId,
        name: form.businessName.trim(),
        location: [form.businessCity.trim(), form.businessCountry.trim()].filter(Boolean).join(', '),
        description: form.businessDescription.trim(),
        contact_email: form.professionalEmail.trim() || form.email.trim(),
        phone: form.professionalPhone.trim() || form.phone.trim() || null,
        seller_type: form.businessType,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        slug,
        payment_info: {},
        documents: [],
      });
      if (!insErr) { lastError = null; break; }
      lastError = insErr;
      if (insErr.code !== '23505') break;
    }
    if (lastError) throw lastError;

    await supabase.from('profiles').update({
      phone: form.phone.trim() || null,
      country: form.country.trim() || 'MU',
      city: form.city.trim() || null,
    }).eq('id', userId);
  };

  if (success) {
    return (
      <div className="auth-page">
        <section className="page-hero" style={{ height: '280px' }}>
          <div className="page-hero-content">
            <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
              <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
                <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
                <li style={{ color: '#fff', fontWeight: 500 }}>{t('sellerRegister.breadcrumb')}</li>
              </ol>
            </nav>
            <span className="page-hero-surtitre anim-fade-up stagger-1">{t('sellerRegister.breadcrumb')}</span>
            <h1 className="page-hero-title anim-fade-up stagger-2">{t('sellerRegister.successTitle')}</h1>
          </div>
        </section>
        <div className="container page-container">
          <div className="scroll-animate" style={{ maxWidth: '520px', margin: '0 auto' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(46, 125, 50, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={28} style={{ color: '#2e7d32' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, margin: '0 0 12px', color: 'var(--text-dark)' }}>{t('sellerRegister.successTitle')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' }}>{t('sellerRegister.successText')}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '28px' }}>{t('sellerRegister.successLogin')}</p>
              <Link to="/login" className="j-pill-btn j-pill-btn--green" style={{ display: 'inline-flex', padding: '12px 32px', fontSize: '14px', fontWeight: 600 }}>
                {t('sellerRegister.goToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (emailConfirmation) {
    return (
      <div className="auth-page">
        <section className="page-hero" style={{ height: '280px' }}>
          <div className="page-hero-content">
            <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
              <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
                <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
                <li style={{ color: '#fff', fontWeight: 500 }}>{t('sellerRegister.breadcrumb')}</li>
              </ol>
            </nav>
            <span className="page-hero-surtitre anim-fade-up stagger-1">{t('sellerRegister.emailConfirmation')}</span>
            <h1 className="page-hero-title anim-fade-up stagger-2">{t('sellerRegister.emailConfirmation')}</h1>
          </div>
        </section>
        <div className="container page-container">
          <div className="scroll-animate" style={{ maxWidth: '520px', margin: '0 auto' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Mail size={28} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, margin: '0 0 12px', color: 'var(--text-dark)' }}>{t('sellerRegister.emailConfirmation')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>{t('sellerRegister.emailConfirmationText', { email: confirmationEmail })}</p>
              <Link to="/login" className="j-pill-btn j-pill-btn--green" style={{ display: 'inline-flex', padding: '12px 32px', fontSize: '14px', fontWeight: 600 }}>
                {t('sellerRegister.goToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' };
  const labelStyle = { fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' };
  const sectionStyle = { marginBottom: '28px' };
  const sectionTitleStyle = { fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' };
  const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };

  return (
    <div className="auth-page">
      <section className="page-hero" style={{ height: '280px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('sellerRegister.breadcrumb')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('sellerRegister.breadcrumb')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('sellerRegister.title')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('sellerRegister.subtitle')}</p>
        </div>
      </section>

      <div className="container page-container">
        <div className="scroll-animate" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px 48px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Store size={28} style={{ color: 'var(--primary)' }} />
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-dark)' }}>{t('sellerRegister.title')}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('sellerRegister.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '13px', fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>{t('sellerRegister.sectionPersonal')}</h2>

                <div style={rowStyle}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>{t('sellerRegister.firstName')} *</label>
                    <input type="text" name="firstName" value={form.firstName} onChange={handleChange} style={inputStyle} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>{t('sellerRegister.lastName')} *</label>
                    <input type="text" name="lastName" value={form.lastName} onChange={handleChange} style={inputStyle} required />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>{t('sellerRegister.email')} *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="email" name="email" value={form.email} onChange={handleChange} style={{ ...inputStyle, paddingLeft: '40px' }} required />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>{t('sellerRegister.phone')}</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+261 …" style={{ ...inputStyle, paddingLeft: '40px' }} />
                  </div>
                </div>

                <div style={rowStyle}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>{t('sellerRegister.country')} *</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="text" name="country" value={form.country} onChange={handleChange} style={{ ...inputStyle, paddingLeft: '40px' }} required />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>{t('sellerRegister.city')} *</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="text" name="city" value={form.city} onChange={handleChange} style={{ ...inputStyle, paddingLeft: '40px' }} required />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>{t('sellerRegister.password')} *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 caractères" style={{ ...inputStyle, paddingLeft: '40px', paddingRight: '40px' }} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label style={labelStyle}>{t('sellerRegister.confirmPassword')} *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder={t('sellerRegister.confirmPassword')} style={{ ...inputStyle, paddingLeft: '40px', paddingRight: '40px' }} required />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>{t('sellerRegister.sectionProfessional')}</h2>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>{t('sellerRegister.businessName')} *</label>
                  <div style={{ position: 'relative' }}>
                    <Store size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" name="businessName" value={form.businessName} onChange={handleChange} style={{ ...inputStyle, paddingLeft: '40px' }} required />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>{t('sellerRegister.businessNameHint')}</span>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>{t('sellerRegister.businessType')} *</label>
                  <select name="businessType" value={form.businessType} onChange={handleChange} style={{ ...inputStyle, appearance: 'none', paddingRight: '32px' }} required>
                    <option value="">{t('onboarding.selectProfile')}</option>
                    {SELLER_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{t(type.labelKey)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>{t('sellerRegister.businessDescription')} *</label>
                  <textarea name="businessDescription" value={form.businessDescription} onChange={handleChange} rows={4} placeholder={t('sellerRegister.businessDescriptionPlaceholder')} style={{ ...inputStyle, resize: 'vertical', minHeight: '90px' }} required />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>{t('sellerRegister.businessDescriptionHint')}</span>
                </div>

                <div style={rowStyle}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>{t('sellerRegister.businessCountry')} *</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="text" name="businessCountry" value={form.businessCountry} onChange={handleChange} style={{ ...inputStyle, paddingLeft: '40px' }} required />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>{t('sellerRegister.businessCity')} *</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="text" name="businessCity" value={form.businessCity} onChange={handleChange} style={{ ...inputStyle, paddingLeft: '40px' }} required />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>{t('sellerRegister.professionalPhone')}</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="tel" name="professionalPhone" value={form.professionalPhone} onChange={handleChange} placeholder="+261 …" style={{ ...inputStyle, paddingLeft: '40px' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label style={labelStyle}>{t('sellerRegister.professionalEmail')}</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="email" name="professionalEmail" value={form.professionalEmail} onChange={handleChange} style={{ ...inputStyle, paddingLeft: '40px' }} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary premium-btn"
                disabled={!canSubmit}
                style={{ width: '100%', padding: '14px', fontSize: '14px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', background: canSubmit ? 'var(--primary)' : '#aaa', color: '#fff', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? (
                  <><Loader2 size={16} style={{ animation: 'sl-rotate 0.9s linear infinite' }} /> {t('sellerRegister.submitting')}</>
                ) : (
                  <>{t('sellerRegister.submit')}</>
                )}
              </button>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
              {t('sellerRegister.hasAccount')}{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{t('sellerRegister.login')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerRegister;
