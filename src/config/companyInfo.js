/**
 * Configuration des informations légales et coordonnées de Jerossa.
 * 
 * Les valeurs non encore fournies sont définies à null afin de ne publier
 * aucune fausse information dans l'application.
 */

export const COMPANY_INFO = {
  // Marque et plateforme
  brandName: 'Jerossa',
  tagline: 'Marketplace Madagascar · Maurice',
  description: 'La marketplace de référence entre Madagascar et Maurice : produits authentiques, matières premières et fournisseurs. Créer des opportunités. Développer les échanges.',

  // Raison sociale et identité légale (À renseigner par le propriétaire de Jerossa)
  legalName: null, // ex: "Jerossa SAS" ou "Jerossa Ltd."
  registrationNumber: null, // ex: "N° RCS / Registre du Commerce"
  vatNumber: null, // ex: "N° NIF / STAT / TVA"

  // Coordonnées de contact officielles (À renseigner par le propriétaire)
  contactEmail: null,
  supportEmail: null,
  legalEmail: null,
  phoneMadagascar: null,
  phoneMauritius: null,
  phoneDisplay: null,

  // Adresses physiques officielles (À renseigner par le propriétaire)
  addressMadagascar: null,
  addressMauritius: null,
  addressDisplay: null,

  // Horaires de service client (indicatif)
  businessHours: null,

  // Hébergeur technique (Information réelle vérifiée)
  hostingProvider: 'Vercel Inc., 340 S Lemon Ave, Walnut, CA 91789, États-Unis',

  // Coordonnées bancaires / Mobile Money de paiement (À renseigner avant activation des paiements réels)
  demoMobileMoneyNumber: null,

  // Configuration des produits de démonstration (Seed)
  isDemoSeedEnabled: true,
  demoSeedSellerNotice: 'Ce produit fait partie du catalogue de démonstration initiale de Jerossa.',
};

export default COMPANY_INFO;
