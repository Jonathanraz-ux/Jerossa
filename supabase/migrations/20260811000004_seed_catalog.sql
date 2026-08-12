-- ==================================================
-- JEROSSA — PHASE 4 : Seed du catalogue (données actuelles)
-- 12 catégories, 8 vendeurs, 11 produits
-- Relations par codes publics (résolus vers les UUID).
-- ==================================================

-- --------------------------------------------------
-- 1. CATEGORIES
-- --------------------------------------------------
insert into public.categories (category_code, slug, name, short, description, image_url, product_count)
values
  ('cat-001', 'vanille-bourbon', 'Vanille de Madagascar', 'Vanille Bourbon Grade A', 'Vanille de Madagascar de qualité supérieure, gousses gourmandes et premium.', 'https://images.unsplash.com/photo-1610487512810-b614ad747572?w=600&auto=format&fit=crop&q=80', 48),
  ('cat-002', 'cacao-feves-bio', 'Cacao & Fèves', 'Cacao fermenté du Sambirano', 'Cacao biologique de Madagascar, fèves fermentées de qualité exceptionnelle.', 'https://images.unsplash.com/photo-1610450949065-1f2841536c88?w=600&auto=format&fit=crop&q=80', 32),
  ('cat-003', 'cafe-specialite', 'Café de Spécialité', 'Cafés verts des hauts plateaux', 'Cafés de spécialité cultivés dans les hauts plateaux de Madagascar.', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&auto=format&fit=crop&q=80', 21),
  ('cat-004', 'epices-poivres-rares', 'Épices & Poivres', 'Poivre voatsiperifery, girofle', 'Épices authentiques de Madagascar, poivres rares et girofles d''exception.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80', 54),
  ('cat-005', 'produits-naturels', 'Produits Naturels', 'Huiles essentielles, cosmétiques', 'Huiles essentielles chémotypées, beurres végétaux et produits naturels certifiés bio.', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80', 65),
  ('cat-006', 'produits-agricoles', 'Produits Agricoles', 'Fruits, légumes, circuit court', 'Produits agricoles frais et secs issus de l''agriculture familiale malgache.', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&auto=format&fit=crop&q=80', 38),
  ('cat-007', 'produits-artisanaux', 'Produits Artisanaux', 'Tissage, vannerie, fait main', 'Créations artisanales malgaches : vannerie, tissage et objets faits main.', 'https://images.unsplash.com/photo-1610487512810-b614ad747572?w=600&auto=format&fit=crop&q=80', 24),
  ('cat-008', 'sucre-derives', 'Sucre & Dérivés', 'Sucre roux de Maurice', 'Sucre roux artisanal et dérivés de canne de Madagascar et Maurice.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80', 15),
  ('cat-009', 'matieres-premieres', 'Matières Premières', 'B2B, vrac, gros volumes', 'Matières premières en vrac destinées aux professionnels : agriculture, cosmétique et agroalimentaire.', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80', 42),
  ('cat-010', 'the-infusions', 'Thé & Infusions', 'Thés des plantations mauriciennes', 'Thés noirs, verts et infusions des plantations de Maurice.', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&auto=format&fit=crop&q=80', 12),
  ('cat-011', 'girofle-fruits', 'Girofle & Fruits', 'Girofle supérieur, fruits transformés', 'Clous de girofle supérieurs et fruits & produits transformés de la côte Est.', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&auto=format&fit=crop&q=80', 19),
  ('cat-012', 'autres-produits-locaux', 'Autres Produits Locaux', 'Découvrez le reste du catalogue', 'Tous les autres trésors locaux de Madagascar et de Maurice, bientôt disponibles.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80', 27)
on conflict (category_code) do nothing;

-- --------------------------------------------------
-- 2. PRODUCERS (vendeurs)
-- --------------------------------------------------
insert into public.producers (seller_code, slug, name, location, description, image_url, rating, reviews_count, established, certifications, response_rate, response_time)
values
  ('seller-001', 'cooperative-sava-vanilla', 'Coopérative SAVA Vanilla', 'Sava, Madagascar', 'Spécialisée dans la vanille Bourbon de Madagascar depuis 1985. Notre coopérative regroupe 120 producteurs familiaux dans la région de Sava, garantissant des gousses de qualité supérieure grâce à des méthodes de séchage traditionnelles.', 'https://images.unsplash.com/photo-1610487512810-b614ad747572?w=400&auto=format&fit=crop&q=80', 4.9, 42, 1985, array['Bio', 'Commerce Équitable', 'ISO 22000'], '98%', '< 2h'),
  ('seller-002', 'domaine-sucrier-mauricien', 'Domaine Sucrier Mauricien', 'Rivière Noire, Maurice', 'Domaine familial produisant un sucre roux artisanal non raffiné depuis trois générations. Nos cannes à sucre sont cultivées sur nos propres terres sans pesticides chimiques.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80', 4.8, 52, 1962, array['Bio', 'Fair Trade'], '95%', '< 4h'),
  ('seller-003', 'plantation-ambanja', 'Plantation Ambanja', 'Ambanja, Madagascar', 'Plantation biologique spécialisée dans le cacao Criollo et Trinitario de la vallée du Sambirano. Nous contrôlons chaque étape de la fermentation pour garantir des fèves d''exception.', 'https://images.unsplash.com/photo-1610450949065-1f2841536c88?w=400&auto=format&fit=crop&q=80', 4.7, 28, 1998, array['Bio', 'UTZ'], '91%', '< 6h'),
  ('seller-004', 'plantations-maurice', 'Plantations Maurice', 'Plaine Wilhems, Maurice', 'Producteur historique de thé noir et d''huiles essentielles à l''Île Maurice. Nos plantations bénéficient d''un terroir unique entre océan et montagne.', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&auto=format&fit=crop&q=80', 4.6, 35, 1950, array['Bio', 'HACCP'], '93%', '< 3h'),
  ('seller-005', 'distillerie-vatovavy', 'Distillerie Vatovavy', 'Vatovavy, Madagascar', 'Distillerie artisanale produisant des huiles essentielles chémotypées par distillation lente. Nous sélectionnons uniquement les meilleures plantes de nos jardins botaniques.', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', 5.0, 19, 2005, array['Bio', 'ECOCERT'], '100%', '< 1h'),
  ('seller-006', 'epices-madagascar', 'Épices de Madagascar', 'Antananarivo, Madagascar', 'Grossiste en épices et poivres rares de Madagascar. Nous travaillons avec des producteurs de toute l''île pour offrir une gamme complète d''épices authentiques.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80', 4.8, 31, 1990, array['Bio', 'ISO 9001'], '96%', '< 2h'),
  ('seller-007', 'agri-sud-est', 'Agri-Sud-Est', 'Manakara, Madagascar', 'Coopérative agricole spécialisée dans le café Robusta de la côte Est de Madagascar. Nos producteurs appliquent des méthodes d''agroforesterie durables.', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&auto=format&fit=crop&q=80', 4.3, 14, 2001, array['Bio', 'Rainforest Alliance'], '89%', '< 8h'),
  ('seller-008', 'analanjirofo-spices', 'Analanjirofo Spices', 'Analanjirofo, Madagascar', 'Producteur exclusif de clous de girofle de Madagascar Supérieur. Nos girofliers poussent à l''état sauvage dans les forêts côtières de l''est.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80', 4.9, 22, 1975, array['Bio', 'Commerce Équitable'], '97%', '< 3h')
on conflict (seller_code) do nothing;

-- --------------------------------------------------
-- 3. PRODUCTS
-- --------------------------------------------------
insert into public.products (
  product_code, slug, title, seller_id, category_id,
  price_eur, unit, origin, market, availability, verified, reviews,
  type, tag, description, stock, delivery, variants, images, rating
)
values
  (
    'prod-001', 'gousses-vanille-bourbon', 'Gousses de Vanille Bourbon Gourmet - Grade A',
    (select id from public.producers where seller_code = 'seller-001'),
    (select id from public.categories where category_code = 'cat-001'),
    220, 'kg', 'Madagascar', 'MG', 'Disponible en gros (Min 5kg)', true, 42,
    'vanilla', 'Direct Producteur',
    'Ces gousses de vanille Bourbon de qualité Gourmet (Grade A) proviennent directement de la région SAVA à Madagascar. Elles sont affinées traditionnellement pendant 6 mois pour développer leur profil aromatique intense, avec des notes cacaotées et boisées. Longueur : 16-20cm, Taux d''humidité : 30-35%.',
    'Disponible en gros (Min 5kg)', 'Expédition sous 48h, Livraison en 5-7 jours',
    array['16cm', '18cm', '20cm+'], array['https://images.unsplash.com/photo-1610487512810-b614ad747572?w=800&auto=format&fit=crop&q=80'],
    4.9
  ),
  (
    'prod-002', 'sucre-roux-special', 'Sucre Roux Spécial - Maurice',
    (select id from public.producers where seller_code = 'seller-002'),
    (select id from public.categories where category_code = 'cat-008'),
    4.5, 'kg', 'Maurice', 'MU', 'En stock', true, 52,
    'spices', 'Direct Maurice',
    'Ce sucre roux artisanal non raffiné conserve sa mélasse naturelle, ce qui lui confère une couleur dorée profonde et un parfum de caramel distinct. Idéal pour la pâtisserie, les rhums arrangés, et la torréfaction.',
    'En stock', 'Livraison standard 3-5 jours',
    array['Sachet 1kg', 'Sac 25kg'], array['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'],
    4.8
  ),
  (
    'prod-003', 'feves-de-cacao-bio', 'Fèves de Cacao Fermentées Bio - Sambirano',
    (select id from public.producers where seller_code = 'seller-003'),
    (select id from public.categories where category_code = 'cat-002'),
    8.5, 'kg', 'Madagascar', 'MG', 'Derniers sacs disponibles', true, 28,
    'cacao', 'Certifié Bio',
    'Fèves de cacao issues du commerce équitable, cultivées dans la vallée du Sambirano. Variété Criollo et Trinitario, avec une fermentation parfaitement maîtrisée de 6 jours. Notes de fruits rouges et d''agrumes, idéales pour un chocolat ''Bean to Bar'' d''exception.',
    'Derniers sacs disponibles', 'Livraison 7-10 jours ouvrés',
    array[]::text[], array['https://images.unsplash.com/photo-1610450949065-1f2841536c88?w=800&auto=format&fit=crop&q=80'],
    4.7
  ),
  (
    'prod-004', 'the-noir-vanille', 'Thé Noir Vanillé - Bois Chéri',
    (select id from public.producers where seller_code = 'seller-004'),
    (select id from public.categories where category_code = 'cat-010'),
    18, 'kg', 'Maurice', 'MU', 'En stock', true, 45,
    'coffee', 'Spécialité Maurice',
    'Un grand classique mauricien. Le thé noir cultivé sur les plateaux du sud de l''Île Maurice est délicatement parfumé à l''extrait pur de vanille, offrant une infusion ronde, réconfortante et légèrement sucrée.',
    'En stock', 'Livraison 3-5 jours',
    array['Vrac 500g', 'Vrac 1kg'], array['https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop&q=80'],
    4.6
  ),
  (
    'prod-005', 'huile-essentielle-ravintsara', 'Huile Essentielle de Ravintsara Pure',
    (select id from public.producers where seller_code = 'seller-005'),
    (select id from public.categories where category_code = 'cat-005'),
    65, 'L', 'Madagascar', 'MG', 'Approvisionnement continu', true, 35,
    'oil', '100% Pure',
    'Huile essentielle chémotypée de Ravintsara (Cinnamomum camphora ct cinéole), extraite par distillation lente des feuilles. Origine Madagascar. Reconnue pour ses formidables propriétés antivirales, stimulantes et expectorantes. 100% pure et intégrale.',
    'Approvisionnement continu', 'Express 48h disponible',
    array['Flacon 250ml', 'Bidon 1L', 'Bidon 5L'], array['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format&fit=crop&q=80'],
    5.0
  ),
  (
    'prod-006', 'poivre-voatsiperifery', 'Poivre Sauvage Voatsiperifery Noir',
    (select id from public.producers where seller_code = 'seller-006'),
    (select id from public.categories where category_code = 'cat-004'),
    45, 'kg', 'Madagascar', 'MG', 'Quantité limitée', true, 19,
    'spices', 'Épice Rare',
    'Un poivre rare poussant à l''état sauvage dans les forêts primaires malgaches. Reconnaissable à sa petite queue, il offre un piquant modéré et une explosion d''arômes boisés, résineux et citronnés. Récolte manuelle.',
    'Quantité limitée', 'Livraison 5-7 jours',
    array[]::text[], array['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'],
    4.9
  ),
  (
    'prod-007', 'cafe-robusta-manakara', 'Café Robusta Supérieur - Manakara',
    (select id from public.producers where seller_code = 'seller-007'),
    (select id from public.categories where category_code = 'cat-003'),
    6.2, 'kg', 'Madagascar', 'MG', 'Sur commande', false, 14,
    'coffee', 'Récolte 2026',
    'Grains de café Robusta non torréfiés (café vert) de la côte Est de Madagascar. Teneur en caféine élevée, avec un corps puissant, idéal pour réaliser des blends corsés ou des extractions espresso intenses.',
    'Sur commande', 'Livraison 10-15 jours',
    array['Sac 60kg'], array['https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop&q=80'],
    4.3
  ),
  (
    'prod-008', 'clous-de-girofle', 'Clous de Girofle de Madagascar - Supérieur',
    (select id from public.producers where seller_code = 'seller-008'),
    (select id from public.categories where category_code = 'cat-004'),
    12, 'kg', 'Madagascar', 'MG', 'En stock', true, 31,
    'spices', 'Exclusivité',
    'Girofliers poussant sur la côte Est. Ces clous sont triés à la main pour garantir des têtes pleines et riches en huile essentielle (eugénol). Arôme chaud, piquant et très parfumé. Parfait pour conserver, parfumer viandes et pâtisseries.',
    'En stock', 'Livraison 5-7 jours',
    array['Sac 5kg', 'Sac 25kg'], array['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'],
    4.8
  ),
  (
    'prod-009', 'produits-agricoles-frais', 'Produits Agricoles Frais - Lot Maraîcher',
    null,
    (select id from public.categories where category_code = 'cat-006'),
    2.8, 'kg', 'Madagascar', 'MG', 'Selon saison', true, 11,
    'agricole', 'Circuit court',
    'Légumes et fruits frais issus de l''agriculture familiale malgache, récoltés à maturité et livrés en circuit court. Idéal pour les restaurants et épiceries de Maurice et de la région.',
    'Selon saison', 'Livraison 3-5 jours',
    array['Caisse 10kg', 'Caisse 25kg'], array['https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800&auto=format&fit=crop&q=80'],
    4.5
  ),
  (
    'prod-010', 'cosmetiques-bio', 'Produits Naturels & Cosmétiques Bio',
    null,
    (select id from public.categories where category_code = 'cat-005'),
    14, 'unité', 'Madagascar', 'MG', 'En stock', true, 26,
    'naturel', 'Certifié Bio',
    'Soins à base d''huiles naturelles de Madagascar : beurre de karité, huile de baobab et gommages aux épices. Formulation artisanale, emballages recyclables.',
    'En stock', 'Livraison 5-7 jours',
    array['Beurre 100g', 'Huile 250ml', 'Coffret'], array['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format&fit=crop&q=80'],
    4.8
  ),
  (
    'prod-011', 'artisanat-malgache', 'Artisanat Malgache - Tissage & Vannerie',
    null,
    (select id from public.categories where category_code = 'cat-007'),
    9, 'pièce', 'Madagascar', 'MG', 'En stock', true, 18,
    'artisanat', 'Fait main',
    'Panier, corbeille et objets tissés à la main par des artisans des Hautes Terres. Savoir-faire transmis de génération en génération, revenu direct aux artisans.',
    'En stock', 'Livraison 7-10 jours',
    array['Panier moyen', 'Grand panier', 'Set 3 pièces'], array['https://images.unsplash.com/photo-1610487512810-b614ad747572?w=800&auto=format&fit=crop&q=80'],
    4.7
  )
on conflict (product_code) do nothing;
