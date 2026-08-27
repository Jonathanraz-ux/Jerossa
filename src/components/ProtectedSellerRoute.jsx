import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const ProtectedSellerRoute = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [producer, setProducer] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setChecked(true);
      return;
    }
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setChecked(true); return; }
      const { data } = await supabase
        .from('producers')
        .select('id, name, slug, status')
        .eq('user_id', user.id)
        .maybeSingle();
      if (alive) {
        setProducer(data || null);
        setChecked(true);
      }
    })();
    return () => { alive = false; };
  }, [authLoading, isAuthenticated]);

  if (authLoading || !checked) {
    return (
      <div className="sv-loader">
        <div className="sv-loader-spinner" />
        <p>Chargement…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!producer || producer.status !== 'approved') {
    return <Navigate to="/vendeur/statut" replace />;
  }

  return children;
};

export default ProtectedSellerRoute;
