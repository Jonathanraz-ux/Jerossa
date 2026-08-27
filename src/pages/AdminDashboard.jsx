import React, { useState, useEffect } from 'react';
import '../admin/admin.css';
import { Sidebar, NotificationsBell, ProfileMenu, CommandPalette } from '../admin/chrome';
import { SECTION_LABELS } from '../admin/nav';
import OverviewSection from '../admin/sections/OverviewSection';
import ProductsSection from '../admin/sections/ProductsSection';
import CategoriesSection from '../admin/sections/CategoriesSection';
import OrdersSection from '../admin/sections/OrdersSection';
import UsersSection from '../admin/sections/UsersSection';
import ClientsSection from '../admin/sections/ClientsSection';
import SellersSection from '../admin/sections/SellersSection';
import RefundsSection from '../admin/sections/RefundsSection';
import MessagesSection from '../admin/sections/MessagesSection';
import SettingsSection from '../admin/sections/SettingsSection';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Auto-collapse sur écran étroit
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)');
    const apply = () => setSidebarCollapsed(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Raccourci clavier : Ctrl/⌘ + K → recherche globale ; Échap ferme le drawer
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="adm-scope">
      <Sidebar
        collapsed={sidebarCollapsed}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {(mobileNavOpen || paletteOpen) && (
        <div
          className="adm-backdrop-mobile"
          onClick={() => setMobileNavOpen(false)}
          style={paletteOpen ? { display: 'none' } : undefined}
        />
      )}

      <main className={`adm-main ${sidebarCollapsed ? 'adm-main--collapsed' : ''}`}>
        <Topbar
          sectionLabel={SECTION_LABELS[activeSection] || ''}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          onOpenMobile={() => setMobileNavOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
          onSelectSection={setActiveSection}
        />

        <div className="adm-content">
          <div className="adm-page" key={activeSection}>
            <AdminContent section={activeSection} setActiveSection={setActiveSection} />
          </div>
        </div>
      </main>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectSection={setActiveSection}
      />
    </div>
  );
};

// ── Topbar ────────────────────────────────────────────────

const Topbar = ({
  sectionLabel,
  sidebarCollapsed,
  onToggleSidebar,
  onOpenMobile,
  onOpenPalette,
  onSelectSection,
}) => (
  <header className="adm-topbar">
    <div className="adm-topbar-left">
      {/* Toggle desktop */}
      <button
        className="adm-icon-btn adm-collapse-desktop"
        onClick={onToggleSidebar}
        aria-label={sidebarCollapsed ? 'Déplier la navigation' : 'Replier la navigation'}
        title={sidebarCollapsed ? 'Déplier' : 'Replier'}
      >
        {sidebarCollapsed ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9.5 4v16"/><path d="M15 10l2 2-2 2"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9.5 4v16"/><path d="M13.5 10l-2 2 2 2"/></svg>
        )}
      </button>
      {/* Burger mobile */}
      <button
        className="adm-icon-btn adm-burger-mobile"
        onClick={onOpenMobile}
        aria-label="Ouvrir la navigation"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
      </button>

      <div className="adm-breadcrumb">
        <span className="adm-breadcrumb-root">Administration</span>
        <span className="adm-breadcrumb-sep">/</span>
        <span className="adm-breadcrumb-current">{sectionLabel}</span>
      </div>
    </div>

    <button className="adm-search-trigger" onClick={onOpenPalette}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <span style={{ fontSize: 12.5 }}>Rechercher…</span>
      <span className="adm-search-hint">
        <span className="adm-kbd">⌘</span>
        <span className="adm-kbd">K</span>
      </span>
    </button>

    <div className="adm-topbar-right">
      <NotificationsBell onSelectSection={onSelectSection} />
      <ProfileMenu />
    </div>
  </header>
);

// ── Content router (mêmes sections qu'avant) ──────────────

const AdminContent = ({ section, setActiveSection }) => {
  switch (section) {
    case 'overview':
      return <OverviewSection setActiveSection={setActiveSection} />;
    case 'products':
      return <ProductsSection />;
    case 'categories':
      return <CategoriesSection />;
    case 'orders':
      return <OrdersSection />;
    case 'refunds':
      return <RefundsSection />;
    case 'users':
      return <UsersSection />;
    case 'clients':
      return <ClientsSection />;
    case 'sellers':
      return <SellersSection />;
    case 'messages':
      return <MessagesSection />;
    case 'settings':
      return <SettingsSection />;
    default:
      return null;
  }
};

export default AdminDashboard;
