import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './animations.css';

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    const { data, error: authError } = await signUp({
      email: formData.email,
      password: formData.password,
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      role: 'customer',
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    if (data.session) {
      navigate('/my-account');
    } else {
      setNotice('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
    }
  };

  return (
    <div className="auth-page">
      {/* Hero */}
      <section className="page-hero" style={{ height: '280px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
  <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
    <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
    <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
    <li style={{ color: '#fff', fontWeight: 500 }}>Inscription</li>
  </ol>
</nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Inscription</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Créer un compte</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Rejoignez la communauté Jerossa.</p>
        </div>
      </section>

      <div className="container page-container">
        <div className="scroll-animate" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <User size={28} style={{ color: 'var(--primary)' }} />
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-dark)' }}>Créer un compte</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Rejoignez la communauté Jerossa</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '13px', fontWeight: 500 }}>
                  {error}
                </div>
              )}
              {notice && (
                <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '13px', fontWeight: 500 }}>
                  {notice}
                </div>
              )}
              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Prénom</label>
                  <input type="text" name="firstName" className="form-input" placeholder="Jean" value={formData.firstName} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Nom</label>
                  <input type="text" name="lastName" className="form-input" placeholder="Dupont" value={formData.lastName} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Adresse email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="email" name="email" className="form-input" placeholder="votre@email.com" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '10px', background: 'var(--brand-green-light)', border: '1px solid rgba(58, 107, 79, 0.25)' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--brand-green)', marginBottom: '3px' }}>
                  <Store size={15} /> Vous souhaitez vendre sur JEROSSA ?
                </strong>
                <span style={{ display: 'block', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-dark)' }}>
                  Créez d'abord votre compte client, puis passez par{' '}
                  <Link to="/vendeur/devenir" style={{ color: 'var(--brand-green)', fontWeight: 600, textDecoration: 'underline' }}>Devenir vendeur</Link> —
                  une seule adresse email suffit et l'équipe validera votre candidature.
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type={showPassword ? 'text' : 'password'} name="password" className="form-input" placeholder="Min. 8 caractères" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '10px 12px 10px 40px', paddingRight: '40px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Confirmer le mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" className="form-input" placeholder="Confirmer" value={formData.confirmPassword} onChange={handleChange} style={{ width: '100%', padding: '10px 12px 10px 40px', paddingRight: '40px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary premium-btn" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '14px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: loading ? 'wait' : 'pointer', background: 'var(--primary)', color: '#fff', transition: 'all 0.2s' }}>{loading ? 'Création…' : 'Créer mon compte'}</button>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
              Déjà un compte ?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;