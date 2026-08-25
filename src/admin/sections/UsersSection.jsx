import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, UserRound } from 'lucide-react';
import { fetchAdminUsers, updateUserRole } from '../../services/admin';
import { formatDate, formatInt } from '../format';
import { PageHead, EmptyState, RoleBadge, Avatar } from '../ui';

const UsersSection = () => {
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchAdminUsers();
    setUsers(data);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId, newRole) => {
    const res = await updateUserRole(userId, newRole);
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    }
  };

  const filtered = users.filter(
    (u) => !search || (u.fullName || '').toLowerCase().includes(search.toLowerCase())
  );

  const counts = useMemo(
    () => ({
      admin: users.filter((u) => u.role === 'admin').length,
      seller: users.filter((u) => u.role === 'seller').length,
      customer: users.filter((u) => u.role === 'customer').length,
    }),
    [users]
  );

  if (loadingData) return <UsersSkeleton title="Utilisateurs" />;

  return (
    <div>
      <PageHead
        eyebrow="Communauté"
        title="Utilisateurs"
        subtitle={`${formatInt(users.length)} comptes inscrits sur la plateforme`}
      />

      <div className="adm-panel" style={{ marginBottom: 16 }}>
        <div className="adm-stat-strip">
          <div className="adm-strip-cell">
            <div className="adm-strip-label">Administrateurs</div>
            <div className="adm-strip-value">{formatInt(counts.admin)}</div>
          </div>
          <div className="adm-strip-cell">
            <div className="adm-strip-label">Vendeurs</div>
            <div className="adm-strip-value">{formatInt(counts.seller)}</div>
          </div>
          <div className="adm-strip-cell">
            <div className="adm-strip-label">Clients</div>
            <div className="adm-strip-value">{formatInt(counts.customer)}</div>
          </div>
        </div>
      </div>

      <UserTable
        users={filtered}
        search={search}
        setSearch={setSearch}
        searchLabel="Rechercher un utilisateur…"
        emptyText="Aucun compte ne correspond à cette recherche."
        onRoleChange={handleRoleChange}
        showRoleSelect
        totalCount={users.length}
      />
    </div>
  );
};

// ── Table partagée Users / Clients ────────────────────────

export const UserTable = ({
  users, search, setSearch, searchLabel, emptyText,
  onRoleChange, showRoleSelect, totalCount,
}) => (
  <>
    <div className="adm-toolbar">
      <label className="adm-field" style={{ flex: 1, maxWidth: 340 }}>
        <Search size={15} strokeWidth={1.75} />
        <input
          type="text"
          placeholder={searchLabel}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <span className="adm-cell-dim" style={{ marginLeft: 'auto' }}>
        {users.length} affiché{users.length > 1 ? 's' : ''}
        {typeof totalCount === 'number' && ` sur ${formatInt(totalCount)}`}
      </span>
    </div>

    <div className="adm-panel">
      {users.length === 0 ? (
        <EmptyState icon={UserRound} title="Aucun utilisateur trouvé" text={emptyText} compact />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Identité</th>
                <th>Rôle</th>
                <th>Pays</th>
                <th>Téléphone</th>
                <th>Inscrit le</th>
                {showRoleSelect && <th />}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="adm-prod-cell">
                      <Avatar name={u.fullName} seed={u.id || u.fullName} size={36} />
                      <div className="adm-prod-meta">
                        <span className="adm-prod-name">{u.fullName || '—'}</span>
                        {u.role === 'seller' && (
                          <span className="adm-prod-code">Compte professionnel</span>
                        )}
                        {u.role === 'admin' && (
                          <span className="adm-prod-code">Équipe Jerossa</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td><RoleBadge role={u.role} /></td>
                  <td style={{ fontSize: 12.5 }}>{u.country || '—'}</td>
                  <td className="num" style={{ fontSize: 12.5 }}>{u.phone || '—'}</td>
                  <td className="adm-cell-dim">{formatDate(u.createdAt)}</td>
                  {showRoleSelect && (
                    <td>
                      <select
                        className="adm-inline-select"
                        value={u.role}
                        onChange={(e) => onRoleChange(u.id, e.target.value)}
                        aria-label={`Rôle de ${u.fullName || 'utilisateur'}`}
                      >
                        <option value="customer">Client</option>
                        <option value="seller">Vendeur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </>
);

const UsersSkeleton = () => (  <div aria-hidden="true">
    <div style={{ marginBottom: 26 }}>
      <div className="adm-sk" style={{ width: 100, height: 11, marginBottom: 12 }} />
      <div className="adm-sk" style={{ width: 190, height: 24 }} />
    </div>
    <div className="adm-panel">
      {[...Array(7)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px' }}>
          <div className="adm-sk" style={{ width: 36, height: 36, borderRadius: '50%' }} />
          <div className="adm-sk" style={{ flex: 1, height: 12 }} />
          <div className="adm-sk" style={{ width: 80, height: 22, borderRadius: 999 }} />
          <div className="adm-sk" style={{ width: 90, height: 12 }} />
        </div>
      ))}
    </div>
  </div>
);

export default UsersSection;
