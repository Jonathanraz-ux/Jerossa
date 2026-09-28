import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Marge (px) sous laquelle l'utilisateur est encore considéré « collé » au bas
 * de la conversation. Absorbe les arrondis de sous-pixel et les quelques px
 * d'inertie laissés par un scroll tactile.
 */
const BOTTOM_TOLERANCE = 72;

/**
 * Auto-descente confinée à la zone de messages d'une conversation.
 *
 * Pourquoi ne pas utiliser `scrollIntoView()` sur une ancre en fin de liste :
 *
 * 1. `scrollIntoView()` fait défiler *tous* les ancêtres défilables de sa cible,
 *    page comprise. Or les écrans de messagerie sont plus hauts que le viewport
 *    (fil d'Ariane + titre + grille calée sur `100vh`), donc l'ancre tirait la
 *    fenêtre vers le bas à chaque ouverture — en compétition avec le reset de
 *    `ScrollManager`.
 * 2. `useConversationChat` remplace le tableau `messages` à chaque tick de
 *    polling (8 s) et à chaque événement Realtime : un effet dépendant de son
 *    identité relançait donc la descente en boucle, en permanence.
 *
 * On pilote donc `scrollTop` du seul conteneur de messages, et uniquement si
 * l'utilisateur n'est pas parti relire plus haut : un message reçu ou un tick de
 * polling ne doit plus arracher la vue.
 *
 * @param {{ conversationId?: string | null, lastMessageId?: string | null }} options
 *   `lastMessageId` sert de déclencheur (et non le tableau complet) pour que le
 *   polling ne soit pas confondu avec l'arrivée d'un vrai message.
 * @returns {{
 *   scrollerRef: (el: HTMLElement | null) => void,
 *   scrollToBottom: (behavior?: ScrollBehavior) => void,
 * }}
 */
export default function useStickyScroll({ conversationId = null, lastMessageId = null } = {}) {
  // Ref de callback : l'élément n'existe qu'une fois la conversation chargée,
  // et l'identité de `setScroller` est stable (donc aucun re-branchement inutile).
  const [scroller, setScroller] = useState(null);
  const isPinnedRef = useRef(true);
  const isFirstRef = useRef(true);
  const prevScrollerRef = useRef(null);
  const prevConvoRef = useRef(null);

  // Un défilement manuel détache le suivi automatique.
  useEffect(() => {
    if (!scroller) return undefined;
    const onScroll = () => {
      isPinnedRef.current = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <= BOTTOM_TOLERANCE;
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, [scroller]);

  // Ouverture de conversation / arrivée d'un message : on se cale en bas, sauf
  // si l'utilisateur consulte l'historique — auquel cas on ne bouge plus.
  useLayoutEffect(() => {
    if (!scroller) return;
    const isOpening = isFirstRef.current
      || prevScrollerRef.current !== scroller
      || prevConvoRef.current !== conversationId;
    isFirstRef.current = false;
    prevScrollerRef.current = scroller;
    prevConvoRef.current = conversationId;
    if (isOpening) isPinnedRef.current = true;
    if (!isPinnedRef.current) return;
    scroller.scrollTo({
      top: scroller.scrollHeight,
      left: 0,
      // Pas d'animation à l'ouverture : on est déjà censé être en place.
      behavior: isOpening ? 'auto' : 'smooth',
    });
  }, [scroller, conversationId, lastMessageId]);

  // À appeler après un envoi : l'utilisateur vient d'interagir, on le ramène
  // au bas même s'il avait remonté dans l'historique.
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    isPinnedRef.current = true;
    if (!scroller) return;
    scroller.scrollTo({ top: scroller.scrollHeight, left: 0, behavior });
  }, [scroller]);

  return { scrollerRef: setScroller, scrollToBottom };
}
