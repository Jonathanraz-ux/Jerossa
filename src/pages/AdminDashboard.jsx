import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, MessageSquare,
  Settings, LogOut, TrendingUp, TrendingDown, MoreHorizontal,
  Search, Plus, Edit3, Trash2, Eye, ChevronDown, Bell, DollarSign,
  BarChart3, Tags, UserCheck, Star, Clock, CheckCircle, XCircle,
  AlertCircle, Download, Filter, Calendar
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'categories', label: 'Catégories', icon: Tags },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'clients', label: 'Clients', icon: UserCheck },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 3 },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div>
            <div className="admin-header">
              <div>
                <h2 className="admin-title">Tableau de bord</h2>
                <p className="admin-subtitle">Bienvenue sur votre espace d'administration</p>
              </div>
              <div className="admin-header-actions">
                <button className="admin-btn-secondary">
                  <Download size={16} />
                  Exporter
                </button>
                <button className="admin-btn-primary">
                  <Plus size={16} />
                  Ajouter un produit
                </button>
              </div>
            </div>

            <div className="admin-kpi-grid">
              <div className="admin-kpi">
                <div className="admin-kpi-icon" style={{ background: 'rgba(140,98,57,0.1)', color: 'var(--primary)' }}>
                  <DollarSign size={22} />
                </div>
                <div className="admin-kpi-info">
                  <span className="admin-kpi-value">45 280 €</span>
                  <span className="admin-kpi-label">Revenus mensuels</span>
                  <span className="admin-kpi-trend admin-kpi-trend--up">
                    <TrendingUp size={12} /> +12.5%
                  </span>
                </div>
              </div>
              <div className="admin-kpi">
                <div className="admin-kpi-icon" style={{ background: 'rgba(43,122,75,0.1)', color: 'var(--success)' }}>
                  <ShoppingCart size={22} />
                </div>
                <div className="admin-kpi-info">
                  <span className="admin-kpi-value">128</span>
                  <span className="admin-kpi-label">Commandes ce mois</span>
                  <span className="admin-kpi-trend admin-kpi-trend--up">
                    <TrendingUp size={12} /> +8.3%
                  </span>
                </div>
              </div>
              <div className="admin-kpi">
                <div className="admin-kpi-icon" style={{ background: 'rgba(184,134,11,0.1)', color: 'var(--warning)' }}>
                  <Users size={22} />
                </div>
                <div className="admin-kpi-info">
                  <span className="admin-kpi-value">2 431</span>
                  <span className="admin-kpi-label">Utilisateurs actifs</span>
                  <span className="admin-kpi-trend admin-kpi-trend--up">
                    <TrendingUp size={12} /> +5.2%
                  </span>
                </div>
              </div>
              <div className="admin-kpi">
                <div className="admin-kpi-icon" style={{ background: 'rgba(192,57,43,0.1)', color: 'var(--danger)' }}>
                  <Package size={22} />
                </div>
                <div className="admin-kpi-info">
                  <span className="admin-kpi-value">84</span>
                  <span className="admin-kpi-label">Produits actifs</span>
                  <span className="admin-kpi-trend admin-kpi-trend--down">
                    <TrendingDown size={12} /> -2.1%
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-grid-2col">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>Commandes récentes</h3>
                  <Link to="/admin" className="admin-card-link" onClick={() => setActiveSection('orders')}>Voir tout</Link>
                </div>
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Commande</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'CMD-2024-001', client: 'Marie Laurent', date: '28 Juil 2026', total: '450 €', status: 'delivered' },
                        { id: 'CMD-2024-002', client: 'Thomas Renard', date: '27 Juil 2026', total: '220 €', status: 'shipped' },
                        { id: 'CMD-2024-003', client: 'Sophie Moreau', date: '26 Juil 2026', total: '890 €', status: 'pending' },
                        { id: 'CMD-2024-004', client: 'Pierre Dubois', date: '25 Juil 2026', total: '175 €', status: 'cancelled' },
                        { id: 'CMD-2024-005', client: 'Léa Martin', date: '24 Juil 2026', total: '1 200 €', status: 'delivered' },
                      ].map(order => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{order.id}</td>
                          <td>{order.client}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.date}</td>
                          <td style={{ fontWeight: 600 }}>{order.total}</td>
                          <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>Avis clients récents</h3>
                  <span className="admin-card-link" style={{ cursor: 'default' }}>Aujourd'hui</span>
                </div>
                <div className="admin-reviews-list">
                  {[
                    { name: 'Marie L.', product: 'Vanille Bourbon Grade A', rating: 5, text: 'Qualité exceptionnelle, livraison rapide !', date: 'Il y a 2h' },
                    { name: 'Thomas R.', product: 'Fèves de Cacao Bio', rating: 4, text: 'Très bon produit, fermentation parfaite.', date: 'Il y a 5h' },
                    { name: 'Sophie M.', product: 'Huile Ravintsara', rating: 5, text: 'Huile pure et de grande qualité.', date: 'Hier' },
                  ].map((review, i) => (
                    <div key={i} className="admin-review-item">
                      <div className="admin-review-header">
                        <div className="admin-review-avatar">{review.name.split(' ').map(n => n[0]).join('')}</div>
                        <div>
                          <div className="admin-review-name">{review.name}</div>
                          <div className="admin-review-product">{review.product}</div>
                        </div>
                        <span className="admin-review-date">{review.date}</span>
                      </div>
                      <div className="admin-review-stars">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={12} fill={j < review.rating ? '#d4a373' : 'rgba(212,163,115,0.2)'} color="#d4a373" />
                        ))}
                      </div>
                      <p className="admin-review-text">"{review.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Activité récente</h3>
              </div>
              <div className="admin-activity-list">
                {[
                  { action: 'Nouvelle commande', detail: 'CMD-2024-001 - 450 €', time: 'Il y a 15 min', icon: ShoppingCart, color: 'var(--success)' },
                  { action: 'Nouveau producteur inscrit', detail: 'Coopérative Ambositra', time: 'Il y a 1h', icon: UserCheck, color: 'var(--primary)' },
                  { action: 'Produit ajouté', detail: 'Poivre Sauvage Voatsiperifery', time: 'Il y a 2h', icon: Package, color: 'var(--warning)' },
                  { action: 'Paiement reçu', detail: 'CMD-2024-002 - 220 €', time: 'Il y a 3h', icon: DollarSign, color: 'var(--success)' },
                  { action: 'Message client', detail: 'Question sur la livraison', time: 'Il y a 4h', icon: MessageSquare, color: 'var(--primary)' },
                ].map((item, i) => (
                  <div key={i} className="admin-activity-item">
                    <div className="admin-activity-icon" style={{ background: `${item.color}15`, color: item.color }}>
                      <item.icon size={16} />
                    </div>
                    <div>
                      <div className="admin-activity-action">{item.action}</div>
                      <div className="admin-activity-detail">{item.detail}</div>
                    </div>
                    <span className="admin-activity-time">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div>
            <div className="admin-header">
              <div>
                <h2 className="admin-title">Gestion des produits</h2>
                <p className="admin-subtitle">{84} produits dans le catalogue</p>
              </div>
              <div className="admin-header-actions">
                <button className="admin-btn-secondary">
                  <Filter size={16} />
                  Filtrer
                </button>
                <button className="admin-btn-primary">
                  <Plus size={16} />
                  Ajouter un produit
                </button>
              </div>
            </div>
            <div className="admin-table-toolbar">
              <div className="admin-search">
                <Search size={15} />
                <input type="text" placeholder="Rechercher un produit..." />
              </div>
              <select className="admin-select">
                <option>Tous les statuts</option>
                <option>Actif</option>
                <option>En rupture</option>
                <option>Brouillon</option>
              </select>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Ventes</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Vanille Bourbon Grade A', cat: 'Vanille', price: '220 €', stock: '48 kg', sales: 156, status: 'active' },
                    { name: 'Fèves de Cacao Bio', cat: 'Cacao', price: '8.50 €', stock: '320 kg', sales: 89, status: 'active' },
                    { name: 'Huile Ravintsara', cat: 'Huiles', price: '65 €', stock: '24 L', sales: 234, status: 'active' },
                    { name: 'Sucre Roux Maurice', cat: 'Épices', price: '4.50 €', stock: 'Épuisé', sales: 78, status: 'inactive' },
                    { name: 'Café Robusta Manakara', cat: 'Café', price: '6.20 €', stock: '15 sacs', sales: 45, status: 'active' },
                  ].map((p, i) => (
                    <tr key={i}>
                      <td>
                        <div className="product-manage-row">
                          <div className="product-manage-img" style={{ background: 'var(--bg-cream)', width: '36px', height: '36px', borderRadius: '6px' }} />
                          <div className="product-manage-details">
                            <span className="product-manage-name">{p.name}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.cat}</td>
                      <td style={{ fontWeight: 600 }}>{p.price}</td>
                      <td style={{ color: p.stock === 'Épuisé' ? 'var(--danger)' : 'inherit' }}>{p.stock}</td>
                      <td>{p.sales}</td>
                      <td><span className={`status-badge ${p.status === 'active' ? 'approved' : 'cancelled'}`}>{p.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="action-icon-btn edit"><Edit3 size={14} /></button>
                          <button className="action-icon-btn delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div>
            <div className="admin-header">
              <div>
                <h2 className="admin-title">Gestion des commandes</h2>
                <p className="admin-subtitle">128 commandes ce mois</p>
              </div>
              <button className="admin-btn-secondary">
                <Download size={16} />
                Exporter
              </button>
            </div>
            <div className="admin-table-toolbar">
              <div className="admin-search">
                <Search size={15} />
                <input type="text" placeholder="Rechercher une commande..." />
              </div>
              <select className="admin-select">
                <option>Tous les statuts</option>
                <option>En attente</option>
                <option>Expédiée</option>
                <option>Livrée</option>
                <option>Annulée</option>
              </select>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>N° Commande</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Paiement</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'CMD-2024-001', client: 'Marie Laurent', date: '28/07/2026', amount: '450 €', payment: 'Validé', status: 'delivered' },
                    { id: 'CMD-2024-002', client: 'Thomas Renard', date: '27/07/2026', amount: '220 €', payment: 'Validé', status: 'shipped' },
                    { id: 'CMD-2024-003', client: 'Sophie Moreau', date: '26/07/2026', amount: '890 €', payment: 'En attente', status: 'pending' },
                    { id: 'CMD-2024-004', client: 'Pierre Dubois', date: '25/07/2026', amount: '175 €', payment: 'Remboursé', status: 'cancelled' },
                    { id: 'CMD-2024-005', client: 'Léa Martin', date: '24/07/2026', amount: '1 200 €', payment: 'Validé', status: 'delivered' },
                  ].map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600 }}>{order.id}</td>
                      <td>{order.client}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.date}</td>
                      <td style={{ fontWeight: 600 }}>{order.amount}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.payment}</td>
                      <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="action-icon-btn edit"><Eye size={14} /></button>
                          <button className="action-icon-btn approve"><CheckCircle size={14} /></button>
                          <button className="action-icon-btn delete"><XCircle size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="admin-placeholder">
            <h2>{menuItems.find(m => m.id === activeSection)?.label}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Module en cours de construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-page">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
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
          <div>
            <div className="admin-sidebar-title">Jerossa</div>
            <div className="admin-sidebar-role">Administrateur</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`admin-nav-btn ${activeSection === item.id ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="admin-nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <span className="admin-sidebar-user">Admin</span>
          <button className="admin-logout-btn">
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Admin Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-search">
            <Search size={16} />
            <input type="text" placeholder="Rechercher..." />
          </div>
          <div className="admin-topbar-actions">
            <button className="admin-topbar-btn">
              <Bell size={18} />
              <span className="admin-topbar-badge">3</span>
            </button>
            <div className="admin-topbar-user">
              <div className="admin-topbar-avatar">AD</div>
            </div>
          </div>
        </div>
        <div className="admin-content">
          {renderContent()}
        </div>
      </main>

      <style>{`
        .admin-page {
          display: flex; min-height: 100vh; background: #f5f4f0; overflow-x: hidden;
        }
        .admin-sidebar {
          width: 250px; background: var(--bg-white); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; position: fixed; top: 0; left: 0;
          height: 100vh; z-index: 50;
        }
        .admin-sidebar-brand {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 1.25rem 1.25rem; border-bottom: 1px solid var(--border);
        }
        .admin-sidebar-logo { display: flex; }
        .admin-sidebar-title { font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; color: var(--text-dark); }
        .admin-sidebar-role { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .admin-sidebar-nav { flex: 1; padding: 0.75rem; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
        .admin-nav-btn {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 0.875rem;
          border-radius: var(--radius-sm); border: none; background: none; width: 100%;
          font-size: 0.8125rem; font-weight: 500; color: var(--text-muted); cursor: pointer;
          transition: all 0.2s; text-align: left;
        }
        .admin-nav-btn:hover { background: var(--bg-cream); color: var(--text-dark); }
        .admin-nav-btn--active { background: var(--primary-light); color: var(--primary); font-weight: 600; }
        .admin-nav-badge { margin-left: auto; background: var(--danger); color: #fff; font-size: 0.6rem; font-weight: 700; padding: 2px 6px; border-radius: 10px; }
        .admin-sidebar-footer { padding: 0.75rem; border-top: 1px solid var(--border); }
        .admin-sidebar-user { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.5rem; padding: 0 0.5rem; }
        .admin-logout-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: none; background: none; width: 100%; font-size: 0.8125rem; color: var(--danger); cursor: pointer; transition: all 0.2s; }
        .admin-logout-btn:hover { background: var(--danger-bg); }

        .admin-main { flex: 1; margin-left: 250px; min-width: 0; }
        .admin-topbar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.75rem 2rem; background: var(--bg-white); border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 40;
        }
        .admin-topbar-search { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 1rem; background: var(--bg-cream); border-radius: 8px; width: 280px; }
        .admin-topbar-search input { border: none; background: none; outline: none; font-size: 0.8125rem; width: 100%; }
        .admin-topbar-search svg { color: var(--text-muted); flex-shrink: 0; }
        .admin-topbar-actions { display: flex; align-items: center; gap: 1rem; }
        .admin-topbar-btn { position: relative; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; border-radius: 50%; transition: all 0.2s; }
        .admin-topbar-btn:hover { background: var(--bg-cream); color: var(--text-dark); }
        .admin-topbar-badge { position: absolute; top: 2px; right: 2px; background: var(--danger); color: #fff; font-size: 0.55rem; font-weight: 700; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .admin-topbar-user { display: flex; align-items: center; gap: 0.5rem; }
        .admin-topbar-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.75rem; cursor: pointer; }

        .admin-content { padding: 2rem; }
        .admin-placeholder { padding: 3rem 0; }
        .admin-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        .admin-title { font-family: var(--font-serif); font-size: 1.5rem; font-weight: 600; }
        .admin-subtitle { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }
        .admin-header-actions { display: flex; gap: 0.75rem; }
        .admin-btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .admin-btn-primary:hover { background: var(--primary-hover); }
        .admin-btn-secondary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; background: var(--bg-white); color: var(--text-dark); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .admin-btn-secondary:hover { border-color: var(--primary); color: var(--primary); }

        .admin-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .admin-kpi { display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem; background: var(--bg-white); border: 1px solid var(--border); border-radius: var(--radius-md); }
        .admin-kpi-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .admin-kpi-info { display: flex; flex-direction: column; }
        .admin-kpi-value { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--text-dark); }
        .admin-kpi-label { font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; }
        .admin-kpi-trend { font-size: 0.65rem; display: flex; align-items: center; gap: 2px; margin-top: 4px; }
        .admin-kpi-trend--up { color: var(--success); }
        .admin-kpi-trend--down { color: var(--danger); }

        .admin-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
        .admin-card { background: var(--bg-white); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; }
        .admin-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .admin-card-header h3 { font-family: var(--font-serif); font-size: 1.05rem; font-weight: 600; }
        .admin-card-link { font-size: 0.75rem; font-weight: 600; color: var(--primary); }

        .admin-reviews-list { display: flex; flex-direction: column; gap: 1rem; }
        .admin-review-item { padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
        .admin-review-item:last-child { border-bottom: none; padding-bottom: 0; }
        .admin-review-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
        .admin-review-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 600; }
        .admin-review-name { font-weight: 600; font-size: 0.8rem; }
        .admin-review-product { font-size: 0.7rem; color: var(--text-muted); }
        .admin-review-date { margin-left: auto; font-size: 0.65rem; color: var(--text-muted); }
        .admin-review-stars { display: flex; gap: 1px; margin-bottom: 0.375rem; }
        .admin-review-text { font-size: 0.8rem; color: var(--text-muted); font-style: italic; }

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
          .admin-nav-badge { position: absolute; top: 4px; right: 4px; }
          .admin-sidebar-footer { display: none; }
          .admin-nav-btn { position: relative; }
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
      `}</style>
    </div>
  );
};

export default AdminDashboard;
