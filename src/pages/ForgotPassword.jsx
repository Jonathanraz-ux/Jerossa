import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLang } from '../context/LangContext';
import './animations.css';

const ForgotPassword = () => {
  const { t } = useLang();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setEmailSent(true);
  };

  return (
    <div className="auth-page">
      {/* Hero */}
      <section className="page-hero" style={{ height: '280px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
  <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
    <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
    <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
    <li style={{ color: '#fff', fontWeight: 500 }}>{t('auth.forgot.title')}</li>
  </ol>
</nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('auth.password')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('auth.forgot.title')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('auth.forgot.subtitle')}</p>
        </div>
      </section>

      <div className="container page-container">
        <div className="scroll-animate" style={{ maxWidth: '440px', margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Mail size={28} style={{ color: 'var(--primary)' }} />
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-dark)' }}>{t('auth.forgot.title')}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('auth.forgot.cardText')}</p>
            </div>

            {emailSent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={56} style={{ color: 'var(--success)', marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>{t('auth.forgot.emailSent')}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  {t('auth.forgot.emailSentText', { email })}
                </p>
                <Link to="/login" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>{t('auth.backToLogin')}</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '13px', fontWeight: 500 }}>
                    {error}
                  </div>
                )}
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>{t('auth.email')}</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="email" className="form-input" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} required />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary premium-btn" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '14px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: loading ? 'wait' : 'pointer', background: 'var(--primary)', color: '#fff', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Send size={16} /> {loading ? t('auth.sending') : t('auth.forgot.sendLink')}
                </button>
              </form>
            )}

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '14px' }}>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <ArrowLeft size={16} /> {t('auth.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;