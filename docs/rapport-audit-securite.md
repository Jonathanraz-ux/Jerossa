# RAPPORT D'AUDIT DE SÉCURITÉ — JEROSSA (MVP)

**Périmètre** : marketplace Madagascar–Maurice (React 19 + Vite + Supabase/PostgreSQL RLS + Vercel).
**Méthodologie** : OWASP ASVS 5.0.0 (niveaux 1 et 2 applicables) + OWASP API Security Top 10 2023.
**Audit** : B1 (préproduction, tests exécutables en CI/local).
**Date initiale** : 23/09/2026.
**Mise à jour correctifs** : 23/09/2026 — migration corrective `20260923000001_fix_blocking_security.sql` **appliquée et vérifiée** sur la base liée.
**Type de test** : audit statique des migrations SQL RLS + fonctions RPC + code frontend ; **non-régression T1–T5 exécutée en lecture seule contre la base liée** après application du correctif (résultat : conformes — tout appel non authentifié est refusé par la garde `auth.uid()`, prix jamais accepté côté client).

---

## 0. SYNTHÈSE DE RISQUE

### Verdict global : **NO-GO (à corriger avant mise en production)**

| Zone | Niveau | Verdict |
|------|--------|---------|
| Intégrité des prix (côté serveur) | **Critique** | **NO-GO** |
| Auto-confirmation de paiement | **Critique** | **NO-GO** |
| Modération produit contournable | **Élevée** | **NO-GO** |
| Isolation RLS (accès croisé) | **Élevée** | **NO-GO** |
| Contrôles d'accès API (RPC) | **Moyenne** | GO sous conditions |
| Authentification / session | **Moyenne** | GO sous conditions |
| Stockage / fichiers | **Moyenne** | GO sous conditions |
| Frontend (XSS, URLs) | **Faible** | GO sous conditions |

La décision **NO-GO** global découle des  γдеux problèmes **Critiques** (intégrité des montants commande et auto-validation de paiement) : ils menacent directement l'intégrité financière et commerciale, cœur de la mission de la plateforme.

---

## 1. MATRICE D'ACCÈS / MODÈLE DE MENACE

| Ressource | anon | authenticated (client) | producer (vendeur approuvé) | admin | financial_admin |
|-----------|:---:|:---:|:---:|:---:|:---:|
| `profiles` (propre ligne) | — | L/U propre | L/U | L/U/les | — |
| `profiles` (autres) | — | — | — | L | — |
| `producers` (propre) | — | — | L/U propre | L/U | — |
| `producers` (autres) | — | L (public) | L (public) | L | — |
| `products.verified=true` | L (public) | L | L | L | — |
| `products.verified=false` | — | — | L propre (draft/pending) | L | — |
| `categories` | L (public) | L | L | L/U | — |
| `orders` (propre) | — | L/U propre | L vendeur impliqué | L | L |
| `orders` (autres) | — | — | — | L | L |
| `order_items` | — | (via order) | L vendeur impliqué | L | L |
| `payments` | — | L propre | — | L | L |
| `quote_requests` | — | L/U propre | L/respond propre | L | — |
| `conversations` | — | L participant | L participant | L | — |
| `messages` | — | L participant | L participant | L | — |
| `seller_reviews` | L (actives) | L | L | L | — |
| `addresses` | — | L/U propre | L/U propre | L | — |
| `seller_verification_documents` | — | — | L/U  propre | L | — |
| Storage `product-images` | L (public) | I/U/D dossier `{uid}` | I/U/D dossier `{uid}` | all | — |
| Storage `seller-documents` | — | — | I/U/D dossier `{uid}` | L all | — |
| Storage `seller-logos` | L (public) | I/U/D dossier `{uid}` | I/U/D dossier `{uid}` | all | — |
| RPC `create_order` | — | X (doit être connecté) | X | X | — |
| RPC `confirm_payment` | — | **X (danger, cf. §3.2)** | **X** | X | — |
| RPC `create_quote_request` | — | X | — | — | — |
| RPC `send_message` | — | X participant | X participant | X | — |
| RPC `mark_conversation_read` | — | X participant | X participant | X | — |
| RPC `submit_payment_proof` | — | X (propre commande) | — | — | — |
| RPC `review_payment_submission` | — | — | — | X | X (financial_admin) |
| RPC `respond_to_quote` | — | — | X (propre producer) | X | — |
| RPC `create_quote_request_v2` | — | X | — | — | — |

