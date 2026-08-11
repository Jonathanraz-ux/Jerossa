# JEROSSA — MVP : Document de préparation de la maquette

> Version : 2.0 (à valider)
> Statut : brouillon de conception — aucune ligne de code produit.
> Cible : marketplace multi-rôles **CLIENT / VENDEUR / ADMIN**.
> Stack : **Vite + React + TypeScript + Tailwind CSS + Supabase** (aucun Next.js).

Ce document définit l'architecture UX/UI du MVP. Une fois validé, il servira de référence pour la maquette complète (écrans), puis pour le développement.

---

## 1. Architecture globale

### 1.1 Stack technique (imposée)

| Couche | Technologie |
|---|---|
| Frontend | Vite + React + TypeScript + Tailwind CSS |
| Routage | React Router |
| Auth | Supabase Auth |
| Base de données | Supabase PostgreSQL + RLS |
| Storage | Supabase Storage (images produits, pièces vendeurs, pièces de remboursement) |
| Logique serveur | Supabase Edge Functions (seules fonctions avec accès aux secrets) |
| Déploiement | Vercel ou Netlify |

**Interdits** : Next.js, App Router, Server Actions, API Routes, middleware Next.js. Toute logique serveur passe par **Supabase + Edge Functions**.

### 1.2 Vue d'ensemble

```
CLIENT ──┐
VENDEUR ─┼──> FRONTEND Vite + React + TS + Tailwind
ADMIN ───┘          │
                    │ (React Router + gardes par rôle)
                    ▼
             SUPABASE (BaaS)
              ├─ Auth (rôles : customer / seller / admin)
              ├─ Postgres (données) + RLS
              ├─ Storage (images, documents privés)
              └─ Edge Functions (logique sécurisée, secrets)
                    │
        ┌───────────┴────────────┐
        │                        │
   paymentService           emailService
   (createPayment)          (sendTransactionalEmail)
   (verifyPayment)          └─> Resend (ou autre provider)
   (handleWebhook)              └─> Destinataire
   (refundPayment)
        │
  Provider paiement MG/MU (à valider — BLOQUANT)
```

### 1.3 Principes d'architecture du MVP

1. **Un seul frontend** — le même front sert tous les rôles, le routage est protégé par rôle ; la sécurité réelle est assurée par **RLS côté base**, jamais par le frontend seul.
2. **Aucun secret dans le frontend** — les clés (paiement, email) vivent uniquement dans les Edge Functions.
3. **Logique métier centralisée** — changements de statut (commande, paiement, remboursement, vendeur) via Supabase (RLS, triggers, Edge Functions). La maquette simulera ces transitions pour que les flux soient crédibles.
4. **Abstraction des providers** — `paymentService` et `emailService` isolent les fournisseurs externes pour pouvoir les remplacer/ajouter sans réécrire l'application.
5. **Panier homogène en devise** — pas de mélange MGA/MUR dans un panier, pas de conversion automatique (voir §6.3).
6. **Validation humaine des vendeurs** — un vendeur n'est actif qu'après validation admin avec pièces justificatives.
7. **MVP simple** — pas de sur-architecture : une seule intégration de paiement au lancement, un fournisseur d'emails, des frais de livraison fixes, une commission configurable.

---

## 2. Sitemap

Légende : `[P]` public · `[C]` client connecté · `[V]` vendeur · `[A]` admin.

