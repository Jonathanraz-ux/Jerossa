# PROFESSIONNALISATION DU SITE — Reste à faire

> Mise à jour : après le lot L4c (`51dac82`)
> Contexte : chantier de stabilisation/refactorisation démarré après audit complet.
> Règle d'or conservée : aucun changement de comportement sans décision explicite et lot dédié.

---

## 0. Fix parcours vendeur & emails (démo) — ✅ appliqué

But : débloquer l'inscription en démo (aucun email réellement envoyé) et rendre le
parcours « Devenir vendeur » visible/utilisable. Décision produit validée.

| Correctif | Détail |
|---|---|
| **Emails/inscription** | `mailer_autoconfirm=true` activé côté projet Supabase (Management API, champ en **minuscules** : le `PATCH /v1/projects/{ref}/config/auth` avec clé majuscule répond 200 mais ignore le champ). Compte créé → confirmé + session immédiate sans email (vérifié empiriquement : `email_confirmed_at` renseigné). Pas de SMTP/`hook_send_email` → aucun email réellement délivré (ni client ni vendeur). |
| **« Devenir vendeur » visible** | Lien à la place du radio « Vendeur » dans `Navbar.jsx` (desktop) + barre basse mobile (icône Store) + style accent dans `Navbar.css`. |
| **Inscription** | `Register.jsx` : suppression du radio « Compte Vendeur » (trompeur/impossible : email unique Supabase) → encart « Vous souhaitez vendre sur JEROSSA ? » avec lien vers `/vendeur/devenir`. `signUp` force `role: 'customer'`. |

Parcours vendeur réel : compte client → `/vendeur/devenir` (candidature) →
approbation admin → `/espace-vendeur` (exige `producer.status === 'approved'`).

**À surveiller en produit** : SMTP transactionnel toujours inactif → préparer un
provider (ex. Resend) le jour où l'on veut de vraies confirmations/récupérations de mot de passe.

---

## 1. Refactorisation technique — en cours

### ✅ Terminé

| Lot | Contenu | Commit |
|---|---|---|
| L1 | Imports inutilisés + état mort (13 pages) | `550bd9e` |
| L2 | Exports morts prouvés (admin/data) | `627f011` |
| L3 | Config commerciale centralisée (`src/config/commerce.js`) | `58b4b4f` |
| L4a | Modules purs devise (`config/currencies.js`, `lib/currency.js`) | `59bfef8` |
| L4b | CurrencyContext délègue aux modules purs (API intacte) | `5f2d1c6` |
| L4c | Formatage prix unitaire public centralisé, figé EUR (`formatUnitPriceFromEUR`) | `51dac82` |

### ⏳ Restant (ordre recommandé)

- **L4d — Pages compte/commandes** : remplacer les 8 copies locales de `formatEUR`
  par `formatEURStatic(v, 'comma')` depuis `src/lib/currency.js`.
  Fichiers : MyOrders, MyRefunds, OrderConfirmation*, OrderDetails, Payment,
  QuoteDetails, RefundDetails, RefundRequest.
  Rendu strictement identique (« 220,00 € »). *OrderConfirmation : ne pas toucher au
  fallback MOCK_ORDER (dette §2).* Risque très faible.
- **L4e — Panier/Checkout** : remplacer les 9 `toFixed(2)+' €'` inline par
  `formatEURStatic(v, 'dot')`. Rendu identique **avec point** (« 165.00 € »),
  conformément à D-dec2. Fichiers : Cart.jsx (×5), Checkout.jsx (×4).
  Les libellés « 15,00 € » / « 35,00 € » restent littéraux ou seront interpolés ici.
- **L4f — SUSPENDU** (décision D-dec1 = NON) : suppression de `catalog.formatPrice`
  et du champ `price` (mapping + mocks). Ne réévaluer qu'après le lot devise ci-dessous.
- **Lot fonctionnel séparé (à valider avec captures avant/après)** :
  `fix: align public product prices with selected currency` — passer les 8 appels
  L4c de `'EUR'` figé à la devise active (Search:108, Category:106,
  ProductDetails:156+264, QuickView:102, ProducerShop:142, Wishlist:74,
  MyFavorites:61). Changement visible : « 220 € / kg » → « 1 078 000 Ar / kg » sur MGA.
