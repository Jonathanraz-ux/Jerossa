export const categoriesData = [
  {
    id: 'cat-001',
    name: 'Vanille de Madagascar',
    slug: 'vanille-bourbon',
    short: 'Vanille Bourbon Grade A',
    description: 'Vanille de Madagascar de qualité supérieure, gousses gourmandes et premium.',
    image: 'https://images.unsplash.com/photo-1610487512810-b614ad747572?w=600&auto=format&fit=crop&q=80',
    productCount: 48,
    products: ['prod-001']
  },
  {
    id: 'cat-002',
    name: 'Cacao & Fèves',
    slug: 'cacao-feves-bio',
    short: 'Cacao fermenté du Sambirano',
    description: 'Cacao biologique de Madagascar, fèves fermentées de qualité exceptionnelle.',
    image: 'https://images.unsplash.com/photo-1610450949065-1f2841536c88?w=600&auto=format&fit=crop&q=80',
    productCount: 32,
    products: ['prod-003']
  },
  {
    id: 'cat-003',
    name: 'Café de Spécialité',
    slug: 'cafe-specialite',
    short: 'Cafés verts des hauts plateaux',
    description: 'Cafés de spécialité cultivés dans les hauts plateaux de Madagascar.',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&auto=format&fit=crop&q=80',
    productCount: 21,
    products: ['prod-007', 'prod-004']
  },
  {
    id: 'cat-004',
    name: 'Épices & Poivres',
    slug: 'epices-poivres-rares',
    short: 'Poivre voatsiperifery, girofle',
    description: 'Épices authentiques de Madagascar, poivres rares et girofles d\'exception.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    productCount: 54,
    products: ['prod-006', 'prod-008']
  },
  {
    id: 'cat-005',
    name: 'Produits Naturels',
    slug: 'produits-naturels',
    short: 'Huiles essentielles, cosmétiques',
    description: 'Huiles essentielles chémotypées, beurres végétaux et produits naturels certifiés bio.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80',
    productCount: 65,
    products: ['prod-005', 'prod-010']
  },
  {
    id: 'cat-006',
    name: 'Produits Agricoles',
    slug: 'produits-agricoles',
    short: 'Fruits, légumes, circuit court',
    description: 'Produits agricoles frais et secs issus de l\'agriculture familiale malgache.',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&auto=format&fit=crop&q=80',
    productCount: 38,
    products: ['prod-009']
  },
  {
    id: 'cat-007',
    name: 'Produits Artisanaux',
    slug: 'produits-artisanaux',
    short: 'Tissage, vannerie, fait main',
    description: 'Créations artisanales malgaches : vannerie, tissage et objets faits main.',
    image: 'https://images.unsplash.com/photo-1610487512810-b614ad747572?w=600&auto=format&fit=crop&q=80',
    productCount: 24,
    products: ['prod-011']
  },
  {
    id: 'cat-008',
    name: 'Sucre & Dérivés',
    slug: 'sucre-derives',
    short: 'Sucre roux de Maurice',
    description: 'Sucre roux artisanal et dérivés de canne de Madagascar et Maurice.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    productCount: 15,
    products: ['prod-002']
  },
  {
    id: 'cat-009',
    name: 'Matières Premières',
    slug: 'matieres-premieres',
    short: 'B2B, vrac, gros volumes',
    description: 'Matières premières en vrac destinées aux professionnels : agriculture, cosmétique et agroalimentaire.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80',
    productCount: 42,
    products: ['prod-001', 'prod-003']
  },
  {
    id: 'cat-010',
    name: 'Thé & Infusions',
    slug: 'the-infusions',
    short: 'Thés des plantations mauriciennes',
    description: 'Thés noirs, verts et infusions des plantations de Maurice.',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&auto=format&fit=crop&q=80',
    productCount: 12,
    products: ['prod-004']
  },
  {
    id: 'cat-011',
    name: 'Girofle & Fruits',
    slug: 'girofle-fruits',
    short: 'Girofle supérieur, fruits transformés',
    description: 'Clous de girofle supérieurs et fruits & produits transformés de la côte Est.',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&auto=format&fit=crop&q=80',
    productCount: 19,
    products: ['prod-008']
  },
  {
    id: 'cat-012',
    name: 'Autres Produits Locaux',
    slug: 'autres-produits-locaux',
    short: 'Découvrez le reste du catalogue',
    description: 'Tous les autres trésors locaux de Madagascar et de Maurice, bientôt disponibles.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    productCount: 27,
    products: []
  }
];

export const getCategoryBySlug = (slug) => categoriesData.find(c => c.slug === slug);