```
JEROSSA
├── /                              [P] Homepage
├── /catalogue                     [P] Catalogue produits (filtres + recherche)
├── /categorie/:slug               [P] Page catégorie
├── /recherche?q=                  [P] Résultats de recherche
├── /produit/:id                   [P] Fiche produit
├── /vendeur/:slug                 [P] Boutique d'un vendeur actif
├── /a-propos                      [P] Présentation entreprise
├── /contact                       [P] Contact (formulaire simple)
│
├── /connexion                     [P] Connexion
├── /inscription                   [P] Inscription
├── /mot-de-passe-oublie           [P] Mot de passe oublié
├── /reinitialiser-mot-de-passe    [P] Réinitialisation (lien email)
│
├── /panier                        [C] Panier (homogène en devise)
├── /checkout                      [C] Checkout (adresse + récap + livraison)
├── /paiement                      [C] Paiement sécurisé (provider MG/MU)
├── /commande/confirmation/:id     [C] Confirmation commande + paiement
│
├── /compte                        [C] Dashboard client
│   ├── /compte/profil             [C] Mon profil
│   ├── /compte/commandes          [C] Mes commandes
│   ├── /compte/commandes/:id      [C] Détail + suivi commande + « Demander un remboursement »
│   ├── /compte/remboursements     [C] Mes remboursements (suivi des statuts)
│   ├── /compte/remboursements/:id [C] Détail d'une demande de remboursement
│   ├── /compte/devis              [C] Mes demandes de devis
│   ├── /compte/devis/:id          [C] Détail d'un devis
│   ├── /compte/adresses           [C] Mes adresses
│   ├── /compte/parametres         [C] Paramètres du compte
│   └── /compte/securite           [C] Sécurité (mot de passe, sessions)
│
├── /vendeur/devenir               [C] Demande pour devenir vendeur (infos + pièces + infos de paiement)
├── /vendeur/statut                [C] Statut de la demande (pending/approved/rejected)
│
├── /espace-vendeur                [V] Dashboard vendeur
│   ├── /espace-vendeur/produits             [V] Liste produits
│   ├── /espace-vendeur/produits/nouveau     [V] Ajouter un produit
│   ├── /espace-vendeur/produits/:id         [V] Modifier un produit
│   ├── /espace-vendeur/commandes            [V] Commandes reçues
│   ├── /espace-vendeur/commandes/:id        [V] Détail + traitement commande
│   ├── /espace-vendeur/devis                [V] Demandes de devis reçues
│   ├── /espace-vendeur/boutique             [V] Profil boutique / entreprise
│   └── /espace-vendeur/parametres           [V] Paramètres vendeur
│
└── /admin                         [A] Dashboard admin
    ├── /admin/utilisateurs        [A] Liste utilisateurs
    ├── /admin/utilisateurs/:id    [A] Détail utilisateur
    ├── /admin/vendeurs            [A] Liste vendeurs (avec statut)
    ├── /admin/vendeurs/:id        [A] Détail + validation/refus/suspension vendeur
    ├── /admin/produits            [A] Produits (masquer/publier)
    ├── /admin/categories          [A] Gestion catégories
    ├── /admin/commandes           [A] Commandes
    ├── /admin/commandes/:id       [A] Détail commande
    ├── /admin/paiements           [A] Paiements
    ├── /admin/remboursements      [A] Demandes de remboursement
    ├── /admin/remboursements/:id  [A] Traitement d'un remboursement (valider/refuser/process)
    ├── /admin/devis               [A] Demandes de devis
    ├── /admin/activite            [A] Notifications / activité
    ├── /admin/logs                [A] Logs / activité administrative
    └── /admin/parametres          [A] Paramètres plateforme (livraison, commission, emails)
```

### 2.1 Pages hors MVP (à réintégrer ou à classer V2)

La maquette actuelle contient aussi : `Blog`, `Article`, `Services`, `Contact`, `FAQ`, `LegalNotice`, `PrivacyPolicy`, `TermsConditions`. **Recommandation** : garder les pages légales (mention légale, confidentialité, CGV, politique de remboursement) car nécessaires au paiement en ligne ; déplacer Blog/Article/Services vers **V2**.

---

## 3. User flows

### 3.1 Parcours client — achat simple

```
Visiteur → Homepage → Catalogue (filtres/recherche) → Fiche produit
        → [Acheter] → Panier → Checkout (adresse) → Paiement
        → Confirmation commande → Espace client (suivi)
```
Branches :
- Non connecté au checkout → redirection login puis retour checkout (session conservée).
- **Panier mixte MGA + MUR** → refusé avec message : « Les produits de ce panier doivent être dans la même devise pour poursuivre la commande. » (deux commandes distinctes si nécessaire).

### 3.2 Parcours client — demande de devis

```
Fiche produit → « Demander un devis » → formulaire (quantité, détails, délai)
→ confirmation envoyée → notification + email au vendeur → vendeur répond (prix/offre)
→ email au client → client consulte dans Mes devis → accepte (→ devient commande) ou refuse
```

### 3.3 Parcours vendeur — onboarding

```
Inscription client → « Devenir vendeur » → formulaire entreprise :
  infos (responsable, entreprise, téléphone, email, adresse, pays, description)
  + pièces (identité, justificatif d'activité, justificatif d'adresse)
  + infos de paiement (compte/titulaire)
→ upload → statut PENDING → admin review (pièces privées) → Approved / Rejected
→ Approved : accès espace-vendeur + email de validation
→ Rejected : email de refus + motif + possibilité de resoumettre
```

### 3.4 Parcours vendeur — produit & commande

```
Espace vendeur → Produits → Ajouter un produit → soumission
→ statut DRAFT (visible vendeur seul) → publication → EN LIGNE
→ réception commande (email « Nouvelle commande ») → traitement
  (Confirmed → Processing → Shipped → Delivered) → email client à chaque changement
```

### 3.5 Parcours admin — validation vendeur

```
Dashboard admin → Vendeurs (filtre Pending) → Détail vendeur (infos + pièces privées + produits)
→ Valider / Refuser / Suspendre → notification + email au vendeur → statut mis à jour
```

### 3.6 Parcours paiement (provider à valider — BLOQUANT)

```
Checkout → récapitulatif (sous-total + livraison + commission) → sélection mode de paiement
→ redirection provider sécurisé (via Edge Function) → retour plateforme
→ statut Paid → commande confirmée → email confirmation commande + paiement
→ échec : retour checkout avec message clair, panier conservé
```

### 3.7 Parcours remboursement (client → admin)

