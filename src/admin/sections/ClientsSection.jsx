import React, { useEffect, useState } from 'react';
import { fetchAdminUsers } from '../../services/admin';
import { formatInt } from '../format';
import { PageHead } from '../ui';
import { UserTable } from './UsersSection';
import { useLang } from '../../context/LangContext';

// Même logique que l'ancienne section : clients = profils de rôle « customer »
const ClientsSection = () => {
  const { t, lang } = useLang();
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const data = await fetchAdminUsers();
      if (!mounted) return;
      setUsers(data.filter((u) => u.role === 'customer'));
      setLoadingData(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = users.filter(
    (u) => !search || (u.fullName || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loadingData) return <ClientsSkeleton />;

  return (
    <div>
      <PageHead
        eyebrow={t('admin.nav.community')}
        title={t('admin.clients.title')}
        subtitle={t('admin.clients.subtitle', { count: formatInt(users.length) })}
      />
      <UserTable
        users={filtered}
        lang={lang}
        search={search}
        setSearch={setSearch}
        searchLabel={t('admin.clients.searchPlaceholder')}
        emptyText={
          users.length === 0
            ? t('admin.clients.startText')
            : t('admin.clients.noMatchText')
        }
        totalCount={users.length}
      />
    </div>
  );
};

const ClientsSkeleton = () => (
  <div aria-hidden="true">
    <div style={{ marginBottom: 26 }}>
      <div className="adm-sk" style={{ width: 100, height: 11, marginBottom: 12 }} />
      <div className="adm-sk" style={{ width: 150, height: 24 }} />
    </div>
    <div className="adm-panel">
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px' }}>
          <div className="adm-sk" style={{ width: 36, height: 36, borderRadius: '50%' }} />
          <div className="adm-sk" style={{ flex: 1, height: 12 }} />
          <div className="adm-sk" style={{ width: 90, height: 12 }} />
        </div>
      ))}
    </div>
  </div>
);

export default ClientsSection;
