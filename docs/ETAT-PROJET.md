# JEROSSA — État du projet

> Mise à jour : 27 août 2026
> Déploiement : Vercel (https://jerossa.vercel.app) · Base : Supabase (fsdfieofbbopmzuforck)

---

## 1. Ce qui a été fait

### Frontend (Vite + React + JS + CSS)
- **Pages publiques** : Home (hero HD optimisé), Catalogue, Catégorie, Recherche, Fiche produit, Boutique producteur, À propos, Contact, Blog/Article, Services, FAQ, pages légales (mentions, confidentialité, CGV), 404.
- **Auth** : Connexion, Inscription, Mot de passe oublié **+ réinitialisation complète** (`/forgot-password` → email → `/reset-password`) — branchées sur Supabase Auth (`AuthContext`).
- **Espace client** : Mes commandes (+ détail, suivi), Mes devis (+ détail), Mes remboursements (+ demande, détail), Mes adresses, Favoris/Wishlist, Paramètres.
- **Panier → Checkout → Paiement → Confirmation** avec règle de panier homogène en devise (MGA/MUR) via `CurrencyContext`.
- **Espace vendeur (partiel)** : page Publier une offre — formulaire complet avec upload réel des photos vers Storage (aperçus, validation type/taille/nombre, suppression).
- **Espace vendeur (espace complet)** : après validation de la boutique (10 août), l'espace `/espace-vendeur` (protégé par `ProtectedSellerRoute`) donne accès à : tableau de bord (KPIs CA/commission/net + dernières commandes), produits (liste, activation, édition), commandes reçues, devis reçus (avec réponse), et fiche boutique. Backend via `src/services/seller.js` (RPC `fetch_my_orders`, `respond_to_quote`, `update_my_shop`, politiques RLS par `my_producer_id()`).
- **Dashboard admin** : KPIs, gestion produits/catégories/commandes/utilisateurs, route protégée par rôle (`ProtectedAdminRoute`).
- Responsive mobile/tablette soigné ; animations au scroll ; rewrite SPA configuré sur Vercel.

### Backend Supabase (13 migrations)
1. `core_tables` — profiles, producers, categories, products…
2. `auth_rls` — trigger `handle_new_user`, RLS profils/produits…
3. `catalog_public_ids` + `seed_catalog` — catalogue de départ.
4. `orders` — RPC `create_order`, `confirm_payment` (security definer).
5. `quotes` — RPC création/réponse/acceptation/refus de devis.
6. `payments` — suivi des paiements.
7. `refunds_email` — RPC `request_refund`, table refunds, base `email_logs`.
8. `admin_rls` + `seed_admin` — accès admin, compte administrateur.
9. `storage_buckets` (24 août) — buckets `product-images` (public, 5 Mo) et `seller-documents` (privé, 10 Mo), policies RLS par dossier `{uid}` + accès admin.
10. `seller_onboarding` (26 août) — colonnes vendeur + RLS candidature/approuvé (cf. § 26 août).
11. `seller_space` (26 août) — espace vendeur : RPC `fetch_my_orders`, `update_my_shop`, `respond_to_quote`. RLS commandes/devis remontés au vendeur.

### Session debug du 21 août (auth 500)
- Diagnostic complet du 500 sur `/auth/v1/token?grant_type=password`.
- **3 causes cumulées** dans le seed manuel de l'admin :
  1. absence de ligne dans `auth.identities` (obligatoire pour le login password) ;
  2. colonnes texte à `NULL` (`email_change`, etc.) que GoTrue refuse de scanner ;
  3. schéma `auth` ancien (pas de `phone_change_token_new`, colonne `provider` requise).
- Compte admin réparé et connexion vérifiée fonctionnelle (HTTP 200).
- Migration `20260820000002_seed_admin.sql` réécrite : idempotente, identité créée, colonnes texte jamais NULL.

### Session du 21 août (compte admin client)
- **cboyjoo22@gmail.com** promu admin : compte créé manuellement via SQL (insert `auth.users` + `auth.identities` + `public.profiles` rôle `admin`, mot de passe communiqué au client — même recette que `seed_admin.sql`).
- Piège rencontré : créer le user via l'onglet Authentication ne garantit pas la ligne dans `profiles` (trigger `handle_new_user` non déclenché) → toujours vérifier avec un join `auth.users ↔ profiles`.

### Session du 24 août (CLI, reset password, storage)
- **Outiling** : Supabase CLI installée (npm global, v2.115), login par Personal Access Token, `supabase link` sur le projet. Token stocké dans `.env.local` (`SUPABASE_ACCESS_TOKEN`, ignoré par Git) — à recréer en secret CI/CD le moment venu.
- **Historique migrations resynchronisé** : les 10 migrations appliquées à la main au SQL Editor ont été marquées via `migration repair` ; `db push` désormais fiable.
- **Reset mot de passe livré** : `ForgotPassword.jsx` branché + page `/reset-password` créée + route ajoutée. Redirections autorisées via Management API (`uri_allow_list`) : `https://jerossa.vercel.app/**` et `http://localhost:5173/**`.
- **Storage opérationnel** : migration `20260824000001_storage_buckets.sql` poussée en prod (buckets + 8 policies). `Publish.jsx` téléverse réellement les photos (dossier `{uid}/`, aperçus, max 6 × 5 Mo, JPG/PNG/WebP). Vérifié en prod : MIME non autorisé rejeté.
- **Limite actuelle** : la publication ne crée une ligne `products` que pour les vendeurs approuvés (depuis le 26 août) — sinon l'offre reste un aperçu simulé.
- Déployé sur Vercel (commits `e585767` + `3475981`). À tester : réception du mail de recovery en conditions réelles.

### Session du 26 août (onboarding vendeur)- **Migration `20260826000001_seller_onboarding.sql`** poussée via CLI (`db push`) :
  - `producers` : colonnes `user_id` (unique, lien auth ↔ vendeur), `status` (`pending/approved/rejected/suspended`, défaut `approved` pour préserver le seed), `contact_email`, `phone`, `payment_info` (jsonb), `documents` (jsonb), `review_note`, `submitted_at`, `reviewed_at`.
  - Helper `my_producer_id()` (security definer) : id du producteur approuvé de l'utilisateur courant.
  - RLS : candidature par l'utilisateur (`producers_insert_own`, toujours `pending`), re-soumission possible après refus (`producers_update_own` — le `with check status='pending'` empêche TOUTE auto-validation), visibilité publique limitée aux boutiques `approved` (+ sa propre fiche + admin).
  - RLS produits côté vendeur : insert/update/delete sur ses propres produits si `seller_id = my_producer_id()`, avec `verified=false` imposé (seule l'admin vérifie). Limitation MVP : un produit déjà vérifié n'est plus éditable par son vendeur.
- **Front** : pages `/vendeur/devenir` (`BecomeSeller.jsx` — formulaire complet + upload des pièces vers `seller-documents`, min. 1 pièce requise) et `/vendeur/statut` (`SellerStatus.jsx` — suivi temps réel par statut). CSS partagée `SellerOnboarding.css`. Lien « Devenir vendeur » ajouté au footer. Lint + build OK.
- **Section admin « Vendeurs »** (`SellersSection.jsx`, nav Communauté) : liste des boutiques liées à des comptes, filtres par statut, recherche, modale d'examen complète (infos, paiement, description), consultation des pièces via URLs signées 10 min sur le bucket privé, actions Valider / Refuser / Suspendre / Réactiver avec motif. Services `fetchSellerApplications` / `updateProducerStatus` / `getDocumentSignedUrl`.
- **Publication réelle dans `Publish.jsx`** : si l'utilisateur a une boutique approuvée, le formulaire produit insère réellement dans `products` (`product_code` auto, slug unique, catégorie résolue par slug, market MGA→MG / MUR→MU, `verified=false`). Bandeau de statut vendeur sinon (aperçu simulé conservé). Écran de succès dédié avec liens produit/boutique.
- **RLS testée en conditions réelles** via Management API (contexte `authenticated` simulé par JWT factice, transaction rollback) : insertion produit par vendeur approuvé OK ; insertion vers un `seller_id` inconnu bloquée ; auto-approbation d'une candidature bloquée ; lecture de sa propre candidature OK. Aucune donnée de test résiduelle.

### Session du 27 août (fin de l'espace vendeur + audit global)
- **Espace vendeur complété et corrigé** : le dossier `src/seller/` (écrit pendant l'audit) a été entièrement vérifié puis commité. Correctifs appliqués :
  - `fetchMyOrders` (`seller.js`) réécrit pour appeler l'RPC `fetch_my_orders` (les `select` directs étaient bloqués par RLS → commandes vides).
  - `SellerLayout` : état de chargement distinct + erreur « Réessayer » (évitait un spinner infini si `producer` null).
  - `SellerProducts` : activation désactivée pour les produits vérifiés (RLS impose `verified=false`).
  - Bug majeur : `fetchMyQuotes` traitait `quote_responses` (tableau embarqué) comme un objet → **NaN** affiché dans `SellerQuotes`. Corrigé avec accès `[0]` (même shape que `quotes.js`).
- **Bugs admin corrigés** : `fetchAdminQuotes` (même bug d'embed `[0]`, latent) ; `updatePlatformSetting` (`.upsert().eq()` invalide en PostgREST → `onConflict: 'key'`).
- **Audit complet** (build + lint verts) : écrans clients, pages publiques, câblage admin (9 onglets ↔ 9 sections), Auth (trigger `on_auth_user_created` → `profiles`), publish/insert produits — aucun autre bug prouvé.

---

## 2. Ce qui reste à faire

### Bloquant (avant mise en production)
- [ ] **Provider de paiement MG/MU** — choix client (Orange Money/MVola/carte ; MCB/SBM) puis intégration réelle via Edge Functions (`createPayment`, `verifyPayment`, webhook). Actuellement simulé.
- [ ] **Emails transactionnels** — Edge Function `emailService` + Resend (15 templates prévus au MVP, §9 du document de conception). Rien n'est branché aujourd'hui.
- [x] ~~**Storage Supabase**~~ — **fait le 24 août** : buckets `product-images` (public) + `seller-documents` (privé) créés via migration `20260824000001`, policies RLS par dossier `{uid}`, upload réel branché dans `Publish.jsx`. Reste : brancher les pièces justificatives dans l'onboarding vendeur.

### Fonctionnel
- [x] ~~**Onboarding vendeur**~~ — **fait le 26 août** : demande « Devenir vendeur » (`/vendeur/devenir`) avec upload pièces vers `seller-documents`, page statut (`/vendeur/statut`), migration RLS complète, **section admin de validation/refus/suspension**, **création réelle de produits dans `Publish.jsx`** (backend + front branchés, RLS testée).
- [x] ~~**Espace vendeur**~~ — **fait le 27 août** : commandes reçues, devis reçus (avec réponse), profil boutique, KPIs (CA/commission/net) dans `/espace-vendeur` (tableau de bord, produits, commandes, devis, fiche boutique). Backend RLS + RPC (`fetch_my_orders`, `respond_to_quote`, `update_my_shop`).
- [ ] Espace admin : remboursements (traitement), paiements, devis, activité/logs, paramètres plateforme (livraison, commission). Tables + RPC déjà en place (`fetchAdminRefunds`/`processRefund`/`fetchAdminQuotes` existent mais aucun onglet/ui ne les consomme) — pur front.
- [x] ~~**Réinitialisation de mot de passe**~~ — **fait le 24 août** : `ForgotPassword.jsx` branché sur `resetPasswordForEmail` + nouvelle page `/reset-password` (`ResetPassword.jsx`, `updateUser({password})`). Redirections autorisées côté Supabase : `jerossa.vercel.app/**` + `localhost:5173/**`. À tester en réel après déploiement Vercel.

### Technique / hygiène
- [x] ~~**Synchroniser l'historique des migrations**~~ — **fait le 24 août** : CLI liée au projet (`supabase link`), `migration repair` exécuté sur les 10 migrations historiques, `db push` opérationnel.
- [ ] README toujours sur le template Vite par défaut — à remplacer.

---

## 3. Améliorations pour la prochaine fois

### Leçons du debug auth (à ne pas reproduire)
1. **Ne jamais insérer directement dans `auth.users` / `auth.identities`** : schéma interne non documenté, variable selon la version du projet. Utiliser le Dashboard (Authentication → Add user), l'API admin (`auth.admin.createUser`) ou `supabase.auth.signUp`. Si un insert SQL est vraiment nécessaire : identité obligatoire + toutes les colonnes texte à `''` (jamais NULL).
2. **Appliquer les migrations via la CLI** (`supabase db push`) et pas à la main dans le SQL Editor : historique fiable, rollback possible, un seul environnement de vérité.
3. **Tester les migrations en local d'abord** (`supabase start` + `db reset`) — aurait révélé les problèmes d'identités/colonnes NULL en 2 minutes au lieu d'une session de debug.
4. **En cas de 500 Supabase Auth, aller directement dans Logs → service « Auth »** (pas les logs Edge/API) : le `error_id` de la réponse y correspond à l'erreur PostgreSQL exacte. C'est ce qui a débloqué le diagnostic en une étape.
5. **La CLI Supabase ne se connecte plus par email/mot de passe** : Personal Access Token obligatoire (Dashboard → Account → Tokens) ou flow navigateur. Le token est sensible — jamais dans Git, uniquement `.env.local` local ou secrets CI/CD.
6. **Config Auth via Management API** : `PATCH /v1/projects/{ref}/config/auth`. Champ `uri_allow_list` = liste **séparée par des virgules** (les retours à la ligne sont silencieusement supprimés). Vérifier ensuite avec un GET — le PATCH renvoie une valeur qui peut différer de ce qui est stocké.

### Montée en qualité
5. **Passer à TypeScript** comme prévu au document de conception (§1.1) — le code est actuellement en JSX.
6. **CI minimale** : lint (oxlint) + build avant chaque déploiement Vercel.
7. **Variables d'environnement par environnement** (dev/prod) et ne jamais exposer autre chose que la clé publishable côté front.
8. **Compte de test par rôle** (customer/seller/admin) documentés dans le README, créés proprement via le dashboard.
9. **Supabase Advisor** (dashboard → Advisors) régulièrement : détecte RLS manquantes, index, sécurité.
10. Sauvegarde/backup du projet activée (Plan Supabase) avant toute manipulation du schéma `auth`.

---

*Document de référence produit : `docs/PREPARATION-MVP.md` (conception v2.0 — 54 écrans, flows, design system, emails, données).*
