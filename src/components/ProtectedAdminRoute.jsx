import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#f5f4f0', fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
          }} />
          <p style={{ fontSize: '0.875rem' }}>Chargement...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== 'admin') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#f5f4f0', fontFamily: 'var(--font-sans)',
      }}>
        <div style={{
          textAlign: 'center', padding: '3rem', background: 'var(--bg-white)',
          borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
          maxWidth: 420, boxShadow: 'var(--shadow-md)',
        }}>
          <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Accès refusé
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Vous n'avez pas les droits d'administration nécessaires pour accéder à cette page.
          </p>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1.5rem', background: 'var(--primary)', color: '#fff',
            borderRadius: 'var(--radius-sm)', textDecoration: 'none',
            fontSize: '0.875rem', fontWeight: 600,
          }}>
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedAdminRoute;
