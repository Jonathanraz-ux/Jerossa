-- ==================================================
-- JEROSSA — Unique index on producers.user_id
-- Empêche qu'un même utilisateur puisse créer plusieurs producers.
-- Les producteurs orphelins (user_id = NULL) ne sont pas concernés
-- car PostgreSQL traite les NULL comme distincts dans les uniques.
-- ==================================================

CREATE UNIQUE INDEX IF NOT EXISTS producers_user_id_unique
  ON public.producers (user_id)
  WHERE user_id IS NOT NULL;