```
Client : Mes commandes → Détail commande → « Demander un remboursement »
  → formulaire (motif, description, montant, pièce jointe optionnelle) → envoi → statut requested
  → email client « demande reçue » + email admin « nouvelle demande »
Admin : Dashboard → Remboursements → Détail (commande, client, vendeur, motif, montant)
  → under_review → approuver (montant réellement remboursé) / refuser (motif)
  → Admin effectue le remboursement côté provider de paiement
  → enregistre référence + note interne → statut processed
  → emails client à chaque changement de statut + email vendeur si pertinent
```

### 3.8 Flux email transactionnel (architecture)

```
Événement métier (commande, paiement, devis, remboursement, vendeur)
  → Supabase (trigger / RLS / app) 
  → Edge Function emailService.sendTransactionalEmail({type, to, data})
  → Resend (ou provider) → destinataire
  → email_logs enregistré (status, provider_message_id)
```

---

## 4. Liste complète des écrans

### 4.1 Public (13 écrans)

| # | Écran | Objectif |
|---|---|---|
| 01 | Homepage | Vitrine marketplace : hero, recherche, catégories, produits, vendeurs, confiance |
| 02 | Catalogue | Grille produits + filtres (catégorie, prix, marché, devise, disponibilité) + tri |
| 03 | Recherche | Résultats en fonction de `?q=` + suggestions |
| 04 | Catégorie | Liste des produits d'une catégorie (même composant que catalogue, source différente) |
| 05 | Fiche produit | Galerie, prix, stock, vendeur, description, CTA acheter/devis |
| 06 | Boutique vendeur | Présentation vendeur + ses produits + avis |
| 07 | À propos | Histoire / mission de Jerossa |
| 08 | Contact | Formulaire simple + coordonnées |
| 09 | Connexion | Email + mot de passe, lien oublié, lien inscription |
| 10 | Inscription | Nom, email, mot de passe, pays (MG/MU) |
| 11 | Mot de passe oublié | Envoi de lien par email |
| 12 | Réinitialisation | Nouveau mot de passe |
| 13 | 404 | Page introuvable |

### 4.2 Client (17 écrans)

