import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Clock, XCircle, Ban, LogIn, Loader2, RefreshCw, Store
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './SellerOnboarding.css';

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

const SellerStatus = () => {
  const { user, isAuthenticated } = useAuth();
  const [checking, setChecking] = useState(true);
  const [producer, setProducer] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducer = useCallback(async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    return error ? null : data;
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      setChecking(false);
      return;
    }
    let alive = true;
    (async () => {
      const data = await loadProducer();
      if (alive) {
        setProducer(data);
        setChecking(false);
      }
    })();
    return () => { alive = false; };
  }, [isAuthenticated, user, loadProducer]);

  const refresh = async () => {
    setRefreshing(true);
    const data = await loadProducer();
    if (data) setProducer(data);
    setRefreshing(false);
  };

  if (checking) {
    return (
      <div className="sl-page">
        <div className="sl-center"><Loader2 size={28} className="sl-spin" /></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="sl-page">
        <div className="container sl-body">
          <div className="sl-notice">
            <div className="sl-notice-ico sl-notice-ico--info"><LogIn size={26} /></div>
            <span className="sl-notice-eyebrow">Espace vendeur</span>
            <h1>Connectez-vous pour suivre votre demande</h1>
            <p>Le suivi de candidature est réservé aux comptes Jerossa.</p>
            <div className="sl-notice-actions">
              <Link to="/login" className="j-pill-btn j-pill-btn--green">Se connecter</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="sl-page">
        <div className="container sl-body">
          <div className="sl-notice">
            <div className="sl-notice-ico sl-notice-ico--info"><Store size={26} /></div>
            <span className="sl-notice-eyebrow">Espace vendeur</span>
            <h1>Aucune candidature enregistrée</h1>
            <p>Vous n'avez pas encore déposé de dossier vendeur. La création d'une boutique est gratuite.</p>
            <div className="sl-notice-actions">
              <Link to="/vendeur/devenir" className="j-pill-btn j-pill-btn--green">Devenir vendeur</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      icon: <Clock size={26} />,
      iconClass: 'sl-notice-ico--info',
      eyebrow: 'Candidature en cours',
      title: 'Votre dossier est en cours d\'examen',
      text: `Déposé le ${formatDate(producer.submitted_at)}. Notre équipe vérifie les informations et pièces justificatives de « ${producer.name} ». Vous serez notifié dès la validation.`
    },
    approved: {
      icon: <CheckCircle2 size={26} />,
      iconClass: '',
      eyebrow: 'Boutique validée',
      title: 'Félicitations, votre boutique « ' + producer.name + ' » est active !',
      text: 'Votre boutique est en ligne. Vous pouvez publier des offres qui seront visibles par les acheteurs.'
    },
    rejected: {
      icon: <XCircle size={26} />,
      iconClass: 'sl-notice-ico--danger',
      eyebrow: 'Candidature refusée',
      title: 'Votre candidature a été refusée',
      text: producer.review_note
        ? `Motif : ${producer.review_note}. Vous pouvez corriger votre dossier et le renvoyer à tout moment.`
        : 'Vous pouvez corriger votre dossier et le renvoyer à tout moment.'
    },
    suspended: {
      icon: <Ban size={26} />,
      iconClass: 'sl-notice-ico--danger',
      eyebrow: 'Compte suspendu',
      title: 'Votre boutique est suspendue',
      text: producer.review_note
        ? `Motif : ${producer.review_note}. Contactez le support pour régulariser votre situation.`
        : 'Contactez le support pour régulariser votre situation.'
    }
  };

  const cfg = statusConfig[producer.status] || statusConfig.pending;

  return (
    <div className="sl-page">
      <section className="sl-hero">
        <div className="container">
          <nav className="sl-breadcrumb">
            <Link to="/">Accueil</Link>
            <span>/</span>
            <span>Statut de ma demande</span>
          </nav>
          <span className="sl-hero-tag">Espace vendeur</span>
          <h1>Suivi de ma candidature</h1>
          <p>L'état de votre dossier boutique, mis à jour en temps réel après examen par notre équipe.</p>
        </div>
      </section>

      <div className="container sl-body">
        <div className="sl-notice sl-notice--card">
          <div className={`sl-notice-ico ${cfg.iconClass}`}>{cfg.icon}</div>
          <span className="sl-notice-eyebrow">{cfg.eyebrow}</span>
          <h1>{cfg.title}</h1>
          <p>{cfg.text}</p>

          <dl className="sl-status-meta">
            <div>
              <dt>Boutique</dt>
              <dd>{producer.name}</dd>
            </div>
            <div>
              <dt>Localisation</dt>
              <dd>{producer.location || '—'}</dd>
            </div>
            <div>
              <dt>Pièces transmises</dt>
              <dd>{Array.isArray(producer.documents) ? producer.documents.length : 0}</dd>
            </div>
            {(producer.status === 'approved' || producer.status === 'suspended') && producer.reviewed_at && (
              <div>
                <dt>Examinée le</dt>
                <dd>{formatDate(producer.reviewed_at)}</dd>
              </div>
            )}
          </dl>

          <div className="sl-notice-actions">
            {producer.status === 'pending' && (
              <button type="button" className="j-pill-btn j-pill-btn--outline-dark" onClick={refresh} disabled={refreshing}>
                <RefreshCw size={14} className={refreshing ? 'sl-spin' : ''} /> Rafraîchir
              </button>
            )}
            {producer.status === 'approved' && (
              <>
                <Link to="/publier" className="j-pill-btn j-pill-btn--green">Publier une offre</Link>
                {producer.slug && (
                  <Link to={`/producteur/${producer.slug}`} className="j-pill-btn j-pill-btn--outline-dark">Voir ma boutique</Link>
                )}
              </>
            )}
            {producer.status === 'rejected' && (
              <Link to="/vendeur/devenir" className="j-pill-btn j-pill-btn--green">Corriger et renvoyer mon dossier</Link>
            )}
            {(producer.status === 'suspended') && (
              <Link to="/contact" className="j-pill-btn j-pill-btn--green">Contacter le support</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerStatus;
