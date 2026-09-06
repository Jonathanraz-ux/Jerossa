-- ==================================================
-- JEROSSA — PHASE 9 (archivée) : création de l'admin
--
-- ⚠️  Cette migration a été vidée volontairement : elle ne crée
--      plus AUCUN utilisateur Supabase Auth, ne définit aucun
--      mot de passe ni aucune adresse en dur, et ne donne plus
--      automatiquement le rôle 'admin' à qui que ce soit.
--
-- Motif : les anciennes versions contenaient un compte
-- d'administration de test avec email et mot de passe fixes.
-- Le référentiel ne doit plus contenir ce genre de secret.
--
-- Le rôle d'administrateur est attribué manuellement :
-- 1. Créer le compte via l'interface d'inscription du site ;
-- 2. Promouvoir le profil dans la table public.profiles
--    (SUPABASE_DASHBOARD -> SQL Editor) :
--
--    update public.profiles
--    set role = 'admin'
--    where id = auth.uid();
--
--    ou via la CLI, en remplaçant L_EMAIL par l'adresse réelle
--    du compte à promouvoir (aucune valeur n'est écrite ici).
--
-- Aucun changement de schéma n'est nécessaire : les tables,
-- fonctions, triggers et politiques RLS sont gérées par les
-- autres migrations (admin_rls, core_tables, ...).
-- ==================================================

-- Migration volontairement sans effet : ne rien exécuter.
do $$
begin
  raise notice 'seed_admin: no-op — admin creation is manual since %', current_date;
end
$$;