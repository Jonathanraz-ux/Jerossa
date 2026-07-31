export const categoriesData = [
  {
    id: 'cat-001',
    name: 'Vanille Bourbon',
    slug: 'vanille-bourbon',
    description: 'Vanille de Madagascar de qualité supérieure, gousses gourmandes et premium.',
    image: 'https://images.unsplash.com/photo-1610487512810-b614ad747572?w=600&auto=format&fit=crop&q=80',
    productCount: 48,
    products: ['prod-001']
  },
  {
    id: 'cat-002',
    name: 'Cacao & Fèves Bio',
    slug: 'cacao-feves-bio',
    description: 'Cacao biologique de Madagascar, fèves fermentées de qualité exceptionnelle.',
    image: 'https://images.unsplash.com/photo-1610450949065-1f2841536c88?w=600&auto=format&fit=crop&q=80',
    productCount: 32,
    products: ['prod-003']
  },
  {
    id: 'cat-003',
    name: 'Huiles Essentielles',
    slug: 'huiles-essentielles',
    description: 'Huiles essentielles chémotypées pures, extraites par distillation lente.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80',
    productCount: 65,
    products: ['prod-005']
  },
  {
    id: 'cat-004',
    name: 'Épices & Poivres Rares',
    slug: 'epices-poivres-rares',
    description: 'Épices authentiques de Madagascar, poivres rares et girofles d\'exception.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    productCount: 54,
    products: ['prod-006', 'prod-008']
  },
  {
    id: 'cat-005',
    name: 'Café de Spécialité',
    slug: 'cafe-specialite',
    description: 'Cafés de spécialité cultivés dans les hauts plateaux de Madagascar.',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&auto=format&fit=crop&q=80',
    productCount: 21,
    products: ['prod-007']
  },
  {
    id: 'cat-006',
    name: 'Sucre & Dérivés',
    slug: 'sucre-derives',
    description: 'Sucre roux artisanal et dérivés de canne de Madagascar et Maurice.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    productCount: 15,
    products: ['prod-002']
  },
  {
    id: 'cat-007',
    name: 'Thé & Infusions',
    slug: 'the-infusions',
    description: 'Thés noirs, verts et infusions des plantations de Maurice.',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&auto=format&fit=crop&q=80',
    productCount: 12,
    products: ['prod-004']
  },
  {
    id: 'cat-008',
    name: 'Produits de Beauté',
    slug: 'produits-beaute',
    description: 'Huiles essentielles et beurres végétaux pour la beauté et le bien-être.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80',
    productCount: 28,
    products: []
  }
];

export const getCategoryBySlug = (slug) => categoriesData.find(c => c.slug === slug);