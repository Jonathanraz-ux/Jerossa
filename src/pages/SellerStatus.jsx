import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Clock, XCircle, Ban, LogIn, Loader2, RefreshCw, Store
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { formatDate } from '../i18n';
import './SellerOnboarding.css';

const SellerStatus = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, lang } = useLang();
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
            <span className="sl-notice-eyebrow">{t('seller.space')}</span>
            <h1>{t('sellerStatus.loginTitle')}</h1>
            <p>{t('sellerStatus.loginText')}</p>
            <div className="sl-notice-actions">
              <Link to="/login" className="j-pill-btn j-pill-btn--green">{t('sellerStatus.login')}</Link>
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
            <span className="sl-notice-eyebrow">{t('seller.space')}</span>
            <h1>{t('sellerStatus.noApplication')}</h1>
            <p>{t('sellerStatus.noApplicationText')}</p>
            <div className="sl-notice-actions">
              <Link to="/vendeur/devenir" className="j-pill-btn j-pill-btn--green">{t('sellerStatus.becomeSeller')}</Link>
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
      eyebrow: t('sellerStatus.pendingEyebrow'),
      title: t('sellerStatus.pendingTitle'),
      text: t('sellerStatus.pendingText', {
        date: formatDate(producer.submitted_at, lang),
        name: producer.name,
      })
    },
    approved: {
      icon: <CheckCircle2 size={26} />,
      iconClass: '',
      eyebrow: t('sellerStatus.approvedEyebrow'),
      title: t('sellerStatus.approvedTitle', { name: producer.name }),
      text: t('sellerStatus.approvedText')
    },
    rejected: {
      icon: <XCircle size={26} />,
      iconClass: 'sl-notice-ico--danger',
      eyebrow: t('sellerStatus.rejectedEyebrow'),
      title: t('sellerStatus.rejectedTitle'),
      text: producer.review_note
        ? t('sellerStatus.rejectedReason', { reason: producer.review_note }) + ' ' + t('sellerStatus.rejectedText')
        : t('sellerStatus.rejectedText')
    },
    suspended: {
      icon: <Ban size={26} />,
      iconClass: 'sl-notice-ico--danger',
      eyebrow: t('sellerStatus.suspendedEyebrow'),
      title: t('sellerStatus.suspendedTitle'),
      text: producer.review_note
        ? t('sellerStatus.suspendedReason', { reason: producer.review_note }) + ' ' + t('sellerStatus.suspendedText')
        : t('sellerStatus.suspendedText')
    }
  };

  const cfg = statusConfig[producer.status] || statusConfig.pending;

  return (
    <div className="sl-page">
      <section className="sl-hero">
        <div className="container">
          <nav className="sl-breadcrumb">
            <Link to="/">{t('sellerStatus.breadcrumbHome')}</Link>
            <span>/</span>
            <span>{t('sellerStatus.breadcrumbStatus')}</span>
          </nav>
          <span className="sl-hero-tag">{t('sellerStatus.heroTag')}</span>
          <h1>{t('sellerStatus.heroTitle')}</h1>
          <p>{t('sellerStatus.heroText')}</p>
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
              <dt>{t('sellerStatus.metaShop')}</dt>
              <dd>{producer.name}</dd>
            </div>
            <div>
              <dt>{t('sellerStatus.metaLocation')}</dt>
              <dd>{producer.location || '—'}</dd>
            </div>
            <div>
              <dt>{t('sellerStatus.metaDocuments')}</dt>
              <dd>{Array.isArray(producer.documents) ? producer.documents.length : 0}</dd>
            </div>
            {(producer.status === 'approved' || producer.status === 'suspended') && producer.reviewed_at && (
              <div>
                <dt>{t('sellerStatus.metaReviewedOn')}</dt>
                <dd>{formatDate(producer.reviewed_at, lang)}</dd>
              </div>
            )}
          </dl>

          <div className="sl-notice-actions">
            {producer.status === 'pending' && (
              <button type="button" className="j-pill-btn j-pill-btn--outline-dark" onClick={refresh} disabled={refreshing}>
                <RefreshCw size={14} className={refreshing ? 'sl-spin' : ''} /> {t('sellerStatus.refresh')}
              </button>
            )}
            {producer.status === 'approved' && (
              <>
                <Link to="/publier" className="j-pill-btn j-pill-btn--green">{t('sellerStatus.publishOffer')}</Link>
                {producer.slug && (
                  <Link to={`/producteur/${producer.slug}`} className="j-pill-btn j-pill-btn--outline-dark">{t('sellerStatus.viewShop')}</Link>
                )}
              </>
            )}
            {producer.status === 'rejected' && (
              <Link to="/vendeur/devenir" className="j-pill-btn j-pill-btn--green">{t('sellerStatus.correctAndResubmit')}</Link>
            )}
            {(producer.status === 'suspended') && (
              <Link to="/contact" className="j-pill-btn j-pill-btn--green">{t('sellerStatus.contactSupport')}</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerStatus;
