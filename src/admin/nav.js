import {
  LayoutDashboard, Package, Tags, ShoppingCart, Wallet, FileText, Users, UserCheck,
  MessageSquare, Settings, Store,
} from 'lucide-react';
import fr from '../i18n/fr.json';
import en from '../i18n/en.json';

// Définition centralisée de la navigation administration (FR par défaut)

const buildNavSections = (t) => [
  {
    label: t('admin.nav.controls'),
    items: [{ id: 'overview', label: t('admin.nav.overview'), icon: LayoutDashboard }],
  },
  {
    label: t('admin.nav.catalog'),
    items: [
      { id: 'products', label: t('admin.nav.products'), icon: Package },
      { id: 'categories', label: t('admin.nav.categories'), icon: Tags },
    ],
  },
  {
    label: t('admin.nav.sales'),
    items: [
      { id: 'orders', label: t('admin.nav.orders'), icon: ShoppingCart },
      { id: 'quotes', label: t('admin.nav.quotes'), icon: FileText },
      { id: 'refunds', label: t('admin.nav.refunds'), icon: Wallet },
    ],
  },
  {
    label: t('admin.nav.community'),
    items: [
      { id: 'users', label: t('admin.nav.users'), icon: Users },
      { id: 'clients', label: t('admin.nav.clients'), icon: UserCheck },
      { id: 'sellers', label: t('admin.nav.sellers'), icon: Store },
      { id: 'messages', label: t('admin.nav.messages'), icon: MessageSquare },
    ],
  },
  {
    label: t('admin.nav.system'),
    items: [{ id: 'settings', label: t('admin.nav.settings'), icon: Settings }],
  },
];

const frT = (key) => fr[key] || key;
const enT = (key) => en[key] || fr[key] || key;

export const NAV_SECTIONS_FR = buildNavSections(frT);
export const NAV_SECTIONS_EN = buildNavSections(enT);

export const navSections = (lang) => (lang === 'en' ? NAV_SECTIONS_EN : NAV_SECTIONS_FR);

// Compatibilité descendante (démarrage en FR)
export const NAV_SECTIONS = NAV_SECTIONS_FR;

const buildSectionLabels = (sections) =>
  Object.fromEntries(sections.flatMap((g) => g.items.map((i) => [i.id, i.label])));

export const SECTION_LABELS = buildSectionLabels(NAV_SECTIONS);

export const NAV_SECTION_LABELS = SECTION_LABELS;
