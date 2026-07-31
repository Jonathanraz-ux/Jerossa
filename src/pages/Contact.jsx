import React, { useState } from 'react';
import { Send, Mail, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import './animations.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-page">
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Contact</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Contact</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Contact</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Une question, une suggestion ou besoin d'assistance ? Notre équipe est à votre disposition.</p>
        </div>
      </section>

      <div className="container">
        <div className="scroll-animate contact-layout">
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-dark)' }}>Envoyez-nous un message</h2>
            {submitted ? (
              <div className="premium-card" style={{ textAlign: 'center', padding: '40px', borderRadius: '12px' }}>
                <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>Message envoyé !</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Nous vous répondrons dans les plus brefs délais.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="scroll-animate" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Nom</label>
                    <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Email</label>
                    <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Sujet</label>
                  <input type="text" name="subject" className="form-input" value={formData.subject} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>Message</label>
                  <textarea name="message" className="form-input" rows={5} value={formData.message} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)', resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Send size={16} /> Envoyer
                </button>
              </form>
            )}
          </div>

          <div className="scroll-animate">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-dark)' }}>Informations de contact</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { icon: Mail, title: 'Email', info: 'contact@jerosa.mg' },
                { icon: Phone, title: 'Téléphone', info: '+261 32 00 000 00' },
                { icon: MapPin, title: 'Adresse', info: '123 Rue de l\'Import-Export\nAntananarivo, Madagascar' },
                { icon: Clock, title: 'Horaires', info: 'Lun - Ven : 8h00 - 17h00\nSam : 9h00 - 12h00' },
              ].map((item, i) => (
                <div key={i} className="premium-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px' }}>
                  <div className="icon-hover" style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon size={20} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px', color: 'var(--text-dark)' }}>{item.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{item.info}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;