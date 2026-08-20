import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchAdminStats, fetchRecentOrders, fetchRecentNotifications,
  fetchAdminProducts, toggleProductActive, deleteProduct,
  fetchAdminOrders, updateOrderStatus,
  fetchAdminCategories, createCategory, updateCategory, deleteCategory,
  fetchAdminUsers, updateUserRole,
  fetchAllNotifications, markNotificationRead, fetchEmailLogs,
  fetchPlatformSettings, updatePlatformSetting,
} from '../services/admin';
import {
  LayoutDashboard, Package, ShoppingCart, Users, MessageSquare,
  Settings, LogOut, Search, Plus, Edit3,
  Trash2, Eye, EyeOff, Bell, DollarSign, Tags, UserCheck,
  CheckCircle, XCircle,
  ChevronRight, Save, X, RefreshCw, Mail,
} from 'lucide-react';

const STATUS_LABELS = {
  pending: 'En attente', confirmed: 'Confirmée', paid: 'Payée',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
  refunded: 'Remboursée',
};

const formatEUR = (n) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const formatDateTime = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const timeAgo = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Il y a ${days}j`;
};

const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'categories', label: 'Catégories', icon: Tags },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'clients', label: 'Clients', icon: UserCheck },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="admin-page">
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'admin-sidebar--collapsed' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="#d4a373" opacity="0.2"/>
              <path d="M16 6c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6z" fill="none" stroke="#d4a373" strokeWidth="1.5"/>
              <path d="M12 16c0 0 1.5-3 4-3s4 3 4 3" stroke="#d4a373" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M14 16l-1 2M18 16l1 2" stroke="#d4a373" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M16 13v-2M16 19v2" stroke="#d4a373" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div>
              <div className="admin-sidebar-title">Jerossa</div>
              <div className="admin-sidebar-role">Administration</div>
            </div>
          )}
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`admin-nav-btn ${activeSection === item.id ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setActiveSection(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={18} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {!sidebarCollapsed && (
            <span className="admin-sidebar-user">{profile?.full_name || 'Admin'}</span>
          )}
          <button className="admin-logout-btn" onClick={handleLogout} title="Déconnexion">
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      <main className={`admin-main ${sidebarCollapsed ? 'admin-main--expanded' : ''}`}>
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="admin-topbar-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{ display: 'flex' }}
            >
              <ChevronRight size={18} style={{ transform: sidebarCollapsed ? 'rotate(0)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
            </button>
            <div className="admin-topbar-search">
              <Search size={16} />
              <input type="text" placeholder="Rechercher..." />
            </div>
          </div>
          <div className="admin-topbar-actions">
            <button className="admin-topbar-btn">
              <Bell size={18} />
            </button>
            <div className="admin-topbar-user">
              <div className="admin-topbar-avatar">
                {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD'}
              </div>
            </div>
          </div>
        </div>
        <div className="admin-content">
          <AdminContent
            section={activeSection}
            loading={loading}
            setLoading={setLoading}
            setActiveSection={setActiveSection}
          />
        </div>
      </main>

      <style>{adminStyles}</style>
    </div>
  );
};

// ─── CONTENT ROUTER ───────────────────────────────────────

const AdminContent = ({ section, setLoading, setActiveSection }) => {
  useEffect(() => { setLoading(true); }, [section]); // eslint-disable-line react-hooks/exhaustive-deps

  switch (section) {
    case 'overview': return <OverviewSection setLoading={setLoading} setActiveSection={setActiveSection} />;
    case 'products': return <ProductsSection setLoading={setLoading} />;
    case 'categories': return <CategoriesSection setLoading={setLoading} />;
    case 'orders': return <OrdersSection setLoading={setLoading} />;
    case 'users': return <UsersSection setLoading={setLoading} />;
    case 'clients': return <ClientsSection setLoading={setLoading} />;
    case 'messages': return <MessagesSection setLoading={setLoading} />;
    case 'settings': return <SettingsSection setLoading={setLoading} />;
    default: return null;
  }
};

// ─── OVERVIEW ─────────────────────────────────────────────

const OverviewSection = ({ setLoading, setActiveSection }) => {
  const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0, totalUsers: 0, totalRevenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      const [s, o, n] = await Promise.all([fetchAdminStats(), fetchRecentOrders(5), fetchRecentNotifications(5)]);
      setStats(s);
      setRecentOrders(o);
      setNotifications(n);
      setLoadingData(false);
      setLoading(false);
    };
    load();
  }, [setLoading]);

  if (loadingData) return <LoadingState />;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Tableau de bord</h2>
          <p className="admin-subtitle">Vue d'ensemble de votre plateforme</p>
        </div>
      </div>

      <div className="admin-kpi-grid">
        <div className="admin-kpi">
          <div className="admin-kpi-icon" style={{ background: 'rgba(140,98,57,0.1)', color: 'var(--primary)' }}>
            <DollarSign size={22} />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{formatEUR(stats.totalRevenue)}</span>
            <span className="admin-kpi-label">Revenus totaux</span>
          </div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-icon" style={{ background: 'rgba(43,122,75,0.1)', color: 'var(--success)' }}>
            <ShoppingCart size={22} />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{stats.totalOrders}</span>
            <span className="admin-kpi-label">Commandes</span>
          </div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-icon" style={{ background: 'rgba(184,134,11,0.1)', color: 'var(--warning)' }}>
            <Users size={22} />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{stats.totalUsers}</span>
            <span className="admin-kpi-label">Utilisateurs</span>
          </div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-icon" style={{ background: 'rgba(192,57,43,0.1)', color: 'var(--danger)' }}>
            <Package size={22} />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{stats.totalProducts}</span>
            <span className="admin-kpi-label">Produits</span>
          </div>
        </div>
      </div>

      <div className="admin-grid-2col">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Commandes récentes</h3>
            <button className="admin-card-link" onClick={() => setActiveSection('orders')}>Voir tout</button>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucune commande</td></tr>
                ) : recentOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{order.orderNumber}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</td>
                    <td style={{ fontWeight: 600 }}>{formatEUR(order.total)}</td>
                    <td><span className={`status-badge ${order.status}`}>{STATUS_LABELS[order.status] || order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Activité récente</h3>
          </div>
          <div className="admin-activity-list">
            {notifications.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.85rem' }}>Aucune notification</p>
            ) : notifications.map((n, i) => (
              <div key={i} className="admin-activity-item">
                <div className="admin-activity-icon" style={{ background: 'rgba(140,98,57,0.1)', color: 'var(--primary)' }}>
                  <Bell size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="admin-activity-action">{n.title}</div>
                  <div className="admin-activity-detail">{n.body}</div>
                </div>
                <span className="admin-activity-time">{timeAgo(n.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PRODUCTS ─────────────────────────────────────────────

const ProductsSection = ({ setLoading }) => {
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadProducts = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchAdminProducts();
    setProducts(data);
    setLoadingData(false);
    setLoading(false);
  }, [setLoading]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleToggle = async (id, currentActive) => {
    const res = await toggleProductActive(id, !currentActive);
    if (res.ok) setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !currentActive } : p));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    const res = await deleteProduct(id);
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== id));
  };

  const filtered = products.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' && p.active) || (statusFilter === 'inactive' && !p.active);
    return matchSearch && matchStatus;
  });

  if (loadingData) return <LoadingState />;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Gestion des produits</h2>
          <p className="admin-subtitle">{products.length} produits dans le catalogue</p>
        </div>
      </div>
      <div className="admin-table-toolbar">
        <div className="admin-search">
          <Search size={15} />
          <input type="text" placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="admin-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Vendeur</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucun produit trouvé</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="product-manage-row">
                    <div className="product-manage-img" />
                    <div className="product-manage-details">
                      <span className="product-manage-name">{p.title}</span>
                      <span className="product-manage-cat">{p.code}</span>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.category}</td>
                <td style={{ fontSize: '0.8rem' }}>{p.seller}</td>
                <td style={{ fontWeight: 600 }}>{formatEUR(p.price)}</td>
                <td>{p.stock || '—'}</td>
                <td>
                  <span className={`status-badge ${p.active ? 'approved' : 'cancelled'}`}>
                    {p.active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="action-icon-btn edit" title={p.active ? 'Désactiver' : 'Activer'} onClick={() => handleToggle(p.id, p.active)}>
                      {p.active ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button className="action-icon-btn delete" title="Supprimer" onClick={() => handleDelete(p.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── CATEGORIES ───────────────────────────────────────────

const CategoriesSection = ({ setLoading }) => {
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', short: '', description: '', imageUrl: '' });

  const loadCategories = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchAdminCategories();
    setCategories(data);
    setLoadingData(false);
    setLoading(false);
  }, [setLoading]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const openCreate = () => { setEditing(null); setForm({ name: '', slug: '', short: '', description: '', imageUrl: '' }); setShowModal(true); };
  const openEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, slug: cat.slug, short: cat.short || '', description: cat.description || '', imageUrl: cat.imageUrl || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      const res = await updateCategory(editing.id, { name: form.name, slug: form.slug, short: form.short, description: form.description, image_url: form.imageUrl });
      if (res.ok) setCategories(prev => prev.map(c => c.id === editing.id ? { ...c, ...form, imageUrl: form.imageUrl } : c));
    } else {
      const res = await createCategory(form);
      if (res.ok && res.data) {
        setCategories(prev => [...prev, { id: res.data.id, code: res.data.category_code, ...form, productCount: 0, createdAt: res.data.created_at }]);
      }
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    const res = await deleteCategory(id);
    if (res.ok) setCategories(prev => prev.filter(c => c.id !== id));
  };

  if (loadingData) return <LoadingState />;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Gestion des catégories</h2>
          <p className="admin-subtitle">{categories.length} catégories</p>
        </div>
        <button className="admin-btn-primary" onClick={openCreate}>
          <Plus size={16} /> Ajouter
        </button>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Code</th>
              <th>Slug</th>
              <th>Produits</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucune catégorie</td></tr>
            ) : categories.map(cat => (
              <tr key={cat.id}>
                <td style={{ fontWeight: 600 }}>{cat.name}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cat.code}</td>
                <td style={{ fontSize: '0.8rem' }}>{cat.slug}</td>
                <td>{cat.productCount}</td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="action-icon-btn edit" onClick={() => openEdit(cat)}><Edit3 size={14} /></button>
                    <button className="action-icon-btn delete" onClick={() => handleDelete(cat.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: 500, padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>{editing ? 'Modifier' : 'Nouvelle catégorie'}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Nom *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Vanille" />
            </div>
            <div className="form-group">
              <label className="form-label">Slug</label>
              <input className="form-input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="vanille" />
            </div>
            <div className="form-group">
              <label className="form-label">Description courte</label>
              <input className="form-input" value={form.short} onChange={e => setForm({ ...form, short: e.target.value })} placeholder="Courte description" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description complète" style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">URL image</label>
              <input className="form-input" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="admin-btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="admin-btn-primary" onClick={handleSave}><Save size={16} /> {editing ? 'Mettre à jour' : 'Créer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ORDERS ───────────────────────────────────────────────

const OrdersSection = ({ setLoading }) => {
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadOrders = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchAdminOrders();
    setOrders(data);
    setLoadingData(false);
    setLoading(false);
  }, [setLoading]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.ok) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loadingData) return <LoadingState />;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Gestion des commandes</h2>
          <p className="admin-subtitle">{orders.length} commandes au total</p>
        </div>
      </div>
      <div className="admin-table-toolbar">
        <div className="admin-search">
          <Search size={15} />
          <input type="text" placeholder="Rechercher une commande..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="admin-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>N° Commande</th>
              <th>Date</th>
              <th>Articles</th>
              <th>Total</th>
              <th>Paiement</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucune commande trouvée</td></tr>
            ) : filtered.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{o.orderNumber}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(o.createdAt)}</td>
                <td style={{ fontSize: '0.8rem' }}>{o.items.length} article{o.items.length > 1 ? 's' : ''}</td>
                <td style={{ fontWeight: 600 }}>{formatEUR(o.total)}</td>
                <td>
                  <span className={`status-badge ${o.paymentStatus === 'paid' ? 'approved' : o.paymentStatus === 'refunded' ? 'cancelled' : 'pending'}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td>
                  <select
                    className="admin-select"
                    value={o.status}
                    onChange={e => handleStatusChange(o.id, e.target.value)}
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td>
                  <OrderDetailsModal order={o} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OrderDetailsModal = ({ order }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="action-icon-btn edit" onClick={() => setOpen(true)}><Eye size={14} /></button>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content" style={{ maxWidth: 600, padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)' }}>Commande {order.orderNumber}</h3>
              <button className="modal-close-btn" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date</span><br /><strong>{formatDate(order.createdAt)}</strong></div>
              <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</span><br /><strong>{formatEUR(order.total)}</strong></div>
              <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Statut</span><br /><span className={`status-badge ${order.status}`}>{STATUS_LABELS[order.status]}</span></div>
              <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paiement</span><br /><span className={`status-badge ${order.paymentStatus === 'paid' ? 'approved' : 'pending'}`}>{order.paymentStatus}</span></div>
            </div>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>Articles</h4>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                <span>{item.title} × {item.qty}</span>
                <span style={{ fontWeight: 600 }}>{formatEUR(item.price * item.qty)}</span>
              </div>
            ))}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Sous-total</span><span>{formatEUR(order.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Livraison</span><span>{formatEUR(order.shippingFee)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── USERS ────────────────────────────────────────────────

const UsersSection = ({ setLoading }) => {
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchAdminUsers();
    setUsers(data);
    setLoadingData(false);
    setLoading(false);
  }, [setLoading]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRoleChange = async (userId, newRole) => {
    const res = await updateUserRole(userId, newRole);
    if (res.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const filtered = users.filter(u => !search || (u.fullName || '').toLowerCase().includes(search.toLowerCase()));

  if (loadingData) return <LoadingState />;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Gestion des utilisateurs</h2>
          <p className="admin-subtitle">{users.length} utilisateurs inscrits</p>
        </div>
      </div>
      <div className="admin-table-toolbar">
        <div className="admin-search">
          <Search size={15} />
          <input type="text" placeholder="Rechercher un utilisateur..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Pays</th>
              <th>Inscrit le</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucun utilisateur trouvé</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.fullName || '—'}</td>
                <td>
                  <span className={`status-badge ${u.role === 'admin' ? 'shipped' : u.role === 'seller' ? 'approved' : 'pending'}`}>
                    {u.role}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem' }}>{u.country || '—'}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                <td>
                  <select
                    className="admin-select"
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    <option value="customer">customer</option>
                    <option value="seller">seller</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── CLIENTS (filtered users) ─────────────────────────────

const ClientsSection = ({ setLoading }) => {
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      const data = await fetchAdminUsers();
      setUsers(data.filter(u => u.role === 'customer'));
      setLoadingData(false);
      setLoading(false);
    };
    load();
  }, [setLoading]);

  const filtered = users.filter(u => !search || (u.fullName || '').toLowerCase().includes(search.toLowerCase()));

  if (loadingData) return <LoadingState />;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Clients</h2>
          <p className="admin-subtitle">{users.length} clients inscrits</p>
        </div>
      </div>
      <div className="admin-table-toolbar">
        <div className="admin-search">
          <Search size={15} />
          <input type="text" placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Pays</th>
              <th>Téléphone</th>
              <th>Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucun client trouvé</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.fullName || '—'}</td>
                <td style={{ fontSize: '0.8rem' }}>{u.country || '—'}</td>
                <td style={{ fontSize: '0.8rem' }}>{u.phone || '—'}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── MESSAGES / NOTIFICATIONS ─────────────────────────────

const MessagesSection = ({ setLoading }) => {
  const [tab, setTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      const [n, e] = await Promise.all([fetchAllNotifications(), fetchEmailLogs()]);
      setNotifications(n);
      setEmailLogs(e);
      setLoadingData(false);
      setLoading(false);
    };
    load();
  }, [setLoading]);

  const handleMarkRead = async (id) => {
    const res = await markNotificationRead(id);
    if (res.ok) setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (loadingData) return <LoadingState />;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Messages & Notifications</h2>
          <p className="admin-subtitle">Gestion des communications</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button className={`admin-tab-btn ${tab === 'notifications' ? 'admin-tab-btn--active' : ''}`} onClick={() => setTab('notifications')}>
          <Bell size={14} /> Notifications ({notifications.length})
        </button>
        <button className={`admin-tab-btn ${tab === 'emails' ? 'admin-tab-btn--active' : ''}`} onClick={() => setTab('emails')}>
          <Mail size={14} /> Emails ({emailLogs.length})
        </button>
      </div>

      {tab === 'notifications' && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Message</th>
                <th>Type</th>
                <th>Date</th>
                <th>Lu</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {notifications.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucune notification</td></tr>
              ) : notifications.map(n => (
                <tr key={n.id} style={{ opacity: n.read ? 0.6 : 1 }}>
                  <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.title}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</td>
                  <td style={{ fontSize: '0.75rem' }}>{n.type}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{timeAgo(n.created_at)}</td>
                  <td>{n.read ? <CheckCircle size={14} color="var(--success)" /> : <XCircle size={14} color="var(--warning)" />}</td>
                  <td>
                    {!n.read && (
                      <button className="action-icon-btn edit" title="Marquer lu" onClick={() => handleMarkRead(n.id)}>
                        <Eye size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'emails' && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Destinataire</th>
                <th>Sujet</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {emailLogs.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucun email</td></tr>
              ) : emailLogs.map(e => (
                <tr key={e.id}>
                  <td style={{ fontSize: '0.85rem' }}>{e.recipient}</td>
                  <td style={{ fontSize: '0.8rem', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject}</td>
                  <td style={{ fontSize: '0.75rem' }}>{e.type}</td>
                  <td>
                    <span className={`status-badge ${e.status === 'sent' ? 'approved' : e.status === 'failed' ? 'cancelled' : 'pending'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDateTime(e.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── SETTINGS ─────────────────────────────────────────────

const SettingsSection = ({ setLoading }) => {
  const [settings, setSettings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      const data = await fetchPlatformSettings();
      setSettings(data);
      setLoadingData(false);
      setLoading(false);
    };
    load();
  }, [setLoading]);

  const handleChange = (key, value) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    for (const s of settings) {
      await updatePlatformSetting(s.key, s.value);
    }
    setSaving(false);
  };

  const labels = {
    commission_rate: 'Taux de commission (%)',
    shipping_fee: 'Frais de livraison (€)',
    free_shipping_threshold: 'Seuil livraison gratuite (€)',
    default_currency: 'Devise par défaut',
    payment_provider: 'Fournisseur de paiement',
  };

  if (loadingData) return <LoadingState />;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Paramètres de la plateforme</h2>
          <p className="admin-subtitle">Configuration générale</p>
        </div>
        <button className="admin-btn-primary" onClick={handleSaveAll} disabled={saving}>
          <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
      <div className="admin-card" style={{ maxWidth: 600 }}>
        {settings.map(s => (
          <div key={s.key} className="form-group">
            <label className="form-label">{labels[s.key] || s.key}</label>
            <input
              className="form-input"
              value={s.value}
              onChange={e => handleChange(s.key, e.target.value)}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Dernière mise à jour: {formatDateTime(s.updated_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── LOADING STATE ────────────────────────────────────────

const LoadingState = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
      <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
      <p style={{ fontSize: '0.85rem' }}>Chargement...</p>
    </div>
  </div>
);

// ─── STYLES ───────────────────────────────────────────────

const adminStyles = `
  @keyframes spin { to { transform: rotate(360deg); } }

  .admin-page { display: flex; min-height: 100vh; background: #f5f4f0; overflow-x: hidden; }
  .admin-sidebar { width: 250px; background: var(--bg-white); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 50; transition: width 0.2s; }
  .admin-sidebar--collapsed { width: 56px; }
  .admin-sidebar-brand { display: flex; align-items: center; gap: 0.75rem; padding: 1.25rem; border-bottom: 1px solid var(--border); }
  .admin-sidebar-logo { display: flex; flex-shrink: 0; }
  .admin-sidebar-title { font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; color: var(--text-dark); }
  .admin-sidebar-role { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .admin-sidebar-nav { flex: 1; padding: 0.75rem; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
  .admin-nav-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 0.875rem; border-radius: var(--radius-sm); border: none; background: none; width: 100%; font-size: 0.8125rem; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all 0.2s; text-align: left; }
  .admin-nav-btn:hover { background: var(--bg-cream); color: var(--text-dark); }
  .admin-nav-btn--active { background: var(--primary-light); color: var(--primary); font-weight: 600; }
  .admin-sidebar-footer { padding: 0.75rem; border-top: 1px solid var(--border); }
  .admin-sidebar-user { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.5rem; padding: 0 0.5rem; }
  .admin-logout-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: none; background: none; width: 100%; font-size: 0.8125rem; color: var(--danger); cursor: pointer; transition: all 0.2s; }
  .admin-logout-btn:hover { background: var(--danger-bg); }

  .admin-main { flex: 1; margin-left: 250px; min-width: 0; transition: margin-left 0.2s; }
  .admin-main--expanded { margin-left: 56px; }
  .admin-topbar { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 2rem; background: var(--bg-white); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 40; }
  .admin-topbar-search { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 1rem; background: var(--bg-cream); border-radius: 8px; width: 280px; }
  .admin-topbar-search input { border: none; background: none; outline: none; font-size: 0.8125rem; width: 100%; }
  .admin-topbar-search svg { color: var(--text-muted); flex-shrink: 0; }
  .admin-topbar-actions { display: flex; align-items: center; gap: 1rem; }
  .admin-topbar-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; border-radius: 50%; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .admin-topbar-btn:hover { background: var(--bg-cream); color: var(--text-dark); }
  .admin-topbar-user { display: flex; align-items: center; gap: 0.5rem; }
  .admin-topbar-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.75rem; cursor: pointer; }

  .admin-content { padding: 2rem; }
  .admin-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
  .admin-title { font-family: var(--font-serif); font-size: 1.5rem; font-weight: 600; }
  .admin-subtitle { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }
  .admin-header-actions { display: flex; gap: 0.75rem; }
  .admin-btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .admin-btn-primary:hover { background: var(--primary-hover); }
  .admin-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .admin-btn-secondary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; background: var(--bg-white); color: var(--text-dark); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .admin-btn-secondary:hover { border-color: var(--primary); color: var(--primary); }

  .admin-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
  .admin-kpi { display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem; background: var(--bg-white); border: 1px solid var(--border); border-radius: var(--radius-md); }
  .admin-kpi-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .admin-kpi-info { display: flex; flex-direction: column; }
  .admin-kpi-value { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--text-dark); }
  .admin-kpi-label { font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; }

  .admin-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
  .admin-card { background: var(--bg-white); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; }
  .admin-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .admin-card-header h3 { font-family: var(--font-serif); font-size: 1.05rem; font-weight: 600; }
  .admin-card-link { font-size: 0.75rem; font-weight: 600; color: var(--primary); background: none; border: none; cursor: pointer; }
  .admin-card-link:hover { text-decoration: underline; }

  .admin-activity-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .admin-activity-item { display: flex; align-items: center; gap: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
  .admin-activity-item:last-child { border-bottom: none; padding-bottom: 0; }
  .admin-activity-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .admin-activity-action { font-weight: 600; font-size: 0.8rem; }
  .admin-activity-detail { font-size: 0.7rem; color: var(--text-muted); }
  .admin-activity-time { margin-left: auto; font-size: 0.65rem; color: var(--text-muted); white-space: nowrap; }

  .admin-table-toolbar { display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center; flex-wrap: wrap; }
  .admin-search { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-white); flex: 1; min-width: 200px; }
  .admin-search input { border: none; background: none; outline: none; font-size: 0.8125rem; width: 100%; }
  .admin-search svg { color: var(--text-muted); flex-shrink: 0; }
  .admin-select { padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.8125rem; background: var(--bg-white); cursor: pointer; outline: none; }

  .admin-tab-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; background: var(--bg-white); color: var(--text-muted); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .admin-tab-btn:hover { color: var(--text-dark); }
  .admin-tab-btn--active { background: var(--primary); color: #fff; border-color: var(--primary); }

  @media (max-width: 1200px) {
    .admin-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .admin-grid-2col { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .admin-sidebar { width: 56px; }
    .admin-sidebar-brand { justify-content: center; padding: 1rem 0.5rem; }
    .admin-sidebar-brand > div:last-child { display: none; }
    .admin-nav-btn { justify-content: center; padding: 0.7rem 0; }
    .admin-nav-btn span { display: none; }
    .admin-sidebar-footer span { display: none; }
    .admin-main { margin-left: 56px; }
    .admin-topbar-search { display: none; }
    .admin-topbar { padding: 0.75rem 1rem; }
    .admin-content { padding: 1.5rem 1rem; }
    .admin-kpi-grid { grid-template-columns: 1fr; }
    .admin-header { flex-direction: column; gap: 1rem; }
  }
  @media (max-width: 480px) {
    .admin-content { padding: 1rem; }
    .admin-header-actions { width: 100%; flex-direction: column; align-items: stretch; }
    .admin-header-actions .admin-btn-primary,
    .admin-header-actions .admin-btn-secondary { justify-content: center; }
    .admin-kpi { padding: 1rem; gap: 0.75rem; }
    .admin-card { padding: 1rem; }
  }
`;

export default AdminDashboard;
