# Test responsive Jerossa — prompt à donner à Gemini

Recopie ce document tel quel dans Gemini et demande-lui d'exécuter le test ci-dessous sans modifier le code.

---

## Rôle

Tu es un testeur QA frontend. Tu dois valider le rendu **responsive** de la boutique e-commerce « Jerossa » (React + Vite) sur ordinateur, tablette et téléphone. Tu NE modifies AUCUN fichier : tu navigues, tu captures, tu rapportes.

## Environnement

- Dev server déjà lancé (ordinateur) : `http://localhost:5173/` — accès réseau : `http://192.168.1.65:5173/`
- Déploiement Vercel (repli) : `https://jerossa.vercel.app`
- Téléphone Android branché en USB : `adb devices` renvoie `LZ0A35TZDD1018669  device`
- Pour que le téléphone atteigne le serveur via l'USB : `adb reverse tcp:5173 tcp:5173` puis sur le téléphone ouvrir `http://localhost:5173/`
- Capture d'écran du téléphone (à toi de l'analyser) : `adb exec-out screencap -p > screen.png`
- Sur ordinateur, varier les largeurs de fenêtre ou utiliser les device modes (Chrome DevTools : 390x844, 375x812, 360x800, 320x568, 768x1024, 820x1180, 1024x1366).

## Viewports à couvrir

1. Ordinateur : 1440 / 1280 / 1024
2. Tablette : 1024x1366, 820x1180, 768x1024
3. Téléphone : 390x844, 375x812, 360x800, 320x568

## Pages et parcours à tester

Pour chaque viewport, tu déroules :

1. Accueil (hero, sections produits, boutons)
2. Catalogue (`/catalogue`) — grille 4→3→2→1 colonnes, filtres/chips scrollables horizontaux, recherche
3. Fiche produit — galerie + miniatures, quantité, boutons Ajouter au panier / Acheter, bouton Devis, aperçu rapide (quickview), bandeau rupture de stock
4. Panier — liste, modif quantité (+/−), suppression, résumé (sous-total/livraison/PromoCode)
5. Checkout — 3 étapes (adresse → livraison → paiement), champs, résumé sticky, sélecteur d'adresse existante, bouton « Enregistrer cette adresse »
6. Page paiement (`/payment` ?order=…) — carte carton simulée, méthodes de paiement, bouton Payer
7. Confirmation de commande (`/order/S/…` + page confirmation)
8. Mes commandes (`/account/orders`) — tableau, détail commande + timeline étapes
9. Mes devis (`/account/quotes`) + détail devis + document PDF
10. Mes remboursements (`/account/refunds`) + demande/détail
11. Connexion / Inscription, Mon compte (onglets)
12. Devenir vendeur (formulaire en plusieurs étapes) — upload image OK
13. Espace vendeur — dashboard, produits (formulaire), commandes, devis
14. Espace admin — sidebar (devient un tiroir burger < 960px), KPIs, pages Commandes/Devis/Employés/Produits/Remboursements/Paramètres
15. Messages (`/messages`) et messages vendeur — liste + fil de discussion
16. Footer, pages légales, recherche

## Critères de validation

- ✅ Aucun texte, bouton, icône, image ou formulaire coupé/masqué (pas de décalage à droite, pas de contenu tronqué).
- ✅ Aucun scroll horizontal au niveau du `body`/page : si un élément déborde, **identifier l'élément fautif** (texte/tableau/sélecteur CSS) au lieu de se contenter de `overflow-x:hidden` (qui masque le bug).
- ✅ Boutons entiers et utilisables (hitbox correcte), libellés non tronqués même sur 320 px.
- ✅ Champs de formulaire alignés et pleine largeur en mobile.
- ✅ Navigation fluide : menu burger fonctionnel, onglons/clics atteignables, retour sans blocage.
- ✅ Images avec ratio propre (carré), pas de déformation excessive.

## Couverture CSS déjà en place (à vérifier, pas à réécrire)

Breakpoints : 1280 / 1100 / 1024 / 960 / 900 / 768 / 720 / 600 / 560 / 520 / 480. Fichiers : `src/App.css`, `src/responsive.css`, `src/index.css`, `src/components/Navbar.css`, `src/components/Footer.css`, `src/components/ProductQuickView.css`, `src/admin/admin.css`, `src/seller/seller.css`, `src/pages/Home.css`, `src/pages/Catalogue.css`, `src/pages/ServiceDetails.css`, `src/pages/SellerOnboarding.css`, `src/pages/Publish.css` + blocs `<style>` inline des pages (Checkout, ProductDetails, ProducerShop, QuoteDetails, RefundDetails, MyAccount, MyAddresses, MessagesPage, SellerMessages). Tables larges = scroll interne (`overflow-x:auto`), c'est acceptable.

## Points à scruter en priorité (risques connus)

- `Payment.jsx` : pas de `@media` — vérifier carte 280 px + boutons à 320 px.
- Libellés `white-space: nowrap` (boutons, badges, onglets admin) sur écrans < 360 px.
- Le `overflow-x:hidden` de body ne doit pas dissimuler un vrai débordement.
- Tableaux admin / Mes commandes en mobile : le défilement interne doit rester utilisable.
- Chips de filtres du catalogue et étape de checkout sur petites largeurs.

## Méthode

1. Démarre par l'ordinateur (1440 → 1280 → 1024), puis tablette, puis téléphone réel via adb.
2. Pour chaque page × viewport, note l'état.
3. Quand un écran est suspect, capture-le (`adb exec-out screencap -p > screen.png` sur téléphone ; capture d'écran Windows sur ordinateur) et analyse l'image.

## Format du rapport

| Page | 1440 | 1280 | 1024 | 768/820 | 390 | 375 | 360 | 320 | Anomalie (élément fautif) | Correction suggérée |

Légende : ✅ OK · ⚠ mineur · ✗ cassé (décrit l'anomalie et le sélecteur/zone fautive).

Termine par une synthèse : liste des corrections à faire classées par priorité (critiques = contenu coupé sur téléphone, moyennes = débordement tablettes, mineures = cosmétique).