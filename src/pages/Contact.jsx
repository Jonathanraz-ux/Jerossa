import React, { useState } from 'react';
import { Send, Mail, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import { useLang } from '../context/LangContext';
import './animations.css';
import { COMPANY_INFO } from '../config/companyInfo';

const Contact = () => {
  const { t } = useLang();
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
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('contactPage.breadcrumb')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('contactPage.surtitre')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('contactPage.title')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('contactPage.desc')}</p>
        </div>
      </section>

      <div className="container">
        <div className="scroll-animate contact-layout">
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-dark)' }}>{t('contactPage.formTitle')}</h2>
            {submitted ? (
              <div className="premium-card" style={{ textAlign: 'center', padding: '40px', borderRadius: '12px' }}>
                <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-dark)' }}>{t('contactPage.successTitle')}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('contactPage.successText')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="scroll-animate" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>{t('common.name')}</label>
                    <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>{t('common.email')}</label>
                    <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>{t('contact.subject')}</label>
                  <input type="text" name="subject" className="form-input" value={formData.subject} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px', display: 'block' }}>{t('contactPage.message')}</label>
                  <textarea name="message" className="form-input" rows={5} value={formData.message} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'var(--transition)', resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Send size={16} /> {t('contactPage.send')}
                </button>
              </form>
            )}
          </div>

          <div className="scroll-animate">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-dark)' }}>{t('contactPage.infoTitle')}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { icon: Mail, title: t('contactPage.infoEmail'), info: COMPANY_INFO.contactEmail },
                { icon: Phone, title: t('contactPage.infoPhone'), info: COMPANY_INFO.phoneMadagascar },
                { icon: MapPin, title: t('contactPage.infoAddress'), info: COMPANY_INFO.addressMadagascar },
                { icon: Clock, title: t('contactPage.infoHours'), info: COMPANY_INFO.businessHours },
              ].filter(item => Boolean(item.info)).map((item, i) => (
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
              <div className="premium-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px' }}>
                <div className="icon-hover" style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={20} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px', color: 'var(--text-dark)' }}>{t('contactPage.onlineSupport')}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>{t('contactPage.onlineSupportText')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;