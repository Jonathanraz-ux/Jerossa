import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './animations.css';

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'Comment passer une commande ?',
      a: 'Parcourez notre catalogue, ajoutez les produits souhaités à votre panier, puis cliquez sur "Commander". Suivez les étapes de livraison et de paiement pour finaliser votre commande.'
    },
    {
      q: 'Quels sont les modes de paiement acceptés ?',
      a: 'Nous acceptons les cartes bancaires (Visa, Mastercard), le paiement mobile (Mobile Money) et les virements bancaires. Toutes les transactions sont sécurisées.'
    },
    {
      q: 'Quels sont les délais de livraison ?',
      a: 'La livraison en France métropolitaine prend généralement 5 à 7 jours ouvrés. Les délais peuvent varier selon la destination et la disponibilité des produits.'
    },
    {
      q: 'Puis-je retourner un produit ?',
      a: 'Oui, nous acceptons les retours sous 30 jours suivant la réception. Les produits doivent être dans leur état d\'origine et non utilisés. Contactez notre service client pour initier un retour.'
    },
    {
      q: 'Comment devenir vendeur sur Jerossa ?',
      a: 'Rendez-vous sur la page "Mon compte" et cliquez sur "Devenir Vendeur". Notre équipe examinera votre dossier et vous contactera sous 48 heures.'
    },
    {
      q: 'Comment suivre ma commande ?',
      a: 'Une fois votre commande expédiée, vous recevrez un email avec un numéro de suivi. Vous pouvez également suivre votre commande depuis la section "Mes commandes" de votre compte.'
    },
    {
      q: 'Les produits sont-ils certifiés bio ?',
      a: 'Une partie de nos produits est certifiée bio. Chaque fiche produit indique les certifications disponibles. Nous travaillons avec des producteurs respectant des normes strictes de qualité.'
    },
    {
      q: 'Comment contacter le support client ?',
      a: 'Vous pouvez nous contacter via le formulaire de contact, par email à contact@jerosa.mg ou par téléphone au +261 32 00 000 00. Notre équipe est disponible du lundi au vendredi de 8h à 17h.'
    }
  ];

  return (
    <div className="faq-page">
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>FAQ</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">FAQ</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">FAQ</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Trouvez des réponses aux questions les plus fréquentes concernant Jerossa.</p>
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