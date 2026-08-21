# JEROSSA — État du projet

> Mise à jour : 21 août 2026
> Déploiement : Vercel (https://jerossa.vercel.app) · Base : Supabase (fsdfieofbbopmzuforck)

---

## 1. Ce qui a été fait

### Frontend (Vite + React + JS + CSS)
- **Pages publiques** : Home (hero HD optimisé), Catalogue, Catégorie, Recherche, Fiche produit, Boutique producteur, À propos, Contact, Blog/Article, Services, FAQ, pages légales (mentions, confidentialité, CGV), 404.
- **Auth** : Connexion, Inscription, Mot de passe oublié — branchées sur Supabase Auth (`AuthContext`).
- **Espace client** : Mes commandes (+ détail, suivi), Mes devis (+ détail), Mes remboursements (+ demande, détail), Mes adresses, Favoris/Wishlist, Paramètres.
- **Panier → Checkout → Paiement → Confirmation** avec règle de panier homogène en devise (MGA/MUR) via `CurrencyContext`.
- **Espace vendeur (partiel)** : page Publier un produit (UI seule — upload non branché).
- **Dashboard admin** : KPIs, gestion produits/catégories/commandes/utilisateurs, route protégée par rôle (`ProtectedAdminRoute`).
- Responsive mobile/tablette soigné ; animations au scroll ; rewrite SPA configuré sur Vercel.

### Backend Supabase (10 migrations)
1. `core_tables` — profiles, producers, categories, products…
2. `auth_rls` — trigger `handle_new_user`, RLS profils/produits…
3. `catalog_public_ids` + `seed_catalog` — catalogue de départ.
4. `orders` — RPC `create_order`, `confirm_payment` (security definer).
5. `quotes` — RPC création/réponse/acceptation/refus de devis.
6. `payments` — suivi des paiements.
7. `refunds_email` — RPC `request_refund`, table refunds, base `email_logs`.
8. `admin_rls` + `seed_admin` — accès admin, compte administrateur.

### Session debug du 21 août (auth 500)
- Diagnostic complet du 500 sur `/auth/v1/token?grant_type=password`.
- **3 causes cumulées** dans le seed manuel de l'admin :
  1. absence de ligne dans `auth.identities` (obligatoire pour le login password) ;
  2. colonnes texte à `NULL` (`email_change`, etc.) que GoTrue refuse de scanner ;
  3. schéma `auth` ancien (pas de `phone_change_token_new`, colonne `provider` requise).
- Compte admin réparé et connexion vérifiée fonctionnelle (HTTP 200).
- Migration `20260820000002_seed_admin.sql` réécrite : idempotente, identité créée, colonnes texte jamais NULL.

---

## 2. Ce qui reste à faire

### Bloquant (avant mise en production)
- [ ] **Provider de paiement MG/MU** — choix client (Orange Money/MVola/carte ; MCB/SBM) puis intégration réelle via Edge Functions (`createPayment`, `verifyPayment`, webhook). Actuellement simulé.
- [ ] **Emails transactionnels** — Edge Function `emailService` + Resend (15 templates prévus au MVP, §9 du document de conception). Rien n'est branché aujourd'hui.
- [ ] **Storage Supabase** — images produits (Publish.jsx est une maquette) + pièces justificatives vendeurs (bucket privé).

### Fonctionnel
- [ ] Onboarding vendeur complet : demande « Devenir vendeur », upload pièces, validation/refus/suspension par l'admin.
- [ ] Espace vendeur : commandes reçues, devis reçus, profil boutique, KPIs (CA/commission/net).
- [ ] Espace admin : remboursements (traitement), paiements, devis, activité/logs, paramètres plateforme (livraison, commission).
- [ ] Réinitialisation de mot de passe (page existe, vérifier le flux email Supabase).

### Technique / hygiène
- [ ] **Synchroniser l'historique des migrations** : elles ont été appliquées à la main (SQL Editor) ; `supabase_migrations.schema_migrations` est vide → faire `supabase migration repair` avant tout `db push`, sinon ré-exécution complète = erreurs.
- [ ] README toujours sur le template Vite par défaut — à remplacer.
- [ ] Commiter la migration seed_admin corrigée (en cours, non commitée).

---

## 3. Améliorations pour la prochaine fois

### Leçons du debug auth (à ne pas reproduire)
1. **Ne jamais insérer directement dans `auth.users` / `auth.identities`** : schéma interne non documenté, variable selon la version du projet. Utiliser le Dashboard (Authentication → Add user), l'API admin (`auth.admin.createUser`) ou `supabase.auth.signUp`. Si un insert SQL est vraiment nécessaire : identité obligatoire + toutes les colonnes texte à `''` (jamais NULL).
2. **Appliquer les migrations via la CLI** (`supabase db push`) et pas à la main dans le SQL Editor : historique fiable, rollback possible, un seul environnement de vérité.
3. **Tester les migrations en local d'abord** (`supabase start` + `db reset`) — aurait révélé les problèmes d'identités/colonnes NULL en 2 minutes au lieu d'une session de debug.
4. **En cas de 500 Supabase Auth, aller directement dans Logs → service « Auth »** (pas les logs Edge/API) : le `error_id` de la réponse y correspond à l'erreur PostgreSQL exacte. C'est ce qui a débloqué le diagnostic en une étape.

### Montée en qualité
5. **Passer à TypeScript** comme prévu au document de conception (§1.1) — le code est actuellement en JSX.
6. **CI minimale** : lint (oxlint) + build avant chaque déploiement Vercel.
7. **Variables d'environnement par environnement** (dev/prod) et ne jamais exposer autre chose que la clé publishable côté front.
8. **Compte de test par rôle** (customer/seller/admin) documentés dans le README, créés proprement via le dashboard.
9. **Supabase Advisor** (dashboard → Advisors) régulièrement : détecte RLS manquantes, index, sécurité.
10. Sauvegarde/backup du projet activée (Plan Supabase) avant toute manipulation du schéma `auth`.

---

*Document de référence produit : `docs/PREPARATION-MVP.md` (conception v2.0 — 54 écrans, flows, design system, emails, données).*