| # | Écran | Objectif |
|---|---|---|
| 14 | Panier | Lignes, quantités, suppression, sous-total/total, **règle devise homogène** |
| 15 | Checkout | Adresse, frais de livraison (fixes, configurés admin), récapitulatif |
| 16 | Paiement | Moyen de paiement (provider MG/MU), sécurité, total |
| 17 | Confirmation commande | N° de commande, récap, prochaines étapes |
| 18 | Dashboard client | Vue d'ensemble : commandes, remboursements, devis, raccourcis |
| 19 | Mon profil | Infos personnelles + avatar |
| 20 | Mes commandes | Liste + statut + recherche |
| 21 | Détail commande | Lignes, montants, suivi, action « Demander un remboursement » |
| 22 | Mes remboursements | Liste des demandes + statut (ex. « Remboursement — 1 500 MUR — En cours d'examen ») |
| 23 | Détail remboursement | Motif, montants demandé/remboursé, statut, référence, pièce jointe |
| 24 | Mes devis | Liste des demandes + statut |
| 25 | Détail devis | Offre du vendeur + accepter/refuser |
| 26 | Mes adresses | CRUD adresses de livraison |
| 27 | Paramètres | Langue, devise préférée, notifications |
| 28 | Sécurité | Mot de passe, sessions actives, double authentification (V2) |
| 29 | Demande vendeur | Formulaire infos + pièces + infos de paiement |
| 30 | Statut de la demande | Pending/Approved/Rejected + message |

### 4.3 Vendeur (8 écrans)

| # | Écran | Objectif |
|---|---|---|
| 31 | Dashboard vendeur | KPIs (CA, commission, net), dernières commandes, produits, devis, alertes remboursements |
| 32 | Produits | Tableau produits + statut + recherche + pagination |
| 33 | Ajouter un produit | Formulaire complet (images, prix, devise, stock, description) |
| 34 | Modifier un produit | Même formulaire pré-rempli + gestion stock |
| 35 | Commandes reçues | Liste + filtres par statut + montant net après commission |
| 36 | Détail commande | Lignes client, adresse, montants (brut / commission / net), changer statut |
| 37 | Demandes de devis | Répondre aux demandes |
| 38 | Profil boutique | Infos entreprise, logo, bannière |

### 4.4 Admin (15 écrans)

| # | Écran | Objectif |
|---|---|---|
| 39 | Dashboard admin | KPIs globaux, file de validation, alertes remboursements, activité récente |
| 40 | Utilisateurs | Liste + recherche + filtre rôle |
| 41 | Détail utilisateur | Profil, historique, actions |
| 42 | Vendeurs | Liste + filtre statut + validation (pièces privées) |
| 43 | Détail vendeur | Dossier, pièces, infos de paiement, produits, valider/refuser/suspendre |
| 44 | Produits | Modération : masquer/publier |
| 45 | Catégories | CRUD catégories |
| 46 | Commandes | Liste globale |
| 47 | Détail commande | Vue complète + montants (brut, livraison, commission, net vendeur) |
| 48 | Paiements | Transactions + statut |
| 49 | Remboursements | Liste des demandes + filtre statut |
| 50 | Détail remboursement | Commande, client, vendeur, motif, montants ; approuver/refuser, montant réel, note interne, référence, statut processed |
| 51 | Demandes de devis | Modération / vue globale |
| 52 | Activité | Notifications, événements récents |
| 53 | Logs | Journal des actions admin (audit) |
| 54 | Paramètres | **Livraison** (montant fixe par devise), **Commission** (taux global), **Emails** (aperçu templates) |

---

## 5. Structure de chaque dashboard

Les trois dashboards partagent le même squelette SaaS :

```
┌──────────────┬─────────────────────────────────────────────┐
│  SIDEBAR     │  TOPBAR                                     │
│  (rôle)      │  recherche · notifications · avatar/profil  │
├──────────────┼─────────────────────────────────────────────┤
│              │                                             │
│  navigation  │  CONTENU PRINCIPAL                          │
│  par rôle    │  (KPIs / tableaux / formulaires)            │
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

- **Sidebar** : collapse en icônes (tablette), drawer plein écran (mobile).
- **Topbar** : recherche globale, cloche de notifications avec badge (commandes, devis, remboursements), menu avatar (profil, paramètres, déconnexion).
- **Contenu** : en-tête de page (titre + actions), KPIs, tables filtrables, pagination, états vides.

### 5.1 Dashboard client

- **KPIs** : commandes en cours, remboursements en cours, devis en attente, favoris.
- **Navigation** : Vue d'ensemble, Mes commandes, Mes remboursements, Mes devis, Mes adresses, Profil, Paramètres, Sécurité.
- **Contenu principal** : dernières commandes (table), remboursements en cours (badges de statut), devis à répondre, raccourcis catalogue.

### 5.2 Dashboard vendeur

- **KPIs** : chiffre d'affaires brut, commission Jerossa, net vendeur, commandes en cours, produits en ligne, devis en attente, remboursements liés.
- **Navigation** : Vue d'ensemble, Produits, Commandes, Devis, Boutique, Paramètres.
- **Contenu principal** : alertes (produit en rupture, devis non traités, remboursement demandé sur une commande), dernières commandes à traiter (avec net vendeur), état des produits.

### 5.3 Dashboard admin

- **KPIs** : utilisateurs, vendeurs, commandes, revenus plateforme (commission), produits en ligne, remboursements à traiter.
- **Navigation** : Vue d'ensemble, Utilisateurs, Vendeurs, Produits, Catégories, Commandes, Paiements, Remboursements, Devis, Activité, Logs, Paramètres.
- **Contenu principal** : file de validation vendeurs (pending), demandes de remboursement à traiter, alertes (paiements échoués), activité récente.

### 5.4 Table (réutilisable)

Colonnes, filtres, recherche, tri, pagination (10/25/50), actions par ligne (menu `⋯`), sélection, exports (V2).

---

## 6. Structure des pages e-commerce

### 6.1 Homepage

1. Header (logo, recherche, nav, panier, compte)
2. Hero (accroche + CTA + image marché local)
3. Barre de recherche + catégories rapides
4. Catégories (cartes)
5. Produits populaires (carrousel/grille)
6. Produits récents
7. Vendeurs / boutiques (cartes avec note)
8. Pourquoi Jerossa (confiance : paiement sécurisé, vendeurs vérifiés, produits locaux)
9. CTA final (inscription client / devenir vendeur)
10. Footer

### 6.2 Fiche produit

Galerie images (vignettes + plein écran) · nom · note/avis · prix (devise marché) · disponibilité + badge stock · options (quantité, variantes) · CTA **Ajouter au panier** · CTA **Demander un devis** · livraison (montant fixe du marché) · description · caractéristiques · encart vendeur (nom, note, « Voir la boutique ») · produits similaires.

### 6.3 Panier — devise homogène

- Lignes (image, nom, vendeur, prix, quantité, suppression) · sous-total · frais de livraison (fixe, configuré admin) · total.
- **Règle MVP : panier homogène.** Tous les produits doivent être dans la même devise (MGA **ou** MUR).
  - Ajout d'un produit d'une autre devise → refus avec message clair :
    > « Les produits de ce panier doivent être dans la même devise pour poursuivre la commande. »
  - L'utilisateur consulte librement les deux devises sur le catalogue ; il effectue **deux commandes distinctes** s'il veut commander dans les deux.
- **Pas de conversion automatique de devise** dans le MVP (évite taux de change, écarts taux affiché/taux de paiement, complications de remboursement et de comptabilité).
- La devise est conservée sur : `product` · `cart` · `order` · `order_item` · `payment` · `refund` (préparation multi-devise V2).
- Panier vide → état vide + CTA catalogue.

### 6.4 Checkout

Étapes : ① Adresse de livraison ② Récapitulatif (lignes + sous-total + livraison + total) ③ Paiement. Barre de progression. Récap latéral fixe (desktop) / plié (mobile).

### 6.5 Confirmation

Numéro de commande, récapitulatif (sous-total, livraison, total), statut du paiement, prochaines étapes (suivi, possibilité de demander un remboursement), boutons « Voir mes commandes » / « Retour au catalogue ».

---

## 7. États de chaque interface

### 7.1 États transverses (toute page)

- **Chargement** : skeletons (cartes, table, fiche) — jamais de spinner brut seul.
- **Vide** : illustration + message + CTA (« Aucun produit — Parcourir le catalogue »).
- **Erreur** : message simple + action de retry.
- **Non connecté** : CTA connexion/inscription (pour panier, devis, remboursement, compte).

### 7.2 États métier

| Objet | États |
|---|---|
| Produit | `en ligne` · `rupture de stock` · `masqué` (admin) · `en attente` (modération) · `refusé` |
| Vendeur | `pending` · `approved` · `rejected` · `suspended` |
| Demande vendeur | `en attente` · `approuvée` · `refusée` (avec motif) |
| Document vendeur | `en attente de vérification` · `vérifié` · `rejeté` |
| Commande | `pending` · `confirmed` · `processing` · `shipped` · `delivered` · `cancelled` · `refunded` (si remboursement total) |
| Paiement | `pending` · `processing` · `paid` · `failed` · `cancelled` |
| Remboursement | `requested` → `under_review` → `approved` / `rejected` → `processed` |
| Devis | `envoyé` · `répondu` · `accepté` · `refusé` · `expiré` |
| Email transactionnel | `envoyé` · `échec` (trace dans `email_logs`) |
| Rôle | `customer` · `seller` · `admin` |

**Remboursement — détail des états (UX client/admin)**

| Statut | Affichage client | Signification |
|---|---|---|
| `requested` | « Demande envoyée » | Formule soumis, en attente de traitement |
| `under_review` | « En cours d'examen » | L'admin étudie la demande |
| `approved` | « Approuvé » | Accepté, remboursement en préparation |
| `rejected` | « Refusé » (+ motif) | Refusé avec explication |
| `processed` | « Remboursé » (+ montant + référence) | Remboursement effectué et enregistré |

Chaque statut a un **badge de couleur dédié** (cf. Design System) et, le cas échéant, une **action contextuelle** (ex. « Traiter », « Valider », « Publier », « Approuver le remboursement »).

---

## 8. Design System proposé

### 8.1 Couleurs (tokens)

| Token | Hex | Usage |
|---|---|---|
| `--primary-600` | `#0E7A5F` | Actions principales, liens (vert terroir / confiance) |
| `--primary-700` | `#0B5F4A` | Hover primary, fonds sombres |
| `--primary-50` | `#ECF7F3` | Fonds de section, badges primaires |
| `--accent-500` | `#D97706` | Prix, promotions, highlights (ambre vanille) |
| `--neutral-900/700/500/100/50` | échelle gris | Texte, bordures, fonds |
| `--success` | `#15803D` | Statuts positifs (approved, paid, delivered, processed) |
| `--warning` | `#B45309` | En attente (pending, under_review, requested) |
| `--danger` | `#B91C1C` | Erreurs, refus, suppression, rejected, failed |
| `--info` | `#1D4ED8` | Informations |

Boutons : `primary` (fond vert, texte blanc), `secondary` (fond gris clair), `outline`, `ghost`, `danger`, `link`. Un seul CTA par section.

### 8.2 Typographie

- **Police** : Inter (ou system stack). Poids 400 / 500 / 600 / 700 / 800.
- **Échelle** (desktop / mobile) :
  - Display 40/32 · H1 32/26 · H2 24/20 · H3 20/18 · H4 16/16
  - Body 16 · Small 14 · Caption 12
- **Numéraux** : tabular-nums pour prix, montants et références.

### 8.3 Composants clés

- **Cards** : rayon 12px, bordure 1px, ombre douce au survol ; carte produit = image (ratio 4:3), titre, vendeur, prix, badge stock, note.
- **Badges** : pastille colorée (fond 50 + texte 700) avec libellé du statut (dont statuts de remboursement).
- **Tables** : entête sticky, zébrures légères, actions en `⋯`, tri par colonnes.
- **Modals** : titre + contenu + 2 actions (confirmer/annuler), jamais d'action destructive sans confirmation.
- **Dropdowns** : menus contextuels, fermeture au clic extérieur.
- **Inputs** : label visible, placeholder utile, état erreur (message + bordure), états focus et disabled clairs.
- **Formulaires multi-étapes** : onboarding vendeur (① infos ② pièces ③ paiement), demande de remboursement (motif → description → montant → pièce optionnelle).
- **Upload** : zone de dépôt avec aperçu, taille limite affichée, statut (en attente de vérification / vérifié / rejeté) pour les documents vendeur.
- **Toasts** : succès / erreur, auto-dismiss (4s), position haut-droite.
- **Skeletons** : chargement sous forme de blocs gris animés.
- **Steppers** : checkout (① adresse ② récap ③ paiement).
- **Empty states** : illustration simple + texte + CTA.
- **Confirmation dialog** : actions destructives (supprimer, suspendre, refuser, rejeter un remboursement) toujours confirmées avec libellé explicite.

### 8.4 Identité email (templates transactionnels)

Identité visuelle cohérente avec Jerossa, déclinée sur **tous les emails** :
- Logo + nom Jerossa en entête ;
- Couleurs du projet (primaire vert, accents ambre) ;
- Design simple et professionnel ;
- Responsive mobile (contenu sur une colonne, tailles adaptées) ;
- Bouton CTA bien visible quand une action est attendue ;
- Footer propre (adresse, mentions légales, lien « ne plus recevoir » dans la limite du transactionnel).

Un **template dédié par événement** (pas d'email générique). Liste complète en §9.

### 8.5 Accessibilité (base)

- Contrastes WCAG AA, focus visible, labels de formulaires, `alt` d'images, targets tactiles ≥ 44px.

---

## 9. Emails transactionnels (MVP)

### 9.1 Fournisseur & architecture

- **Fournisseur retenu (proposition) : Resend** — ⚠️ **À VALIDER PAR LE CLIENT** (autre fournisseur possible tant que l'abstraction est respectée).
- **Aucune clé API dans le frontend Vite.** Le flux est : `Frontend → Supabase Edge Function → Resend → destinataire`.
- **Couche d'abstraction `emailService`** : fonction unique `sendTransactionalEmail({ type, to, data })` côté Edge Function. Le reste de l'application ne connaît jamais Resend — seul le service d'envoi change si le fournisseur est remplacé.
- **Traçabilité** : chaque envoi enregistré dans `email_logs` (status, provider_message_id, subject). Simple — pas de marketing automation.

### 9.2 Événements et templates

**CLIENT**

| Type | Objet (exemple) | Déclencheur |
|---|---|---|
| `verification` | « Confirmez votre compte Jerossa » | Création / vérification de compte |
| `password_reset` | « Réinitialisez votre mot de passe » | Demande de réinitialisation |
| `order_confirmed` | « Votre commande #JRS-1024 est confirmée » | Commande confirmée |
| `payment_confirmed` | « Votre paiement a été confirmé » | Paiement `paid` |
| `order_status` | « Votre commande #JRS-1024 a été expédiée » | Changement de statut commande |
| `quote_response` | « Le vendeur a répondu à votre devis » | Réponse à une demande de devis |
| `refund_status` | « Votre demande de remboursement est en cours d'examen » | Changement de statut remboursement |

**VENDEUR**

| Type | Objet (exemple) | Déclencheur |
|---|---|---|
| `seller_approved` | « Votre compte vendeur a été approuvé » | Validation admin |
| `seller_rejected` | « Votre demande vendeur a été refusée » (+ motif) | Refus admin |
| `new_order` | « Nouvelle commande #JRS-1024 » | Commande reçue |
| `new_quote` | « Nouvelle demande de devis » | Demande de devis reçue |
| `refund_notification` | « Une demande de remboursement concerne votre commande » | Remboursement lié à une commande vendeur |

**ADMIN**

| Type | Objet (exemple) | Déclencheur |
|---|---|---|
| `new_seller_request` | « Nouvelle demande vendeur à valider » | Demande vendeur soumise |
| `new_refund_request` | « Nouvelle demande de remboursement » | Demande de remboursement soumise |
| `new_order_notification` | « Nouvelle commande passée » (optionnel) | Commande créée |

---

## 10. Responsive strategy

| Breakpoint | Cible | Comportement |
|---|---|---|
| Desktop ≥ 1280 / 1440 | Recherche pleine largeur, cartes 4-5 colonnes, récap latéral fixe | |
| Tablet 768–1023 | Sidebar en icônes, cartes 2-3 colonnes, tables scrollables horizontalement, récap replié | |
| Mobile 375/390 | Navigation burger, grilles 1-2 colonnes, CTA sticky « Ajouter au panier », filtres en drawer, tableaux transformés en listes/cards, swipe de galerie | |

Principes : **mobile-first**, dessiner d'abord le 375px puis enrichir ; jamais de contenu clippé ; filtres accessibles en drawer ; formulaires en une colonne ; documents vendeur/remboursement consultables (aperçu) sur mobile.

---

## 11. MVP vs V2

### 11.1 Inclus au MVP

Catalogue + recherche/filtres · fiches produit · panier/checkout/paiement (un seul provider au lancement) · commandes + suivi · devis · comptes + rôles · onboarding vendeur avec validation admin (pièces privées) · **remboursements (demande client + traitement admin)** · **emails transactionnels essentiels (Resend via Edge Function)** · dashboards client/vendeur/admin · modération produits · paramètres plateforme (livraison, commission) · notifications · pages légales · responsive.

### 11.2 V2 / Future

| Fonctionnalité | Pourquoi V2 |
|---|---|
| Blog, Services, FAQ avancés, chat en ligne | Hors parcours transactionnel |
| Notations/avis complets des produits | Nécessite modération et volume |
| Application mobile native | PWA d'abord |
| IA (recommandations, recherche sémantique) | Volume de données requis |
| Fidélité, promotions complexes, enchères | Hors cahier des charges |
| Analytics avancées, exports admin | Données réelles nécessaires |
| Logistique / tracking transporteur temps réel, calcul de livraison par distance/poids | Provider externe requis |
| Panier multi-devise avec conversion automatique | Taux de change, écarts de paiement |
| Split payment automatique / reversement vendeurs automatisé | Dépend du fournisseur choisi ; le MVP calcule et enregistre seulement |
| Remboursement automatique via API du provider | Le MVP : admin déclenche + enregistre référence ; l'API est prévue dans l'architecture `refundPayment()` |
| Système de litiges avancé | Hors cahier des charges |
| Marketing automation, newsletter, segmentation, campagnes, CRM email | Hors périmètre (jamais dans `email_logs`) |
| Double authentification | Renforcer en phase suivante |
| Commission différenciée par vendeur | Le MVP : taux global configurable |

---

## 12. Architecture logique des données (alignement UX)

Non codé — modèle mental pour que chaque écran soit alimentable par Supabase. La devise est portée par toutes les entités monétaires ; `refunds` et `email_logs` sont prévus dès le MVP.

| Entité | Champs clés | Relations |
|---|---|---|
| `users` | id (auth), email, role | → profiles |
| `profiles` | user_id, nom, prénom, pays (MG/MU), devise, avatar | 1-1 users |
| `sellers` | user_id, nom boutique, slug, statut, description, infos de paiement (titulaire, coordonnées) | 1-1 users |
| `seller_documents` | seller_id, type, file_path (storage privé), statut (pending/verified/rejected) | N-1 sellers |
| `categories` | nom, slug, parent | auto-référence |
| `products` | seller_id, catégorie, titre, description, prix, **devise**, marché, stock, statut | N-1 sellers/categories |
| `product_images` | product_id, url, ordre | N-1 products |
| `carts` | user_id, **devise** (homogène) | 1-1 users |
| `cart_items` | cart_id, product_id, quantité | N-1 |
| `addresses` | user_id, libellé, ville, pays | N-1 users |
| `orders` | user_id, numéro, statut, **devise**, subtotal, shipping_fee, total, commission_rate, commission_amount, seller_amount, platform_amount, adresse | N-1 users |
| `order_items` | order_id, product_id, prix, quantité, **devise** | N-1 |
| `payments` | order_id, montant, **devise**, statut, ref provider, provider | 1-1 orders |
| `refunds` | order_id, customer_id, seller_id, amount_requested, amount_refunded, **devise**, reason, description, status, admin_note, refund_reference, requested_at, processed_at, created_at, updated_at | N-1 orders |
| `quote_requests` | user_id, product_id, quantités, message, statut | N-1 |
| `quote_responses` | quote_request_id, vendeur, prix, délai | 1-1 |
| `notifications` | user_id, type, lu | N-1 |
| `email_logs` | user_id, recipient, type, subject, status, provider, provider_message_id, sent_at, created_at | N-1 users |
| `platform_settings` | clé/valeur : shipping_fee_mga, shipping_fee_mur, commission_rate, default_currency, payment_provider | — |
| `audit_logs` | admin_id, action, cible | historique |

**Calculs de montants (conceptuels, affichés dans les dashboards)**

```
subtotal (somme des lignes)
+ shipping_fee (fixe, configuré admin)
= total (payé par le client)

commission_amount = commission_rate (%) × subtotal
seller_amount     = subtotal − commission_amount
platform_amount   = commission_amount
```

Le MVP **calcule et enregistre** ces montants par commande ; le reversement réel aux vendeurs reste à définir avec le client et le provider de paiement (pas de split automatique au MVP).

**Remboursement (conceptuel)** : le client demande `amount_requested` ; l'admin approuve avec `amount_refunded` (réel) ; si le provider le permet via `refundPayment()` l'Edge Function déclenche l'API, sinon l'admin opère manuellement côté provider puis enregistre `refund_reference` et passe à `processed`.

**Principes RLS (design)** : un utilisateur lit/écrit ses propres lignes (profils, commandes, devis, remboursements) ; un vendeur gère ses produits, ses commandes reçues et voit ses montants nets ; l'admin lit tout et modifie les statuts (vendeurs, produits, commandes, remboursements) ; le public ne lit que produits `en ligne` + vendeurs `approved` ; **les documents vendeur et les infos de paiement ne sont jamais publics** (bucket Storage privé, accès admin uniquement).

---

## 13. Paramètres marketplace (admin)

| Paramètre | Comportement MVP | Statut |
|---|---|---|
| Frais de livraison MGA | Montant fixe configurable (ex. 5 000 MGA) | ⚠️ **Montant À VALIDER PAR LE CLIENT** |
| Frais de livraison MUR | Montant fixe configurable (ex. 150 MUR) | ⚠️ **Montant À VALIDER PAR LE CLIENT** |
| Taux de commission | Pourcentage global configurable (ex. X %) | ⚠️ **Pourcentage À VALIDER PAR LE CLIENT** |
| Devise par défaut | Devise du marché de lancement | ⚠️ **À VALIDER PAR LE CLIENT** |
| Provider de paiement | Sélection du fournisseur + comptes marchands | ⚠️ **BLOQUANT — À VALIDER PAR LE CLIENT** |
| Fournisseur email | Resend (proposition) + clé en Edge Function | ⚠️ **À VALIDER PAR LE CLIENT** |
| Politique de remboursement | Délai/conditions affichés au client | ⚠️ **À VALIDER PAR LE CLIENT** |

Le remboursement et la livraison sont **enregistrés à la commande** (montants figés au moment de l'achat), même si le paramètre global change ensuite.

---

## 14. Ordre recommandé de conception

1. Design System (tokens + composants de base + identité email) — §8
2. Shell d'app : header, footer, routage par rôle, gardes — §2/§5
3. Pages publiques : homepage → catalogue → fiche produit → boutique vendeur — §6
4. Panier (devise homogène) → checkout (livraison) → paiement → confirmation — §6
5. Auth : connexion / inscription / mot de passe — §4
6. Espace client (dashboard, commandes, remboursements, devis, adresses) — §5.1
7. Onboarding vendeur (demande, pièces, statut, espace vendeur) — §5.2
8. Admin (validation vendeurs, produits, commandes, paiements, remboursements, paramètres) — §5.3
9. Emails transactionnels (templates + Edge Function `emailService`) — §9
10. États transverses (loading, empty, error) — §7
11. Responsive (mobile/tablet passes) — §10

---

## 15. Points à trancher / À VALIDER PAR LE CLIENT

> Marqués ⚠️ **À VALIDER PAR LE CLIENT** dans le document — ne pas les transformer en décisions techniques définitives sans validation.

1. **Provider de paiement MG/MU (BLOQUANT)** — Orange Money, MVola, carte pour Madagascar ; MCB/SBM, carte pour Maurice. Le client doit valider : fournisseurs, comptes marchands, devises supportées, frais de transaction, conditions/API. **Sans ce choix + accès API, l'intégration du paiement est bloquante pour la livraison finale.** L'UX checkout/paiement reste maquettée et l'architecture `paymentService` (createPayment / verifyPayment / handleWebhook / refundPayment) est prévue multi-provider sans sur-architecturer.
2. **Commission exacte** — le taux (%), global par défaut, doit être confirmé. L'architecture calcule et enregistre brut / commission / net vendeur / part plateforme.
3. **Pièces exactes pour les vendeurs** — identité, justificatif d'activité/enregistrement, justificatif d'adresse, infos de paiement. La liste finale dépend des exigences légales et commerciales MG/MU — à confirmer, ne rien inventer.
4. **Montants de livraison** — fixes, configurés par l'admin (ex. 5 000 MGA / 150 MUR). Montants initiaux à valider.
5. **Politique de remboursement** — délais, conditions, montants (total/partiel). À définir par le client pour l'affichage client et l'interface admin.
6. **Fournisseur email** — Resend proposé ; valider (ou un équivalent compatible avec l'abstraction `emailService`).
7. **Devise de lancement / marché prioritaire** — Madagascar ou Maurice en premier ? Fixe devise par défaut, paiement, livraison.
8. **Mode de reversement aux vendeurs** — comment les vendeurs reçoivent leurs fonds (manuel provider / API). À définir avec le client + provider de paiement.
9. **Stock en gros vs détail** — certains produits sont « Min 5kg » ; le MVP gère-t-il les quantités minimales / unités multiples ? Impact sur le panier.
10. **Écrans hors périmètre** — validation du déplacement Blog/Article/Services vers V2.

---

## 16. Récapitulatif de validation

| Bloc | À valider |
|---|---|
| Architecture | Stack Vite + React + TS + Tailwind + Supabase (définitif, pas de Next.js) |
| Sitemap | 54 écrans proposés — liste à confirmer |
| Flows | Parcours achat, devis, vendeur, admin, paiement, remboursement, email |
| États | Tableaux de statuts (7.2) dont remboursement (`requested → under_review → approved/rejected → processed`) |
| Design System | Couleurs, typo, composants, identité email (8) |
| Emails | 15 événements + templates + abstraction `emailService` (9) |
| Data | Entités + RLS + devise + montants commande/commission + `refunds` + `email_logs` (12) |
| Paramètres | Livraison, commission, provider paiement, email, politique remboursement (13) |
| Décisions bloquantes | §15 — notamment le provider de paiement |

Une fois ces points validés, je produirai la **maquette écran par écran** selon l'ordre de la section 14.

