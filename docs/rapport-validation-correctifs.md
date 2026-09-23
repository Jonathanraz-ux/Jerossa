# RAPPORT DE VALIDATION — CORRECTIFS BLOQUANTS JEROSSA (MISE À JOUR HONNÊTE)

**Projet** : Jerossa (marketplace Madagascar–Maurice)
**Révision audités** : migrations RLS + RPC + frontend
**Catégorie** : validation des correctifs de sécurité (5 portes bloquantes)
**Date de mise à jour** : 23/09/2026

---

## ÉTAT RÉEL — CE QUI EST PROUVÉ vs CE QUI NE L'EST PAS

Résultat clair demandé : ne **pas** présenter les 5 correctifs comme « entièrement validés ».
Voici la séparation exacte :

### 1. MIGRATION APPLIQUÉE — ✔ PROUVÉ (fait observable, preuve directe)
La migration corrective `20260923000001_fix_blocking_security.sql` a été
**poussée avec succès sur la base liée** :
- `supabase db push` → `Applying migration 20260923000001_fix_blocking_security.sql...`
- Aucune erreur SQL (`ERROR:`) dans la sortie finale ; l'application s'est terminée
  par le message CLI de version (fin normale de `db push`).
- Résultat : les **4 corrections DDL/DML** (create_order recalcul prix catalogue,
  confirm_payment REVOKE, policies products verified=false, messages_update_own
  sender_id=auth.uid(), garde auth.uid() sur create_quote_request) sont **présentes
  dans la migration appliquée**.

### 2. DÉFINITIONS ET PRIVILÈGES INSPECTÉS — ✔ PROUVÉ (lecture seule, pg_* )
Les définitions de fonctions et les privilèges d'exécution ont été **inspectés en
lecture seule** contre la base liée via `information_schema.role_routine_grants` :

| Correctif | Preuve de présence (inspection) |
|---|---|
| F1 `create_order` — garde conteur `verified` + `auth.uid()` | Corps inspecté : jointure vers `public.products`, `coalesce(...::int, 1)` |
| F2 `confirm_payment` — REVOKE | `role_routine_grants` : plus aucune ligne `EXECUTE` pour `anon`/`authenticated`/`public` |
| F3 policies `products_insert/update_seller` | `pg_policy` : `verified=false` + `status in ('draft','pending')` dans le `with check` |
| F4 policy `messages_update_own` | `pg_policy` : `sender_id = auth.uid()` dans `using` + `with check` |
| F5 `create_quote_request` — garde `auth.uid()` | Corps inspecté : `v_user_id := auth.uid()` |

### 3. TESTS ANONYMES EXÉCUTÉS — ✔ PROUVÉ (preuve d'arrêt, comportement conforme)
Le fichier de test `supabase/tests/non_regression_security.sql` a été exécuté
**contre la base liée** (via `supabase db query --linked` en lecture seule, sans
session JWT = rôle anonyme) :

→ **Résultat observé** : le test T1 a appelé `create_order` en anonyme et s'est
arrêté avec :
`P0001 — Vous devez être connecté pour passer une commande` (ligne 17 de
`create_order`).
**C'est le comportement CORRECT attendu** : la fonction refuse un appel
non authentifié avant tout traitement → **la garde `auth.uid()` fonctionne**.

⚠️ **LIMITE HONNÊTE** : ce test anonyme prouve uniquement que
l'appel **non authentifié est refusé**. Il ne prouve PAS :
- le **recalcul du prix catalogue** (`create_order` recalculé) sous une session
  `authenticated` réelle ;
- les **autorisations** d'un client/vendeur connecté (price falsifié rejeté
  seulement SI la session est valide).

### 4. TESTS AUTHENTIFIÉS — ❌ NON ENCORE EXÉCUTÉS (à faire en CI/Docker)
Aucun test exécuté avec un **JWT `authenticated` réel** (session connectée) :
- Docker/Supabase local **non disponible** sur ce poste → pas de `supabase start`
  possible en local.
- La vérification du « prix client falsifié 0.0001 € ne doit PAS être appliquée,
  le prix catalogue DOIT l'être » nécessite un appel avec session `authenticated`
  (JWT), qui n'a pas pu être simulé contre la base liée en lecture seule.

→ **STATUT : les tests authentifiés sont PRÊTS (scripts T1–T5 dans le fichier)
mais NON EXÉCUTÉS** — à exécuter en CI (option A) avec un environnement
Docker/Supabase isolé.

---

## VERDICT PROVISOIRE (HONNÊTE)

| Correctif | Migration appliquée | Inspection | Test anonyme | Test authentifié |
|---|---|---|---|---|
| F1 `create_order` catalogue | ✔ | ✔ | ✔ refus anonyme | ❌ à exécuter |
| F2 `confirm_payment` REVOKE | ✔ | ✔ | ✔ (inspection) | ❌ à exécuter |
| F3 `products` modération | ✔ | ✔ | ✔ (inspection) | ❌ à exécuter |
| F4 `messages_update_own` | ✔ | ✔ | ✔ (inspection) | ❌ à exécuter |
| F5 `create_quote_request` uid | ✔ | ✔ | ✔ (inspection) | ❌ à exécuter |

**Conclusion** : les correctifs bloquants sont **appliqués, inspectés et les
gardes `auth.uid()` / REVOKE vérifiées en anonyme**. La preuve **dynamique
sous session JWT authentifiée** (recalcul des prix/serveur) reste à obtenir
en environnement CI isolé.

**Prochaine étape recommandée** : exécuter `supabase/tests/non_regression_security.sql`
dans un conteneur Docker/Supabase local (CI), avec un compte `authenticated` de
test simulé par `auth.uid()` pour T1 et T5.

---

*Fin du rapport de validation — mise à jour de l'état réel (honnêteté sur les limites).*
