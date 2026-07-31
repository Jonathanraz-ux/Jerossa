export const ordersData = [
  {
    id: 'CMD-2026-001',
    date: '2026-07-15',
    status: 'delivered',
    total: '440,00 €',
    items: [
      { productId: 'prod-001', name: 'Gousses de Vanille Bourbon Gourmet - Grade A', qty: 2, price: '220,00 € / kg' }
    ],
    tracking: 'FR123456789',
    steps: [
      { label: 'Commande passée', date: '2026-07-15', completed: true },
      { label: 'Paiement confirmé', date: '2026-07-15', completed: true },
      { label: 'Expédié', date: '2026-07-16', completed: true },
      { label: 'En livraison', date: '2026-07-18', completed: true },
      { label: 'Livré', date: '2026-07-20', completed: true }
    ]
  },
  {
    id: 'CMD-2026-002',
    date: '2026-07-22',
    status: 'shipped',
    total: '180,00 €',
    items: [
      { productId: 'prod-002', name: 'Sucre Roux Spécial - Maurice', qty: 1, price: '4,50 € / kg' },
      { productId: 'prod-004', name: 'Thé Noir Vanillé - Bois Chéri', qty: 1, price: '18,00 € / kg' }
    ],
    tracking: 'FR987654321',
    steps: [
      { label: 'Commande passée', date: '2026-07-22', completed: true },
      { label: 'Paiement confirmé', date: '2026-07-22', completed: true },
      { label: 'Expédié', date: '2026-07-23', completed: true },
      { label: 'En livraison', date: '2026-07-24', completed: true },
      { label: 'Livré', date: '—', completed: false }
    ]
  },
  {
    id: 'CMD-2026-003',
    date: '2026-07-28',
    status: 'pending',
    total: '85,00 €',
    items: [
      { productId: 'prod-003', name: 'Fèves de Cacao Fermentées Bio - Sambirano', qty: 1, price: '8,50 € / kg' }
    ],
    tracking: null,
    steps: [
      { label: 'Commande passée', date: '2026-07-28', completed: true },
      { label: 'Paiement confirmé', date: '2026-07-28', completed: true },
      { label: 'Expédié', date: '—', completed: false },
      { label: 'En livraison', date: '—', completed: false },
      { label: 'Livré', date: '—', completed: false }
    ]
  }
];

export const getOrderById = (id) => ordersData.find(o => o.id === id);