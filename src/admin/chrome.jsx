import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ShoppingCart, Users,
  LogOut, Bell, ChevronDown,
  Store, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchRecentNotifications, fetchAdminProducts, fetchAdminOrders, fetchAdminUsers,
} from '../services/admin';
import { formatEUR, timeAgo, ROLE_LABELS } from './format';
import { Avatar } from './ui';
import { NAV_SECTIONS } from './nav';

// NAV_SECTIONS et SECTION_LABELS sont définis dans ./nav.js

// ── Marque ─────────────────────────────────────────────────

const BrandMark = () => (
  <span className="adm-brand-mark">
    <svg width="21" height="21" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 4c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4z"
        stroke="currentColor" strokeWidth="1.8" opacity="0.9"
      />
      <path
        d="M11.5 16.5c1-2.2 2.7-3.3 4.5-3.3s3.5 1.1 4.5 3.3"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      />
      <path d="M16 13v-3M14 20l-.8 2M18 20l.8 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  </span>
);

// ── Sidebar ────────────────────────────────────────────────

export const Sidebar = ({
  collapsed,
  activeSection,
  onSelectSection,
  mobileOpen,
  onCloseMobile,
}) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside
      className={`adm-sidebar ${collapsed ? 'adm-sidebar--collapsed' : ''} ${mobileOpen ? 'adm-sidebar--mobile-open' : ''}`}
      aria-label="Navigation administration"
    >
      <div className="adm-brand">
        <BrandMark />
        {!collapsed && (
          <div className="adm-brand-text">
            <span className="adm-brand-name">Jerossa</span>
            <span className="adm-brand-tag">Administration</span>
          </div>
        )}
      </div>

      <nav className="adm-nav">
        {NAV_SECTIONS.map((group) => (
          <div className="adm-nav-group" key={group.label}>
            {!collapsed && <span className="adm-nav-label">{group.label}</span>}
            {group.items.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  className={`adm-nav-item ${isActive ? 'adm-nav-item--active' : ''}`}
                  onClick={() => {
                    onSelectSection(item.id);
                    onCloseMobile();
                  }}
                  title={collapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon size={18} strokeWidth={1.75} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="adm-sidebar-foot">
        <div className="adm-user-card" title={profile?.full_name || 'Admin'}>
          <Avatar name={profile?.full_name} seed={(profile?.full_name || '') + 'x'} size={34} />
          {!collapsed && (
            <div className="adm-user-meta">
              <div className="adm-user-name">{profile?.full_name || 'Administrateur'}</div>
              <div className="adm-user-role">{ROLE_LABELS[profile?.role] || 'Admin'}</div>
            </div>
          )}
        </div>
        <button
          className="adm-logout-btn"
          onClick={handleLogout}
          title="Déconnexion"
        >
          <LogOut size={15} strokeWidth={1.75} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

// ── Cloche de notifications (données réelles) ─────────────

export const NotificationsBell = ({ onSelectSection }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const wrapRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetchRecentNotifications(6).then((n) => {
      if (mounted) setItems(n);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const unread = items.filter((n) => !n.read).length;

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        className="adm-icon-btn"
        aria-label={`Notifications${unread ? ` (${unread} non lues)` : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={18} strokeWidth={1.75} />
        {unread > 0 && (
          <span className="adm-notif-dot">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="adm-popover" style={{ width: 340 }}>
          <div className="adm-popover-head">
            <span>Notifications</span>
            {unread > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-bronze-deep)' }}>
                {unread} non {unread > 1 ? 'lues' : 'lue'}
              </span>
            )}
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {items.length === 0 ? (
              <div className="adm-palette-empty">Aucune notification pour le moment.</div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    gap: 11,
                    padding: '11px 16px',
                    borderBottom: '1px solid var(--adm-line)',
                    opacity: n.read ? 0.62 : 1,
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      marginTop: 6,
                      width: 7,
                      height: 7,
                      borderRadius: 99,
                      flexShrink: 0,
                      background: n.read ? 'var(--adm-line-strong)' : 'var(--adm-bronze)',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-ink)' }}>
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--adm-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {n.body}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--adm-faint)',
                      whiteSpace: 'nowrap',
                      paddingTop: 2,
                    }}
                  >
                    {timeAgo(n.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
          <button
            className="adm-menu-item"
            onClick={() => {
              setOpen(false);
              onSelectSection('messages');
            }}
            style={{ justifyContent: 'center', color: 'var(--adm-bronze-deep)', fontWeight: 600 }}
          >
            Tout consulter <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Menu profil ────────────────────────────────────────────

export const ProfileMenu = () => {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button className="adm-profile-chip" onClick={() => setOpen((v) => !v)}>
        <Avatar name={profile?.full_name} seed={(profile?.full_name || '') + 'x'} size={32} />
        <span
          className="adm-profile-name-wrap"
          style={{ textAlign: 'left', lineHeight: 1.25 }}
        >
          <span
            style={{
              display: 'block',
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--adm-ink)',
              maxWidth: 130,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {profile?.full_name || 'Administrateur'}
          </span>
          <span style={{ display: 'block', fontSize: 10.5, color: 'var(--adm-faint)' }}>
            {ROLE_LABELS[profile?.role] || 'Admin'}
          </span>
        </span>
        <ChevronDown size={14} strokeWidth={2} style={{ color: 'var(--adm-faint)' }} />
      </button>

      {open && (
        <div className="adm-popover" style={{ width: 230 }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--adm-line)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>
              {profile?.full_name || 'Administrateur'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--adm-muted)', marginTop: 2 }}>
              {ROLE_LABELS[profile?.role] || 'Admin'}
            </div>
          </div>
          <button className="adm-menu-item" onClick={() => { setOpen(false); navigate('/'); }}>
            <Store size={15} strokeWidth={1.75} /> Voir la boutique
          </button>
          <div className="adm-menu-sep" />
          <button className="adm-menu-item adm-menu-item--danger" onClick={handleLogout}>
            <LogOut size={15} strokeWidth={1.75} /> Déconnexion
          </button>
        </div>
      )}
    </div>
  );
};

// ── Palette de commandes (Ctrl/⌘ + K) ─────────────────────

let paletteCache = null;

const usePaletteResults = (query, data) =>
  React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const sections = NAV_SECTIONS.flatMap((g) =>
      g.items
        .filter((i) => !q || i.label.toLowerCase().includes(q))
        .map((i) => ({ kind: 'section', id: i.id, label: i.label, icon: i.icon, sub: 'Navigation' }))
    );
    if (!data) return { list: [...sections], grouped: { Navigation: sections } };

    const match = (s) => !q || String(s).toLowerCase().includes(q);
    const products = q
      ? data.products.filter((p) => match(p.title) || match(p.code)).slice(0, 5)
          .map((p) => ({ kind: 'product', id: p.id, label: p.title, sub: formatEUR(p.price), sectionId: 'products' }))
      : [];
    const orders = q
      ? data.orders.filter((o) => match(o.orderNumber)).slice(0, 5)
          .map((o) => ({ kind: 'order', id: o.id, label: o.orderNumber, sub: formatEUR(o.total), sectionId: 'orders' }))
      : [];
    const users = q
      ? data.users.filter((u) => match(u.fullName)).slice(0, 4)
          .map((u) => ({ kind: 'user', id: u.id, label: u.fullName || '—', sub: ROLE_LABELS[u.role] || u.role, sectionId: 'users' }))
      : [];

    const grouped = {};
    if (sections.length) grouped.Navigation = sections;
    if (products.length) grouped.Produits = products;
    if (orders.length) grouped.Commandes = orders;
    if (users.length) grouped.Utilisateurs = users;
    return { list: [...sections, ...products, ...orders, ...users], grouped };
  }, [query, data]);

export const CommandPalette = ({ open, onClose, onSelectSection }) => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState(paletteCache);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open || data) return;
    Promise.all([fetchAdminProducts(), fetchAdminOrders(), fetchAdminUsers()]).then(
      ([products, orders, users]) => {
        paletteCache = {
          products: products.slice(0, 80),
          orders: orders.slice(0, 80),
          users: users.slice(0, 80),
        };
        setData(paletteCache);
      }
    );
  }, [open, data]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  const { list, grouped } = usePaletteResults(query, data);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  if (!open) return null;

  const pick = (item) => {
    onSelectSection(item.sectionId || item.id);
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && list[cursor]) {
      e.preventDefault();
      pick(list[cursor]);
    }
  };

  let flatIndex = -1;

  return (
    <div
      className="adm-palette-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="adm-palette" role="dialog" aria-modal="true" aria-label="Recherche globale">
        <div className="adm-palette-input-row">
          <SearchIcon />
          <input
            ref={inputRef}
            className="adm-palette-input"
            placeholder="Rechercher une page, un produit, une commande…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <span className="adm-kbd">esc</span>
        </div>

        <div className="adm-palette-body">
          {list.length === 0 ? (
            <div className="adm-palette-empty">Aucun résultat pour « {query} »</div>
          ) : (
            Object.entries(grouped).map(([groupName, items]) => (
              <div key={groupName}>
                <div className="adm-palette-section-title">{groupName}</div>
                {items.map((item) => {
                  flatIndex += 1;
                  const idx = flatIndex;
                  const isSelected = cursor === idx;
                  return (
                    <button
                      key={`${item.kind}-${item.id}`}
                      className={`adm-palette-option ${isSelected ? 'adm-palette-option--selected' : ''}`}
                      onMouseEnter={() => setCursor(idx)}
                      onClick={() => pick(item)}
                    >
                      <ItemGlyph kind={item.kind} />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.label}
                      </span>
                      <span className="adm-palette-option-sub">{item.sub}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="adm-palette-footer">
          <span><b>↑↓</b> naviguer</span>
          <span><b>↵</b> ouvrir</span>
          <span style={{ marginLeft: 'auto', opacity: 0.7 }}>Jerossa · Recherche globale</span>
        </div>
      </div>
    </div>
  );
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

const ItemGlyph = ({ kind }) => {
  const size = 15;
  const common = { size, strokeWidth: 1.75 };
  if (kind === 'product') return <Package {...common} />;
  if (kind === 'order') return <ShoppingCart {...common} />;
  if (kind === 'user') return <Users {...common} />;
  return <ArrowRight {...common} />;
};
