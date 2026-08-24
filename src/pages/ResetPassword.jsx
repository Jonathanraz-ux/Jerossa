import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './animations.css';

const MIN_PASSWORD_LENGTH = 6;

const ResetPassword = () => {
  const { session, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }
    if (formData.password !== formData.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess(true);
  };

  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="container page-container" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Hero */}
      <section className="page-hero" style={{ height: '280px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Nouveau mot de passe</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Mot de passe</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Nouveau mot de passe</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Choisissez un mot de passe sécurisé pour votre compte.</p>
        </div>
      </section>

      <div className="container page-container">
        <div className="scroll-animate" style={{ maxWidth: '440px', margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', border: '1px solid var(--border)' }}>
            {!session ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <AlertCircle size={56} style={{ color: 'var(--warning)', marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>Lien invalide ou expiré</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  Ce lien de réinitialisation n'est plus valide. Demandez-en un nouveau.
                </p>
                <Link to="/forgot-password" className="btn btn-primary premium-btn" style={{ display: 'inline-block', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none' }}>Demander un nouveau lien</Link>
              </div>
            ) : success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={56} style={{ color: 'var(--success)', marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>Mot de passe mis à jour !</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  Votre mot de passe a été modifié avec succès.
                </p>
                <Link to="/login" className="btn btn-primary premium-btn" style={{ display: 'inline-block', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none' }}>Se connecter</Link>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Lock size={28} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-dark)' }}>Nouveau mot de passe</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Choisissez un mot de passe d'au moins {MIN_PASSWORD_LENGTH} caractères.</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {error && (
                    <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '13px', fontWeight: 500 }}>
                      {error}
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Nouveau mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPassword ? 'text' : 'password'} name="password" className="form-input" placeholder="••••••••" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '12px 40px 12px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Confirmer le mot de passe</label>
                    <input type={showPassword ? 'text' : 'password'} name="confirm" className="form-input" placeholder="••••••••" value={formData.confirm} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
                  </div>

                  <button type="submit" className="btn btn-primary premium-btn" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '14px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: loading ? 'wait' : 'pointer', background: 'var(--primary)', color: '#fff', transition: 'all 0.2s' }}>
                    {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
