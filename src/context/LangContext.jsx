import React, { createContext, useCallback, useContext, useState } from 'react';

const translations = {
  fr: {
    // Producer shop page
    'shop.breadcrumb.home': 'Accueil',
    'shop.breadcrumb.sellers': 'Fournisseurs',
    'shop.verified': 'Vendeur vérifié',
    'shop.since': 'Depuis',
    'shop.contact': 'Contacter le vendeur',
    'shop.quote': 'Demander un devis',
    'shop.stats.rating': 'Note moyenne',
    'shop.stats.orders': 'Commandes terminées',
    'shop.stats.response_rate': 'Taux de réponse',
    'shop.stats.response_time': 'Temps de réponse',
    'shop.stats.new_seller': 'Nouveau vendeur',
    'shop.stats.no_reviews': 'Aucun avis',
    'shop.stats.na': 'Pas encore disponible',
    'shop.tabs.products': 'Produits',
    'shop.tabs.about': 'À propos',
    'shop.tabs.reviews': 'Avis clients',
    'shop.empty.title': 'Aucun produit publié pour le moment',
    'shop.empty.text': 'Ce vendeur peut néanmoins répondre à une demande personnalisée. Contactez-le pour lui présenter votre besoin.',
    'shop.empty.cta': 'Contacter le vendeur',
    'shop.product.view': 'Voir le produit',
    'shop.product.quote': 'Demander un devis',
    'shop.product.price_on_request': 'Prix sur demande',
    'shop.product.moq': 'Quantité min.',
    'shop.product.available': 'Disponible',
    'shop.product.limited_stock': 'Stock limité',
    'shop.product.on_order': 'Sur commande',
    'shop.product.unavailable': 'Indisponible',
    'shop.product.delivery_available': 'Livraison disponible',
    'shop.product.delivery_not': 'Pas de livraison',
    // Contact modal
    'contact.title': 'Contacter le vendeur',
    'contact.subject': 'Sujet',
    'contact.product': 'Produit concerné',
    'contact.message': 'Message',
    'contact.message_ph': 'Décrivez votre besoin ou posez votre question…',
    'contact.send': 'Envoyer le message',
    'contact.sending': 'Envoi…',
    'contact.success': 'Message envoyé avec succès.',
    'contact.error': 'Erreur lors de l\'envoi. Réessayez.',
    'contact.login_required': 'Connectez-vous pour envoyer un message.',
    'contact.self_error': 'Vous ne pouvez pas vous contacter vous-même.',
    // Quote modal
    'quote.title': 'Demander un devis',
    'quote.product': 'Produit concerné',
    'quote.quantity': 'Quantité souhaitée',
    'quote.unit': 'Unité',
    'quote.location': 'Pays ou ville de livraison',
    'quote.location_ph': 'Ex. : Antananarivo, Madagascar',
    'quote.delay': 'Délai souhaité',
    'quote.delay_ph': 'Ex. : sous 2 semaines',
    'quote.message': 'Message complémentaire',
    'quote.message_ph': 'Précisez vos besoins (conditionnement, destination…)',
    'quote.send': 'Envoyer la demande',
    'quote.sending': 'Envoi…',
    'quote.success': 'Demande de devis envoyée.',
    'quote.error': 'Erreur lors de l\'envoi. Réessayez.',
    // Reviews
    'reviews.title': 'Avis clients',
    'reviews.no_reviews': 'Aucun avis pour le moment',
    'reviews.no_reviews_text': 'Soyez le premier à donner votre avis après une commande.',
    'reviews.verified_purchase': 'Achat vérifié',
    'reviews.write': 'Laisser un avis',
    'reviews.your_rating': 'Votre note',
    'reviews.your_comment': 'Votre commentaire (facultatif)',
    'reviews.submit': 'Publier mon avis',
    'reviews.submitting': 'Publication…',
    'reviews.edit': 'Modifier mon avis',
    'reviews.your_order': 'Votre commande',
    'reviews.select_order': 'Sélectionnez une commande terminée',
    'reviews.login_required': 'Connectez-vous pour laisser un avis.',
    'reviews.need_order': 'Vous devez avoir une commande terminée avec ce vendeur.',
    'reviews.success': 'Avis publié avec succès.',
    'reviews.error': 'Erreur lors de la publication.',
    'reviews.stars': 'étoiles',
    // Messages page
    'messages.title': 'Messages',
    'messages.no_conversations': 'Aucune conversation',
    'messages.no_conversations_text': 'Vous n\'avez pas encore de messages.',
    'messages.placeholder': 'Écrivez votre message…',
    'messages.send': 'Envoyer',
    'messages.unread': 'non lu(s)',
    // Seller space messages
    'seller.messages': 'Messages',
    // Account messages
    'account.messages': 'Mes messages',
    // Navigation
    'nav.sellers': 'Fournisseurs',
    'nav.messages': 'Messages',
  },
  en: {
    'shop.breadcrumb.home': 'Home',
    'shop.breadcrumb.sellers': 'Suppliers',
    'shop.verified': 'Verified seller',
    'shop.since': 'Since',
    'shop.contact': 'Contact seller',
    'shop.quote': 'Request a quote',
    'shop.stats.rating': 'Average rating',
    'shop.stats.orders': 'Completed orders',
    'shop.stats.response_rate': 'Response rate',
    'shop.stats.response_time': 'Response time',
    'shop.stats.new_seller': 'New seller',
    'shop.stats.no_reviews': 'No reviews yet',
    'shop.stats.na': 'Not yet available',
    'shop.tabs.products': 'Products',
    'shop.tabs.about': 'About',
    'shop.tabs.reviews': 'Customer reviews',
    'shop.empty.title': 'No products published yet',
    'shop.empty.text': 'This seller may still be able to handle a custom request. Contact them to discuss your needs.',
    'shop.empty.cta': 'Contact seller',
    'shop.product.view': 'View product',
    'shop.product.quote': 'Request a quote',
    'shop.product.price_on_request': 'Price on request',
    'shop.product.moq': 'Min. qty',
    'shop.product.available': 'Available',
    'shop.product.limited_stock': 'Limited stock',
    'shop.product.on_order': 'Made to order',
    'shop.product.unavailable': 'Unavailable',
    'shop.product.delivery_available': 'Delivery available',
    'shop.product.delivery_not': 'No delivery',
    'contact.title': 'Contact seller',
    'contact.subject': 'Subject',
    'contact.product': 'Related product',
    'contact.message': 'Message',
    'contact.message_ph': 'Describe your needs or ask your question…',
    'contact.send': 'Send message',
    'contact.sending': 'Sending…',
    'contact.success': 'Message sent successfully.',
    'contact.error': 'Error sending message. Please try again.',
    'contact.login_required': 'Please log in to send a message.',
    'contact.self_error': 'You cannot contact yourself.',
    'quote.title': 'Request a quote',
    'quote.product': 'Related product',
    'quote.quantity': 'Desired quantity',
    'quote.unit': 'Unit',
    'quote.location': 'Delivery country or city',
    'quote.location_ph': 'e.g. Antananarivo, Madagascar',
    'quote.delay': 'Preferred timeframe',
    'quote.delay_ph': 'e.g. within 2 weeks',
    'quote.message': 'Additional details',
    'quote.message_ph': 'Specify your needs (packaging, destination…)',
    'quote.send': 'Send request',
    'quote.sending': 'Sending…',
    'quote.success': 'Quote request sent.',
    'quote.error': 'Error sending request. Please try again.',
    'reviews.title': 'Customer reviews',
    'reviews.no_reviews': 'No reviews yet',
    'reviews.no_reviews_text': 'Be the first to leave a review after your purchase.',
    'reviews.verified_purchase': 'Verified purchase',
    'reviews.write': 'Leave a review',
    'reviews.your_rating': 'Your rating',
    'reviews.your_comment': 'Your comment (optional)',
    'reviews.submit': 'Submit my review',
    'reviews.submitting': 'Submitting…',
    'reviews.edit': 'Edit my review',
    'reviews.your_order': 'Your order',
    'reviews.select_order': 'Select a completed order',
    'reviews.login_required': 'Please log in to leave a review.',
    'reviews.need_order': 'You need a completed order with this seller to leave a review.',
    'reviews.success': 'Review published successfully.',
    'reviews.error': 'Error publishing review.',
    'reviews.stars': 'stars',
    'messages.title': 'Messages',
    'messages.no_conversations': 'No conversations',
    'messages.no_conversations_text': 'You don\'t have any messages yet.',
    'messages.placeholder': 'Type your message…',
    'messages.send': 'Send',
    'messages.unread': 'unread',
    'seller.messages': 'Messages',
    'account.messages': 'My messages',
    'nav.sellers': 'Suppliers',
    'nav.messages': 'Messages',
  },
};

const LangContext = createContext(null);

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('jr_lang') || 'fr'; } catch { return 'fr'; }
  });

  const toggle = useCallback(() => {
    const next = lang === 'fr' ? 'en' : 'fr';
    setLang(next);
    try { localStorage.setItem('jr_lang', next); } catch { /* noop */ }
  }, [lang]);

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations.fr[key] || key;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
