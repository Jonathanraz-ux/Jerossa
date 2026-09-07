import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLang } from '../context/LangContext';
import './animations.css';

const Faq = () => {
  const { t } = useLang();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
    { q: t('faq.q6'), a: t('faq.a6') }
  ];

  return (
    <div className="faq-page">
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('nav.home')}</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{t('faq.breadcrumb')}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">{t('faq.surtitre')}</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{t('faq.title')}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{t('faq.desc')}</p>
        </div>
      </section>

      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faqs.map((faq, i) => (
            <div key={i} className="premium-card scroll-animate" style={{ border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '12px', overflow: 'hidden', background: '#fff', transition: 'all 0.2s', animationDelay: `${i * 0.05}s` }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-sans)', color: 'var(--text-dark)' }}
              >
                {faq.q}
                {openIndex === i ? <ChevronUp size={20} style={{ color: 'var(--primary)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />}
              </button>
              {openIndex === i && (
                <div style={{ padding: '0 24px 20px', color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '14px' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;