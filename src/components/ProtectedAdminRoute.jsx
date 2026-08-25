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
        minHeight: '100vh', background: '#f3f0ea', fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ textAlign: 'center', color: '#857f72' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #e6e1d5',
            borderTopColor: '#a87945', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
          }} />
          <p style={{ fontSize: '0.875rem' }}>Chargement…</p>
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
        minHeight: '100vh', background: '#f3f0ea', fontFamily: 'var(--font-sans)',
      }}>
        <div style={{
          textAlign: 'center', padding: '3rem', background: '#ffffff',
          borderRadius: 16, border: '1px solid #e6e1d5',
          maxWidth: 420, boxShadow: '0 2px 6px rgba(23,22,20,0.05), 0 12px 32px rgba(23,22,20,0.07)',
        }}>
          <ShieldAlert size={48} color="#a63d35" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Accès refusé
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#857f72', marginBottom: '1.5rem' }}>
            Vous n'avez pas les droits d'administration nécessaires pour accéder à cette page.
          </p>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1.5rem', background: '#a87945', color: '#fff',
            borderRadius: 10, textDecoration: 'none',
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
