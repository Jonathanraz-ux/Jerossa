-- =============================================================
-- 1. Ajouter la colonne seller_type à la table producers
-- =============================================================
ALTER TABLE producers
  ADD COLUMN IF NOT EXISTS seller_type text
    CHECK (seller_type IN ('individual', 'company', 'cooperative'))
    DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_producers_seller_type ON producers (seller_type);

-- =============================================================
-- 2. Créer la table seller_verification_documents
-- =============================================================
CREATE TABLE IF NOT EXISTS seller_verification_documents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_application_id uuid NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
  owner_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type     text NOT NULL,
  storage_path      text NOT NULL,
  original_filename text,
  mime_type         text NOT NULL,
  file_size         integer NOT NULL,
  verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'valid', 'invalid')),
  rejection_reason  text,
  uploaded_at       timestamptz NOT NULL DEFAULT now(),
  reviewed_at       timestamptz,
  reviewed_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_svd_application ON seller_verification_documents (seller_application_id);
CREATE INDEX IF NOT EXISTS idx_svd_owner ON seller_verification_documents (owner_id);

-- =============================================================
-- 3. Activer RLS sur la nouvelle table
-- =============================================================
ALTER TABLE seller_verification_documents ENABLE ROW LEVEL SECURITY;

-- 3a. Le candidat peut voir les métadonnées de ses propres documents
CREATE POLICY "svd_select_own"
  ON seller_verification_documents FOR SELECT
  USING (owner_id = auth.uid());

-- 3b. Les administrateurs peuvent tout voir
CREATE POLICY "svd_select_admin"
  ON seller_verification_documents FOR SELECT
  USING (is_admin());

-- 3c. Le candidat peut insérer ses propres documents
CREATE POLICY "svd_insert_own"
  ON seller_verification_documents FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- 3d. Le candidat peut supprimer ses propres documents (avant validation)
CREATE POLICY "svd_delete_own"
  ON seller_verification_documents FOR DELETE
  USING (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM producers p
      WHERE p.id = seller_verification_documents.seller_application_id
        AND p.user_id = auth.uid()
        AND p.status IN ('pending', 'rejected', 'needs_changes')
    )
  );

-- 3e. Le candidat peut mettre à jour ses propres documents (remplacement)
CREATE POLICY "svd_update_own"
  ON seller_verification_documents FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- 3f. Les administrateurs peuvent tout mettre à jour (validation/refus)
CREATE POLICY "svd_update_admin"
  ON seller_verification_documents FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3g. Les administrateurs peuvent supprimer
CREATE POLICY "svd_delete_admin"
  ON seller_verification_documents FOR DELETE
  USING (is_admin());

-- =============================================================
-- 4. Politique de stockage seller-documents pour le nouveau
--    schéma de chemins {user_id}/{application_id}/{doc_type}/
-- =============================================================
-- La politique INSERT existante autorise déjà les uploads dans
-- le dossier {uid}/. Le nouveau schéma imbrique des sous-dossiers
-- sous {uid}/, donc la politique existante continue de fonctionner.
-- Aucune modification de bucket n'est nécessaire ici.

-- =============================================================
-- 5. Empêcher l'escalade de rôle par modification directe
-- =============================================================
-- La table profiles a déjà une policy empêchant un vendeur
-- de se promouvoir admin. On ajoute une protection similaire
-- sur producers pour la colonne is_verified via l'update admin.
-- Ceci est déjà couvert par la policy producers_update_admin
-- qui requiert is_admin().