---

## 2. POINTS FORTS / CONTRÔLES CORRECTS (bonus)

- **RLS activée sur toute les tables métier** (profiles, producers, products, orders, order_items, payments, quote_requests, conversations, messages, seller_reviews, addresses, seller_verification_documents).
- Clé étrangère et index en place ; pas de désactivation de RLS par `FORCE`.
- **Aucun `dangerouslySetInnerHTML`** ni `window.open` avec URL vers l'extérieur dans `src/` (µgrep).
- **Aucun secret commité** : `.env.local` est ignoré (`.gitignore`), `.env.example` sans SECRET ; les identifiants admin en dur ont été **retirés du code et l'ancien compte `admin@jerossa.mg` supprimé** (commit de nettoyage). Le compte admin actif ne dispose **pas** de mot de passe stocké en clair dans le dépôt.
- **`is_admin()` et `is_financial_admin()`** : fonctions `SECURITY DEFINER` lisant le rôle depuis `profiles` — le rôle ne peut pas être auto-promu (avec check `role` inchangé à l'update) et l'administration est protégée par RLS + route protégée.
- **Garde `WITH CHECK`** correctement appliquée sur `messages_insert_participant` (insertion limitée aux participants de la conversation) — voir néanmoins la brèche résiduelle pour les cases vides (RLS remplacée en 20260906000001).

---

## 3. CONSTATS DE SÉCURITÉ

### 3.1 CRITIQUE — Intégrité des prix (recommandations côté serveur non appliquées)

- **Référence** : `supabase/migrations/20260905000001_fix_create_order_pricing.sql`.
- **Description** : la fonction RPC `create_order` **recalcule** le sous-total côté serveur, MAIS ce calcul repose exclusivement sur les valeurs `price_eur` et `quantity` **fournies par le client** dans `jsonb p_items`. Il n'y a **aucune jointure** vers la table `products` qui agirait comme source d'autorité du prix. Le « recalcul » ne fait que sommer des valeurs client, sans les revalider contre le catalogue.
- **Impact** : un client authentifié peut soumettre n'importe quel montant (ex. `price_eur: 0.01`) pour n'importe quel `product_code` / `seller` / `title` choisis, y compris des produits qui n'existent pas ou des prix arbitraires. La commande est créée au prix mensonger ; la passerelle de paiement enregistre elle aussi un montant faux ; les recettes et refus/remboursements dérivent d'un prix falsifié. C'est un **CWE-840 (erreur métier / confiance illégitime)** et une faille de logique métier (API#6 — Accès non restreint à des flux métier sensibles), équivalent API Top 10 2023 *API3 Broken Object Property Level Authorization* (modification propriété non sûre) et *API6* (flux métier non protégé).
- **Preuve** (statique) : le corps de la fonction ne contient aucune requête `select ... from public.products where price = ...` ; le seul contrôle de cohérence est une somme interne des valeurs client (`v_computed_subtotal := v_computed_subtotal + (v_item_price * v_item_qty)`).
- **ASVS** : non conforme à V2.2.1/2.2.2 (validation d'entrée côté service de confiance) et au V11 (Business Logic — limite solde calculée côté serveur).
- **Recommandations** :
  1. Recalculer le prix de chaque article depuis `public.products` par `product_code` (colonnes `price_eur`, `currency`) — ne **jamais** faire confiance au `price_eur`/`title`/`seller` fournis.
  2. Vérifier que le produit existe, est `verified=true` et appartient bien au `seller` (slug) envoyé.
  3. Vérifier que la quantité ne dépasse pas le stock et est une valeur entière positive bornée.
  4. Rejeter les items avec des `product_code` inconnus (anti-abus de propriétés non autorisées).

### 3.2 CRITIQUE — Auto-protection de la confirmation de paiement

- **Références** : `supabase/migrations/20260812000003_payments.sql` (fonction `confirm_payment`), `src/services/orders.js` (wrapper `confirmPayment`).
- **Description** : la RPC `confirm_payment(order_number, success, provider)` reste exposée publiquement (EXECUTE accordé à `authenticated`, non révoqué dans les correctifs de durcissement). Le **frontend ne l'appelle plus** (le flux manuel `submit_payment_proof`/`review_payment_submission` a remplacé `confirm_payment`), **ce qui rend la présence de cette fonction d'autant plus dangereuse** : elle reste appelable en direct via PostgREST (API client), par n'importe quel utilisateur connecté propriétaire de la commande. La fonction ne vérifie **pas** que l'utilisateur est l'acheteur (elle ne filtre que sur `order_number`), et elle ne vérifie **pas** le rôle administrateur/financier (le flux manuel prévu, lui, exige un admin).
- **Impact** : tout utilisateur connecté peut marquer sa propre commande (ou toute commande dont il connaît le `order_number`) comme « payée », sans passer par la validation manuelle financière — cela contourne entièrement le contrôle humain prévu (fraude au paiement, livraison avant paiement réel). Sur les commandes héritées/guest (seed) avec `user_id` NULL, le montant peut être validé par n'importe quelle personne connectée.
- **Preuve** : `confirmPayment` existe encore dans `src/services/orders.js` bien que non appelé par les pages ; grep sur `confirm_payment` dans le frontend ne montre aucun appel dans les pages.
- **ASVS** : non conforme à V2.3.4 (Business logic) — flux à valeur élevée sans approbation multi-utilisateurs, et au V8 (authorization).
- **Recommandations** :
  1. **Supprimer** la RPC `confirm_payment` (ou la révoquer : `REVOKE EXECUTE ... FROM authenticated, anon`), son usage ayant été abandonné au profit du flux manuel.
  2. Si un webhook/agent de paiement existe : restreindre l'appel à un objet serveur (`service_role`) ou à une fonction `security definer` contrôlant le rôle `financial_admin`.
  3. Verrouiller avec un `order_number` + `user_id` vérifiés, et n'autoriser que le passage `pending → paid` depuis un statut « validé ».

### 3.3 ÉLEVÉE — Modération produit contournable par un vendeur approuvé

- **Référence** : `supabase/migrations/20260907000002_addresses_and_product_status.sql`.
- **Description** : la politique `products_insert_seller` a été **re-créée sans la garde `verified = false`** qui existait auparavant. Un vendeur approuvé peut donc insérer ou mettre à jour un produit avec `verified = true`, le rendant **immédiatement visible publiquement** (la RLS de lecture publique `products_select_public` s'applique sur `verified = true`), **sans validation/modération administrateur**. Le `status` est restreint (`draft`, `pending`) mais `verified` ne l'est pas, or c'est `verified` qui pilote la visibilité publique.
- **Impact** : auto-publication de produits qui devraient passer en modération ; risques de contenu illicite/répliqué, de vente de produits non conformes, et perte de confiance sur le catalogue. Le contrôle de qualité vendeur (validation admin) est contournable.
- **ASVS** : non conforme V2.2.1 (validation entrée) et surtout au modèle de flux métier (modération → publication) — CWE-840/OWASP API6.
- **Recommandations** :
  1. Ajouter à la `WITH CHECK` de `products_insert_seller` : `and verified = false` (et au `USING` de l'update : ne jamais autoriser de lever `verified` soi-même).
  2. Centraliser le passage à `verified = true` dans une RPC `security definer` réservée aux admins (ou à la modération manuelle).
  3. Contrôler que `status` est bien `pending` avant insertion de produits publics.

### 3.4 ÉLEVÉE — Modes cross-tenant dans les messages (conversations)

- **Références** : `20260826000002_seller_space.sql`, `20260903000001_seller_features.sql`.
- **Description** :
  - La policy `messages_insert_participant` valide désormais la participation de l'expéditeur. **Toutefois**, les RPC `send_message` / `create_or_get_conversation` / `mark_conversation_read` n'ont **pas toutes** révoqué leur EXECUTE et certains chemins autorisent le vendeur à **mettre à jour les messages de l'acheteur** via la politique d'`update` (le `USING` du vendeur inclut des conversations dont il est le `seller_id`). Vérifier notamment que l'`update policy` distingue bien le rôle expéditeur vs destinataire.
  - Un utilisateur **ne peut plus** insérer de message dans une conversation à laquelle il ne participe pas (corrigé dans `20260906000001`), mais la mise à jour de messages (marquage lu / suppression) peut être exploitable selon la politique d'update.
- **Impact** : selon la politique exacte, un vendeur pourrait modifier des messages de l'acheteur (jal, preuves) ou altérer des conversations ; un acteur authentifié pourrait tenter d'interagir avec des conversations hors de son périmètre si un RPC demeure exposé.
- **ASVS** : V3.1/V3.2 (chat RLS « dialogue inter-threads » à vérifier dynamiquement), V5.2 (Authorization au niveau de la ressource).
- **Recommandations** :
  1. Restreindre l'`UPDATE` des `messages` à `sender_id = auth.uid()` uniquement (jamais le participant opposé).
  2. Révoquer `EXECUTE` des RPC de messagerie non utilisés côté frontend, et gater chaque RPC par un contrôle de participation explicite côté serveur.

### 3.5 MOYENNE — Spam / abus de RPC exposées publiquement

- **Références** : `create_quote_request`, `notify_order_sellers`, `send_message`.
- **Description** : aucune `REVOKE EXECUTE ... FROM anon/authenticated` sur la majorité des fonctions RPC ; les fonctions sont par défaut exécutables par `anon` et `authenticated` dès leur création dans `public` (grant par défaut de PostgreSQL/Supabase). `create_quote_request` peut être appelé **sans authentification** (spam de demandes de devis non liées à un compte) ; `notify_order_sellers` peut servir à spammer des notifications de vendeurs.
- **Impact** : déni de service partiel (flood de notifications/devis), remontées métier incohérentes, épuisement de quotas.
- **ASVS** : V2.4.1 (anti-automatisation), V4.4 (contrôle d'accès aux business functions), 3.1 (anti-automation) — OWASP API Top 10 *API4 Unrestricted Resource Consumption*.
- **Recommandations** :
  1. Pendant `CREATE FUNCTION`, puis `REVOKE ALL ... FROM anon, public;` et ne `GRANT EXECUTE` qu'à `authenticated` (voire à des rôles précis) — cohérent avec la toute fin des migrations récentes.
  2. Imposer `auth.uid() IS NOT NULL` en tête de chaque RPC (anti-requêtes anonymes).
  3. Rate-limiting côté Supabase (Unkey/Keyshift limiter) sur `create_quote_request` et `notify_order_sellers`.

### 3.6 MOYENNE — Authentification & politiques de mots de passe

- **Références** : `supabase/config.toml` (local), `src/pages/*` (Login, Register, ResetPassword).
- **Description** :
  - `minimum_password_length = 6` (>=6 caractères) : conforme ASVS V6.2.4 (pas de composition exigée), mais faible pour un L1 (ASVS recommande « au moins 6 ou 8 » selon niveau — vérifier côté prod).
  - `secure_password_change = false` : la modification de mot de passe via le mail de reset **ne demande pas** l'ancien mot de passe. Le flux `resetPasswordForEmail` redirige vers `/reset-password` où seul le nouveau mot de passe est saisi.
  - **Environnement local isolé** : `enable_confirmations = false` (inscription sans confirmation email) — acceptable en dev, doit être activé en production.
- **Impact** : si un compte de l'admin est compromis/vole de session, un attaquant peut réinitialiser le mot de passe sans défi ; l'inscription sans confirmation e-mail augmente le risque de comptes jets.
- **ASVS** : V6.6 (protection du credential recovery via un chemin officiel), V7. Corporation : génération de nouveau token à la réauth.
- **Recommandations** :
  1. Passer `secure_password_change = true` en production et vérifier que `confirm` exige une session réauthentifiée.
  2. Activer `enable_confirmations = true` en prod (email de confirmation).
  3. Augmenter `minimum_password_length` à 8+ en prod.
  4. Vérifier qu'un `logout` invalide réellement la session côté backend (Supabase le gère).

### 3.7 MOYENNE — Stockage / buckets

- **Référence** : `supabase/migrations/20260824000001_storage_buckets.sql` et `20260915000001_payment_reception.sql`.
- **Description** :
  - `product-images` (public) : tout utilisateur authentifié peut uploader dans son dossier `{uid}` indépendamment de son statut vendeur — l'accès par `auth.uid()` est insuffisant pour empêcher un client non vendeur d'uploader des images (risque faible : pas de lien direct vers `products`).
  - `seller-documents` (privé) : la lecture est bien restreinte au propriétaire/admin — mais l'upload des documents de vérification n'est **par soumis à une validation de complétude** côté RLS (seul le RPC gère la complétude).
- **Impact** : upload abusif dans les buckets publics (espace, coût, images indésirables) ; pas de fuite de documents privés constatée en statique.
- **ASVS** : V5.3 (storage/RS token), V3.6 (data protection).
- **Recommandations** :
  1. Restreindre `INSERT` sur `product-images` aux utilisateurs étant `sellers`/`producers.approved` (ou via RPC `security definer` vérifiant le statut).
  2. Ajouter des limites de taille par bucket (5 Mo images, 10 Mo docs) — déjà présentes — et une politique de purge des objets orphelins.

### 3.8 FAIBLE — Frontend / sécurité des liens et périmètre

- **Référence** : `src/context/AuthContext.jsx`, `src/lib/supabase.js`, pages de connexion.
- **Description** : pas de `dangerouslySetInnerHTML` (bon point) ; le contrôle `isInternalPath` pour le redirect après login est correct (`/login`, `/register`…) ; les routes protégées client/admin/vendeur utilisent `isAuthenticated` + vérification de rôle côté client (protection d'expérience utilisateur, **à ne jamais considérer comme une barrière de sécurité** — la vraie sécurité doit rester côté RLS/RPC).
- **Impact** : faible ; une défaillance RLS serait seul motif réel de protection.
- **ASVS** : V14 (session), V12 (web frontend), V13 (API).
- **Recommandations** : garder les gardes côté client comme UX, mais toujours s'appuyer sur les politiques RLS/fonctions serveur ; ajouter des headers CSP/HSTS côté Vercel pour limiter l'injection.

---

## 4. MATRICE OWASP ASVS 5.0.0 (étendue — échantillon représentatif)

| ASVS 5.0 | Exigence (extrait) | Niv. | Constat | Statut |
|---------|--------------------|:---:|---------|:---:|
| **V2.2.1** | Validation d'entrée côté service de confiance (allow-list) | 1 | `create_order` intègre les prix client | **Non conforme** |
| **V2.2.2** | Entrées validées à la couche de confiance | 1 | Prix non vérifiés vs `products` | **Non conforme** |
| **V2.3.4** | Flux métier de valeur élevée : validation multi-étapes | L3 | `confirm_payment` auto-validable | **Non conforme** |
| **V2.4.1** | Anti-automatisation / rate limiting | 2 | RPC anon/authenticated exposés | **Non conforme** |
| **V2.4.2** | Contrôle de business-logic (déclenchement humain) | L3 | — | Partiel |
| **V3.1.1** | Logging des tentatives de sécurité / audit | 1 | `financial_audit_logs` (paiements) mais pas d'audit global | Partiel |
| **V6.1.1** | Documentation des exigences d'authentification | 1 | config.toml détaillée | **Conforme** |
| **V6.2.5** | Mots de passe : pas de règle restrictive | 1 | `minimum_password_length` | **Conforme** (à renforcer en prod) |
| **V6.3/7.x** | Ré-authentification / session | 2-3 | `secure_password_change=false` | **Non conforme** |
| **V7. Joint** | (état session / invalidation) | 2 | géré par Supabase | À vérifier (Session provider) |
| **V8.1.1** | Vérification du rôle d'autorisation au backend | 1 | RLS + RPC définis | **Conforme** (sauf 3.2/3.4) |
| **V11-Self** | (non applicable : JWT PKCE) | — | supabase-js PKCE | **Conforme** |
| **V14** | Data protection / data classification | 2 | buckets publics vs privés documentés | Conforme (storage) |
| **V16** | Logging et gestion d'erreurs | 1 | erreurs exposées à l'utilisateur (erreur: message) | Partiel |

*Remarque : ce tableau est un échantillon des exigences évaluables statiquement. Les niveaux indiqués suivent la hiérarchie ASVS 5.0 ; la colonne Statut reflète l'état du code analysé.*

---

## 5. TEST CASES PRÉPARÉS (en attente d'environnement d'exécution)

Ces scenarii sont prêts pour une exécution RLS (le schéma étant audit-checké, ils sont codés pour SQLx/SQL brut) :

**5.1 Isolation fine (attendus à l'échec)**
- `t07_prix_falsifie.sql` : créer une commande avec `price_eur: 0.01` → attendu **refus** (aujourd'hui : accepté) — preuve de l'anti-intégrité prix.
- `t08_confirm_payment_direct.sql` : appeler `confirm_payment` sur une commande non sienne → attendu **refus** (aujourd'hui : accepté pour le propriétaire).
- `t10_moderation_contournable.sql` : vendeur approuvé insère un produit `verified=true` → attendu **refus** (aujourd'hui : accepté, visible publiquement).
- `t11_messages_cross_tenant.sql` : client A tente d'insérer/mettre à jour un message dans la conversation de B → attendu **refus**.

**5.2 Isolation croisée**
- `t12_isolation_vendeur.sql` : vendeur A lit le ou les orders/items de vendeur B → attendu **refus**.
- `t13_admin_no_self_privilege.sql` : un `seller` tente de promouvoir son rôle → attendu **refus** (`role` inchangé).

**5.3 Parcours légitimes**
- `t01_creation_produit_vendeur.sql`, `t02_creation_commande_client.sql`, `t03_quote_flow.sql`, `t04_messages_participants.sql`, `t05_storage_own_folder.sql`, `t06_admin_views_orders.sql`.

---

## 6. PLAN DE TESTS DYNAMIQUES SUGGÉRÉ (à lancer sur environnent local ou CI)

1. Déclencher une structure Supabase locale (`supabase start`), puis `supabase db reset --db-url postgres://...` sur les migrations.
2. Appliquer les migrations via `supabase db push` ou seed par `supabase db reset`.
3. Créer 4 comptes d'essai : client A, client B, vendeur A (producers.approved), vendeur B + admin (role admin).
4. Exécuter les tests SQL ci-dessus (`.sql` dans `tests/security/`).
5. Vérifier : rejet des prix falsifiés, refus de confirmation sans rôle financier, refus de publication de produits sans modération, isolation strict 1er/2e parties.

---

## 7. CORRECTIFS RECOMMANDÉS (PRIORITÉ)

| # | Priorité | Fichier cible | Action |
|---|---------|---------------|--------|
| 1 | **Critique** | `create_order` (20260905000001) | Recalculer le prix depuis `products` (source d'autorité), rejeter les codes inconnus, valider quantité/stock. |
| 2 | **Critique** | `confirm_payment` + `src/services/orders.js` | Supprimer/REVOKER l'RPC et son wrapper ; côté serveur n'autoriser que `financial_admin` (ou webhook service_role). |
| 3 | **Élevée** | `products` RLS / RPC `verify_product` | Imposer `verified=false` à l'insert/update vendeur ; moderne passage à `true` par RPC admin seulement. |
| 4 | **Élevée** | `messages` policies / RPCs | `UPDATE` uniquement `sender_id=auth.uid()` ; gate `send_message`/`mark_conversation_read` sur la participation. |
| 5 | **Moyenne** | Toutes RPC | `REVOKE EXECUTE FROM anon,public;` + `GRANT` à `authenticated` ; `auth.uid()` requis en entrée. |
| 6 | **Moyenne** | `supabase/config.toml` + Vercel | `secure_password_change=true`, `enable_confirmations=true`, `minimum_password_length=8` ; headers CSP/HSTS. |
| 7 | **Moyenne** | Storage | Restreindre `product-images` aux sellers approuvés ; purge des orphelins. |

---

## 8. ACTIONS MANUELLES / VÉRIFICATIONS REQUISES

- **Révocation de l'ancien compte admin supprimé** : confirmer dans l'admin UI qu'aucune session Stale existe pour `admin@jerossa.mg` (verrouillage).
- **Vérification de la configuration déployée** (non vérifiable statiquement sans accès au projet) : RLS actives sur **toutes** les tables en prod, `enable_confirmations`, `secure_password_change`, seuils de mots de passe, bucket privé `seller-documents` (vérifier la RLS sur `storage.objects`).
- **Confirmer** que `confirm_payment` n'est pas référencée par un webhook externe ou une intégration de la passerelle.
- **Revoir** la messagerie : selon la politique d'`update` effective en prod, décider si un vendeur peut altérer des messages acheteur (mettre à jour les revues de la politique d'update dans `20260826000002`/`20260903000001`).
- **Exécuter les tests dynamiques** (§5) une fois un environnement Supabase démarré ; intégrer à la CI.

---

## 9. ANNEXE — PÉRIMÈTRE & MÉTHODE

- **Méthode** : revue de code des fichiers listés en §10 (matrice d'accès §1, constats §3, test-cases §5). Aucun test dynamique exécuté (environnement local non disponible).
- **Secrets** : aucun secret n'a été extrait ni affiché ; les valeurs d'environnement restent masquées. `.env.local` n'est pas suivi par git.
- **Limitations** : config déployée (prod) et état effectif des politiques RLS en environnement distant non vérifiables sans accès au projet. Les vulnérabilités supposées doivent être confirmées par test (scénarios fournis).

---

## 10. FICHIERS AUDITÉS

- `supabase/migrations/` : 20260811000001_core_tables, 20260811000002_auth_rls, 20260812000001_orders, 20260812000002_quotes, 20260812000003_payments, 20260812000004_refunds_email, 20260820000001_admin_rls, 20260824000001_storage_buckets, 20260826000001_seller_onboarding, 20260826000002_seller_space, 20260903000001_seller_features, 20260907000002_addresses_and_product_status, 20260915000001_payment_reception (en cours), 20260906000001_secure_bulk...
- `src/services/orders.js`, `src/services/messages.js`, `src/services/catalog.js`, `src/services/seller.js`, `src/services/admin.js` (partiel)…
- `src/context/AuthContext.jsx`, `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/pages/ResetPassword.jsx`, `src/pages/ForgotPassword.jsx`, `src/components/Protected*Route`, `src/lib/supabase.{js,utils}`…

---

*Fin du rapport d'audit.*
