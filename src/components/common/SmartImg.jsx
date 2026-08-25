import React, { useEffect, useRef, useState } from 'react';

// Tuile neutre de remplacement (ivoire + pictogramme discret)
const FALLBACK_SVG =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E" +
  "%3Crect width='200' height='200' fill='%23faf8f5'/%3E" +
  "%3Crect x='0.5' y='0.5' width='199' height='199' fill='none' stroke='%23e8e4de'/%3E" +
  "%3Cg fill='none' stroke='%23c9b489' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E" +
  "%3Cpath d='M100 62l34 20v40l-34 20-34-20V82z'/%3E" +
  "%3Cpath d='M66 82l34 20 34-20M100 102v40'/%3E%3C/g%3E%3C/svg%3E";

/**
 * Image produit robuste : fade-in au chargement, fallback élégant en cas d'erreur.
 * Conserve le className et les props transmis pour ne rien casser des styles existants.
 */
const SmartImg = ({ src = '', alt = '', className = '', ...rest }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  // Images en cache : l'événement load peut avoir déjà eu lieu
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={src || FALLBACK_SVG}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`jr-smartimg ${loaded ? 'is-loaded' : ''} ${className}`}
      onLoad={() => setLoaded(true)}
      onError={(e) => {
        setLoaded(true);
        if (e.currentTarget.src !== FALLBACK_SVG) {
          e.currentTarget.src = FALLBACK_SVG;
        }
      }}
      {...rest}
    />
  );
};

export default SmartImg;