- **L5 — États loading/error/empty/success** : les services avalent les erreurs
  (`return []`, ex. services/catalog.js:68-71) → une panne réseau affiche
  « Aucun résultat ». Migration progressive : les services lèvent, les consommateurs
  interceptent. Aucune modification Supabase/RLS.
- **L6 — ErrorBoundary racine** : actuellement zéro boundary → crash rendu = écran blanc.
  Composant + intégration App.jsx.
- **L7 — Découpage des gros fichiers** : Home.jsx (623 l.) + Home.css (2 089 l.,
  4 media queries), ProductDetails (431), Publish (426), Checkout (392).
  Extraire d'abord un `PageHero` partagé (markup dupliqué ~12 pages), puis sections Home.
- **L8 — CSS** : dédoublonner les keyframes (animations.css vs App.css:202-207),
  retirer progressivement les `!important` de responsive.css:9-16.
- **L9 — Hook `useAsyncData`** : pattern `let active = true; fetch…` copié ×5
  (MyOrders, MyQuotes, MyRefunds, Payment, OrderDetails).
- **L10 — Validation finale** : lint, build, smoke des 41 routes, console propre.

---

## 2. Dette fonctionnelle hors périmètre (mocks assumés)

⚠️ À traiter uniquement via des décisions produit dédiées — jamais dans un lot technique :

- `/my-account` (MyAccount.jsx:5,66,85) affiche des **commandes mockées**
  (`data/orders.js`) alors que `/my-orders` affiche les vraies (Supabase).
- **Fallbacks mock** : OrderDetails.jsx:39 (`getOrderById`),
  OrderTracking.jsx:17-18 (`ordersData.find`), OrderConfirmation.jsx:7-16,30 (`MOCK_ORDER`).
- **Favoris factices** : Wishlist.jsx:8 et MyFavorites.jsx:8 rendent
  `productsData.slice(0, 3)` — de vrais favoris nécessiteraient une table Supabase
  (hors périmètre refactorisation).
- `data/producers.js` : entièrement non importé (flaggé, volontairement conservé).
- `Account.jsx` : page vitrine `/account` distincte de `/my-account` — clarifier le
  parcours souhaité un jour.

---

## 3. Améliorations UI/UX boutique (plan P1–P3 restant)

### P1 — Conversion & parcours achat
- Recherche live dans la navbar (dropdown produits pendant la frappe ;
  données déjà disponibles via `fetchProducts()`).
- Fiche produit : galerie miniatures aboutie + zoom discret + badge stock temps réel.
- Bouton « Ajouter au panier » : état loading court + confirmation visuelle généralisée.

### P2 — Design system boutique
- Harmoniser Home.css/responsive.css sur les tokens existants (durées 150–300 ms ease-out).
- Contraste : `--text-muted: #7a7a7a` limite AA → envisager `#6b6560`.
- Accessibilité : focus-trap sur les modales, `aria-expanded` sur les menus navbar.

### P3 — Espace client
- Timeline de suivi de commande premium (remplacer `.tracking-steps` App.css:171-179).
- Même langage visuel que l'admin (badges `jr-*` déjà disponibles).

---

## 4. Divers notés pendant les audits

- `ScrollAnimations.jsx:23` : polling DOM toutes les 300 ms — remplacer par un
  MutationObserver (optionnel).
- `ProductQuickView.jsx:48` : warning deps useEffect préexistant.
- Offset navbar codé à trois endroits (68 px Navbar.css:180, 88 px ScrollManager,
  sticky `top:100px` Cart/Checkout) — centraliser si retouche du header.
- Badge sombre `rgba(30,61,47,.9)` recopié dans ≥4 pages → token candidat.
- Admin : `admin/format.js` pourrait un jour ré-exporter `lib/format.js` quand il
  existera (éviter double source), sans urgence.

---

## 5. Commandes de validation (à chaque lot)

```bash
npm run lint     # 0 erreur, 0 nouveau warning
npm run build    # succès
npm run dev      # smoke routes + console navigateur vide
```

Scénarios critiques inchangés : homogénéité panier MG/MU · livraison (>200 strict,
200 € pile payant, express 35 €) · conversion MGA/MUR/EUR sur catalogue ·
ancre « Comment ça marche » · admin complet.
