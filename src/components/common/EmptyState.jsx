import React from 'react';
import { PackageOpen } from 'lucide-react';

/**
 * État vide premium et volontaire.
 * - icon        : composant lucide (défaut PackageOpen)
 * - title       : titre éditorial court
 * - text        : phrase d'explication rassurante
 * - action      : noeud React (bouton / lien)
 * - plain       : variante sans fond (intégrée à une page déjà encadrée)
 */
const EmptyState = ({ icon: Icon = PackageOpen, title, text, action, plain = false }) => (
  <div className={`jr-empty ${plain ? 'jr-empty--plain' : ''}`}>
    <div className="jr-empty-icon">
      <Icon size={24} strokeWidth={1.5} />
    </div>
    {title && <h3 className="jr-empty-title">{title}</h3>}
    {text && <p className="jr-empty-text">{text}</p>}
    {action && <div className="jr-empty-action">{action}</div>}
  </div>
);

export default EmptyState;
