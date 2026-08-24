# JEROSSA — Guide de test de la plateforme

> **À l'attention du client** — 21 août 2026
> Site en ligne : **https://jerossa.vercel.app**
> Environnement de démonstration : les paiements et emails sont simulés, toutes les autres données sont réelles (base Supabase).

---

## 1. Comptes pour tester

| Rôle | Comment y accéder | Identifiants |
|---|---|---|
| **Client** | Créer un compte librement sur le site | Page « Créer un compte » → onglet *Compte Client* |
| **Administrateur** | Connexion puis menu **Mon compte → tableau de bord** | Email : `admin@jerossa.mg` · Mot de passe : `Admin@Jerossa2026` |

> 💡 Astuce : ouvrez une fenêtre de navigation privée pour tester le parcours client, tout en restant connecté en admin dans votre fenêtre principale. Vous verrez ainsi en direct l'effet des actions admin côté client.
>
> ⚠️ Ce mot de passe admin est temporaire : il sera changé avant la mise en production.

---

## 2. Parcours client à tester

### A. Créer un compte client
1. En haut à droite : **Créer un compte**.
2. Choisir *Compte Client*, renseigner nom, email, mot de passe (6 caractères min.).
3. ✅ Résultat attendu : redirection vers votre tableau de bord **Mon compte** (`/my-account`). La session reste active même après fermeture du navigateur.

### B. Se reconnecter et retrouver son tableau de bord
1. **Se connecter** avec vos identifiants.
2. Une fois connecté, le lien **« Mon compte »** apparaît en haut à droite (à la place de « Se connecter ») + un bouton **Déconnexion**.
3. Sur mobile : l'icône **Compte** dans la barre du bas y mène directement.

### C. Explorer le catalogue
- Menu **Produits** : catalogue complet lu en base, avec recherche, filtres par catégorie/pays et tri.
- Menu **Catégories** : navigation par catégorie.
- Fiche produit : photos, description, producteur, produits similaires.
- En haut à gauche : sélecteur de **marché** (Madagascar 🇲🇬 / Maurice 🇲🇺) et de **devise** (MGA, MUR, EUR) — les prix s'affichent convertis.

### D. Parcours d'achat complet ⭐ (le parcours clé)
1. Fiche produit → **Ajouter au panier** (ou « Acheter maintenant »).
2. Panier (icône 🛒) : modifier les quantités, supprimer. Livraison 15 €, **offerte au-delà de 200 €**.
   - Règle métier : le panier doit rester homogène par marché (pas de mélange produits Madagascar/Maurice).
3. **Passer commande** : 3 étapes — Adresse → Livraison (standard/express) → Paiement.
4. **Paiement simulé** (encart « environnement de démonstration ») :
   - **Confirmer le paiement** → la commande passe en *payée* en base, redirection vers la confirmation avec numéro de commande.
   - **Simuler un échec** → retour au checkout avec message d'erreur ; le panier est conservé, vous pouvez réessayer.
5. ✅ La commande est **réellement enregistrée** dans la base, visible ensuite dans « Mes commandes ».

### E. Suivre ses commandes
- **Mon compte → Mes commandes** (ou `/my-orders`) : liste des vraies commandes, statut, détail avec timeline (confirmée → payée → expédiée → livrée).
- Depuis une commande payée : bouton **Demander un remboursement** (voir G).

### F. Demander un devis
1. Sur une fiche produit : bouton **« Demander un devis »** (quantité, délai souhaité, message).
2. Fonctionne **connecté ou non** (sans compte, une référence de suivi vous est communiquée).
3. Suivi : **Mes devis** (`/my-quotes`). Lorsqu'une réponse prix/délai existe, vous pouvez l'**accepter** (génère une commande) ou la **refuser**.

### G. Demander un remboursement
1. Mes commandes → détail d'une commande payée → **Demander un remboursement**.
2. Formulaire : motif, description, montant, email de suivi.
3. Suivi : **Mes remboursements** (`/my-refunds`) avec numéro de dossier.
4. Un bandeau précise que l'email de confirmation est encore simulé.

### H. Suivi public sans compte
- Page **Suivi de commande** (`/track/NUMERO`) : entrez le numéro de commande reçu à l'étape D pour voir son statut, même déconnecté.

---

## 3. Parcours administrateur

Se connecter avec `admin@jerossa.mg`, puis ouvrir **/admin** (accès refusé pour tout compte non admin — c'est voulu, vous pouvez le vérifier avec le compte client).

| Onglet | Ce que vous pouvez faire |
|---|---|
| **Vue d'ensemble** | KPIs calculés en direct depuis la base : chiffre d'affaires payé, nombre de commandes / produits / utilisateurs, dernières commandes et notifications. |
| **Produits** | Liste réelle du catalogue : **activer/désactiver** un produit, **supprimer** (avec confirmation). |
| **Catégories** | Gestion complète : **créer, modifier, supprimer** une catégorie. |
| **Commandes** | Liste réelle, recherche/filtres, **changement de statut** (en attente → confirmée → payée → expédiée → livrée). |

> 🔁 Test croisé conseillé : passez une commande en client (parcours D), changez son statut en admin, puis constatez la nouvelle timeline côté client dans « Mes commandes ».

---

## 4. Ce qui est encore en simulation ou à venir (transparence)

| Élément | État actuel |
|---|---|
| Paiement réel (Mobile Money, carte, virement) | Simulé — intégration provider MG/MU prévue avant mise en prod |
| Emails transactionnels (confirmation, etc.) | Non activés — en attente du domaine professionnel |
| Mot de passe oublié | Page présente mais non branchée |
| Favoris / Wishlist | Vitrine non personnalisée (données d'exemple) |
| Carnet d'adresses & paramètres du compte | Maquettes (non enregistrées) |
| Édition/création de produits par l'admin | Activation/suppression seulement ; création via espace vendeur à venir |
| Espace vendeur complet (commandes reçues, KPIs, validation d'onboarding) | À venir |
| « Publier une offre » | Interface de démonstration |

---

## 5. Résumé — 10 minutes pour tout voir

1. **Client** (fenêtre privée) : créer un compte → ajouter 2 produits au panier → checkout → confirmer le paiement → voir la commande dans « Mes commandes ».
2. **Client** : demander un devis sur un produit → noter la référence.
3. **Admin** (fenêtre principale) : `/admin` → constater la commande dans les KPIs → passer son statut à « Expédiée ».
4. **Client** : rafraîchir « Mes commandes » → la timeline montre « Expédiée ». Tester aussi une demande de remboursement sur cette commande.
