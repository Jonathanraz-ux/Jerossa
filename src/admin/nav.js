import {
  LayoutDashboard, Package, Tags, ShoppingCart, Users, UserCheck,
  MessageSquare, Settings,
} from 'lucide-react';

// Définition centralisée de la navigation administration
export const NAV_SECTIONS = [
  {
    label: 'Pilotage',
    items: [{ id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard }],
  },
  {
    label: 'Catalogue',
    items: [
      { id: 'products', label: 'Produits', icon: Package },
      { id: 'categories', label: 'Catégories', icon: Tags },
    ],
  },
  {
    label: 'Ventes',
    items: [{ id: 'orders', label: 'Commandes', icon: ShoppingCart }],
  },
  {
    label: 'Communauté',
    items: [
      { id: 'users', label: 'Utilisateurs', icon: Users },
      { id: 'clients', label: 'Clients', icon: UserCheck },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
    ],
  },
  {
    label: 'Système',
    items: [{ id: 'settings', label: 'Paramètres', icon: Settings }],
  },
];

export const SECTION_LABELS = Object.fromEntries(
  NAV_SECTIONS.flatMap((g) => g.items.map((i) => [i.id, i.label]))
);
