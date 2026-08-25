import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Gestion du défilement lors de la navigation :
 * - Sans ancre   : retour propre en haut de page (sinon le navigateur
 *                  conserve l'ancienne position → on atterrit au footer).
 * - Avec ancre   : défilement fluide vers la section cible, avec quelques
 *                  re-tentatives car les images/données chargées après coup
 *                  décalent la mise en page (et donc la position réelle).
 */
export default function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    const { hash } = location;

    // Navigation classique : repartir du haut
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return undefined;
    }

    // Navigation par ancre (/section)
    const id = decodeURIComponent(hash.slice(1));
    if (!id) return undefined;

    let cancelled = false;
    // Le contenu se charge après le rendu : on ré-ajuste tant que la mise
    // en page bouge. Chaque tentative est sans effet si on est déjà en place.
    const delays = [0, 250, 600, 1000, 1500];
    const timers = delays.map((delay) =>
      setTimeout(() => {
        if (cancelled) return;
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Déjà positionné juste sous la barre collante → rien à faire
        if (delay > 0 && Math.abs(rect.top - 88) < 48) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, delay)
    );

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [location]);

  return null;
}
